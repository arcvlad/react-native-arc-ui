import { memo, useCallback, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { useEnteringExiting } from "../../hooks/useEnteringExiting";
import { useSelectionMotion } from "../../internal/selection/useSelectionMotion";
import { useSelectionPress } from "../../internal/selection/useSelectionPress";
import { useSelectionState } from "../../internal/selection/useSelectionState";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { resolveTextContent } from "../../utils/reactNode";
import { Icon } from "../Icon/Icon";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { IRadio } from "./types";
import { isFiniteNumber } from "../../utils/numberUtils";

const RadioComponent = ({
  children,
  value,
  checked,
  onCheckedChange,
  animation,
  active = true,
  disabled,
  size,
  error,
  textStyle,
  style,
  onPress,
  onPressIn,
  onPressOut,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  testID,
  ...pressableProps
}: IRadio) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale } = useARCUISystem();

  const { entering, exiting } = useEnteringExiting();

  // ─── Native prop normalization ───────────────────────────────────────────

  /**
   * PressableProps allows boolean | null | undefined.
   *
   * Shared ARCUI selection infrastructure operates on strict boolean
   * semantics.
   */
  const resolvedDisabled = disabled === true;

  const isInteractionDisabled = resolvedDisabled || !active;

  // ─── Selection ownership ─────────────────────────────────────────────────

  const { resolvedChecked, toggleChecked } = useSelectionState({
    componentName: "Radio",

    checked,

    onCheckedChange,

    value,

    /**
     * Radio is a standalone controlled boolean when used independently,
     * but inside SelectionGroup it supports single-selection mode only.
     */
    groupPolicy: "single",
  });

  // ─── Resolved props ──────────────────────────────────────────────────────

  const resolvedAnimation = animation ?? tokens.pressAnimation.type;

  const defaultSize = tokens.sizings.radio.size;

  const defaultDotSize = tokens.sizings.radio.dotSize;

  if (!isFiniteNumber(defaultSize) || defaultSize <= 0) {
    throw new Error(
      "[react-native-arc-ui] tokens.sizings.radio.size must be a finite number greater than 0.",
    );
  }

  if (!isFiniteNumber(defaultDotSize) || defaultDotSize <= 0) {
    throw new Error(
      "[react-native-arc-ui] tokens.sizings.radio.dotSize must be a finite number greater than 0.",
    );
  }

  if (defaultDotSize >= defaultSize) {
    throw new Error(
      "[react-native-arc-ui] Radio tokens.sizings.radio.dotSize must be smaller than tokens.sizings.radio.size.",
    );
  }

  const hasValidSize = size === undefined || (isFiniteNumber(size) && size > 0);

  const resolvedSize = hasValidSize ? (size ?? defaultSize) : defaultSize;

  if (__DEV__ && !hasValidSize) {
    console.error(
      "[react-native-arc-ui] Radio: invalid size. Falling back to tokens.sizings.radio.size.",
    );
  }

  /**
   * Custom outer sizes retain the same dot/outer ratio as the
   * Radio sizing tokens.
   */
  const dotRatio = defaultDotSize / defaultSize;

  const resolvedDotSize = resolvedSize * dotRatio;

  const resolvedBorderWidth = tokens.border.radio;

  const hasError = error != null && error.length > 0;

  // ─── Content / accessibility fallback ────────────────────────────────────

  const hasContent =
    children !== null &&
    children !== undefined &&
    typeof children !== "boolean";

  const textContent = useMemo(
    () => (hasContent ? resolveTextContent(children) : null),
    [children, hasContent],
  );

  const isTextContent = textContent !== null;

  const resolvedAccessibilityLabel =
    accessibilityLabel ??
    (isTextContent && textContent.length > 0 ? textContent : undefined);

  // ─── Animation configuration ─────────────────────────────────────────────

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.radioAnimations, tokens.animations),
    [tokens.radioAnimations, tokens.animations],
  );

  // ─── Shared semantic motion ──────────────────────────────────────────────

  const {
    checkedProgress,
    disabledProgress,
    inactiveProgress,
    errorProgress,
    prefersReducedMotion,
  } = useSelectionMotion({
    checked: resolvedChecked,

    disabled: resolvedDisabled,

    inactive: !active,

    hasError,

    animationConfig,
  });

  // ─── Shared press lifecycle ──────────────────────────────────────────────

  const { pressProgress, scale, handlePressIn, handlePressOut } =
    useSelectionPress({
      interactionDisabled: isInteractionDisabled,

      animation: resolvedAnimation,

      duration: tokens.pressAnimation.duration,

      scaleUpValue: tokens.pressAnimation.scaleUpValue,

      scaleDownValue: tokens.pressAnimation.scaleDownValue,

      prefersReducedMotion,

      onPressIn,
      onPressOut,
    });

  // ─── Static token styles ─────────────────────────────────────────────────

  const rowTokenStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xs,
    }),
    [tokens.spacing.xs],
  );

  const errorRowTokenStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xxs,

      paddingTop: tokens.spacing.xxs,
    }),
    [tokens.spacing.xxs],
  );

  const labelTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.radio.text).style,
    [tokens.typography.radio.text],
  );

  const errorTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.radio.error).style,
    [tokens.typography.radio.error],
  );

  // ─── Theme token extraction ──────────────────────────────────────────────

  const lightBorderPrimary = tokens.colors.light.radio.border.primary;

  const lightBorderPressed = tokens.colors.light.radio.border.pressed;

  const lightBorderDisabled = tokens.colors.light.radio.border.disabled;

  const lightBorderInactive = tokens.colors.light.radio.border.inactive;

  const darkBorderPrimary = tokens.colors.dark.radio.border.primary;

  const darkBorderPressed = tokens.colors.dark.radio.border.pressed;

  const darkBorderDisabled = tokens.colors.dark.radio.border.disabled;

  const darkBorderInactive = tokens.colors.dark.radio.border.inactive;

  const lightDotPrimary = tokens.colors.light.radio.background.primary;

  const lightDotPressed = tokens.colors.light.radio.background.pressed;

  const lightDotDisabled = tokens.colors.light.radio.background.disabled;

  const lightDotInactive = tokens.colors.light.radio.background.inactive;

  const darkDotPrimary = tokens.colors.dark.radio.background.primary;

  const darkDotPressed = tokens.colors.dark.radio.background.pressed;

  const darkDotDisabled = tokens.colors.dark.radio.background.disabled;

  const darkDotInactive = tokens.colors.dark.radio.background.inactive;

  const lightDotTransparent = tokens.colors.light.radio.background.transparent;

  const darkDotTransparent = tokens.colors.dark.radio.background.transparent;

  const lightTextPrimary = tokens.colors.light.radio.text.primary;

  const lightTextDisabled = tokens.colors.light.radio.text.disabled;

  const lightTextInactive = tokens.colors.light.radio.text.inactive;

  const darkTextPrimary = tokens.colors.dark.radio.text.primary;

  const darkTextDisabled = tokens.colors.dark.radio.text.disabled;

  const darkTextInactive = tokens.colors.dark.radio.text.inactive;

  const lightError = tokens.colors.light.states.danger;

  const darkError = tokens.colors.dark.states.danger;

  // ─── Radio-owned visual resolution ───────────────────────────────────────

  /**
   * Shared selection infrastructure supplies independent semantic
   * progress values.
   *
   * Radio owns the actual renderer and visual priority:
   *
   * disabled
   * ↓
   * inactive
   * ↓
   * error
   * ↓
   * pressed
   * ↓
   * normal
   */
  const radioColors = useDerivedValue(() => {
    // Ring: pressed → error → inactive → disabled

    const lightPressedBorder = interpolateColor(
      pressProgress.value,
      [0, 1],
      [lightBorderPrimary, lightBorderPressed],
    );

    const lightErrorBorder = interpolateColor(
      errorProgress.value,
      [0, 1],
      [lightPressedBorder, lightError],
    );

    const lightInactiveBorder = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [lightErrorBorder, lightBorderInactive],
    );

    const lightBorder = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightInactiveBorder, lightBorderDisabled],
    );

    const darkPressedBorder = interpolateColor(
      pressProgress.value,
      [0, 1],
      [darkBorderPrimary, darkBorderPressed],
    );

    const darkErrorBorder = interpolateColor(
      errorProgress.value,
      [0, 1],
      [darkPressedBorder, darkError],
    );

    const darkInactiveBorder = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [darkErrorBorder, darkBorderInactive],
    );

    const darkBorder = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkInactiveBorder, darkBorderDisabled],
    );

    // Dot:
    //
    // unchecked stays transparent in every modifier state.
    // checked uses normal / pressed / inactive / disabled colors.
    //
    // Error does not recolor the dot. Validation belongs to the
    // outer ring and error message.

    const lightPrimaryDot = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [lightDotTransparent, lightDotPrimary],
    );

    const lightPressedDotTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [lightDotTransparent, lightDotPressed],
    );

    const lightPressedDot = interpolateColor(
      pressProgress.value,
      [0, 1],
      [lightPrimaryDot, lightPressedDotTarget],
    );

    const lightInactiveDotTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [lightDotTransparent, lightDotInactive],
    );

    const lightInactiveDot = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [lightPressedDot, lightInactiveDotTarget],
    );

    const lightDisabledDotTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [lightDotTransparent, lightDotDisabled],
    );

    const lightDot = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightInactiveDot, lightDisabledDotTarget],
    );

    const darkPrimaryDot = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [darkDotTransparent, darkDotPrimary],
    );

    const darkPressedDotTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [darkDotTransparent, darkDotPressed],
    );

    const darkPressedDot = interpolateColor(
      pressProgress.value,
      [0, 1],
      [darkPrimaryDot, darkPressedDotTarget],
    );

    const darkInactiveDotTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [darkDotTransparent, darkDotInactive],
    );

    const darkInactiveDot = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [darkPressedDot, darkInactiveDotTarget],
    );

    const darkDisabledDotTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [darkDotTransparent, darkDotDisabled],
    );

    const darkDot = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkInactiveDot, darkDisabledDotTarget],
    );

    // Label: inactive → disabled
    //
    // Error intentionally keeps the normal label color.

    const lightInactiveText = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [lightTextPrimary, lightTextInactive],
    );

    const lightText = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightInactiveText, lightTextDisabled],
    );

    const darkInactiveText = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [darkTextPrimary, darkTextInactive],
    );

    const darkText = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkInactiveText, darkTextDisabled],
    );

    return {
      border: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkBorder, lightBorder],
      ),

      dot: interpolateColor(themeProgress.value, [0, 1], [darkDot, lightDot]),

      text: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkText, lightText],
      ),
    };
  });

  const errorColor = useDerivedValue(() =>
    interpolateColor(themeProgress.value, [0, 1], [darkError, lightError]),
  );

  // ─── Radio-owned animated styles ─────────────────────────────────────────

  /**
   * Ring and label/custom content receive the same SharedValue
   * separately so each scales around its own center.
   */
  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  /**
   * size is the outer Radio diameter before ARCUI font scaling.
   */
  const animatedRingGeometryStyle = useAnimatedStyle(() => {
    const scaledSize = resolvedSize * fontScale.value;

    return {
      width: scaledSize,

      height: scaledSize,

      borderRadius: scaledSize / 2,

      borderWidth: resolvedBorderWidth * fontScale.value,
    };
  });

  const animatedRingColorStyle = useAnimatedStyle(() => ({
    borderColor: radioColors.value.border,
  }));

  const animatedDotGeometryStyle = useAnimatedStyle(() => {
    const scaledDotSize = resolvedDotSize * fontScale.value;

    return {
      width: scaledDotSize,

      height: scaledDotSize,

      borderRadius: scaledDotSize / 2,
    };
  });

  const animatedDotColorStyle = useAnimatedStyle(() => ({
    backgroundColor: radioColors.value.dot,
  }));

  const labelFontSize = tokens.typography.radio.text.fontSize;
  const labelLineHeight = tokens.typography.radio.text.lineHeight;

  const animatedTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: labelFontSize * fontScale.value,

    lineHeight:
      labelLineHeight != null ? labelLineHeight * fontScale.value : undefined,
  }));

  const animatedTextColorStyle = useAnimatedStyle(() => ({
    color: radioColors.value.text,
  }));

  const errorFontSize = tokens.typography.radio.error.fontSize;
  const errorLineHeight = tokens.typography.radio.error.lineHeight;

  const animatedErrorTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: errorFontSize * fontScale.value,

    lineHeight:
      errorLineHeight != null ? errorLineHeight * fontScale.value : undefined,
  }));

  const animatedErrorTextColorStyle = useAnimatedStyle(() => ({
    color: errorColor.value,
  }));

  // ─── Selection interaction ───────────────────────────────────────────────

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      if (isInteractionDisabled) {
        return;
      }

      toggleChecked();

      onPress?.(event);
    },
    [isInteractionDisabled, toggleChecked, onPress],
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <Pressable
      {...pressableProps}
      testID={testID}
      style={style}
      disabled={isInteractionDisabled}
      role="radio"
      accessibilityRole="radio"
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      aria-checked={resolvedChecked}
      aria-disabled={isInteractionDisabled}
      accessibilityState={{
        ...accessibilityState,

        checked: resolvedChecked,

        disabled: isInteractionDisabled,
      }}
      onPress={handleOnPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.radioContainer, rowTokenStyle]}>
        <Animated.View
          testID={testID ? `${testID}-ring` : undefined}
          style={[
            styles.radio,
            animatedRingGeometryStyle,
            animatedRingColorStyle,
            animatedScaleStyle,
          ]}
        >
          <Animated.View
            testID={testID ? `${testID}-dot` : undefined}
            style={[animatedDotGeometryStyle, animatedDotColorStyle]}
          />
        </Animated.View>

        {hasContent &&
          (isTextContent ? (
            <Animated.Text
              testID={testID ? `${testID}-label` : undefined}
              allowFontScaling={false}
              maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
              style={[
                styles.text,
                labelTypographyStyle,
                animatedTextSizeStyle,
                animatedTextColorStyle,
                animatedScaleStyle,
                textStyle,
              ]}
            >
              {textContent}
            </Animated.Text>
          ) : (
            <Animated.View style={[styles.customContent, animatedScaleStyle]}>
              {children}
            </Animated.View>
          ))}
      </Animated.View>

      {hasError && (
        <Animated.View
          testID={testID ? `${testID}-error-row` : undefined}
          entering={entering}
          exiting={exiting}
          accessible
          role="alert"
          accessibilityRole="alert"
          accessibilityLabel={error}
          accessibilityLiveRegion="polite"
          style={[styles.errorContainer, errorRowTokenStyle]}
        >
          <Icon
            type="alertCircle"
            size={tokens.sizings.icon.xs}
            darkColor={darkError}
            lightColor={lightError}
          />

          <Animated.Text
            testID={testID ? `${testID}-error` : undefined}
            accessible={false}
            allowFontScaling={false}
            maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
            style={[
              styles.errorText,
              errorTypographyStyle,
              animatedErrorTextSizeStyle,
              animatedErrorTextColorStyle,
            ]}
          >
            {error}
          </Animated.Text>
        </Animated.View>
      )}
    </Pressable>
  );
};

export const Radio = memo(RadioComponent);

Radio.displayName = "Radio";

const styles = StyleSheet.create({
  radioContainer: {
    flexDirection: "row",

    alignItems: "center",
  },

  radio: {
    flexShrink: 0,

    /**
     * Important for multiline labels.
     *
     * The Radio belongs to the beginning of the label rather than
     * vertically centering against the entire wrapped paragraph.
     */
    alignSelf: "flex-start",

    justifyContent: "center",

    alignItems: "center",
  },

  text: {
    flexShrink: 1,
  },

  customContent: {
    flexShrink: 1,
  },

  errorContainer: {
    flexDirection: "row",

    alignItems: "center",
  },

  errorText: {
    flexShrink: 1,
  },
});
