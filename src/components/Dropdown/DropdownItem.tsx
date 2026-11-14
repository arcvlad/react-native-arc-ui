import { memo, useCallback, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, type ViewStyle } from "react-native";
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
import { Icon } from "../Icon/Icon";
import { resolveThemeColor } from "../../utils/resolveThemeColor";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type {
  IDropdownItemColors,
  TDropdownItem,
  TDropdownItemTone,
} from "./types";

interface IDropdownItem {
  item: TDropdownItem;
  colors?: Readonly<IDropdownItemColors>;
  separatorColor: Readonly<{ light: string; dark: string }>;

  /**
   * Selection is reported with both identity and the complete item.
   *
   * Dropdown owns closing the host and forwarding the public
   * onSelect(value, item) callback.
   */
  onPress: (value: string, item: TDropdownItem) => void;

  /**
   * Derived by Dropdown when the item itself does not provide testID.
   */
  testID?: string;
}

const resolveDropdownItemTone = (value: unknown): TDropdownItemTone => {
  if (value === undefined || value === "neutral" || value === "danger") {
    return value ?? "neutral";
  }

  if (__DEV__) {
    console.error(
      `[react-native-arc-ui] Dropdown item tone "${String(
        value,
      )}" is invalid. Falling back to "neutral".`,
    );
  }

  return "neutral";
};

const DropdownItemComponent = ({
  item,
  colors,
  separatorColor,
  onPress,
  testID,
}: IDropdownItem) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale } = useARCUISystem();

  const prefersReducedMotion = useReducedMotion();

  const pressProgress = useSharedValue(0);

  const isDisabled = item.disabled ?? false;

  const resolvedTestID = item.testID ?? testID;

  const itemMinHeight = tokens.sizings.dropdown.itemMinHeight;

  const pressDuration = tokens.pressAnimation.duration;

  const resolvedTone = resolveDropdownItemTone(item.tone);
  const isDanger = resolvedTone === "danger";

  const lightPalette = tokens.colors.light.dropdown.item;
  const darkPalette = tokens.colors.dark.dropdown.item;

  // ─── Background colors ────────────────────────────────────────────────────

  const rootBackgroundDefault = resolveThemeColor(
    colors?.background?.default,
    lightPalette.background.default,
    darkPalette.background.default,
    "Dropdown colors.item.background.default",
  );
  const rootBackgroundPressed = resolveThemeColor(
    colors?.background?.pressed,
    lightPalette.background.pressed,
    darkPalette.background.pressed,
    "Dropdown colors.item.background.pressed",
  );
  const rootBackgroundDisabled = resolveThemeColor(
    colors?.background?.disabled,
    lightPalette.background.disabled,
    darkPalette.background.disabled,
    "Dropdown colors.item.background.disabled",
  );

  const backgroundDefault = resolveThemeColor(
    item.colors?.background?.default,
    rootBackgroundDefault.light,
    rootBackgroundDefault.dark,
    "Dropdown item colors.background.default",
  );
  const backgroundPressed = resolveThemeColor(
    item.colors?.background?.pressed,
    rootBackgroundPressed.light,
    rootBackgroundPressed.dark,
    "Dropdown item colors.background.pressed",
  );
  const backgroundDisabled = resolveThemeColor(
    item.colors?.background?.disabled,
    rootBackgroundDisabled.light,
    rootBackgroundDisabled.dark,
    "Dropdown item colors.background.disabled",
  );

  const lightBackgroundDefault = backgroundDefault.light;
  const darkBackgroundDefault = backgroundDefault.dark;
  const lightBackgroundPressed = backgroundPressed.light;
  const darkBackgroundPressed = backgroundPressed.dark;
  const lightBackgroundDisabled = backgroundDisabled.light;
  const darkBackgroundDisabled = backgroundDisabled.dark;

  const lightBackground = isDisabled
    ? lightBackgroundDisabled
    : lightBackgroundDefault;
  const darkBackground = isDisabled
    ? darkBackgroundDisabled
    : darkBackgroundDefault;

  // ─── Text colors ──────────────────────────────────────────────────────────

  const lightToneText = isDanger
    ? lightPalette.text.danger
    : lightPalette.text.primary;
  const darkToneText = isDanger
    ? darkPalette.text.danger
    : darkPalette.text.primary;

  const rootTextDefault = resolveThemeColor(
    colors?.text?.default,
    lightToneText,
    darkToneText,
    "Dropdown colors.item.text.default",
  );
  const rootTextDisabled = resolveThemeColor(
    colors?.text?.disabled,
    lightPalette.text.disabled,
    darkPalette.text.disabled,
    "Dropdown colors.item.text.disabled",
  );

  const textDefault = resolveThemeColor(
    item.colors?.text?.default,
    rootTextDefault.light,
    rootTextDefault.dark,
    "Dropdown item colors.text.default",
  );
  const textDisabled = resolveThemeColor(
    item.colors?.text?.disabled,
    rootTextDisabled.light,
    rootTextDisabled.dark,
    "Dropdown item colors.text.disabled",
  );

  const lightText = isDisabled ? textDisabled.light : textDefault.light;
  const darkText = isDisabled ? textDisabled.dark : textDefault.dark;

  // ─── Icon colors ──────────────────────────────────────────────────────────

  const lightToneIcon = isDanger
    ? lightPalette.icon.danger
    : lightPalette.icon.primary;
  const darkToneIcon = isDanger
    ? darkPalette.icon.danger
    : darkPalette.icon.primary;

  const rootIconDefault = resolveThemeColor(
    colors?.icon?.default,
    lightToneIcon,
    darkToneIcon,
    "Dropdown colors.item.icon.default",
  );
  const rootIconDisabled = resolveThemeColor(
    colors?.icon?.disabled,
    lightPalette.icon.disabled,
    darkPalette.icon.disabled,
    "Dropdown colors.item.icon.disabled",
  );

  const iconDefault = resolveThemeColor(
    item.colors?.icon?.default,
    rootIconDefault.light,
    rootIconDefault.dark,
    "Dropdown item colors.icon.default",
  );
  const iconDisabled = resolveThemeColor(
    item.colors?.icon?.disabled,
    rootIconDisabled.light,
    rootIconDisabled.dark,
    "Dropdown item colors.icon.disabled",
  );

  const lightIcon = isDisabled ? iconDisabled.light : iconDefault.light;
  const darkIcon = isDisabled ? iconDisabled.dark : iconDefault.dark;

  // ─── Separator colors ─────────────────────────────────────────────────────

  const lightSeparator = separatorColor.light;
  const darkSeparator = separatorColor.dark;

  // ─── Static token-driven styles ─────────────────

  const rowLayoutStyle = useMemo<ViewStyle>(
    () => ({
      paddingHorizontal: tokens.sizings.dropdown.itemPaddingHorizontal,

      paddingVertical: tokens.sizings.dropdown.itemPaddingVertical,

      gap: tokens.sizings.dropdown.itemGap,
    }),
    [
      tokens.sizings.dropdown.itemPaddingHorizontal,
      tokens.sizings.dropdown.itemPaddingVertical,
      tokens.sizings.dropdown.itemGap,
    ],
  );

  const separatorLayoutStyle = useMemo<ViewStyle>(
    () => ({
      left: tokens.sizings.dropdown.separatorInset,

      right: tokens.sizings.dropdown.separatorInset,

      height: tokens.sizings.dropdown.separatorThickness,
    }),
    [
      tokens.sizings.dropdown.separatorInset,
      tokens.sizings.dropdown.separatorThickness,
    ],
  );

  const labelTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.dropdown.item).style,
    [tokens.typography.dropdown.item],
  );

  const itemLineHeight = tokens.typography.dropdown.item.lineHeight;

  // ─── Interaction ────────────────────────────────

  const handlePress = useCallback(() => {
    if (isDisabled) {
      return;
    }

    onPress(item.value, item);
  }, [isDisabled, item, onPress]);

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

  /**
   * An item may become disabled while the Dropdown is already open.
   *
   * Never leave an interrupted pressed visual state active after
   * interaction has become unavailable.
   */
  useEffect(() => {
    if (!isDisabled) {
      return;
    }

    cancelAnimation(pressProgress);

    pressProgress.value = 0;
  }, [isDisabled, pressProgress]);

  // ─── Animated styles ────────────────────────────

  const animatedRowStyle = useAnimatedStyle(() => {
    const baseBackground = interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBackground, lightBackground],
    );

    const pressedBackground = interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBackgroundPressed, lightBackgroundPressed],
    );

    return {
      backgroundColor: isDisabled
        ? baseBackground
        : interpolateColor(
            pressProgress.value,
            [0, 1],
            [baseBackground, pressedBackground],
          ),

      /**
       * ARCUI font scaling owns the minimum interactive row height.
       *
       * minHeight rather than height allows multiline accessibility
       * labels to grow naturally instead of being clipped.
       */
      minHeight: itemMinHeight * fontScale.value,
    };
  });

  const itemFontSize = tokens.typography.dropdown.item.fontSize;

  const animatedTextSizeStyle = useAnimatedStyle(() => ({
    /**
     * Native scaling is disabled below because ARCUI already applies the
     * clamped system font scale through this SharedValue.
     */
    fontSize: itemFontSize * fontScale.value,

    lineHeight:
      itemLineHeight != null ? itemLineHeight * fontScale.value : undefined,
  }));

  const animatedTextColorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(themeProgress.value, [0, 1], [darkText, lightText]),
  }));

  const animatedSeparatorStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkSeparator, lightSeparator],
    ),
  }));

  return (
    <Pressable
      testID={resolvedTestID}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      role="menuitem"
      accessibilityRole="menuitem"
      accessibilityLabel={item.label}
      aria-disabled={isDisabled}
      accessibilityState={{
        disabled: isDisabled,
      }}
    >
      <Animated.View style={[styles.row, rowLayoutStyle, animatedRowStyle]}>
        {item.icon && (
          <Icon
            type={item.icon}
            size={tokens.sizings.icon.s}
            colors={{
              icon: {
                light: lightIcon,
                dark: darkIcon,
              },
            }}
            testID={resolvedTestID ? `${resolvedTestID}-icon` : undefined}
            accessible={false}
          />
        )}

        <Animated.Text
          allowFontScaling={false}
          maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
          style={[
            styles.label,
            labelTypographyStyle,
            animatedTextSizeStyle,
            animatedTextColorStyle,
          ]}
          testID={resolvedTestID ? `${resolvedTestID}-label` : undefined}
          accessible={false}
        >
          {item.label}
        </Animated.Text>

        {item.separator && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.separator,
              separatorLayoutStyle,
              animatedSeparatorStyle,
            ]}
            testID={resolvedTestID ? `${resolvedTestID}-separator` : undefined}
            accessible={false}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};

export const DropdownItem = memo(DropdownItemComponent);

DropdownItem.displayName = "DropdownItem";

const styles = StyleSheet.create({
  row: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    flex: 1,
  },

  /**
   * The separator belongs visually to the row but must not participate
   * in normal layout height; otherwise maxVisibleItems becomes inaccurate.
   */
  separator: {
    position: "absolute",
    bottom: 0,
  },
});
