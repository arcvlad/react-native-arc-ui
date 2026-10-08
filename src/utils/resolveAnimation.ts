import type { TEasing } from "../tokens/Animations";
import { resolveEasing } from "./resolveEasing";

type TAnimationConfig = {
  duration: number;
  easing: ReturnType<typeof resolveEasing>;
};

type TComponentAnimationOverride = {
  duration?: number;
  easing?: TEasing;
};

type TGlobalAnimation = {
  duration: number;
  easing: TEasing;
};

/**
 * Resolves animation config with fallback to global animations.
 * Call outside worklets — pass result directly to withTiming.
 *
 * @example
 * // Global animations only:
 * withTiming(value, resolveAnimation(tokens.animations));
 *
 * // Per-component with fallback:
 * withTiming(value, resolveAnimation(tokens.accordionAnimations, tokens.animations));
 */
export const resolveAnimation = (
  componentConfigOrGlobal: TComponentAnimationOverride | TGlobalAnimation,
  globalConfig?: TGlobalAnimation,
): TAnimationConfig => {
  if (!globalConfig) {
    const global = componentConfigOrGlobal as TGlobalAnimation;
    return {
      duration: global.duration,
      easing: resolveEasing(global.easing),
    };
  }

  return {
    duration: componentConfigOrGlobal.duration ?? globalConfig.duration,
    easing: resolveEasing(
      componentConfigOrGlobal.easing ?? globalConfig.easing,
    ),
  };
};
