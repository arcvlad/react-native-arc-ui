import { ColorsLight, ColorsDark } from "./Colors";
import { Radius } from "./Radius";
import { Border } from "./Border";
import { Typography } from "./Typography";
import { Spacing } from "./Spacing";
import { SafeArea } from "./SafeArea";
import { ZIndex } from "./ZIndex";
import {
  animationDefaultProps,
  pressAnimationDefaultProps,
  springConfigDefaultProps,
  enteringExitingDefaultProps,
  dialogAnimationDefaultProps,
  accordionAnimationDefaultProps,
  modalAnimationDefaultProps,
  selectAnimationDefaultProps,
  tabsAnimationDefaultProps,
  dropdownAnimationDefaultProps,
  progressBarAnimationDefaultProps,
  radioAnimationDefaultProps,
  checkboxAnimationDefaultProps,
  toggleAnimationDefaultProps,
  toastAnimationDefaultProps,
  skeletonAnimationDefaultProps,
  sliderAnimationDefaultProps,
  spinnerLoaderAnimationDefaultProps,
  fluidViewAnimationDefaultProps,
  headerAnimationDefaultProps,
  infoboxAnimationDefaultProps,
} from "./Animations";
import type { TTokens } from "../types/tokens";
import { Sizings } from "./Sizings";

export const defaultTokens: TTokens = {
  colors: {
    light: ColorsLight,
    dark: ColorsDark,
  },
  radius: Radius,
  border: Border,
  typography: Typography,
  spacing: Spacing,
  safeArea: SafeArea,
  sizings: Sizings,
  zIndex: ZIndex,
  animations: animationDefaultProps,
  pressAnimation: pressAnimationDefaultProps,
  springConfig: springConfigDefaultProps,
  enteringExiting: enteringExitingDefaultProps,
  dialogAnimations: dialogAnimationDefaultProps,
  accordionAnimations: accordionAnimationDefaultProps,
  infoboxAnimations: infoboxAnimationDefaultProps,
  fluidViewAnimations: fluidViewAnimationDefaultProps,
  headerAnimations: headerAnimationDefaultProps,
  modalAnimations: modalAnimationDefaultProps,
  selectAnimations: selectAnimationDefaultProps,
  tabsAnimations: tabsAnimationDefaultProps,
  dropdownAnimations: dropdownAnimationDefaultProps,
  progressBarAnimations: progressBarAnimationDefaultProps,
  checkboxAnimations: checkboxAnimationDefaultProps,
  radioAnimations: radioAnimationDefaultProps,
  toggleAnimations: toggleAnimationDefaultProps,
  toastAnimations: toastAnimationDefaultProps,
  skeletonAnimations: skeletonAnimationDefaultProps,
  sliderAnimations: sliderAnimationDefaultProps,
  spinnerLoaderAnimations: spinnerLoaderAnimationDefaultProps,
};

export { ColorsLight, ColorsDark } from "./Colors";
export { Radius } from "./Radius";
export { Border } from "./Border";
export { Typography } from "./Typography";
export { Spacing } from "./Spacing";
export { SafeArea } from "./SafeArea";
export type {
  TSafeAreaOffset,
  TSafeAreaComponentTokens,
  TSafeAreaTokens,
} from "./SafeArea";
export { ZIndex } from "./ZIndex";
export {
  animationDefaultProps,
  pressAnimationDefaultProps,
  springConfigDefaultProps,
  enteringExitingDefaultProps,
  dialogAnimationDefaultProps,
  accordionAnimationDefaultProps,
  modalAnimationDefaultProps,
  selectAnimationDefaultProps,
  tabsAnimationDefaultProps,
  dropdownAnimationDefaultProps,
} from "./Animations";
export type {
  TAnimationDirection,
  TEasing,
  TPressAnimation,
} from "./Animations";
