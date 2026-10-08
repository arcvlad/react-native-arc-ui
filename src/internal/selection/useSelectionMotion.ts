import { useEffect } from "react";
import {
  cancelAnimation,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type TSelectionTimingConfig = NonNullable<Parameters<typeof withTiming>[1]>;

type TUseSelectionMotionOptions = {
  checked: boolean;

  disabled: boolean;
  inactive: boolean;
  hasError: boolean;

  animationConfig: TSelectionTimingConfig;
};

export const useSelectionMotion = ({
  checked,
  disabled,
  inactive,
  hasError,
  animationConfig,
}: TUseSelectionMotionOptions) => {
  const prefersReducedMotion = useReducedMotion();

  const checkedProgress = useSharedValue(checked ? 1 : 0);

  const disabledProgress = useSharedValue(disabled ? 1 : 0);

  const inactiveProgress = useSharedValue(inactive ? 1 : 0);

  const errorProgress = useSharedValue(hasError ? 1 : 0);

  // ─── Checked ─────────────────────────────────────────────────────────────

  useEffect(() => {
    cancelAnimation(checkedProgress);

    const target = checked ? 1 : 0;

    if (prefersReducedMotion) {
      checkedProgress.value = target;

      return;
    }

    checkedProgress.value = withTiming(target, animationConfig);
  }, [checked, prefersReducedMotion, checkedProgress, animationConfig]);

  // ─── Semantic modifiers ─────────────────────────────────────────────────

  /**
   * These are deliberately independent boolean dimensions.
   *
   * Components resolve their own visual priority from these values.
   * No modifier transition can travel through an unrelated state.
   */
  useEffect(() => {
    const disabledTarget = disabled ? 1 : 0;

    const inactiveTarget = inactive ? 1 : 0;

    const errorTarget = hasError ? 1 : 0;

    cancelAnimation(disabledProgress);

    cancelAnimation(inactiveProgress);

    cancelAnimation(errorProgress);

    if (prefersReducedMotion) {
      disabledProgress.value = disabledTarget;

      inactiveProgress.value = inactiveTarget;

      errorProgress.value = errorTarget;

      return;
    }

    disabledProgress.value = withTiming(disabledTarget, animationConfig);

    inactiveProgress.value = withTiming(inactiveTarget, animationConfig);

    errorProgress.value = withTiming(errorTarget, animationConfig);
  }, [
    disabled,
    inactive,
    hasError,
    prefersReducedMotion,
    disabledProgress,
    inactiveProgress,
    errorProgress,
    animationConfig,
  ]);

  // ─── Lifecycle cleanup ──────────────────────────────────────────────────

  useEffect(
    () => () => {
      cancelAnimation(checkedProgress);

      cancelAnimation(disabledProgress);

      cancelAnimation(inactiveProgress);

      cancelAnimation(errorProgress);
    },
    [checkedProgress, disabledProgress, inactiveProgress, errorProgress],
  );

  return {
    checkedProgress,
    disabledProgress,
    inactiveProgress,
    errorProgress,

    prefersReducedMotion,
  };
};
