import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  cancelAnimation,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { resolveEasing } from "../../utils/resolveEasing";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { TToastEntry, TToastId } from "./types";

type TToastItemProps = {
  toast: TToastEntry;
  stackOffset: number;
  stackDepth: number;
  onHeightChange: (id: TToastId, height: number) => void;
  onRequestClose: (id: TToastId) => void;
  onExitComplete: (id: TToastId) => void;
};

const FALLBACK_DISPLAY_DURATION = 3000;

const resolveDisplayDuration = (
  duration: number | undefined,
  tokenDuration: number,
): number => {
  if (duration !== undefined && Number.isFinite(duration) && duration >= 0) {
    return duration;
  }

  if (Number.isFinite(tokenDuration) && tokenDuration >= 0) {
    return tokenDuration;
  }

  return FALLBACK_DISPLAY_DURATION;
};

const resolveStackScale = (
  depth: number,
  step: number,
  minimum: number,
): number => {
  const resolvedDepth =
    Number.isFinite(depth) && depth > 0 ? Math.floor(depth) : 0;

  const resolvedStep = Number.isFinite(step) && step > 0 ? step : 0;

  const resolvedMinimum = Number.isFinite(minimum)
    ? Math.min(1, Math.max(0, minimum))
    : 1;

  return Math.max(resolvedMinimum, 1 - resolvedDepth * resolvedStep);
};

export const ToastItem = memo(function ToastItem({
  toast,
  stackOffset,
  stackDepth,
  onHeightChange,
  onRequestClose,
  onExitComplete,
}: TToastItemProps) {
  const { tokens } = useARCUITheme();
  const { themeProgress } = useARCUIAnimatedTheme();
  const { fontScale } = useARCUISystem();

  const prefersReducedMotion = useReducedMotion();

  /**
   * One visual lifecycle progress owns both opacity and vertical translation.
   *
   * 0 -> hidden
   * 1 -> fully presented
   *
   * Reusing the same progress keeps enter/exit reversal coherent when a Toast
   * is dismissed before its enter transition completes.
   */
  const progress = useSharedValue(0);

  /**
   * Stack offset is independent from enter/exit motion.
   *
   * Keeping them on separate nested views allows sibling reflow to reverse or
   * retarget without interfering with the Toast's own lifecycle animation.
   */
  const resolvedStackOffset =
    toast.placement === "top" ? stackOffset : -stackOffset;

  const stackPosition = useSharedValue(resolvedStackOffset);

  const resolvedStackScale = resolveStackScale(
    stackDepth,
    tokens.sizings.toast.stackScaleStep,
    tokens.sizings.toast.stackMinScale,
  );

  const stackScale = useSharedValue(resolvedStackScale);
  const stackBorderProgress = useSharedValue(stackDepth > 0 ? 1 : 0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPresentedRef = useRef(false);

  // ─── Token primitives ─────────────────────────────────────────────────────

  const darkBackground = tokens.colors.dark.toast.background.primary;
  const lightBackground = tokens.colors.light.toast.background.primary;

  const darkText = tokens.colors.dark.toast.text.primary;
  const lightText = tokens.colors.light.toast.text.primary;

  const darkStackBorder = tokens.colors.dark.toast.border.stacked;
  const lightStackBorder = tokens.colors.light.toast.border.stacked;

  const textFontSize = tokens.typography.toast.text.fontSize;
  const textLineHeight = tokens.typography.toast.text.lineHeight;

  const motionDistance = tokens.toastAnimations.distance;
  const motionDirection = toast.placement === "top" ? -1 : 1;

  const displayDuration = resolveDisplayDuration(
    toast.duration,
    tokens.toastAnimations.displayDuration,
  );

  const enterAnimationConfig = useMemo(
    () => ({
      duration:
        tokens.toastAnimations.enterDuration ?? tokens.animations.enterDuration,

      easing: resolveEasing(
        tokens.toastAnimations.enterEasing ?? tokens.animations.enterEasing,
      ),
    }),
    [tokens.toastAnimations, tokens.animations],
  );

  const exitAnimationConfig = useMemo(
    () => ({
      duration:
        tokens.toastAnimations.exitDuration ?? tokens.animations.exitDuration,

      easing: resolveEasing(
        tokens.toastAnimations.exitEasing ?? tokens.animations.exitEasing,
      ),
    }),
    [tokens.toastAnimations, tokens.animations],
  );

  const stackAnimationConfig = useMemo(
    () => ({
      duration:
        tokens.toastAnimations.layoutDuration ?? tokens.animations.duration,

      easing: resolveEasing(
        tokens.toastAnimations.layoutEasing ?? tokens.animations.easing,
      ),
    }),
    [tokens.toastAnimations, tokens.animations],
  );

  const textTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.toast.text).style,
    [tokens.typography.toast.text],
  );

  // ─── Theme ────────────────────────────────────────────────────────────────

  const toastColors = useDerivedValue(() => ({
    background: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBackground, lightBackground],
    ),

    text: interpolateColor(themeProgress.value, [0, 1], [darkText, lightText]),

    stackBorder: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkStackBorder, lightStackBorder],
    ),
  }));

  // ─── Animated styles ──────────────────────────────────────────────────────

  const animatedStackPositionStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: stackPosition.value,
      },
      {
        scale: stackScale.value,
      },
    ],
  }));

  const animatedMotionStyle = useAnimatedStyle(() => ({
    opacity: progress.value,

    transform: [
      {
        translateY: (1 - progress.value) * motionDistance * motionDirection,
      },
    ],
  }));

  const animatedSurfaceColorStyle = useAnimatedStyle(() => ({
    backgroundColor: toastColors.value.background,
  }));

  const animatedStackBorderStyle = useAnimatedStyle(() => ({
    borderColor: toastColors.value.stackBorder,
    opacity: stackBorderProgress.value,
  }));

  const animatedTextSizeStyle = useAnimatedStyle(() => {
    const fontSize = textFontSize * fontScale.value;

    if (textLineHeight === undefined) {
      return {
        fontSize,
      };
    }

    return {
      fontSize,
      lineHeight: textLineHeight * fontScale.value,
    };
  });

  const animatedTextColorStyle = useAnimatedStyle(() => ({
    color: toastColors.value.text,
  }));

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onHeightChange(toast.id, event.nativeEvent.layout.height);
    },
    [onHeightChange, toast.id],
  );

  const requestClose = useCallback(() => {
    onRequestClose(toast.id);
  }, [onRequestClose, toast.id]);

  const completeExit = useCallback(() => {
    onExitComplete(toast.id);
  }, [onExitComplete, toast.id]);

  useEffect(() => {
    const resolvedBorderProgress = stackDepth > 0 ? 1 : 0;

    cancelAnimation(stackPosition);
    cancelAnimation(stackScale);
    cancelAnimation(stackBorderProgress);

    if (prefersReducedMotion) {
      stackPosition.value = resolvedStackOffset;
      stackScale.value = resolvedStackScale;
      stackBorderProgress.value = resolvedBorderProgress;

      return;
    }

    stackPosition.value = withTiming(resolvedStackOffset, stackAnimationConfig);

    stackScale.value = withTiming(resolvedStackScale, stackAnimationConfig);

    stackBorderProgress.value = withTiming(
      resolvedBorderProgress,
      stackAnimationConfig,
    );

    return () => {
      cancelAnimation(stackPosition);
      cancelAnimation(stackScale);
      cancelAnimation(stackBorderProgress);
    };
  }, [
    stackPosition,
    stackScale,
    stackBorderProgress,
    stackDepth,
    resolvedStackOffset,
    resolvedStackScale,
    prefersReducedMotion,
    stackAnimationConfig,
  ]);

  /**
   * Android has accessibilityLiveRegion for dynamic announcements.
   *
   * iOS has no equivalent live-region primitive, so explicitly queue the
   * Toast message once when it becomes semantically visible.
   */
  useEffect(() => {
    if (!toast.isOpen || Platform.OS !== "ios") {
      return;
    }

    AccessibilityInfo.announceForAccessibilityWithOptions(toast.message, {
      queue: true,
    });
  }, [toast.id, toast.isOpen, toast.message]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    cancelAnimation(progress);

    if (!toast.isOpen) {
      /**
       * showToast() followed immediately by hideToast(id) can be batched
       * before ToastItem ever presents. There is nothing visual to animate
       * out in that case.
       */
      if (!hasPresentedRef.current || prefersReducedMotion) {
        progress.value = 0;
        completeExit();

        return;
      }

      progress.value = withTiming(0, exitAnimationConfig, (finished) => {
        if (finished) {
          runOnJS(completeExit)();
        }
      });

      return () => {
        cancelAnimation(progress);
      };
    }

    hasPresentedRef.current = true;

    if (prefersReducedMotion) {
      progress.value = 1;
    } else {
      progress.value = withTiming(1, enterAnimationConfig);
    }

    let cancelled = false;

    const scheduleAutoDismiss = async () => {
      let timeoutDuration = displayDuration;

      /**
       * Respect Android's user-configured accessibility timeout for transient
       * UI. If the native query fails, keep the ARCUI-requested duration.
       */
      if (Platform.OS === "android" && displayDuration > 0) {
        try {
          timeoutDuration =
            await AccessibilityInfo.getRecommendedTimeoutMillis(
              displayDuration,
            );
        } catch {
          timeoutDuration = displayDuration;
        }
      }

      if (cancelled) {
        return;
      }

      timerRef.current = setTimeout(requestClose, timeoutDuration);
    };

    void scheduleAutoDismiss();

    return () => {
      cancelled = true;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      cancelAnimation(progress);
    };
  }, [
    toast.isOpen,
    progress,
    prefersReducedMotion,
    enterAnimationConfig,
    exitAnimationConfig,
    displayDuration,
    requestClose,
    completeExit,
  ]);

  return (
    <Animated.View
      testID={toast.testID}
      onLayout={handleLayout}
      style={[
        styles.stackItem,
        toast.placement === "top"
          ? styles.stackItemTop
          : styles.stackItemBottom,
        animatedStackPositionStyle,
      ]}
    >
      <Animated.View
        accessible={toast.isOpen}
        accessibilityElementsHidden={!toast.isOpen}
        accessibilityLabel={toast.message}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        importantForAccessibility={toast.isOpen ? "yes" : "no-hide-descendants"}
        style={[
          styles.toast,
          {
            borderRadius: tokens.radius.toast,

            paddingVertical: tokens.sizings.toast.paddingVertical,

            paddingHorizontal: tokens.sizings.toast.paddingHorizontal,

            gap: tokens.sizings.toast.contentGap,
          },
          animatedMotionStyle,
          animatedSurfaceColorStyle,
        ]}
      >
        {toast.icon ? (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {toast.icon}
          </View>
        ) : null}

        <Animated.Text
          accessible={false}
          allowFontScaling={false}
          testID={toast.testID ? `${toast.testID}-message` : undefined}
          maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
          style={[
            styles.text,
            textTypographyStyle,
            animatedTextSizeStyle,
            animatedTextColorStyle,
          ]}
        >
          {toast.message}
        </Animated.Text>

        <Animated.View
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.stackBorder,
            {
              borderRadius: tokens.radius.toast,
              borderWidth: tokens.sizings.toast.stackBorderWidth,
            },
            animatedStackBorderStyle,
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
});

ToastItem.displayName = "ToastItem";

const styles = StyleSheet.create({
  stackItem: {
    position: "absolute",
    left: 0,
    right: 0,
    width: "100%",
  },

  stackItemTop: {
    top: 0,
  },

  stackItemBottom: {
    bottom: 0,
  },

  toast: {
    flexDirection: "row",
    alignItems: "center",
  },

  stackBorder: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  text: {
    minWidth: 0,
  },
});
