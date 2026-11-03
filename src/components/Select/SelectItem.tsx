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
import { resolveThemeColor } from "../../utils/resolveThemeColor";
import { Icon } from "../Icon/Icon";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { ISelectItemColors, TSelectOption } from "./types";

interface ISelectItem {
  option: TSelectOption;
  colors?: Readonly<ISelectItemColors>;
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
  colors,
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

  // ─── Color endpoints ───────────────────────────────────────────────────────

  const lightPalette = tokens.colors.light.select.item;
  const darkPalette = tokens.colors.dark.select.item;

  const backgroundDefault = resolveThemeColor(
    colors?.background?.default,
    lightPalette.background.default,
    darkPalette.background.default,
    "Select colors.item.background.default",
  );
  const backgroundSelected = resolveThemeColor(
    colors?.background?.selected,
    lightPalette.background.selected,
    darkPalette.background.selected,
    "Select colors.item.background.selected",
  );
  const backgroundPressed = resolveThemeColor(
    colors?.background?.pressed,
    lightPalette.background.pressed,
    darkPalette.background.pressed,
    "Select colors.item.background.pressed",
  );

  const textDefault = resolveThemeColor(
    colors?.text?.default,
    lightPalette.text.default,
    darkPalette.text.default,
    "Select colors.item.text.default",
  );
  const textSelected = resolveThemeColor(
    colors?.text?.selected,
    lightPalette.text.selected,
    darkPalette.text.selected,
    "Select colors.item.text.selected",
  );
  const textDisabled = resolveThemeColor(
    colors?.text?.disabled,
    lightPalette.text.disabled,
    darkPalette.text.disabled,
    "Select colors.item.text.disabled",
  );

  const iconDefault = resolveThemeColor(
    colors?.icon?.default,
    lightPalette.icon.default,
    darkPalette.icon.default,
    "Select colors.item.icon.default",
  );
  const iconSelected = resolveThemeColor(
    colors?.icon?.selected,
    lightPalette.icon.selected,
    darkPalette.icon.selected,
    "Select colors.item.icon.selected",
  );
  const iconDisabled = resolveThemeColor(
    colors?.icon?.disabled,
    lightPalette.icon.disabled,
    darkPalette.icon.disabled,
    "Select colors.item.icon.disabled",
  );

  const lightBgDefault = backgroundDefault.light;
  const darkBgDefault = backgroundDefault.dark;
  const lightBgSelected = backgroundSelected.light;
  const darkBgSelected = backgroundSelected.dark;
  const lightBgPressed = backgroundPressed.light;
  const darkBgPressed = backgroundPressed.dark;

  const lightTextDefault = textDefault.light;
  const darkTextDefault = textDefault.dark;
  const lightTextSelected = textSelected.light;
  const darkTextSelected = textSelected.dark;
  const lightTextDisabled = textDisabled.light;
  const darkTextDisabled = textDisabled.dark;

  const lightIconDefault = iconDefault.light;
  const darkIconDefault = iconDefault.dark;
  const lightIconSelected = iconSelected.light;
  const darkIconSelected = iconSelected.dark;
  const lightIconDisabled = iconDisabled.light;
  const darkIconDisabled = iconDisabled.dark;

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
              colors={{
                icon: {
                  light: lightIcon,
                  dark: darkIcon,
                },
              }}
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
                  colors={{
                    icon: {
                      light: lightIcon,
                      dark: darkIcon,
                    },
                  }}
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
