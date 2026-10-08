import type { TextStyle } from "react-native";

import type { TTypographyStyle } from "../tokens/Typography";

export type TResolvedTypographyStyle = {
  fontSize: NonNullable<TextStyle["fontSize"]>;
  lineHeight: TextStyle["lineHeight"];
  style: TextStyle;
};

/**
 * Separates ARCUI-managed text properties from static native typography.
 *
 * fontSize / lineHeight are applied through ARCUI's central fontScale
 * SharedValue. color remains owned by the component theme/state system.
 * Everything else can pass through as native TextStyle configuration.
 */
export const resolveTypographyStyle = (
  typography: TTypographyStyle,
): TResolvedTypographyStyle => {
  const style: TextStyle = { ...typography };

  delete style.fontSize;
  delete style.lineHeight;
  delete style.color;

  return {
    fontSize: typography.fontSize,
    lineHeight: typography.lineHeight,
    style,
  };
};
