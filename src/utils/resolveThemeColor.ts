import type { TThemeColor } from "../types/colors";

type TResolvedThemeColor = Readonly<{
  light: string;
  dark: string;
}>;

/**
 * Resolves an optional ARCUI color override into concrete light/dark endpoints.
 *
 * Resolution contract:
 *
 * 1. Fixed string -> same endpoint in both themes.
 * 2. Complete { light, dark } pair -> custom theme-aware endpoints.
 * 3. Missing override -> supplied component/token fallbacks.
 * 4. Invalid runtime override -> development diagnostic + safe fallbacks.
 *
 * Call during normal component render before Reanimated worklets. Worklets
 * should consume only the returned primitive string endpoints.
 */
export const resolveThemeColor = (
  color: TThemeColor | undefined,
  fallbackLight: string,
  fallbackDark: string,
  debugName?: string,
): TResolvedThemeColor => {
  if (typeof color === "string") {
    return {
      light: color,
      dark: color,
    };
  }

  if (
    color !== null &&
    typeof color === "object" &&
    typeof color.light === "string" &&
    typeof color.dark === "string"
  ) {
    return {
      light: color.light,
      dark: color.dark,
    };
  }

  if (__DEV__ && color !== undefined) {
    console.error(
      `[react-native-arc-ui]${debugName ? ` ${debugName}:` : ""} color override must be a string or a complete { light, dark } pair. Falling back to ARCUI tokens.`,
    );
  }

  return {
    light: fallbackLight,
    dark: fallbackDark,
  };
};
