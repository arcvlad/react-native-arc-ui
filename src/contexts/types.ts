import type { SharedValue } from "react-native-reanimated";

import type { TIconSet } from "../components/Icon/types";
import type { TThemeWithCustomTokens } from "../types/tokens";

export type TStaticTheme<TCustom extends object = Record<never, never>> = {
  theme: "light" | "dark";

  themeMode: "system" | "light" | "dark";

  tokens: TThemeWithCustomTokens<TCustom>;

  /**
   * Icon registry resolved for this ARCUI provider mount.
   */
  iconSet: TIconSet;

  onBack?: () => void;
};

export type TAnimatedTheme = {
  themeProgress: SharedValue<number>;
};

export type TSafeAreaInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type TSystemContext = {
  fontScale: SharedValue<number>;
  safeAreaInsets: TSafeAreaInsets;
};
