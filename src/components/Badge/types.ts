import type { ViewProps } from "react-native";

import type { TThemeColor } from "../../types/colors";

export type TBadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface IBadgeColors {
  /**
   * Badge surface color.
   */
  background?: TThemeColor;

  /**
   * Label color for label Badges.
   */
  text?: TThemeColor;
}

type TDotBadgeColors = Omit<IBadgeColors, "text"> & {
  text?: never;
};

interface IBadgeBase extends Omit<ViewProps, "children"> {
  /**
   * Semantic Badge palette.
   *
   * @default "danger"
   */
  tone?: TBadgeTone;
}

export interface IDotBadge extends IBadgeBase {
  dot?: true;
  label?: never;

  /**
   * Diameter of the dot.
   * Falls back to tokens.sizings.badge.dotSize.
   */
  size?: number;

  /**
   * Per-instance ARCUI-owned color overrides.
   * Dot Badges own only a background color.
   */
  colors?: Readonly<TDotBadgeColors>;
}

export interface ILabelBadge extends IBadgeBase {
  dot?: false;
  label: string | number;

  size?: never;

  /**
   * Per-instance ARCUI-owned color overrides.
   */
  colors?: Readonly<IBadgeColors>;
}

export type IBadge = IDotBadge | ILabelBadge;
