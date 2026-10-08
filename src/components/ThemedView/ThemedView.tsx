import { memo } from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated";

import { useARCUIAnimatedTheme, useARCUITheme } from "../../contexts/hooks";

import type { IThemedView } from "./types";

const TRANSPARENT = "rgba(0, 0, 0, 0)";

const normalizeAnimatedColor = (value: string): string =>
  value === "transparent" ? TRANSPARENT : value;

const ThemedViewComponent = ({
  ref,
  children,
  style,
  color,
  darkColor,
  lightColor,
  ...viewProps
}: IThemedView) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  // ─── Native style resolution ──────────────────────

  /**
   * backgroundColor may be owned either by ThemedView's theme-aware
   * color API or by the consumer's native style.
   *
   * Flattening happens only during React render. No frame-level work
   * or SharedValue access happens here.
   */
  const flattenedStyle = StyleSheet.flatten(style) ?? {};

  const { backgroundColor: styleBackgroundColor, ...consumerStaticStyle } =
    flattenedStyle;

  // ─── Background color ─────────────────────────────

  const hasThemePair = darkColor !== undefined && lightColor !== undefined;

  const hasColorProp = color !== undefined;

  /**
   * Background ownership priority:
   *
   * color
   * ↓
   * complete darkColor + lightColor pair
   * ↓
   * style.backgroundColor
   * ↓
   * ARCUI ThemedView tokens
   *
   * When native style owns backgroundColor, ARCUI intentionally does
   * not create a competing animated background property.
   */
  const styleOwnsBackground =
    !hasColorProp && !hasThemePair && styleBackgroundColor !== undefined;

  const defaultDarkBackground = normalizeAnimatedColor(
    tokens.colors.dark.themedView.background,
  );

  const defaultLightBackground = normalizeAnimatedColor(
    tokens.colors.light.themedView.background,
  );

  const customDarkBackground = hasThemePair ? darkColor : defaultDarkBackground;

  const customLightBackground = hasThemePair
    ? lightColor
    : defaultLightBackground;

  const resolvedDarkBackground = normalizeAnimatedColor(
    color ?? customDarkBackground,
  );

  const resolvedLightBackground = normalizeAnimatedColor(
    color ?? customLightBackground,
  );

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    if (styleOwnsBackground) {
      return {};
    }

    return {
      backgroundColor: interpolateColor(
        themeProgress.value,
        [0, 1],
        [resolvedDarkBackground, resolvedLightBackground],
      ),
    };
  });

  const resolvedConsumerStyle: ViewStyle =
    styleOwnsBackground && styleBackgroundColor !== undefined
      ? {
          ...consumerStaticStyle,
          backgroundColor: styleBackgroundColor,
        }
      : consumerStaticStyle;

  // ─── Render ──────────────────────────────────────

  return (
    <Animated.View
      ref={ref}
      {...viewProps}
      style={[animatedBackgroundStyle, resolvedConsumerStyle]}
    >
      {children}
    </Animated.View>
  );
};

export const ThemedView = memo(ThemedViewComponent);

ThemedView.displayName = "ThemedView";
