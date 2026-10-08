import type { ReactNode, Ref } from "react";
import type { View, ViewProps } from "react-native";

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
   * Fixed background color used in both themes.
   *
   * Takes priority over darkColor/lightColor and
   * style.backgroundColor.
   */
  color?: string;

  /**
   * Dark-theme background color override.
   *
   * Used only when lightColor is also provided.
   */
  darkColor?: string;

  /**
   * Light-theme background color override.
   *
   * Used only when darkColor is also provided.
   */
  lightColor?: string;
}
