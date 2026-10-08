import type { ComponentRef, ReactNode, Ref } from "react";
import type {
  DimensionValue,
  StyleProp,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

export type TDividerOrientation = "horizontal" | "vertical";

export type TDividerLabelPosition = "start" | "center" | "end";

type TDividerBase = Omit<ViewProps, "children" | "style"> & {
  /**
   * Ref to the Divider root layout container.
   */
  ref?: Ref<ComponentRef<typeof View>>;

  /**
   * Length along the Divider's primary axis.
   *
   * horizontal -> width
   * vertical   -> height
   *
   * @default "100%"
   */
  length?: DimensionValue;

  /**
   * Divider line thickness.
   *
   * Falls back to tokens.sizings.divider.thickness.
   */
  thickness?: number;

  /**
   * Fixed line color for both themes.
   *
   * Takes precedence over darkColor/lightColor.
   */
  color?: string;

  /**
   * Theme-aware line colors.
   *
   * Both darkColor and lightColor must be provided for the pair
   * to override the semantic Divider color tokens.
   */
  darkColor?: string;
  lightColor?: string;

  /**
   * Line corner radius.
   *
   * Falls back to tokens.radius.divider.
   */
  radius?: number;

  /**
   * Style applied to the Divider root layout container.
   *
   * Use color/darkColor/lightColor to customize the line itself.
   */
  style?: StyleProp<ViewStyle>;
};

type THorizontalDivider = TDividerBase & {
  orientation?: "horizontal";

  /**
   * Optional content displayed inside the Divider.
   *
   * Textual content receives ARCUI typography, theme transitions,
   * and font scaling automatically. Custom ReactNode content is
   * rendered as provided.
   */
  label?: ReactNode;

  /**
   * Label placement along the horizontal Divider.
   *
   * Uses logical start/end terminology so the public API does not
   * encode physical left/right semantics.
   *
   * @default "center"
   */
  labelPosition?: TDividerLabelPosition;
};

type TVerticalDivider = TDividerBase & {
  orientation: "vertical";

  /**
   * Labels are intentionally unsupported for vertical Dividers.
   */
  label?: never;
  labelPosition?: never;
};

export type IDivider = THorizontalDivider | TVerticalDivider;
