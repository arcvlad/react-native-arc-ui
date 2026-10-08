import type { ReactNode } from "react";
import type { View, ViewProps } from "react-native";
import type { EntryOrExitLayoutType } from "react-native-reanimated";

/**
 * Optional mount/unmount animation for FluidView.
 *
 * true:
 * uses ARCUI's configured default entering/exiting transition.
 *
 * false / undefined:
 * disables that presence transition.
 *
 * Reanimated transition:
 * uses the supplied custom transition while still respecting
 * the system Reduced Motion preference.
 */
export type TFluidViewPresenceAnimation = boolean | EntryOrExitLayoutType;

export interface IFluidView extends ViewProps {
  children?: ReactNode;

  /**
   * React 19 ref-as-prop.
   *
   * Exposes the underlying native View for measurement
   * and other standard React Native imperative APIs.
   */
  ref?: React.Ref<View>;

  /**
   * Optional mount transition.
   *
   * true uses ARCUI's configured default entering transition.
   * A Reanimated transition may be supplied for custom motion.
   *
   * @default false
   */
  entering?: TFluidViewPresenceAnimation;

  /**
   * Optional unmount transition.
   *
   * true uses ARCUI's configured default exiting transition.
   * A Reanimated transition may be supplied for custom motion.
   *
   * @default false
   */
  exiting?: TFluidViewPresenceAnimation;
}
