import type { Ref } from "react";
import type { View, ViewProps } from "react-native";

export interface ISpinnerLoader extends Omit<ViewProps, "children" | "ref"> {
  /**
   * Native SpinnerLoader container ref.
   */
  ref?: Ref<View>;

  /**
   * Rendered spinner size.
   *
   * Must be a finite number greater than zero.
   *
   * @default tokens.sizings.spinnerLoader.size
   */
  size?: number;

  /**
   * Whether SpinnerLoader geometry follows ARCUI's accessibility font scale.
   *
   * SpinnerLoader is a geometric primitive by default, so an explicit size
   * means the actual rendered size unless scaling is explicitly enabled.
   *
   * @default false
   */
  scaleWithFont?: boolean;

  /**
   * Fixed color used in every theme.
   *
   * Takes precedence over darkColor/lightColor.
   */
  color?: string;

  /**
   * Theme-aware color pair.
   *
   * Both values must be provided. An incomplete pair is ignored and ARCUI
   * falls back to the SpinnerLoader theme tokens.
   */
  darkColor?: string;
  lightColor?: string;
}
