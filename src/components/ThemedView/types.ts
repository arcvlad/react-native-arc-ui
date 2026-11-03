import type { ReactNode, Ref } from "react";
import type { View, ViewProps } from "react-native";

import type { TThemeColor } from "../../types/colors";

export interface IThemedViewColors {
  /**
   * ThemedView background color.
   *
   * A string is fixed across themes. A { light, dark } pair participates in
   * ARCUI's animated theme transition.
   */
  background?: TThemeColor;
}

export interface IThemedView extends ViewProps {
  children?: ReactNode;

  /**
   * React 19 ref-as-prop.
   *
   * Exposes the underlying native View for measurement
   * and other standard React Native imperative APIs.
   */
  ref?: Ref<View>;

  /**
   * Per-instance ARCUI-owned color overrides.
   *
   * colors.background takes priority over style.backgroundColor. When no
   * background override is provided, style.backgroundColor remains a static
   * native escape hatch before ARCUI falls back to ThemedView tokens.
   */
  colors?: Readonly<IThemedViewColors>;
}
