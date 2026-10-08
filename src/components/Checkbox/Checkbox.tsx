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
import type { ICheckbox } from "./types";
import { resolveNonNegativeMetric } from "../../utils/numberUtils";

/**
 * Minimum total inset reserved around the check icon.
 *
 * With the default Checkbox geometry this leaves approximately
 * 2 logical pixels on each side before font scaling.
 *
 * Thicker custom borders can increase the effective inset further.
 */
const CHECK_ICON_TOTAL_INSET = 4;

const CheckboxComponent = ({
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
}: ICheckbox) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale } = useARCUISystem();

  const { entering, exiting } = useEnteringExiting();

  // ─── Native prop normalization ───────────────────────────────────────────

  /**
   * React Native PressableProps allows:
   *
   * boolean | null | undefined
   *
   * Internal ARCUI semantics operate on a strict boolean.
   */
  const resolvedDisabled = disabled === true;

  const isInteractionDisabled = resolvedDisabled || !active;

  // ─── Selection ownership ─────────────────────────────────────────────────

  const { resolvedChecked, toggleChecked } = useSelectionState({
    componentName: "Checkbox",

    checked,

    onCheckedChange,

    value,

    /**
     * Checkbox supports:
     *
     * - standalone controlled boolean ownership;
     * - single SelectionGroup ownership;
     * - multiple SelectionGroup ownership.
     */
    groupPolicy: "any",
  });

  // ─── Resolved props ──────────────────────────────────────────────────────

  const resolvedAnimation = animation ?? tokens.pressAnimation.type;

  const resolvedSize = resolveNonNegativeMetric(
    size,
    tokens.sizings.checkbox.size,
  );

  const resolvedBorderWidth = tokens.border.checkbox;

  /**
   * size - 4 is the normal case.
   *
   * A thicker border reserves additional space so the checkmark
   * never competes visually with the border.
   */
  const resolvedIconSize = Math.max(
    resolvedSize - Math.max(CHECK_ICON_TOTAL_INSET, resolvedBorderWidth * 2),
    0,
  );

  const hasError = error != null && error.length > 0;

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
    () => resolveAnimation(tokens.checkboxAnimations, tokens.animations),
    [tokens.checkboxAnimations, tokens.animations],
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
    () => resolveTypographyStyle(tokens.typography.checkbox.text).style,
    [tokens.typography.checkbox.text],
  );

  const errorTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.checkbox.error).style,
    [tokens.typography.checkbox.error],
  );

  // ─── Theme token extraction ──────────────────────────────────────────────

  const lightBorderPrimary = tokens.colors.light.checkbox.border.primary;

  const lightBorderPressed = tokens.colors.light.checkbox.border.pressed;

  const lightBorderDisabled = tokens.colors.light.checkbox.border.disabled;

  const lightBorderInactive = tokens.colors.light.checkbox.border.inactive;

  const darkBorderPrimary = tokens.colors.dark.checkbox.border.primary;

  const darkBorderPressed = tokens.colors.dark.checkbox.border.pressed;

  const darkBorderDisabled = tokens.colors.dark.checkbox.border.disabled;

  const darkBorderInactive = tokens.colors.dark.checkbox.border.inactive;

  const lightBackgroundPrimary =
    tokens.colors.light.checkbox.background.primary;

  const lightBackgroundPressed =
    tokens.colors.light.checkbox.background.pressed;

  const lightBackgroundDisabled =
    tokens.colors.light.checkbox.background.disabled;

  const lightBackgroundInactive =
    tokens.colors.light.checkbox.background.inactive;

  const lightBackgroundTransparent =
    tokens.colors.light.checkbox.background.transparent;

  const darkBackgroundPrimary = tokens.colors.dark.checkbox.background.primary;

  const darkBackgroundPressed = tokens.colors.dark.checkbox.background.pressed;

  const darkBackgroundDisabled =
    tokens.colors.dark.checkbox.background.disabled;

  const darkBackgroundInactive =
    tokens.colors.dark.checkbox.background.inactive;

  const darkBackgroundTransparent =
    tokens.colors.dark.checkbox.background.transparent;

  const lightTextPrimary = tokens.colors.light.checkbox.text.primary;

  const lightTextDisabled = tokens.colors.light.checkbox.text.disabled;

  const lightTextInactive = tokens.colors.light.checkbox.text.inactive;

  const darkTextPrimary = tokens.colors.dark.checkbox.text.primary;

  const darkTextDisabled = tokens.colors.dark.checkbox.text.disabled;

  const darkTextInactive = tokens.colors.dark.checkbox.text.inactive;

  const lightCheckIcon = tokens.colors.light.checkbox.icon;

  const darkCheckIcon = tokens.colors.dark.checkbox.icon;

  const lightError = tokens.colors.light.states.danger;

  const darkError = tokens.colors.dark.states.danger;

  // ─── Checkbox-owned visual resolution ────────────────────────────────────

  /**
   * Shared selection infrastructure supplies semantic progress values.
   *
   * Checkbox owns its renderer and visual priority:
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
  const checkboxColors = useDerivedValue(() => {
    // Border: pressed → error → inactive → disabled

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

    // Background:
    // unchecked remains transparent in every semantic state.
    // checked uses the corresponding state background.

    const lightPrimaryBackground = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [lightBackgroundTransparent, lightBackgroundPrimary],
    );

    const lightPressedBackgroundTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [lightBackgroundTransparent, lightBackgroundPressed],
    );

    const lightPressedBackground = interpolateColor(
      pressProgress.value,
      [0, 1],
      [lightPrimaryBackground, lightPressedBackgroundTarget],
    );

    const lightInactiveBackgroundTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [lightBackgroundTransparent, lightBackgroundInactive],
    );

    const lightInactiveBackground = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [lightPressedBackground, lightInactiveBackgroundTarget],
    );

    const lightDisabledBackgroundTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [lightBackgroundTransparent, lightBackgroundDisabled],
    );

    const lightBackground = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightInactiveBackground, lightDisabledBackgroundTarget],
    );

    const darkPrimaryBackground = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [darkBackgroundTransparent, darkBackgroundPrimary],
    );

    const darkPressedBackgroundTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [darkBackgroundTransparent, darkBackgroundPressed],
    );

    const darkPressedBackground = interpolateColor(
      pressProgress.value,
      [0, 1],
      [darkPrimaryBackground, darkPressedBackgroundTarget],
    );

    const darkInactiveBackgroundTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [darkBackgroundTransparent, darkBackgroundInactive],
    );

    const darkInactiveBackground = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [darkPressedBackground, darkInactiveBackgroundTarget],
    );

    const darkDisabledBackgroundTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [darkBackgroundTransparent, darkBackgroundDisabled],
    );

    const darkBackground = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkInactiveBackground, darkDisabledBackgroundTarget],
    );

    // Text: inactive → disabled
    //
    // Error intentionally keeps the normal label color.
    // Validation remains represented by border + error message.

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

      background: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkBackground, lightBackground],
      ),

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

  // ─── Checkbox-owned animated styles ──────────────────────────────────────

  /**
   * Box and label intentionally receive the same scale SharedValue
   * through separate styles.
   *
   * Each therefore scales around its own center rather than treating
   * the complete row as one rigid transform group.
   */
  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  /**
   * Existing Checkbox geometry behavior is intentionally preserved.
   */
  const animatedBoxGeometryStyle = useAnimatedStyle(() => ({
    width: resolvedSize * fontScale.value,

    height: resolvedSize * fontScale.value,

    borderWidth: resolvedBorderWidth * fontScale.value,
  }));

  const animatedBoxColorStyle = useAnimatedStyle(() => ({
    borderColor: checkboxColors.value.border,

    backgroundColor: checkboxColors.value.background,
  }));

  const animatedCheckStyle = useAnimatedStyle(() => ({
    opacity: checkedProgress.value,
  }));

  const labelFontSize = tokens.typography.checkbox.text.fontSize;
  const labelLineHeight = tokens.typography.checkbox.text.lineHeight;

  const animatedTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: labelFontSize * fontScale.value,

    lineHeight:
      labelLineHeight != null ? labelLineHeight * fontScale.value : undefined,
  }));

  const animatedTextColorStyle = useAnimatedStyle(() => ({
    color: checkboxColors.value.text,
  }));

  const errorFontSize = tokens.typography.checkbox.error.fontSize;
  const errorLineHeight = tokens.typography.checkbox.error.lineHeight;

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
      role="checkbox"
      accessibilityRole="checkbox"
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
      <Animated.View style={[styles.checkboxContainer, rowTokenStyle]}>
        <Animated.View
          testID={testID ? `${testID}-box` : undefined}
          style={[
            styles.checkbox,
            {
              borderRadius: tokens.radius.checkbox,
            },
            animatedBoxGeometryStyle,
            animatedBoxColorStyle,
            animatedScaleStyle,
          ]}
        >
          <Animated.View style={animatedCheckStyle}>
            <Icon
              type="check"
              size={resolvedIconSize}
              scaleWithFont
              darkColor={darkCheckIcon}
              lightColor={lightCheckIcon}
            />
          </Animated.View>
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
            scaleWithFont
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

export const Checkbox = memo(CheckboxComponent);

Checkbox.displayName = "Checkbox";

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: "row",

    alignItems: "center",
  },

  checkbox: {
    flexShrink: 0,

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
