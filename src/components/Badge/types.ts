import type { ViewProps } from "react-native";

interface IBadgeBase extends Omit<ViewProps, "children"> {
  color?: string;
  darkColor?: string;
  lightColor?: string;
}

export interface IDotBadge extends IBadgeBase {
  dot?: true;
  label?: never;

  /**
   * Diameter of the dot.
   * Falls back to tokens.sizings.badge.dotSize.
   */
  size?: number;

  textColor?: never;
  darkTextColor?: never;
  lightTextColor?: never;
}

export interface ILabelBadge extends IBadgeBase {
  dot?: false;
  label: string | number;

  size?: never;

  textColor?: string;
  darkTextColor?: string;
  lightTextColor?: string;
}

export type IBadge = IDotBadge | ILabelBadge;
