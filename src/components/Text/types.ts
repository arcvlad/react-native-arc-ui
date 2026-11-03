import type { TextProps } from "react-native";

import type { TThemeColor } from "../../types/colors";

export interface ITextColors {
  /**
   * Text content color.
   *
   * A string is fixed across themes. A { light, dark } pair participates in
   * ARCUI's animated theme transition.
   */
  text?: TThemeColor;
}

export interface IText extends Omit<
  TextProps,
  "allowFontScaling" | "maxFontSizeMultiplier"
> {
  /**
   * Per-instance ARCUI-owned color overrides.
   *
   * colors.text takes priority over style.color. When no text override is
   * provided, style.color remains a static native escape hatch before ARCUI
   * falls back to the default Text tokens.
   */
  colors?: Readonly<ITextColors>;
}
