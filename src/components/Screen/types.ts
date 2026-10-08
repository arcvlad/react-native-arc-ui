import type { ReactNode, Ref } from "react";
import type { View, ViewProps } from "react-native";

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
}
