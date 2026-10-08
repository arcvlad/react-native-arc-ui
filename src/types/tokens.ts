import type { ColorsDark, ColorsLight } from "../tokens/Colors";
import type { Radius } from "../tokens/Radius";
import type { Border } from "../tokens/Border";
import type { Typography } from "../tokens/Typography";
import type { Spacing } from "../tokens/Spacing";
import type { ZIndex } from "../tokens/ZIndex";
import type {
  accordionAnimationDefaultProps,
  fluidViewAnimationDefaultProps,
  animationDefaultProps,
  checkboxAnimationDefaultProps,
  dialogAnimationDefaultProps,
  dropdownAnimationDefaultProps,
  enteringExitingDefaultProps,
  modalAnimationDefaultProps,
  pressAnimationDefaultProps,
  progressBarAnimationDefaultProps,
  radioAnimationDefaultProps,
  selectAnimationDefaultProps,
  skeletonAnimationDefaultProps,
  sliderAnimationDefaultProps,
  spinnerLoaderAnimationDefaultProps,
  springConfigDefaultProps,
  tabsAnimationDefaultProps,
  toastAnimationDefaultProps,
  toggleAnimationDefaultProps,
  headerAnimationDefaultProps,
  infoboxAnimationDefaultProps,
} from "../tokens/Animations";
import type { Sizings } from "../tokens/Sizings";
import type { SafeArea } from "../tokens/SafeArea";

type TEmptyCustomTokens = Record<never, never>;

export type TTokens = {
  colors: {
    light: typeof ColorsLight;
    dark: typeof ColorsDark;
  };
  radius: typeof Radius;
  border: typeof Border;
  typography: typeof Typography;
  spacing: typeof Spacing;
  safeArea: typeof SafeArea;
  sizings: typeof Sizings;
  zIndex: typeof ZIndex;
  animations: typeof animationDefaultProps;
  pressAnimation: typeof pressAnimationDefaultProps;
  springConfig: typeof springConfigDefaultProps;
  enteringExiting: typeof enteringExitingDefaultProps;
  dialogAnimations: typeof dialogAnimationDefaultProps;
  accordionAnimations: typeof accordionAnimationDefaultProps;
  infoboxAnimations: typeof infoboxAnimationDefaultProps;
  fluidViewAnimations: typeof fluidViewAnimationDefaultProps;
  headerAnimations: typeof headerAnimationDefaultProps;
  modalAnimations: typeof modalAnimationDefaultProps;
  selectAnimations: typeof selectAnimationDefaultProps;
  tabsAnimations: typeof tabsAnimationDefaultProps;
  dropdownAnimations: typeof dropdownAnimationDefaultProps;
  progressBarAnimations: typeof progressBarAnimationDefaultProps;
  checkboxAnimations: typeof checkboxAnimationDefaultProps;
  radioAnimations: typeof radioAnimationDefaultProps;
  toggleAnimations: typeof toggleAnimationDefaultProps;
  toastAnimations: typeof toastAnimationDefaultProps;
  skeletonAnimations: typeof skeletonAnimationDefaultProps;
  sliderAnimations: typeof sliderAnimationDefaultProps;
  spinnerLoaderAnimations: typeof spinnerLoaderAnimationDefaultProps;
};

/**
 * ARCUI custom tokens extend the resolved theme at the top level.
 * Custom namespaces should use keys outside the built-in TTokens surface.
 */
export type TThemeWithCustomTokens<
  TCustom extends object = TEmptyCustomTokens,
> = TTokens & TCustom;

/**
 * ARCUI token configuration is shallow at the top level.
 *
 * A built-in namespace may be omitted, but when supplied it must be a complete
 * replacement for that namespace. Consumers that want a partial nested change
 * should compose it explicitly with normal object spread before passing it in.
 *
 * Consumers using custom namespaces should define and reuse the same custom
 * token type at the ARCUI provider and useARCUITheme<TCustom>() boundary.
 */
export type TTokensOverride<TCustom extends object = TEmptyCustomTokens> =
  Partial<TTokens> & TCustom;
