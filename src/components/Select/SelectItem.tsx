import { memo, useCallback, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { Icon } from "../Icon/Icon";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { TSelectOption } from "./types";

interface ISelectItem {
  option: TSelectOption;
  isSelected: boolean;
  multiple: boolean;

  /**
   * Base row height before ARCUI font scaling.
   */
  itemHeight: number;

  /**
   * Parent-level unavailable state.
   *
   * Covers both Select disabled and inactive states.
   */
  interactionDisabled: boolean;

  onPress: (option: TSelectOption) => void;

  testID?: string;
}

const SelectItemComponent = ({
  option,
  isSelected,
  multiple,
  itemHeight,
  interactionDisabled,
  onPress,
  testID,
}: ISelectItem) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale } = useARCUISystem();

  const prefersReducedMotion = useReducedMotion();

  // ─── Availability ─────────────────────────────────────────────────────────

  const isDisabled = interactionDisabled || option.disabled === true;

  // ─── Animation configuration ──────────────────────────────────────────────

  const selectionAnimationConfig = useMemo(
    () => resolveAnimation(tokens.selectAnimations, tokens.animations),
    [tokens.selectAnimations, tokens.animations],
  );

  const pressDuration = tokens.pressAnimation.duration;

  // ─── Shared visual progress ────────────────────────────────────────────────

  const selectedProgress = useSharedValue(isSelected ? 1 : 0);

  const pressProgress = useSharedValue(0);

  // ─── Selection motion ─────────────────────────────────────────────────────

  useEffect(() => {
    cancelAnimation(selectedProgress);

    const target = isSelected ? 1 : 0;

    if (prefersReducedMotion) {
      selectedProgress.value = target;

      return;
    }

    selectedProgress.value = withTiming(target, selectionAnimationConfig);
  }, [
    isSelected,
    prefersReducedMotion,
    selectionAnimationConfig,
    selectedProgress,
  ]);

  // ─── Press lifecycle ──────────────────────────────────────────────────────

  /**
   * A row becoming unavailable while pressed must never retain stale
   * pressed feedback.
   */
  useEffect(() => {
    if (!isDisabled) {
      return;
    }

    cancelAnimation(pressProgress);

    pressProgress.value = 0;
  }, [isDisabled, pressProgress]);

  const handlePress = useCallback(() => {
    if (isDisabled) {
      return;
    }

    onPress(option);
  }, [isDisabled, onPress, option]);

  const handlePressIn = useCallback(() => {
    if (isDisabled) {
      return;
    }

    cancelAnimation(pressProgress);

    if (prefersReducedMotion) {
      pressProgress.value = 1;

      return;
    }

    pressProgress.value = withTiming(1, {
      duration: pressDuration,
    });
  }, [isDisabled, prefersReducedMotion, pressDuration, pressProgress]);

  const handlePressOut = useCallback(() => {
    cancelAnimation(pressProgress);

    if (prefersReducedMotion) {
      pressProgress.value = 0;

      return;
    }

    pressProgress.value = withTiming(0, {
      duration: pressDuration,
    });
  }, [prefersReducedMotion, pressDuration, pressProgress]);

  // ─── Static token styles ──────────────────────────────────────────────────

  const itemTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.select.item).style,
    [tokens.typography.select.item],
  );

  const innerTokenStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.sizings.select.itemGap,
    }),
    [tokens.sizings.select.itemGap],
  );

  const checkSlotStyle = useMemo<ViewStyle>(
    () => ({
      width: tokens.sizings.select.checkSlotWidth,
    }),
    [tokens.sizings.select.checkSlotWidth],
  );

  // ─── Token extraction ─────────────────────────────────────────────────────

  const lightBgDefault = tokens.colors.light.select.item.background.default;

  const darkBgDefault = tokens.colors.dark.select.item.background.default;

  const lightBgSelected = tokens.colors.light.select.item.background.selected;

  const darkBgSelected = tokens.colors.dark.select.item.background.selected;

  const lightBgPressed = tokens.colors.light.select.item.background.pressed;

  const darkBgPressed = tokens.colors.dark.select.item.background.pressed;

  const lightTextDefault = tokens.colors.light.select.item.text.default;

  const darkTextDefault = tokens.colors.dark.select.item.text.default;

  const lightTextSelected = tokens.colors.light.select.item.text.selected;

  const darkTextSelected = tokens.colors.dark.select.item.text.selected;

  const lightTextDisabled = tokens.colors.light.select.item.text.disabled;

  const darkTextDisabled = tokens.colors.dark.select.item.text.disabled;

  const lightIconDefault = tokens.colors.light.select.item.icon.default;

  const darkIconDefault = tokens.colors.dark.select.item.icon.default;

  const lightIconSelected = tokens.colors.light.select.item.icon.selected;

  const darkIconSelected = tokens.colors.dark.select.item.icon.selected;

  const lightIconDisabled = tokens.colors.light.select.item.icon.disabled;

  const darkIconDisabled = tokens.colors.dark.select.item.icon.disabled;

  const itemRadius = tokens.radius.selectItem;

  const baseFontSize = tokens.typography.select.item.fontSize;

  const iconSize = tokens.sizings.icon.s;

  const itemMarginVertical = tokens.sizings.select.itemMarginVertical;

  const itemMarginHorizontal = tokens.sizings.select.itemMarginHorizontal;

  const itemPaddingHorizontal = tokens.sizings.select.itemPaddingHorizontal;

  // ─── Resolved icon endpoint ───────────────────────────────────────────────

  /**
   * Icon itself owns theme interpolation, so selection uses a resolved React
   * endpoint while row background/text selection is animated independently.
   */
  const lightIcon = isDisabled
    ? lightIconDisabled
    : isSelected
      ? lightIconSelected
      : lightIconDefault;

  const darkIcon = isDisabled
    ? darkIconDisabled
    : isSelected
      ? darkIconSelected
      : darkIconDefault;

  // ─── Animated styles ──────────────────────────────────────────────────────

  /**
   * Outer particle height follows ARCUI font scale.
   *
   * This stays aligned with Select's list-height calculation.
   */
  const animatedPressableStyle = useAnimatedStyle(() => ({
    height: itemHeight * fontScale.value,
  }));

  /**
   * Selection and press are independent visual dimensions.
   *
   * selectedProgress resolves default ↔ selected first, then pressProgress
   * resolves base ↔ pressed. This prevents React selection endpoint changes
   * from flashing while press-out is still reversing.
   */
  const animatedInnerStyle = useAnimatedStyle(() => {
    const lightBaseBackground = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightBgDefault, lightBgSelected],
    );

    const darkBaseBackground = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkBgDefault, darkBgSelected],
    );

    const baseBackground = interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBaseBackground, lightBaseBackground],
    );

    const pressedBackground = interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBgPressed, lightBgPressed],
    );

    return {
      flex: 1,

      marginVertical: itemMarginVertical * fontScale.value,

      marginHorizontal: itemMarginHorizontal * fontScale.value,

      paddingHorizontal: itemPaddingHorizontal * fontScale.value,

      borderRadius: itemRadius,

      backgroundColor: interpolateColor(
        pressProgress.value,
        [0, 1],
        [baseBackground, pressedBackground],
      ),
    };
  });

  const itemLineHeight = tokens.typography.select.item.lineHeight;

  const animatedTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: baseFontSize * fontScale.value,

    lineHeight:
      itemLineHeight != null ? itemLineHeight * fontScale.value : undefined,
  }));

  const animatedTextColorStyle = useAnimatedStyle(() => {
    const lightSelectionText = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightTextDefault, lightTextSelected],
    );

    const darkSelectionText = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkTextDefault, darkTextSelected],
    );

    const resolvedLightText = isDisabled
      ? lightTextDisabled
      : lightSelectionText;

    const resolvedDarkText = isDisabled ? darkTextDisabled : darkSelectionText;

    return {
      color: interpolateColor(
        themeProgress.value,
        [0, 1],
        [resolvedDarkText, resolvedLightText],
      ),
    };
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Animated.View
      testID={testID}
      style={[styles.pressable, animatedPressableStyle]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        role="menuitem"
        accessibilityRole="menuitem"
        accessibilityLabel={option.label}
        aria-selected={isSelected}
        aria-disabled={isDisabled}
        accessibilityState={{
          disabled: isDisabled,

          selected: isSelected,
        }}
        style={styles.pressableFill}
      >
        <Animated.View
          style={[styles.inner, innerTokenStyle, animatedInnerStyle]}
        >
          {option.icon && (
            <Icon
              type={option.icon}
              size={iconSize}
              lightColor={lightIcon}
              darkColor={darkIcon}
              accessible={false}
            />
          )}

          <Animated.Text
            testID={testID ? `${testID}-label` : undefined}
            allowFontScaling={false}
            maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
            style={[
              styles.label,
              itemTypographyStyle,
              animatedTextSizeStyle,
              animatedTextColorStyle,
            ]}
            numberOfLines={1}
            accessible={false}
          >
            {option.label}
          </Animated.Text>

          {(multiple || isSelected) && (
            <View
              testID={isSelected && testID ? `${testID}-check` : undefined}
              style={[styles.checkContainer, checkSlotStyle]}
            >
              {isSelected && (
                <Icon
                  type="check"
                  size={iconSize}
                  lightColor={lightIcon}
                  darkColor={darkIcon}
                  accessible={false}
                />
              )}
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export const SelectItem = memo(SelectItemComponent);

SelectItem.displayName = "SelectItem";

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
  },

  pressableFill: {
    flex: 1,
  },

  inner: {
    flexDirection: "row",

    alignItems: "center",
  },

  label: {
    flex: 1,
  },

  checkContainer: {
    alignItems: "center",

    justifyContent: "center",
  },
});
