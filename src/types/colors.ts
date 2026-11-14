/**
 * Public ARCUI color override primitive.
 *
 * A string is fixed across both themes.
 * A light/dark pair participates in ARCUI's animated theme transition.
 */
export type TThemeColor =
  | string
  | Readonly<{
      light: string;
      dark: string;
    }>;
