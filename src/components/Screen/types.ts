import type { ReactNode, Ref } from "react";
import type { View, ViewProps } from "react-native";

import type { TThemeColor } from "../../types/colors";

export interface IScreenColors {
  /**
   * Screen background color.
   */
  background?: TThemeColor;
}

export interface IScreen extends ViewProps {
  /**
   * React 19 ref-as-prop.
   *
   * Exposes the underlying native View for measurement
   * and other standard React Native imperative APIs.
   */
  ref?: Ref<View>;

  /**
   * Screen content.
   */
  children: ReactNode;

  /**
   * Per-instance ARCUI-owned color overrides.
   */
  colors?: Readonly<IScreenColors>;
}
