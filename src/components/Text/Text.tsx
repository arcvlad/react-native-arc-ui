import { memo, useMemo } from "react";
import { StyleSheet, type TextStyle } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { isNonNegativeFiniteNumber } from "../../utils/numberUtils";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { IText } from "./types";

const TRANSPARENT = "rgba(0, 0, 0, 0)";

const normalizeAnimatedColor = (value: string): string =>
  value === "transparent" ? TRANSPARENT : value;

const TextComponent = ({
  style,
  color,
  darkColor,
  lightColor,
  ...textProps
}: IText) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale } = useARCUISystem();

  // ─── Native style resolution ──────────────────────────────────────────────

  /**
   * ARCUI owns font scaling, so consumer fontSize / lineHeight are resolved
   * as unscaled base metrics and applied through the fontScale SharedValue.
   *
   * Flattening happens only during React render. No frame-level work is added.
   */
  const flattenedStyle = StyleSheet.flatten(style) ?? {};

  const {
    fontSize: styleFontSize,
    lineHeight: styleLineHeight,
    color: styleColor,
    ...consumerStaticStyle
  } = flattenedStyle;

  // ─── Typography ───────────────────────────────────────────────────────────

  const {
    fontSize: tokenFontSize,
    lineHeight: tokenLineHeight,
    style: typographyStyle,
  } = useMemo(
    () => resolveTypographyStyle(tokens.typography.text.text),
    [tokens.typography.text.text],
  );

  const baseFontSize = isNonNegativeFiniteNumber(styleFontSize)
    ? styleFontSize
    : tokenFontSize;

  const baseLineHeight = isNonNegativeFiniteNumber(styleLineHeight)
    ? styleLineHeight
    : isNonNegativeFiniteNumber(tokenLineHeight)
      ? tokenLineHeight
      : undefined;

  /**
   * React Native Text uses native automatic line-height measurement when no
   * lineHeight is supplied.
   *
   * Reanimated can normally clear animated style properties with undefined,
   * but native Text layout can retain a previously animated lineHeight when
   * switching dynamically back to automatic measurement.
   *
   * Changing this key only when lineHeight ownership changes gives the native
   * Text node a clean layout state without introducing a default lineHeight or
   * moving font-scale work back to the JS thread.
   */
  const lineHeightModeKey =
    baseLineHeight === undefined ? "auto-line-height" : "managed-line-height";

  const animatedTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: baseFontSize * fontScale.value,

    lineHeight:
      baseLineHeight !== undefined
        ? baseLineHeight * fontScale.value
        : undefined,
  }));

  // ─── Color ────────────────────────────────────────────────────────────────

  /**
   * Color priority:
   *
   * color
   * ↓
   * complete darkColor + lightColor pair
   * ↓
   * style.color
   * ↓
   * ARCUI text tokens
   *
   * style.color remains a native escape hatch. When it owns color, ARCUI does
   * not create a competing animated color property.
   */
  const hasThemePair = darkColor != null && lightColor != null;

  const hasIncompleteThemePair = (darkColor != null) !== (lightColor != null);

  const hasColorProp = color != null;

  const styleOwnsColor = !hasColorProp && !hasThemePair && styleColor != null;

  const defaultDarkText = normalizeAnimatedColor(
    tokens.colors.dark.text.primary,
  );

  const defaultLightText = normalizeAnimatedColor(
    tokens.colors.light.text.primary,
  );

  const customDarkText = hasThemePair ? darkColor : defaultDarkText;

  const customLightText = hasThemePair ? lightColor : defaultLightText;

  const resolvedDarkText = normalizeAnimatedColor(color ?? customDarkText);

  const resolvedLightText = normalizeAnimatedColor(color ?? customLightText);

  const animatedTextColorStyle = useAnimatedStyle(() => {
    if (styleOwnsColor) {
      return {};
    }

    return {
      color: interpolateColor(
        themeProgress.value,
        [0, 1],
        [resolvedDarkText, resolvedLightText],
      ),
    };
  });

  const resolvedConsumerStyle: TextStyle =
    styleOwnsColor && styleColor != null
      ? {
          ...consumerStaticStyle,
          color: styleColor,
        }
      : consumerStaticStyle;

  // ─── Development diagnostics ──────────────────────────────────────────────

  if (
    __DEV__ &&
    styleFontSize !== undefined &&
    !isNonNegativeFiniteNumber(styleFontSize)
  ) {
    console.error(
      "[react-native-arc-ui] Text: style.fontSize must be a finite non-negative number. Falling back to tokens.typography.text.text.fontSize.",
    );
  }

  if (
    __DEV__ &&
    styleLineHeight !== undefined &&
    !isNonNegativeFiniteNumber(styleLineHeight)
  ) {
    console.error(
      "[react-native-arc-ui] Text: style.lineHeight must be a finite non-negative number. Falling back to the configured Text lineHeight.",
    );
  }

  if (__DEV__ && hasIncompleteThemePair) {
    console.error(
      "[react-native-arc-ui] Text: darkColor and lightColor must be provided together. The incomplete theme color pair was ignored.",
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Animated.Text
      key={lineHeightModeKey}
      {...textProps}
      allowFontScaling={false}
      maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
      style={[
        typographyStyle,
        animatedTextSizeStyle,
        animatedTextColorStyle,
        resolvedConsumerStyle,
      ]}
    />
  );
};

export const Text = memo(TextComponent);

Text.displayName = "Text";
