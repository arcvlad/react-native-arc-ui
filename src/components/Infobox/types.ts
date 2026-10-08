import type { ReactNode, Ref } from "react";
import type { StyleProp, View, ViewProps, ViewStyle } from "react-native";

import type { TIconType } from "../Icon/types";

export type TInfoboxType = "default" | "warning" | "danger";

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
   * Semantic Infobox presentation.
   *
   * @default "default"
   */
  type?: TInfoboxType;

  style?: StyleProp<ViewStyle>;
};

type TInfoboxBuiltInIcon = {
  /**
   * ARCUI-owned built-in icon.
   *
   * Its color follows the Infobox semantic type and theme.
   *
   * When omitted, the default icon follows the semantic type:
   * default -> "info"
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
