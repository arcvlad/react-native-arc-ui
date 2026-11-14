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
import { resolveNonNegativeMetric } from "../../utils/numberUtils";
import { resolveThemeColor } from "../../utils/resolveThemeColor";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { IBadge, TBadgeTone } from "./types";

const resolveBadgeTone = (value: string): TBadgeTone => {
  switch (value) {
    case "neutral":
    case "info":
    case "success":
    case "warning":
    case "danger":
      return value;

    default:
      if (__DEV__) {
        console.error(
          `[react-native-arc-ui] Badge tone "${String(
            value,
          )}" is invalid. Falling back to "danger".`,
        );
      }

      return "danger";
  }
};

const BadgeComponent = ({
  dot: _dot,
  label,
  tone = "danger",
  colors,
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

  const resolvedTone = resolveBadgeTone(tone);

  const resolvedDotSize = resolveNonNegativeMetric(
    size,
    tokens.sizings.badge.dotSize,
  );

  const labelMinSize = tokens.sizings.badge.labelMinSize;

  // ─── Theme colors ────────────────────────────────────────────────────────

  /**
   * Resolution priority:
   *
   * colors override
   * ↓
   * tone palette
   */
  const resolvedBackground = resolveThemeColor(
    colors?.background,
    tokens.colors.light.badge[resolvedTone].background,
    tokens.colors.dark.badge[resolvedTone].background,
    "Badge colors.background",
  );

  const resolvedText = resolveThemeColor(
    colors?.text,
    tokens.colors.light.badge[resolvedTone].text,
    tokens.colors.dark.badge[resolvedTone].text,
    "Badge colors.text",
  );

  const lightBackground = resolvedBackground.light;
  const darkBackground = resolvedBackground.dark;

  const hasBackgroundOverride = colors?.background !== undefined;

  const styleBackgroundColor = StyleSheet.flatten(style)?.backgroundColor;

  const styleOwnsBackground =
    !hasBackgroundOverride && styleBackgroundColor !== undefined;

  const lightText = resolvedText.light;
  const darkText = resolvedText.dark;

  const backgroundColor = useDerivedValue(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBackground, lightBackground],
    ),
  );

  const resolvedTextColor = useDerivedValue(() =>
    interpolateColor(themeProgress.value, [0, 1], [darkText, lightText]),
  );

  // ─── Dot ─────────────────────────────────────────────────────────────────

  const animatedDotStyle = useAnimatedStyle(() => ({
    backgroundColor: styleOwnsBackground ? undefined : backgroundColor.value,
  }));

  // ─── Label ───────────────────────────────────────────────────────────────

  const animatedLabelBackgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: styleOwnsBackground ? undefined : backgroundColor.value,
  }));

  /**
   * Label dimensions grow together with ARCUI-controlled text scaling.
   * Unlike the decorative dot, a label Badge contains readable text and
   * therefore needs enough vertical space for accessibility font sizes.
   */
  const animatedLabelContainerSizeStyle = useAnimatedStyle(() => ({
    minHeight: labelMinSize * fontScale.value,
    minWidth: labelMinSize * fontScale.value,
  }));

  const labelFontSize = tokens.typography.badge.label.fontSize;
  const labelLineHeight = tokens.typography.badge.label.lineHeight;

  const animatedLabelTextSizeStyle = useAnimatedStyle(() => ({
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

  // ─── Render ───────────────────────────────────────────────────────────────

  if (isDot) {
    return (
      <Animated.View
        key="dot"
        {...viewProps}
        testID={testID}
        style={[
          styles.dot,
          {
            width: resolvedDotSize,
            height: resolvedDotSize,
            borderRadius: resolvedDotSize / 2,
          },
          style,
          animatedDotStyle,
        ]}
      />
    );
  }

  return (
    <Animated.View
      key="label"
      {...viewProps}
      testID={testID}
      style={[
        styles.labelContainer,
        {
          borderRadius: tokens.radius.badge,
          paddingHorizontal: tokens.spacing.xxs,
        },
        animatedLabelContainerSizeStyle,
        style,
        animatedLabelBackgroundStyle,
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
          animatedLabelTextSizeStyle,
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
