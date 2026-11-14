import type { ReactNode, Ref } from "react";
import type { StyleProp, View, ViewProps, ViewStyle } from "react-native";

import type { TThemeColor } from "../../types/colors";
import type { TIconType } from "../Icon/types";

export type TInfoboxTone = "info" | "success" | "warning" | "danger";

export interface IInfoboxColors {
  background?: TThemeColor;
  border?: TThemeColor;
  text?: TThemeColor;
  icon?: TThemeColor;
}

type TInfoboxBase = Omit<ViewProps, "children" | "style"> & {
  /**
   * React 19 ref-as-prop.
   */
  ref?: Ref<View>;

  /**
   * Infobox content.
   *
   * Textual ReactNode content receives ARCUI typography and
   * accessibility font scaling. Arbitrary ReactNode content
   * remains consumer-owned.
   */
  children: ReactNode;

  /**
   * Semantic Infobox palette.
   *
   * @default "info"
   */
  tone?: TInfoboxTone;

  /**
   * Per-instance ARCUI-owned color overrides.
   */
  colors?: Readonly<IInfoboxColors>;

  style?: StyleProp<ViewStyle>;
};

type TInfoboxBuiltInIcon = {
  /**
   * ARCUI-owned built-in icon.
   *
   * Its color follows the Infobox semantic tone and theme.
   *
   * When omitted, the default icon follows the semantic tone:
   * info -> "info"
   * success -> "check"
   * warning -> "alertCircle"
   * danger -> "xCircle"
   */
  icon?: TIconType;

  customIcon?: never;
};

type TInfoboxCustomIcon = {
  icon?: never;

  /**
   * Completely consumer-owned icon/content.
   *
   * ARCUI does not alter its color, size, accessibility
   * or animation.
   */
  customIcon: ReactNode;
};

export type IInfobox = TInfoboxBase &
  (TInfoboxBuiltInIcon | TInfoboxCustomIcon);
