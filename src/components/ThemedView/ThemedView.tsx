import { memo } from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated";

import { useARCUIAnimatedTheme, useARCUITheme } from "../../contexts/hooks";
import { resolveThemeColor } from "../../utils/resolveThemeColor";

import type { IThemedView } from "./types";

const TRANSPARENT = "rgba(0, 0, 0, 0)";

const normalizeAnimatedColor = (value: string): string =>
  value === "transparent" ? TRANSPARENT : value;

const ThemedViewComponent = ({
  ref,
  children,
  style,
  colors,
  ...viewProps
}: IThemedView) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  // ─── Native style resolution ──────────────────────────────────────────────

  /**
   * backgroundColor may be owned either by ThemedView's colors API or by the
   * consumer's native style.
   *
   * Flattening happens only during React render. No frame-level work or
   * SharedValue access happens here.
   */
  const flattenedStyle = StyleSheet.flatten(style) ?? {};

  const { backgroundColor: styleBackgroundColor, ...consumerStaticStyle } =
    flattenedStyle;

  // ─── Background color ────────────────────────────────────────────────────

  const hasBackgroundOverride = colors?.background !== undefined;

  /**
   * Background ownership priority:
   *
   * colors.background
   * ↓
   * style.backgroundColor
   * ↓
   * ARCUI ThemedView tokens
   *
   * When native style owns backgroundColor, ARCUI intentionally does not
   * create a competing animated background property.
   */
  const styleOwnsBackground =
    !hasBackgroundOverride && styleBackgroundColor !== undefined;

  const resolvedBackground = resolveThemeColor(
    colors?.background,
    tokens.colors.light.themedView.background,
    tokens.colors.dark.themedView.background,
    "ThemedView colors.background",
  );

  const resolvedDarkBackground = normalizeAnimatedColor(
    resolvedBackground.dark,
  );

  const resolvedLightBackground = normalizeAnimatedColor(
    resolvedBackground.light,
  );

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    if (styleOwnsBackground) {
      return { backgroundColor: undefined };
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

  // ─── Render ───────────────────────────────────────────────────────────────

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
