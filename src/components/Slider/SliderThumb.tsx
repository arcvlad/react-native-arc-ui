import { memo, useCallback, useEffect, useMemo } from "react";
import {
  StyleSheet,
  TextInput,
  type AccessibilityActionEvent,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { useARCUISystem, useARCUITheme } from "../../contexts/hooks";
import { resolveAnimation } from "../../utils/resolveAnimation";

import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { ISliderColors, ISliderSizes } from "./types";
import {
  clampSliderNormalized,
  formatSliderValue,
  getAdjacentSliderValue,
  sliderNormalizedToValue,
  sliderValueToAccessibilityInteger,
  sliderValueToNormalized,
  snapSliderValue,
} from "./utils";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type TAnimatedTextInputProps = TextInputProps & {
  text?: string;
};

type TSliderThumbKind = "single" | "lower" | "upper";

interface ISliderThumb {
  kind: TSliderThumbKind;

  position: SharedValue<number>;
  otherPosition?: SharedValue<number>;
  isInteracting: SharedValue<boolean>;

  semanticValue: number;

  accessibilityMin: number;
  accessibilityMax: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;

  min: number;
  max: number;
  step: number;

  sizes: ISliderSizes;
  colors: ISliderColors;

  /**
   * Optional JS-side live semantic update.
   *
   * The worklet calls this only when the snapped value changes,
   * never for every gesture frame.
   */
  onChange?: (value: number, otherValue?: number) => void;

  /**
   * Completes one successful interaction whose final semantic value differs
   * from the value at interaction start. emitChange tells JS whether the final
   * snapped value still needs to be delivered to the live callback first.
   */
  onFinish: (
    value: number,
    otherValue: number | undefined,
    emitChange: boolean,
  ) => void;

  /**
   * Optional controlled-state reconciliation when the gesture ends without
   * a semantic finish callback (for example cancellation or a no-op release).
   */
  onReconcile?: () => void;

  showTooltip: boolean;
  disabled: boolean;

  testID?: string;
}

const ACCESSIBILITY_ACTIONS = [
  { name: "increment" as const },
  { name: "decrement" as const },
];

const SliderThumbComponent = ({
  kind,
  position,
  otherPosition,
  isInteracting,
  semanticValue,
  accessibilityMin,
  accessibilityMax,
  accessibilityLabel,
  accessibilityHint,
  min,
  max,
  step,
  sizes,
  colors,
  onChange,
  onFinish,
  onReconcile,
  showTooltip,
  disabled,
  testID,
}: ISliderThumb) => {
  const { tokens, theme } = useARCUITheme();
  const { fontScale } = useARCUISystem();

  const prefersReducedMotion = useReducedMotion();

  const {
    thumbSize,
    thumbTouchSize,
    trackWidth,
    trackOffset,
    tooltipWidth,
    tooltipHeight,
    tooltipGap,
  } = sizes;

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.sliderAnimations, tokens.animations),
    [tokens.sliderAnimations, tokens.animations],
  );

  const resolvedThumbScale = tokens.sliderAnimations.thumbScale;

  const tooltipScaleFrom = tokens.sliderAnimations.tooltipScaleFrom;

  const valueFontSize = tokens.typography.slider.value.fontSize;

  const tooltipProgress = useSharedValue(0);

  const thumbScale = useSharedValue(1);

  const startX = useSharedValue(0);

  /**
   * Semantic gesture bookkeeping stays on the UI thread.
   *
   * interactionStartValue is the rollback/commit baseline.
   * lastEmittedValue prevents duplicate UI -> JS transitions while the
   * gesture itself remains fully continuous at display refresh rate.
   */
  const interactionStartValue = useSharedValue(semanticValue);

  const lastEmittedValue = useSharedValue(semanticValue);

  const didScheduleFinish = useSharedValue(false);

  useEffect(
    () => () => {
      cancelAnimation(tooltipProgress);
      cancelAnimation(thumbScale);
      isInteracting.value = false;
    },
    [tooltipProgress, thumbScale, isInteracting],
  );

  // ─── Static token geometry ───────────────────────────────────────────────

  const touchTargetStyle = useMemo<ViewStyle>(
    () => ({
      position: "absolute",
      top: 0,
      width: thumbTouchSize,
      height: thumbTouchSize,
      alignItems: "center",
      justifyContent: "center",
    }),
    [thumbTouchSize],
  );

  const thumbGeometryStyle = useMemo<ViewStyle>(
    () => ({
      width: thumbSize,
      height: thumbSize,
      borderRadius: thumbSize / 2,
    }),
    [thumbSize],
  );

  /**
   * First-paint fallback.
   *
   * Reanimated owns position after its animated style is installed, but the
   * native view should already be visible in the correct semantic position on
   * frame 0. This avoids waiting for either UI-thread style installation or
   * track measurement before the thumb can be painted.
   */
  const initialNormalizedPosition = sliderValueToNormalized(
    semanticValue,
    min,
    max,
    step,
  );

  const initialTouchTargetStyle = useMemo<ViewStyle>(
    () => ({
      left: `${initialNormalizedPosition * 100}%` as `${number}%`,
      transform: [
        {
          translateX: -initialNormalizedPosition * thumbTouchSize,
        },
      ],
    }),
    [initialNormalizedPosition, thumbTouchSize],
  );

  const initialThumbColor = disabled
    ? tokens.colors[theme].slider.thumb.disabled
    : tokens.colors[theme].slider.thumb.primary;

  const initialThumbStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: initialThumbColor,
    }),
    [initialThumbColor],
  );

  const tooltipGeometryStyle = useMemo<ViewStyle>(
    () => ({
      width: tooltipWidth,
      height: tooltipHeight,
      borderRadius: tokens.radius.slider,
    }),
    [tooltipWidth, tooltipHeight, tokens.radius.slider],
  );

  const tooltipTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.slider.value).style,
    [tokens.typography.slider.value],
  );

  // ─── Pan gesture ─────────────────────────────────────────────────────────

  const pan = Gesture.Pan()
    .enabled(!disabled && trackWidth > 0)
    .maxPointers(1)
    .onBegin(() => {
      "worklet";

      isInteracting.value = true;

      /**
       * React semantic state is the interaction baseline.
       *
       * The visual position may be between semantic values while a controlled
       * prop update is still animating, so commit/cancel semantics must use the
       * React source of truth rather than an intermediate visual position.
       */
      interactionStartValue.value = semanticValue;
      lastEmittedValue.value = semanticValue;
      didScheduleFinish.value = false;

      cancelAnimation(position);

      /**
       * Dragging still begins exactly from the position the user currently sees.
       */
      startX.value = position.value * trackWidth;

      cancelAnimation(thumbScale);

      if (prefersReducedMotion) {
        thumbScale.value = 1;
      } else {
        thumbScale.value = withTiming(resolvedThumbScale, animationConfig);
      }

      if (showTooltip) {
        cancelAnimation(tooltipProgress);

        tooltipProgress.value = prefersReducedMotion
          ? 1
          : withTiming(1, animationConfig);
      }
    })
    .onUpdate((event) => {
      "worklet";

      if (trackWidth <= 0) {
        return;
      }

      const nextX = Math.min(
        Math.max(startX.value + event.translationX, 0),
        trackWidth,
      );

      let normalized = clampSliderNormalized(nextX / trackWidth);

      /**
       * Range thumbs never cross.
       *
       * This constraint is entirely UI-thread-side.
       */
      if (kind === "lower" && otherPosition) {
        normalized = Math.min(normalized, otherPosition.value);
      } else if (kind === "upper" && otherPosition) {
        normalized = Math.max(normalized, otherPosition.value);
      }

      /**
       * Visual motion stays fully continuous regardless of JS load.
       */
      position.value = normalized;

      /**
       * Keep the common commit-only path completely free of UI -> JS work
       * during drag. Live semantic calculation is needed only when the
       * consumer explicitly subscribes to onValueChange/onValuesChange.
       */
      if (!onChange) {
        return;
      }

      /**
       * JS observes only semantic step transitions, never raw gesture frames.
       */
      const nextValue = sliderNormalizedToValue(normalized, min, max, step);

      if (nextValue !== lastEmittedValue.value) {
        lastEmittedValue.value = nextValue;

        const otherValue = otherPosition
          ? sliderNormalizedToValue(otherPosition.value, min, max, step)
          : undefined;

        runOnJS(onChange)(nextValue, otherValue);
      }
    })
    .onTouchesUp(() => {
      "worklet";

      /**
       * Press feedback follows the physical touch lifetime, not Pan activation.
       * A short tap may begin receiving touches without producing an update,
       * so hide transient feedback as soon as the finger is lifted.
       */
      cancelAnimation(thumbScale);

      thumbScale.value = prefersReducedMotion
        ? 1
        : withTiming(1, animationConfig);

      if (showTooltip) {
        cancelAnimation(tooltipProgress);

        tooltipProgress.value = prefersReducedMotion
          ? 0
          : withTiming(0, animationConfig);
      }
    })
    .onEnd(() => {
      "worklet";

      let value = sliderNormalizedToValue(position.value, min, max, step);

      let otherValue: number | undefined;

      if (kind === "lower" && otherPosition) {
        const upperValue = sliderNormalizedToValue(
          otherPosition.value,
          min,
          max,
          step,
        );

        otherValue = upperValue;
        value = Math.min(value, upperValue);
      } else if (kind === "upper" && otherPosition) {
        const lowerValue = sliderNormalizedToValue(
          otherPosition.value,
          min,
          max,
          step,
        );

        otherValue = lowerValue;
        value = Math.max(value, lowerValue);
      }

      const target = sliderValueToNormalized(value, min, max, step);

      cancelAnimation(position);

      position.value = prefersReducedMotion
        ? target
        : withTiming(target, animationConfig);

      const shouldEmitFinalChange = value !== lastEmittedValue.value;

      if (shouldEmitFinalChange) {
        lastEmittedValue.value = value;
      }

      /**
       * No semantic final change means there is nothing to commit.
       *
       * If the finger returned to the start value between gesture updates,
       * still flush that final live value so JS does not remain stale.
       */
      if (value === interactionStartValue.value) {
        if (shouldEmitFinalChange && onChange) {
          runOnJS(onChange)(value, otherValue);
        }

        return;
      }

      /**
       * Exactly one JS completion transition for the drag.
       *
       * onFinish also flushes the final live value first when required.
       */
      didScheduleFinish.value = true;
      runOnJS(onFinish)(value, otherValue, shouldEmitFinalChange);
    })
    .onFinalize((_event, success) => {
      "worklet";

      isInteracting.value = false;

      if (!success) {
        const rollbackValue = interactionStartValue.value;

        const committedPosition = sliderValueToNormalized(
          rollbackValue,
          min,
          max,
          step,
        );

        cancelAnimation(position);

        position.value = prefersReducedMotion
          ? committedPosition
          : withTiming(committedPosition, animationConfig);

        /**
         * Live JS state follows the cancelled interaction back to its
         * original semantic value when it had previously observed a change.
         */
        if (lastEmittedValue.value !== rollbackValue) {
          lastEmittedValue.value = rollbackValue;

          if (onChange) {
            const rollbackOtherValue = otherPosition
              ? sliderNormalizedToValue(otherPosition.value, min, max, step)
              : undefined;

            runOnJS(onChange)(rollbackValue, rollbackOtherValue);
          }
        }
      }

      /**
       * Successful semantic finishes reconcile through onFinish itself.
       * Controlled no-op/cancelled interactions still need one explicit
       * reconciliation so the latest React source of truth can resume control.
       */
      if (onReconcile && (!success || !didScheduleFinish.value)) {
        runOnJS(onReconcile)();
      }

      cancelAnimation(thumbScale);

      thumbScale.value = prefersReducedMotion
        ? 1
        : withTiming(1, animationConfig);

      if (showTooltip) {
        cancelAnimation(tooltipProgress);

        tooltipProgress.value = prefersReducedMotion
          ? 0
          : withTiming(0, animationConfig);
      }
    });

  // ─── Thumb ───────────────────────────────────────────────────────────────

  const animatedTouchTargetStyle = useAnimatedStyle(() => {
    const normalized = clampSliderNormalized(position.value);

    if (trackWidth <= 0) {
      /**
       * Initial layout fallback.
       *
       * Keep the thumb visible at its semantic normalized position before
       * onLayout provides the measured track width. The percentage anchors
       * against the full container and the translation subtracts the thumb
       * touch target proportionally, which is equivalent to:
       *
       * normalized * (containerWidth - thumbTouchSize)
       */
      return {
        left: `${normalized * 100}%` as `${number}%`,
        transform: [{ translateX: -normalized * thumbTouchSize }],
      };
    }

    return {
      left: normalized * trackWidth,
      transform: [{ translateX: 0 }],
    };
  });

  const animatedThumbStyle = useAnimatedStyle(() => ({
    backgroundColor: colors.thumbColor.value,

    transform: [
      {
        scale: prefersReducedMotion ? 1 : thumbScale.value,
      },
    ],
  }));

  // ─── Tooltip ─────────────────────────────────────────────────────────────

  const animatedTooltipStyle = useAnimatedStyle(() => {
    const containerWidth = trackWidth + trackOffset * 2;

    const center = trackOffset + position.value * trackWidth;

    const rawLeft = center - tooltipWidth / 2;

    const maxLeft = Math.max(0, containerWidth - tooltipWidth);

    const left = Math.min(Math.max(rawLeft, 0), maxLeft);

    const scale = prefersReducedMotion
      ? 1
      : tooltipScaleFrom + (1 - tooltipScaleFrom) * tooltipProgress.value;

    return {
      left,

      top: -tooltipHeight - tooltipGap,

      opacity: tooltipProgress.value,

      backgroundColor: colors.tooltipBg.value,

      transform: [{ scale }],
    };
  });

  const valueLineHeight = tokens.typography.slider.value.lineHeight;

  const animatedTooltipTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: valueFontSize * fontScale.value,

    lineHeight:
      valueLineHeight != null
        ? valueLineHeight * fontScale.value
        : undefined,
  }));

  const animatedTooltipTextColorStyle = useAnimatedStyle(() => ({
    color: colors.tooltipText.value,
  }));

  const animatedTooltipTextProps = useAnimatedProps<TAnimatedTextInputProps>(
    () => {
      const value = formatSliderValue(
        sliderNormalizedToValue(position.value, min, max, step),
      );

      return {
        text: value,
        defaultValue: value,
      };
    },
  );

  // ─── Accessibility ───────────────────────────────────────────────────────

  const accessibilityValue = useMemo(
    () => ({
      min: sliderValueToAccessibilityInteger(accessibilityMin, min, max, step),

      max: sliderValueToAccessibilityInteger(accessibilityMax, min, max, step),

      now: sliderValueToAccessibilityInteger(semanticValue, min, max, step),

      text: formatSliderValue(semanticValue),
    }),
    [accessibilityMin, accessibilityMax, semanticValue, min, max, step],
  );

  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (disabled) {
        return;
      }

      const action = event.nativeEvent.actionName;

      if (action !== "increment" && action !== "decrement") {
        return;
      }

      const adjacent = getAdjacentSliderValue(
        semanticValue,
        action,
        min,
        max,
        step,
      );

      const bounded = Math.min(
        Math.max(adjacent, accessibilityMin),
        accessibilityMax,
      );

      const nextValue = snapSliderValue(bounded, min, max, step);

      if (nextValue === semanticValue) {
        return;
      }

      const target = sliderValueToNormalized(nextValue, min, max, step);

      cancelAnimation(position);

      position.value = prefersReducedMotion
        ? target
        : withTiming(target, animationConfig);

      /**
       * Accessibility increment/decrement is one complete discrete
       * interaction, so JS receives change and commit in one transition.
       */
      const otherValue =
        kind === "lower"
          ? accessibilityMax
          : kind === "upper"
            ? accessibilityMin
            : undefined;

      onFinish(nextValue, otherValue, true);
    },
    [
      disabled,
      semanticValue,
      accessibilityMin,
      accessibilityMax,
      min,
      max,
      step,
      position,
      prefersReducedMotion,
      animationConfig,
      kind,
      onFinish,
    ],
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      {showTooltip && (
        <Animated.View
          testID={testID ? `${testID}-tooltip` : undefined}
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.tooltip, tooltipGeometryStyle, animatedTooltipStyle]}
        >
          <AnimatedTextInput
            animatedProps={animatedTooltipTextProps}
            defaultValue={formatSliderValue(semanticValue)}
            editable={false}
            caretHidden
            pointerEvents="none"
            accessible={false}
            allowFontScaling={false}
            numberOfLines={1}
            maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
            style={[
              styles.tooltipText,
              tooltipTypographyStyle,
              animatedTooltipTextSizeStyle,
              animatedTooltipTextColorStyle,
            ]}
          />
        </Animated.View>
      )}

      <GestureDetector gesture={pan}>
        <Animated.View
          testID={testID}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          aria-disabled={disabled}
          accessibilityState={{
            disabled,
          }}
          accessibilityValue={accessibilityValue}
          accessibilityActions={ACCESSIBILITY_ACTIONS}
          onAccessibilityAction={handleAccessibilityAction}
          style={[
            touchTargetStyle,
            initialTouchTargetStyle,
            animatedTouchTargetStyle,
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[thumbGeometryStyle, initialThumbStyle, animatedThumbStyle]}
          />
        </Animated.View>
      </GestureDetector>
    </>
  );
};

export const SliderThumb = memo(SliderThumbComponent);

SliderThumb.displayName = "SliderThumb";

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  tooltipText: {
    padding: 0,
    margin: 0,
    width: "100%",
    textAlign: "center",
  },
});
