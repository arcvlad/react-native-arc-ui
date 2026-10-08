import { Easing } from "react-native-reanimated";
import type { TEasing } from "../tokens/Animations";

/**
 * Maps TEasing string enum to Reanimated Easing function.
 * Called outside worklets — returns a worklet-compatible Easing function.
 */
export const resolveEasing = (easing: TEasing): ((t: number) => number) => {
  switch (easing) {
    case "linear":
      return Easing.linear;
    case "easeIn":
      return Easing.in(Easing.ease);
    case "easeOut":
      return Easing.out(Easing.ease);
    case "easeInOut":
      return Easing.inOut(Easing.ease);
    case "easeInCubic":
      return Easing.in(Easing.cubic);
    case "easeOutCubic":
      return Easing.out(Easing.cubic);
    case "easeInOutCubic":
      return Easing.inOut(Easing.cubic);
    default:
      return Easing.inOut(Easing.ease);
  }
};
