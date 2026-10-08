import { useCallback, useEffect, useMemo } from "react";
import type { GestureResponderEvent, PressableProps } from "react-native";
import {
  cancelAnimation,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { TPressAnimation } from "../../tokens/Animations";

type TUseSelectionPressOptions = {
  interactionDisabled: boolean;

  animation: TPressAnimation;

  duration: number;

  scaleUpValue: number;
  scaleDownValue: number;

  prefersReducedMotion: boolean;

  onPressIn?: PressableProps["onPressIn"];

  onPressOut?: PressableProps["onPressOut"];
};

export const useSelectionPress = ({
  interactionDisabled,
  animation,
  duration,
  scaleUpValue,
  scaleDownValue,
  prefersReducedMotion,
  onPressIn,
  onPressOut,
}: TUseSelectionPressOptions) => {
  const pressProgress = useSharedValue(0);

  const scale = useSharedValue(1);

  const animationConfig = useMemo(
    () => ({
      duration,
    }),
    [duration],
  );

  /**
   * Press feedback must never survive:
   *
   * - transition into unavailable state;
   * - press animation mode replacement.
   *
   * Reset is immediate because this is state cleanup,
   * not presentation motion.
   */
  useEffect(() => {
    cancelAnimation(scale);

    cancelAnimation(pressProgress);

    scale.value = 1;

    pressProgress.value = 0;
  }, [interactionDisabled, animation, scale, pressProgress]);

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (interactionDisabled) {
        return;
      }

      /**
       * Consumer callback semantics are independent from
       * ARCUI visual feedback.
       */
      onPressIn?.(event);

      if (animation === "none") {
        return;
      }

      /**
       * Reduced Motion removes geometric movement.
       *
       * Scale modes therefore fall back to the same pressed-color
       * progress used by highlight, preserving interaction feedback
       * without movement.
       */
      if (prefersReducedMotion) {
        cancelAnimation(pressProgress);

        pressProgress.value = 1;

        return;
      }

      if (animation === "scaleUp") {
        cancelAnimation(scale);

        scale.value = withTiming(scaleUpValue, animationConfig);

        return;
      }

      if (animation === "scaleDown") {
        cancelAnimation(scale);

        scale.value = withTiming(scaleDownValue, animationConfig);

        return;
      }

      if (animation === "highlight") {
        cancelAnimation(pressProgress);

        pressProgress.value = withTiming(1, animationConfig);
      }
    },
    [
      interactionDisabled,
      animation,
      prefersReducedMotion,
      pressProgress,
      scale,
      scaleUpValue,
      scaleDownValue,
      animationConfig,
      onPressIn,
    ],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      cancelAnimation(scale);

      cancelAnimation(pressProgress);

      if (prefersReducedMotion) {
        scale.value = 1;

        pressProgress.value = 0;
      } else {
        if (animation === "scaleUp" || animation === "scaleDown") {
          scale.value = withTiming(1, animationConfig);
        } else {
          scale.value = 1;
        }

        if (animation === "highlight") {
          pressProgress.value = withTiming(0, animationConfig);
        } else {
          pressProgress.value = 0;
        }
      }

      onPressOut?.(event);
    },
    [
      animation,
      prefersReducedMotion,
      scale,
      pressProgress,
      animationConfig,
      onPressOut,
    ],
  );

  return {
    pressProgress,
    scale,

    handlePressIn,
    handlePressOut,
  };
};
