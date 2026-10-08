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
import type { IScreen } from "./types";

export const Screen = ({ ref, children, style, testID, ...props }: IScreen) => {
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

  // ─── Theme token extraction ───────────────────────────────────────────────

  const lightBackground = tokens.colors.light.background.screen;

  const darkBackground = tokens.colors.dark.background.screen;

  // ─── Animated theme ───────────────────────────────────────────────────────

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
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

        animatedStyle,

        style,
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
