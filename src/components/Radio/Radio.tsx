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
import { resolveThemeColor } from "../../utils/resolveThemeColor";
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
  colors,
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

  // ─── Theme color endpoints ───────────────────────────────────────────────

  const resolvedBorderDefault = resolveThemeColor(
    colors?.border?.default,
    tokens.colors.light.radio.border.primary,
    tokens.colors.dark.radio.border.primary,
    "Radio colors.border.default",
  );
  const resolvedBorderPressed = resolveThemeColor(
    colors?.border?.pressed,
    tokens.colors.light.radio.border.pressed,
    tokens.colors.dark.radio.border.pressed,
    "Radio colors.border.pressed",
  );
  const resolvedBorderDisabled = resolveThemeColor(
    colors?.border?.disabled,
    tokens.colors.light.radio.border.disabled,
    tokens.colors.dark.radio.border.disabled,
    "Radio colors.border.disabled",
  );
  const resolvedBorderInactive = resolveThemeColor(
    colors?.border?.inactive,
    tokens.colors.light.radio.border.inactive,
    tokens.colors.dark.radio.border.inactive,
    "Radio colors.border.inactive",
  );

  const lightBorderPrimary = resolvedBorderDefault.light;
  const darkBorderPrimary = resolvedBorderDefault.dark;
  const lightBorderPressed = resolvedBorderPressed.light;
  const darkBorderPressed = resolvedBorderPressed.dark;
  const lightBorderDisabled = resolvedBorderDisabled.light;
  const darkBorderDisabled = resolvedBorderDisabled.dark;
  const lightBorderInactive = resolvedBorderInactive.light;
  const darkBorderInactive = resolvedBorderInactive.dark;

  const resolvedBackgroundChecked = resolveThemeColor(
    colors?.background?.checked,
    tokens.colors.light.radio.background.primary,
    tokens.colors.dark.radio.background.primary,
    "Radio colors.background.checked",
  );
  const resolvedBackgroundPressed = resolveThemeColor(
    colors?.background?.pressed,
    tokens.colors.light.radio.background.pressed,
    tokens.colors.dark.radio.background.pressed,
    "Radio colors.background.pressed",
  );
  const resolvedBackgroundDisabled = resolveThemeColor(
    colors?.background?.disabled,
    tokens.colors.light.radio.background.disabled,
    tokens.colors.dark.radio.background.disabled,
    "Radio colors.background.disabled",
  );
  const resolvedBackgroundInactive = resolveThemeColor(
    colors?.background?.inactive,
    tokens.colors.light.radio.background.inactive,
    tokens.colors.dark.radio.background.inactive,
    "Radio colors.background.inactive",
  );
  const resolvedBackgroundUnchecked = resolveThemeColor(
    colors?.background?.unchecked,
    tokens.colors.light.radio.background.transparent,
    tokens.colors.dark.radio.background.transparent,
    "Radio colors.background.unchecked",
  );

  const lightDotPrimary = resolvedBackgroundChecked.light;
  const darkDotPrimary = resolvedBackgroundChecked.dark;
  const lightDotPressed = resolvedBackgroundPressed.light;
  const darkDotPressed = resolvedBackgroundPressed.dark;
  const lightDotDisabled = resolvedBackgroundDisabled.light;
  const darkDotDisabled = resolvedBackgroundDisabled.dark;
  const lightDotInactive = resolvedBackgroundInactive.light;
  const darkDotInactive = resolvedBackgroundInactive.dark;
  const lightDotTransparent = resolvedBackgroundUnchecked.light;
  const darkDotTransparent = resolvedBackgroundUnchecked.dark;

  const resolvedTextDefault = resolveThemeColor(
    colors?.text?.default,
    tokens.colors.light.radio.text.primary,
    tokens.colors.dark.radio.text.primary,
    "Radio colors.text.default",
  );
  const resolvedTextDisabled = resolveThemeColor(
    colors?.text?.disabled,
    tokens.colors.light.radio.text.disabled,
    tokens.colors.dark.radio.text.disabled,
    "Radio colors.text.disabled",
  );
  const resolvedTextInactive = resolveThemeColor(
    colors?.text?.inactive,
    tokens.colors.light.radio.text.inactive,
    tokens.colors.dark.radio.text.inactive,
    "Radio colors.text.inactive",
  );

  const lightTextPrimary = resolvedTextDefault.light;
  const darkTextPrimary = resolvedTextDefault.dark;
  const lightTextDisabled = resolvedTextDisabled.light;
  const darkTextDisabled = resolvedTextDisabled.dark;
  const lightTextInactive = resolvedTextInactive.light;
  const darkTextInactive = resolvedTextInactive.dark;

  const resolvedError = resolveThemeColor(
    colors?.error,
    tokens.colors.light.radio.error,
    tokens.colors.dark.radio.error,
    "Radio colors.error",
  );
  const lightError = resolvedError.light;
  const darkError = resolvedError.dark;

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
            colors={{
              icon: {
                light: lightError,
                dark: darkError,
              },
            }}
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
