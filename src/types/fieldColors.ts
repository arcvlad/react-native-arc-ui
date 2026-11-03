import type { TThemeColor } from "./colors";

export interface IFieldColors {
  background?: Readonly<{
    default?: TThemeColor;
    disabled?: TThemeColor;
  }>;

  border?: Readonly<{
    empty?: TThemeColor;
    filled?: TThemeColor;
    focused?: TThemeColor;
    error?: TThemeColor;
    inactive?: TThemeColor;
    disabled?: TThemeColor;
  }>;

  text?: Readonly<{
    default?: TThemeColor;
    disabled?: TThemeColor;
  }>;

  placeholder?: TThemeColor;

  label?: Readonly<{
    default?: TThemeColor;
    disabled?: TThemeColor;
  }>;

  icon?: Readonly<{
    default?: TThemeColor;
    disabled?: TThemeColor;
  }>;

  clearButton?: TThemeColor;

  /**
   * Shared validation color used by the label/error presentation.
   * Border error color remains independently overrideable through border.error.
   */
  error?: TThemeColor;
}
