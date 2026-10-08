import { memo, useCallback, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { Icon } from "../Icon/Icon";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { TDropdownItem } from "./types";

interface IDropdownItem {
  item: TDropdownItem;

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

const DropdownItemComponent = ({ item, onPress, testID }: IDropdownItem) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale } = useARCUISystem();

  const pressProgress = useSharedValue(0);

  const isDisabled = item.disabled ?? false;

  const resolvedTestID = item.testID ?? testID;

  const itemMinHeight = tokens.sizings.dropdown.itemMinHeight;

  const hasCustomThemePair =
    item.darkColor !== undefined && item.lightColor !== undefined;

  /**
   * Custom color resolution is shared by text and icon:
   *
   * 1. color -> fixed in both themes
   * 2. complete darkColor + lightColor pair
   * 3. incomplete pair -> ignored
   * 4. semantic destructive / primary tokens
   *
   * Disabled state intentionally overrides every custom color.
   */
  const customLightColor =
    item.color ?? (hasCustomThemePair ? item.lightColor : undefined);

  const customDarkColor =
    item.color ?? (hasCustomThemePair ? item.darkColor : undefined);

  // ─── Background colors ──────────────────────────

  const lightBackgroundDefault =
    tokens.colors.light.dropdown.item.background.default;

  const darkBackgroundDefault =
    tokens.colors.dark.dropdown.item.background.default;

  const lightBackgroundPressed =
    tokens.colors.light.dropdown.item.background.pressed;

  const darkBackgroundPressed =
    tokens.colors.dark.dropdown.item.background.pressed;

  const lightBackgroundDisabled =
    tokens.colors.light.dropdown.item.background.disabled;

  const darkBackgroundDisabled =
    tokens.colors.dark.dropdown.item.background.disabled;

  const lightBackground = isDisabled
    ? lightBackgroundDisabled
    : lightBackgroundDefault;

  const darkBackground = isDisabled
    ? darkBackgroundDisabled
    : darkBackgroundDefault;

  // ─── Text colors ────────────────────────────────

  const lightTextPrimary = tokens.colors.light.dropdown.item.text.primary;

  const darkTextPrimary = tokens.colors.dark.dropdown.item.text.primary;

  const lightTextDisabled = tokens.colors.light.dropdown.item.text.disabled;

  const darkTextDisabled = tokens.colors.dark.dropdown.item.text.disabled;

  const lightTextDestructive =
    tokens.colors.light.dropdown.item.text.destructive;

  const darkTextDestructive = tokens.colors.dark.dropdown.item.text.destructive;

  const lightText = isDisabled
    ? lightTextDisabled
    : (customLightColor ??
      (item.destructive ? lightTextDestructive : lightTextPrimary));

  const darkText = isDisabled
    ? darkTextDisabled
    : (customDarkColor ??
      (item.destructive ? darkTextDestructive : darkTextPrimary));

  // ─── Icon colors ────────────────────────────────

  const lightIconPrimary = tokens.colors.light.dropdown.item.icon.primary;

  const darkIconPrimary = tokens.colors.dark.dropdown.item.icon.primary;

  const lightIconDisabled = tokens.colors.light.dropdown.item.icon.disabled;

  const darkIconDisabled = tokens.colors.dark.dropdown.item.icon.disabled;

  const lightIconDestructive =
    tokens.colors.light.dropdown.item.icon.destructive;

  const darkIconDestructive = tokens.colors.dark.dropdown.item.icon.destructive;

  const lightIcon = isDisabled
    ? lightIconDisabled
    : (customLightColor ??
      (item.destructive ? lightIconDestructive : lightIconPrimary));

  const darkIcon = isDisabled
    ? darkIconDisabled
    : (customDarkColor ??
      (item.destructive ? darkIconDestructive : darkIconPrimary));

  // ─── Separator colors ───────────────────────────

  const lightSeparator = tokens.colors.light.dropdown.separator;

  const darkSeparator = tokens.colors.dark.dropdown.separator;

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

    pressProgress.value = withTiming(1, {
      duration: tokens.pressAnimation.duration,
    });
  }, [isDisabled, pressProgress, tokens.pressAnimation.duration]);

  const handlePressOut = useCallback(() => {
    cancelAnimation(pressProgress);

    pressProgress.value = withTiming(0, {
      duration: tokens.pressAnimation.duration,
    });
  }, [pressProgress, tokens.pressAnimation.duration]);

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
            darkColor={darkIcon}
            lightColor={lightIcon}
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
