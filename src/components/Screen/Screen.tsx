import { StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { resolveSafeArea } from "../../utils/resolveSafeArea";
import { resolveThemeColor } from "../../utils/resolveThemeColor";
import type { IScreen } from "./types";

export const Screen = ({
  ref,
  children,
  colors,
  style,
  testID,
  ...props
}: IScreen) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { safeAreaInsets } = useARCUISystem();

  // ─── Safe Area ────────────────────────────────────────────────────────────

  const safeTop = resolveSafeArea(
    safeAreaInsets.top,
    tokens.safeArea.screen.top,
  );

  const safeRight = resolveSafeArea(
    safeAreaInsets.right,
    tokens.safeArea.screen.right,
  );

  const safeBottom = resolveSafeArea(
    safeAreaInsets.bottom,
    tokens.safeArea.screen.bottom,
  );

  const safeLeft = resolveSafeArea(
    safeAreaInsets.left,
    tokens.safeArea.screen.left,
  );

  // ─── Theme color resolution ──────────────────────────────────────────────

  const resolvedBackground = resolveThemeColor(
    colors?.background,
    tokens.colors.light.background.screen,
    tokens.colors.dark.background.screen,
    "Screen colors.background",
  );

  const lightBackground = resolvedBackground.light;
  const darkBackground = resolvedBackground.dark;

  const hasBackgroundOverride = colors?.background !== undefined;

  const styleBackgroundColor = StyleSheet.flatten(style)?.backgroundColor;

  const styleOwnsBackground =
    !hasBackgroundOverride && styleBackgroundColor !== undefined;

  // ─── Animated theme ──────────────────────────────────────────────────────

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: styleOwnsBackground
      ? undefined
      : interpolateColor(
          themeProgress.value,
          [0, 1],
          [darkBackground, lightBackground],
        ),
  }));

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Animated.View
      {...props}
      ref={ref}
      testID={testID}
      style={[
        styles.screen,

        {
          paddingTop: safeTop,

          paddingRight: safeRight,

          paddingBottom: safeBottom,

          paddingLeft: safeLeft,
        },

        /**
         * Native style owns backgroundColor only when colors.background is
         * absent. animatedStyle explicitly clears its backgroundColor in that
         * case because Reanimated animated properties otherwise outrank static
         * React Native styles regardless of array order.
         */
        style,
        animatedStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
};

Screen.displayName = "Screen";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
