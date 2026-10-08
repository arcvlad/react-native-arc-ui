import { memo, useMemo } from "react";
import { StyleSheet } from "react-native";
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
import type { IBadge } from "./types";
import { resolveNonNegativeMetric } from "../../utils/numberUtils";
import { resolveTypographyStyle } from "../../utils/resolveTypography";

const BadgeComponent = ({
  dot: _dot,
  label,
  color,
  darkColor,
  lightColor,
  textColor,
  darkTextColor,
  lightTextColor,
  size,
  style,
  testID,
  ...viewProps
}: IBadge) => {
  const { tokens } = useARCUITheme();
  const { themeProgress } = useARCUIAnimatedTheme();
  const { fontScale } = useARCUISystem();

  /**
   * label is the semantic discriminator.
   *
   * <Badge /> and <Badge dot /> are dot badges.
   * Providing a label creates a label badge.
   *
   * Checking against undefined intentionally allows numeric 0
   * and an empty string to remain valid label values.
   */
  const isDot = label === undefined;

  const resolvedDotSize = resolveNonNegativeMetric(
    size,
    tokens.sizings.badge.dotSize,
  );

  const labelMinSize = tokens.sizings.badge.labelMinSize;

  // ─── Theme colors ──────────────────────────────────────────────────────────

  const defaultDarkBackground = tokens.colors.dark.badge.background;

  const defaultLightBackground = tokens.colors.light.badge.background;

  const defaultDarkText = tokens.colors.dark.badge.text;

  const defaultLightText = tokens.colors.light.badge.text;

  /**
   * Theme override contract:
   *
   * color
   * → fixed color in both themes
   *
   * darkColor + lightColor
   * → theme-aware pair
   *
   * only one theme color
   * → pair is ignored and Badge falls back to tokens
   */
  const backgroundColor = useDerivedValue(() => {
    if (color !== undefined) {
      return color;
    }

    if (darkColor !== undefined && lightColor !== undefined) {
      return interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkColor, lightColor],
      );
    }

    return interpolateColor(
      themeProgress.value,
      [0, 1],
      [defaultDarkBackground, defaultLightBackground],
    );
  });

  const resolvedTextColor = useDerivedValue(() => {
    if (textColor !== undefined) {
      return textColor;
    }

    if (darkTextColor !== undefined && lightTextColor !== undefined) {
      return interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkTextColor, lightTextColor],
      );
    }

    return interpolateColor(
      themeProgress.value,
      [0, 1],
      [defaultDarkText, defaultLightText],
    );
  });

  // ─── Dot ───────────────────────────────────────────────────────────────────

  const animatedDotStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  // ─── Label ─────────────────────────────────────────────────────────────────

  const animatedLabelContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,

    /**
     * Label dimensions grow together with ARCUI-controlled text scaling.
     * Unlike the decorative dot, a label Badge contains readable text and
     * therefore needs enough vertical space for accessibility font sizes.
     */
    minHeight: labelMinSize * fontScale.value,
    minWidth: labelMinSize * fontScale.value,
  }));

  const labelFontSize = tokens.typography.badge.label.fontSize;
  const labelLineHeight = tokens.typography.badge.label.lineHeight;

  const animatedLabelSizeStyle = useAnimatedStyle(() => ({
    fontSize: labelFontSize * fontScale.value,

    lineHeight:
      labelLineHeight != null ? labelLineHeight * fontScale.value : undefined,
  }));

  const animatedLabelColorStyle = useAnimatedStyle(() => ({
    color: resolvedTextColor.value,
  }));

  const labelTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.badge.label).style,
    [tokens.typography.badge.label],
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  if (isDot) {
    return (
      <Animated.View
        {...viewProps}
        testID={testID}
        style={[
          styles.dot,
          {
            width: resolvedDotSize,
            height: resolvedDotSize,
            borderRadius: resolvedDotSize / 2,
          },
          animatedDotStyle,
          style,
        ]}
      />
    );
  }

  return (
    <Animated.View
      {...viewProps}
      testID={testID}
      style={[
        styles.labelContainer,
        {
          borderRadius: tokens.radius.badge,
          paddingHorizontal: tokens.spacing.xxs,
        },
        animatedLabelContainerStyle,
        style,
      ]}
    >
      <Animated.Text
        testID={testID ? `${testID}-text` : undefined}
        allowFontScaling={false}
        maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
        numberOfLines={1}
        style={[
          styles.labelText,
          labelTypographyStyle,
          animatedLabelSizeStyle,
          animatedLabelColorStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
};

export const Badge = memo(BadgeComponent);

Badge.displayName = "Badge";

const styles = StyleSheet.create({
  dot: {
    flexShrink: 0,
  },

  labelContainer: {
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  labelText: {
    textAlign: "center",
    includeFontPadding: false,
  },
});
