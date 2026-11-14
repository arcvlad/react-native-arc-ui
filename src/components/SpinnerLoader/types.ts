import type { Ref } from "react";
import type { View, ViewProps } from "react-native";

import type { TThemeColor } from "../../types/colors";

export interface ISpinnerLoaderColors {
  /**
   * Spinner indicator color.
   *
   * A string is fixed across themes. A { light, dark } pair participates in
   * ARCUI's animated theme transition.
   */
  indicator?: TThemeColor;
}

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
   * Per-instance ARCUI-owned color overrides.
   */
  colors?: Readonly<ISpinnerLoaderColors>;
}
