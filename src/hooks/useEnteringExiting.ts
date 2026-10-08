import {
  FadeIn,
  FadeOut,
  useReducedMotion,
  type EntryOrExitLayoutType,
} from "react-native-reanimated";

import { useARCUITheme } from "../contexts/hooks";
import type { TEasing } from "../tokens/Animations";
import { resolveEasing } from "../utils/resolveEasing";

type TUseEnteringExitingResult = {
  entering?: EntryOrExitLayoutType;
  exiting?: EntryOrExitLayoutType;
};

/**
 * Resolves entering and exiting independently.
 *
 * Priority for each side:
 * 1. system reduced motion disables all non-essential layout motion;
 * 2. explicit component override;
 * 3. ARCUI entering/exiting defaults when globally enabled;
 * 4. undefined when no animation should be applied.
 *
 * Providing only `enteringOverride` does not disable the normal ARCUI exiting
 * animation, and vice versa.
 */
export const useEnteringExiting = (
  enteringOverride?: EntryOrExitLayoutType,
  exitingOverride?: EntryOrExitLayoutType,
): TUseEnteringExitingResult => {
  const { tokens } = useARCUITheme();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return {
      entering: undefined,
      exiting: undefined,
    };
  }

  const defaultsEnabled = tokens.enteringExiting.enabled;

  const enterDuration =
    tokens.enteringExiting.enterDuration ?? tokens.animations.enterDuration;
  const exitDuration =
    tokens.enteringExiting.exitDuration ?? tokens.animations.exitDuration;

  const enterEasing: TEasing =
    tokens.enteringExiting.enterEasing ?? tokens.animations.enterEasing;
  const exitEasing: TEasing =
    tokens.enteringExiting.exitEasing ?? tokens.animations.exitEasing;

  const defaultEntering = defaultsEnabled
    ? FadeIn.duration(enterDuration).easing(resolveEasing(enterEasing))
    : undefined;

  const defaultExiting = defaultsEnabled
    ? FadeOut.duration(exitDuration).easing(resolveEasing(exitEasing))
    : undefined;

  return {
    entering: enteringOverride ?? defaultEntering,
    exiting: exitingOverride ?? defaultExiting,
  };
};
