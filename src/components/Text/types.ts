import type { TextProps } from "react-native";

export interface IText extends Omit<
  TextProps,
  "allowFontScaling" | "maxFontSizeMultiplier"
> {
  /**
   * Fixed text color used in both themes.
   *
   * Takes priority over darkColor/lightColor
   * and style.color.
   */
  color?: string;

  /**
   * Dark-theme text color override.
   *
   * Both darkColor and lightColor must be
   * provided. An incomplete pair is ignored.
   *
   * Ignored when color is provided.
   */
  darkColor?: string;

  /**
   * Light-theme text color override.
   *
   * Both darkColor and lightColor must be
   * provided. An incomplete pair is ignored.
   *
   * Ignored when color is provided.
   */
  lightColor?: string;
}
