import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import {
  cancelAnimation,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { useARCUITheme } from "../../contexts/hooks";
import { resolveAnimation } from "../../utils/resolveAnimation";

interface IUseFieldMotion {
  hasError: boolean;
  disabled: boolean;
  inactive: boolean;
  hasValue: boolean;
}

type TProgressTarget = 0 | 1;

type TProgressTargetState = {
  target: TProgressTarget;
  reducedMotion: boolean;
};

/**
 * Owns the independent animated semantic axes shared by ARCUI fields.
 *
 * Focus is intentionally controlled imperatively through setFocused().
 * Native focus/blur events therefore update only a SharedValue and do not
 * require React state or a component rerender.
 *
 * Prop-driven semantic states remain independent so transitions never pass
 * through unrelated visual states.
 */
export const useFieldMotion = ({
  hasError,
  disabled,
  inactive,
  hasValue,
}: IUseFieldMotion) => {
  const { tokens } = useARCUITheme();

  const prefersReducedMotion = useReducedMotion();

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.animations),
    [tokens.animations],
  );

  // ─── Independent state axes ─────────────────────────────────────────────────

  /**
   * A field cannot be focused before mounting.
   *
   * autoFocus still resolves correctly because the native onFocus event
   * updates this SharedValue immediately after native focus is acquired.
   */
  const focusedProgress = useSharedValue(0);

  const errorProgress = useSharedValue(hasError ? 1 : 0);

  const disabledProgress = useSharedValue(disabled ? 1 : 0);

  const inactiveProgress = useSharedValue(inactive ? 1 : 0);

  const hasValueProgress = useSharedValue(hasValue ? 1 : 0);

  /**
   * Mirrors only the last requested target on the JS thread.
   *
   * This lets duplicate updates bail out without synchronously reading
   * SharedValue.value from the UI thread.
   */
  const focusedTargetStateRef = useRef<TProgressTargetState>({
    target: 0,
    reducedMotion: prefersReducedMotion,
  });

  const errorTargetStateRef = useRef<TProgressTargetState>({
    target: hasError ? 1 : 0,
    reducedMotion: prefersReducedMotion,
  });

  const disabledTargetStateRef = useRef<TProgressTargetState>({
    target: disabled ? 1 : 0,
    reducedMotion: prefersReducedMotion,
  });

  const inactiveTargetStateRef = useRef<TProgressTargetState>({
    target: inactive ? 1 : 0,
    reducedMotion: prefersReducedMotion,
  });

  const hasValueTargetStateRef = useRef<TProgressTargetState>({
    target: hasValue ? 1 : 0,
    reducedMotion: prefersReducedMotion,
  });

  // ─── Shared transition helper ────────────────────────────────────────────────

  const updateProgress = useCallback(
    (
      progress: SharedValue<number>,
      target: TProgressTarget,
      targetStateRef: RefObject<TProgressTargetState>,
    ) => {
      const previous = targetStateRef.current;

      if (previous.target === target) {
        if (previous.reducedMotion === prefersReducedMotion) {
          return;
        }

        targetStateRef.current = {
          target,
          reducedMotion: prefersReducedMotion,
        };

        /**
         * When reduced motion becomes enabled while an animation is running,
         * snap to the already-requested target. When it becomes disabled, the
         * value is already at the target and no new animation is necessary.
         */
        if (!prefersReducedMotion) {
          return;
        }

        cancelAnimation(progress);
        progress.value = target;

        return;
      }

      targetStateRef.current = {
        target,
        reducedMotion: prefersReducedMotion,
      };

      cancelAnimation(progress);

      if (prefersReducedMotion) {
        progress.value = target;

        return;
      }

      progress.value = withTiming(target, animationConfig);
    },
    [prefersReducedMotion, animationConfig],
  );

  // ─── Native focus axis ───────────────────────────────────────────────────────

  /**
   * Called directly from native focus/blur event handlers.
   *
   * No React state is involved in the focus animation path.
   */
  const setFocused = useCallback(
    (focused: boolean) => {
      updateProgress(focusedProgress, focused ? 1 : 0, focusedTargetStateRef);
    },
    [focusedProgress, updateProgress],
  );

  /**
   * Focus is event-driven rather than prop-driven, so it needs its own
   * synchronization point when the reduced-motion preference changes.
   */
  useEffect(() => {
    updateProgress(
      focusedProgress,
      focusedTargetStateRef.current.target,
      focusedTargetStateRef,
    );
  }, [focusedProgress, updateProgress]);

  // ─── Prop-driven axes ────────────────────────────────────────────────────────

  /**
   * Each semantic axis has its own effect.
   *
   * For example, toggling error does not restart focused, disabled,
   * inactive or value-presence animations.
   */
  useEffect(() => {
    updateProgress(errorProgress, hasError ? 1 : 0, errorTargetStateRef);
  }, [hasError, errorProgress, updateProgress]);

  useEffect(() => {
    updateProgress(disabledProgress, disabled ? 1 : 0, disabledTargetStateRef);
  }, [disabled, disabledProgress, updateProgress]);

  useEffect(() => {
    updateProgress(inactiveProgress, inactive ? 1 : 0, inactiveTargetStateRef);
  }, [inactive, inactiveProgress, updateProgress]);

  useEffect(() => {
    updateProgress(hasValueProgress, hasValue ? 1 : 0, hasValueTargetStateRef);
  }, [hasValue, hasValueProgress, updateProgress]);

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  /**
   * Semantic transitions are UI-thread-owned and may still be active when
   * the consuming field unmounts.
   *
   * Cancel only at lifecycle teardown; normal replacement/reversal remains
   * owned by updateProgress().
   */
  useEffect(
    () => () => {
      cancelAnimation(focusedProgress);
      cancelAnimation(errorProgress);
      cancelAnimation(disabledProgress);
      cancelAnimation(inactiveProgress);
      cancelAnimation(hasValueProgress);
    },
    [
      focusedProgress,
      errorProgress,
      disabledProgress,
      inactiveProgress,
      hasValueProgress,
    ],
  );

  return {
    focusedProgress,
    errorProgress,
    disabledProgress,
    inactiveProgress,
    hasValueProgress,
    setFocused,
  };
};
