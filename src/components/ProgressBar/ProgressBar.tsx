import { memo, useEffect, useMemo } from "react";
import Animated, {
  cancelAnimation,
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import {
  clampNumber,
  isFiniteNumber,
  isNonNegativeFiniteNumber,
  normalizeNumberPrecision,
} from "../../utils/numberUtils";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { IProgressBar } from "./types";
import type { ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { errors } from "../../utils/errors";

const PROGRESS_STATE = {
  NORMAL: 0,
  DISABLED: 1,
} as const;

const PROGRESS_STATES = [
  PROGRESS_STATE.NORMAL,
  PROGRESS_STATE.DISABLED,
] as const;

const ProgressBarComponent = ({
  value = 0,
  label,
  showValue = false,
  disabled = false,
  height,
  radius,
  style,
  testID,
  accessibilityLabel,
  ...viewProps
}: IProgressBar) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale } = useARCUISystem();

  // ─── Public API invariants ────────────────────────────────────────────────

  if (!isFiniteNumber(value)) {
    throw new Error(
      errors.prop("ProgressBar", "value", "Expected a finite number."),
    );
  }

  const clampedValue = clampNumber(value, 0, 100);

  /**
   * React Native's native accessibility range currently expects an integer
   * value for `now`.
   *
   * ProgressBar itself still preserves decimal precision visually and in
   * showValue.
   */
  const accessibilityNow = normalizeNumberPrecision(clampedValue);

  const tokenHeight = tokens.sizings.progressBar.height;

  const tokenRadius = tokens.radius.progressBar;

  const hasValidHeight =
    height === undefined || isNonNegativeFiniteNumber(height);

  const hasValidRadius =
    radius === undefined || isNonNegativeFiniteNumber(radius);

  const resolvedHeight = hasValidHeight ? (height ?? tokenHeight) : tokenHeight;

  const resolvedRadius = hasValidRadius ? (radius ?? tokenRadius) : tokenRadius;

  if (__DEV__ && !hasValidHeight) {
    console.error(
      "[react-native-arc-ui] ProgressBar: invalid height. Falling back to tokens.sizings.progressBar.height.",
    );
  }

  if (__DEV__ && !hasValidRadius) {
    console.error(
      "[react-native-arc-ui] ProgressBar: invalid radius. Falling back to tokens.radius.progressBar.",
    );
  }

  // ─── Token extraction ────────────────────────────────────────────────────

  const lightTrack = tokens.colors.light.progressBar.track;

  const darkTrack = tokens.colors.dark.progressBar.track;

  const lightFill = tokens.colors.light.progressBar.fill;

  const darkFill = tokens.colors.dark.progressBar.fill;

  const lightDisabled = tokens.colors.light.progressBar.disabled;

  const darkDisabled = tokens.colors.dark.progressBar.disabled;

  const lightLabel = tokens.colors.light.progressBar.label;

  const darkLabel = tokens.colors.dark.progressBar.label;

  const labelFontSize = tokens.typography.progressBar.label.fontSize;

  const valueFontSize = tokens.typography.progressBar.value.fontSize;

  const headerGap = tokens.spacing.xs;

  const animationConfig = useMemo(
    () => ({
      ...resolveAnimation(tokens.progressBarAnimations, tokens.animations),

      reduceMotion: ReduceMotion.System,
    }),
    [tokens.progressBarAnimations, tokens.animations],
  );

  // ─── Static token / geometry styles ──────────────────────────────────────

  const containerGapStyle = useMemo<ViewStyle>(
    () => ({
      gap: headerGap,
    }),
    [headerGap],
  );

  const trackGeometryStyle = useMemo<ViewStyle>(
    () => ({
      height: resolvedHeight,

      borderRadius: resolvedRadius,
    }),
    [resolvedHeight, resolvedRadius],
  );

  const fillGeometryStyle = useMemo<ViewStyle>(
    () => ({
      borderRadius: resolvedRadius,
    }),
    [resolvedRadius],
  );

  const labelTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.progressBar.label).style,
    [tokens.typography.progressBar.label],
  );

  const valueTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.progressBar.value).style,
    [tokens.typography.progressBar.value],
  );

  // ─── UI-thread state ─────────────────────────────────────────────────────

  const disabledProgress = useSharedValue(
    disabled ? PROGRESS_STATE.DISABLED : PROGRESS_STATE.NORMAL,
  );

  const fillProgress = useSharedValue(clampedValue / 100);

  // ─── Prop → UI-thread transitions ────────────────────────────────────────

  useEffect(() => {
    cancelAnimation(disabledProgress);

    disabledProgress.value = withTiming(
      disabled ? PROGRESS_STATE.DISABLED : PROGRESS_STATE.NORMAL,
      animationConfig,
    );
  }, [disabled, disabledProgress, animationConfig]);

  useEffect(() => {
    cancelAnimation(fillProgress);

    fillProgress.value = withTiming(clampedValue / 100, animationConfig);
  }, [clampedValue, fillProgress, animationConfig]);

  useEffect(() => {
    return () => {
      cancelAnimation(disabledProgress);
      cancelAnimation(fillProgress);
    };
  }, [disabledProgress, fillProgress]);

  // ─── Theme / state colors ────────────────────────────────────────────────

  const animatedColors = useDerivedValue(() => {
    const lightFillColor = interpolateColor(
      disabledProgress.value,
      PROGRESS_STATES,
      [lightFill, lightDisabled],
    );

    const darkFillColor = interpolateColor(
      disabledProgress.value,
      PROGRESS_STATES,
      [darkFill, darkDisabled],
    );

    return {
      track: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkTrack, lightTrack],
      ),

      fill: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkFillColor, lightFillColor],
      ),

      label: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkLabel, lightLabel],
      ),
    };
  });

  // ─── Animated styles ─────────────────────────────────────────────────────

  const trackAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: animatedColors.value.track,
  }));

  /**
   * The fill always occupies the complete track.
   *
   * Progress itself is represented through scaleX so frame-level updates stay
   * transform-only on the UI thread instead of animating layout width.
   */
  const fillAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: animatedColors.value.fill,

    transform: [
      {
        scaleX: fillProgress.value,
      },
    ],
  }));

  const labelLineHeight = tokens.typography.progressBar.label.lineHeight;

  const labelSizeStyle = useAnimatedStyle(() => ({
    fontSize: labelFontSize * fontScale.value,

    lineHeight:
      labelLineHeight != null ? labelLineHeight * fontScale.value : undefined,
  }));

  const labelColorStyle = useAnimatedStyle(() => ({
    color: animatedColors.value.label,
  }));

  const valueLineHeight = tokens.typography.progressBar.value.lineHeight;

  const valueSizeStyle = useAnimatedStyle(() => ({
    fontSize: valueFontSize * fontScale.value,

    lineHeight:
      valueLineHeight != null ? valueLineHeight * fontScale.value : undefined,
  }));

  const valueColorStyle = useAnimatedStyle(() => ({
    color: animatedColors.value.label,
  }));

  // ─── Render semantics ────────────────────────────────────────────────────

  const showHeader = label != null || showValue;

  const displayedValue = `${clampedValue}%`;

  const resolvedAccessibilityLabel = accessibilityLabel ?? label;

  return (
    <View
      {...viewProps}
      testID={testID}
      style={[styles.container, containerGapStyle, style]}
      accessible
      role="progressbar"
      accessibilityRole="progressbar"
      accessibilityLabel={resolvedAccessibilityLabel}
      aria-disabled={disabled}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={accessibilityNow}
      accessibilityState={{
        disabled,
      }}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: accessibilityNow,
      }}
    >
      {showHeader && (
        <View style={styles.header} pointerEvents="none">
          {label != null ? (
            <Animated.Text
              testID={testID ? `${testID}-label` : undefined}
              accessible={false}
              allowFontScaling={false}
              maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
              numberOfLines={1}
              style={[
                styles.label,
                labelTypographyStyle,
                labelSizeStyle,
                labelColorStyle,
              ]}
            >
              {label}
            </Animated.Text>
          ) : (
            <View style={styles.labelSpacer} />
          )}

          {showValue && (
            <Animated.Text
              testID={testID ? `${testID}-value` : undefined}
              accessible={false}
              allowFontScaling={false}
              maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
              style={[valueTypographyStyle, valueSizeStyle, valueColorStyle]}
            >
              {displayedValue}
            </Animated.Text>
          )}
        </View>
      )}

      <Animated.View
        testID={testID ? `${testID}-track` : undefined}
        pointerEvents="none"
        style={[styles.track, trackGeometryStyle, trackAnimatedStyle]}
      >
        <Animated.View
          testID={testID ? `${testID}-fill` : undefined}
          style={[styles.fill, fillGeometryStyle, fillAnimatedStyle]}
        />
      </Animated.View>
    </View>
  );
};

export const ProgressBar = memo(ProgressBarComponent);

ProgressBar.displayName = "ProgressBar";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  label: {
    flex: 1,

    flexShrink: 1,
  },

  labelSpacer: {
    flex: 1,
  },

  track: {
    width: "100%",

    overflow: "hidden",
  },

  fill: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    transformOrigin: "left center",
  },
});
