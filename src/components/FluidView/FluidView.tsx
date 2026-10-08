import { memo, useMemo } from "react";
import Animated, {
  LinearTransition,
  useReducedMotion,
  type EntryOrExitLayoutType,
} from "react-native-reanimated";

import { useARCUITheme } from "../../contexts/hooks";
import { useEnteringExiting } from "../../hooks/useEnteringExiting";
import { resolveAnimation } from "../../utils/resolveAnimation";
import type { IFluidView, TFluidViewPresenceAnimation } from "./types";

/**
 * Resolves one opt-in FluidView presence transition.
 *
 * undefined / false -> disabled
 * true              -> ARCUI configured default
 * custom transition -> consumer-provided Reanimated transition
 *
 * Reduced Motion always wins.
 */
const resolvePresenceAnimation = (
  requested: TFluidViewPresenceAnimation | undefined,
  arcuiDefault: EntryOrExitLayoutType | undefined,
  prefersReducedMotion: boolean,
): EntryOrExitLayoutType | undefined => {
  if (prefersReducedMotion || requested === undefined || requested === false) {
    return undefined;
  }

  if (requested === true) {
    return arcuiDefault;
  }

  return requested;
};

/**
 * Opt-in wrapper for fluid layout changes.
 *
 * FluidView animates changes to its own size and position using
 * Reanimated layout transitions. Wrap layout elements individually
 * when they should smoothly reposition as surrounding content changes.
 *
 * Presence transitions are available explicitly through
 * entering/exiting. They remain opt-in so normal FluidView mounts
 * do not gain implicit animation.
 *
 * Useful for:
 * - validation errors
 * - conditional content
 * - dynamic form fields
 * - expandable sections
 * - content whose natural dimensions change
 * - sibling repositioning
 * - opt-in mount/unmount transitions
 *
 * FluidView intentionally does not inspect or clone its children.
 * It preserves normal React Native layout behavior and only adds
 * explicitly requested animation behavior to the wrapper itself.
 */
const FluidViewComponent = ({
  ref,
  children,
  style,
  testID,
  entering: enteringProp,
  exiting: exitingProp,
  ...props
}: IFluidView) => {
  const { tokens } = useARCUITheme();

  const prefersReducedMotion = useReducedMotion();

  const { entering: defaultEntering, exiting: defaultExiting } =
    useEnteringExiting();

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.fluidViewAnimations, tokens.animations),
    [tokens.fluidViewAnimations, tokens.animations],
  );

  const layoutTransition = useMemo(
    () =>
      LinearTransition.duration(animationConfig.duration).easing(
        animationConfig.easing,
      ),
    [animationConfig.duration, animationConfig.easing],
  );

  const entering = resolvePresenceAnimation(
    enteringProp,
    defaultEntering,
    prefersReducedMotion,
  );

  const exiting = resolvePresenceAnimation(
    exitingProp,
    defaultExiting,
    prefersReducedMotion,
  );

  return (
    <Animated.View
      {...props}
      ref={ref}
      testID={testID}
      entering={entering}
      exiting={exiting}
      layout={prefersReducedMotion ? undefined : layoutTransition}
      style={style}
    >
      {children}
    </Animated.View>
  );
};

export const FluidView = memo(FluidViewComponent);

FluidView.displayName = "FluidView";
