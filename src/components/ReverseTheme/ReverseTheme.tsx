import { useMemo } from "react";
import { useDerivedValue } from "react-native-reanimated";

import { AnimatedThemeContext } from "../../contexts/contexts";
import { useARCUIAnimatedTheme } from "../../contexts/hooks";
import type { TAnimatedTheme } from "../../contexts/types";
import type { IReverseTheme } from "./types";

/**
 * Inverts the theme for all children.
 *
 * Every component inside reads themeProgress from AnimatedThemeContext.
 * ReverseTheme provides a new context with `1 - themeProgress`,
 * so all interpolateColor(themeProgress.value, [0,1], [dark, light])
 * calls automatically produce the opposite color — zero changes to
 * any existing component.
 *
 * Nestable: ReverseTheme inside ReverseTheme = original theme.
 * All on UI thread — useDerivedValue, no JS bridge.
 *
 * @example
 * <View style={{ backgroundColor: "rgba(0, 0, 0, 1)" }}>
 *   <ReverseTheme>
 *     <Text>White on dark card</Text>
 *     <Icon type="info" />
 *     <Button type="border">All inverted</Button>
 *   </ReverseTheme>
 * </View>
 */
export const ReverseTheme = ({ children }: IReverseTheme) => {
  const { themeProgress } = useARCUIAnimatedTheme();

  const reversedProgress = useDerivedValue(() => 1 - themeProgress.value);

  const reversedTheme = useMemo<TAnimatedTheme>(
    () => ({ themeProgress: reversedProgress }),
    [reversedProgress],
  );

  return (
    <AnimatedThemeContext.Provider value={reversedTheme}>
      {children}
    </AnimatedThemeContext.Provider>
  );
};

ReverseTheme.displayName = "ReverseTheme";
