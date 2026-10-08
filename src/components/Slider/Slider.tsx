import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUIStrings,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { Icon } from "../Icon/Icon";

import { SliderHeader } from "./SliderHeader";
import { SliderThumb } from "./SliderThumb";
import { SliderTrack } from "./SliderTrack";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { ISlider, ISliderColors, ISliderSizes } from "./types";
import {
  resolveSliderConfig,
  resolveSliderRangeValues,
  sliderValueToNormalized,
  snapSliderValue,
} from "./utils";

export type { ISlider, TSliderLayout } from "./types";

const SliderComponent = (props: ISlider) => {
  const {
    min: minimum = 0,
    max: maximum = 100,
    step: requestedStep = 1,
    label,
    error,
    layout = "label-value",
    showTooltip = true,
    disabled = false,
    active = true,
    style,
    testID,
  } = props;

  const { tokens } = useARCUITheme();
  const { themeProgress } = useARCUIAnimatedTheme();
  const { fontScale } = useARCUISystem();
  const strings = useARCUIStrings();

  const prefersReducedMotion = useReducedMotion();

  const { min, max, step } = resolveSliderConfig(
    minimum,
    maximum,
    requestedStep,
  );

  const isRange = props.range === true;

  const singleValue = props.range === true ? undefined : props.value;

  const rangeValues = props.range === true ? props.values : undefined;

  const onValueChange = props.range === true ? undefined : props.onValueChange;

  const onValueCommit = props.range === true ? undefined : props.onValueCommit;

  const onValuesChange =
    props.range === true ? props.onValuesChange : undefined;

  const onValuesCommit =
    props.range === true ? props.onValuesCommit : undefined;

  // ─── Semantic state ──────────────────────────────────────────────────────

  /**
   * Single/range mode is a structural lifetime invariant.
   *
   * This is independent from semantic state ownership: all Slider values are
   * controlled, but changing the component between one-thumb and two-thumb
   * architecture requires a remount.
   */
  const [initialIsRange] = useState(isRange);

  const resolvedSingleValue = snapSliderValue(
    singleValue ?? min,
    min,
    max,
    step,
  );

  const resolvedRangeValues = resolveSliderRangeValues(
    rangeValues ?? [min, max],
    min,
    max,
    step,
  );

  const resolvedRangeLowerValue = resolvedRangeValues[0];

  const resolvedRangeUpperValue = resolvedRangeValues[1];

  /**
   * UI-thread interactions optimistically move SharedValues before the JS
   * controlled state is resolved.
   *
   * A consumer may accept or reject the requested value while keeping the same
   * prop value, so semantic sync effects need an explicit reconciliation signal
   * even when their semantic dependency did not change.
   */
  const [controlledCommitRevision, setControlledCommitRevision] = useState(0);

  const isFixed = max <= min;

  const isInteractionDisabled = disabled || !active || isFixed;

  // ─── Motion ──────────────────────────────────────────────────────────────

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.sliderAnimations, tokens.animations),
    [tokens.sliderAnimations, tokens.animations],
  );

  // ─── Geometry ────────────────────────────────────────────────────────────

  const thumbSize = tokens.sizings.slider.thumbSize;

  const thumbTouchSize = Math.max(
    thumbSize,
    tokens.sizings.slider.thumbTouchSize,
  );

  const trackHeight = tokens.sizings.slider.trackHeight;

  const tooltipWidth = tokens.sizings.slider.tooltipWidth;

  const tooltipHeight = tokens.sizings.slider.tooltipHeight;

  const tooltipGap = tokens.sizings.slider.tooltipGap;

  const trackOffset = thumbTouchSize / 2;

  const [trackAreaWidth, setTrackAreaWidth] = useState(0);

  /**
   * Thumb centers travel only through the portion of the
   * Slider that keeps the complete touch target inside bounds.
   */
  const trackWidth = Math.max(0, trackAreaWidth - trackOffset * 2);

  const trackAreaHeight = tooltipHeight + tooltipGap + thumbTouchSize;

  const sizes = useMemo<ISliderSizes>(
    () => ({
      thumbSize,
      thumbTouchSize,
      trackHeight,
      trackWidth,
      trackOffset,
      tooltipWidth,
      tooltipHeight,
      tooltipGap,
    }),
    [
      thumbSize,
      thumbTouchSize,
      trackHeight,
      trackWidth,
      trackOffset,
      tooltipWidth,
      tooltipHeight,
      tooltipGap,
    ],
  );

  const containerTokenStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.sizings.slider.contentGap,
    }),
    [tokens.sizings.slider.contentGap],
  );

  const trackAreaStyle = useMemo<ViewStyle>(
    () => ({
      height: trackAreaHeight,
    }),
    [trackAreaHeight],
  );

  const trackAndThumbAreaStyle = useMemo<ViewStyle>(
    () => ({
      top: tooltipHeight + tooltipGap,
      height: thumbTouchSize,
    }),
    [tooltipHeight, tooltipGap, thumbTouchSize],
  );

  const errorRowTokenStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.sizings.slider.errorGap,
    }),
    [tokens.sizings.slider.errorGap],
  );

  const errorTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.input.error).style,
    [tokens.typography.input.error],
  );

  const handleTrackLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;

    setTrackAreaWidth((current) =>
      current === nextWidth ? current : nextWidth,
    );
  }, []);

  // ─── Visual SharedValues ─────────────────────────────────────────────────

  const singlePos = useSharedValue(
    sliderValueToNormalized(resolvedSingleValue, min, max, step),
  );

  const rangeLoPos = useSharedValue(
    sliderValueToNormalized(resolvedRangeLowerValue, min, max, step),
  );

  const rangeHiPos = useSharedValue(
    sliderValueToNormalized(resolvedRangeUpperValue, min, max, step),
  );

  /**
   * Active gestures own visual position until they finish.
   *
   * Controlled live callbacks may cause React props to update while a finger
   * is still moving. These flags prevent those prop updates from fighting the
   * gesture-driven SharedValues and introducing visual jitter.
   */
  const singleIsInteracting = useSharedValue(false);

  const rangeLoIsInteracting = useSharedValue(false);

  const rangeHiIsInteracting = useSharedValue(false);

  /**
   * React values are semantic source of truth.
   *
   * SharedValues mirror them only for visual positioning. During an active
   * gesture the UI-thread position has temporary visual priority; the final
   * controlled value is reconciled after the interaction completes.
   */
  useEffect(() => {
    if (isRange || singleIsInteracting.value) {
      return;
    }

    const target = sliderValueToNormalized(resolvedSingleValue, min, max, step);

    cancelAnimation(singlePos);

    singlePos.value = prefersReducedMotion
      ? target
      : withTiming(target, animationConfig);

    return () => {
      cancelAnimation(singlePos);
    };
  }, [
    isRange,
    resolvedSingleValue,
    min,
    max,
    step,
    prefersReducedMotion,
    animationConfig,
    singlePos,
    singleIsInteracting,
    controlledCommitRevision,
  ]);

  useEffect(() => {
    if (!isRange || rangeLoIsInteracting.value) {
      return;
    }

    const target = sliderValueToNormalized(
      resolvedRangeLowerValue,
      min,
      max,
      step,
    );

    cancelAnimation(rangeLoPos);

    rangeLoPos.value = prefersReducedMotion
      ? target
      : withTiming(target, animationConfig);

    return () => {
      cancelAnimation(rangeLoPos);
    };
  }, [
    isRange,
    resolvedRangeLowerValue,
    min,
    max,
    step,
    prefersReducedMotion,
    animationConfig,
    rangeLoPos,
    rangeLoIsInteracting,
    controlledCommitRevision,
  ]);

  useEffect(() => {
    if (!isRange || rangeHiIsInteracting.value) {
      return;
    }

    const target = sliderValueToNormalized(
      resolvedRangeUpperValue,
      min,
      max,
      step,
    );

    cancelAnimation(rangeHiPos);

    rangeHiPos.value = prefersReducedMotion
      ? target
      : withTiming(target, animationConfig);

    return () => {
      cancelAnimation(rangeHiPos);
    };
  }, [
    isRange,
    resolvedRangeUpperValue,
    min,
    max,
    step,
    prefersReducedMotion,
    animationConfig,
    rangeHiPos,
    rangeHiIsInteracting,
    controlledCommitRevision,
  ]);

  // ─── Semantic change / commit callbacks ──────────────────────────────────

  /**
   * Live callbacks intentionally do not mutate ARCUI React state.
   *
   * The gesture remains UI-thread owned; consumers opt into JS/React live
   * updates only by providing onValueChange / onValuesChange.
   */
  const handleSingleChange = useCallback(
    (nextValue: number, _otherValue?: number) => {
      if (isRange) {
        return;
      }

      onValueChange?.(snapSliderValue(nextValue, min, max, step));
    },
    [isRange, min, max, step, onValueChange],
  );

  const handleLowerChange = useCallback(
    (nextValue: number, otherValue?: number) => {
      if (!isRange) {
        return;
      }

      const upper = snapSliderValue(
        otherValue ?? resolvedRangeUpperValue,
        min,
        max,
        step,
      );

      const lower = Math.min(snapSliderValue(nextValue, min, max, step), upper);

      onValuesChange?.([lower, upper]);
    },
    [isRange, min, max, step, resolvedRangeUpperValue, onValuesChange],
  );

  const handleUpperChange = useCallback(
    (nextValue: number, otherValue?: number) => {
      if (!isRange) {
        return;
      }

      const lower = snapSliderValue(
        otherValue ?? resolvedRangeLowerValue,
        min,
        max,
        step,
      );

      const upper = Math.max(snapSliderValue(nextValue, min, max, step), lower);

      onValuesChange?.([lower, upper]);
    },
    [isRange, min, max, step, resolvedRangeLowerValue, onValuesChange],
  );

  /**
   * Finish handlers emit the final public callbacks and trigger controlled
   * visual reconciliation.
   *
   * emitChange is true only when the final snapped value was not already sent
   * by the live UI-thread step-change path. This prevents duplicate callbacks.
   *
   * ARCUI never mutates Slider semantic state internally.
   */

  const handleControlledInteractionReconcile = useCallback(() => {
    setControlledCommitRevision((current) => current + 1);
  }, [setControlledCommitRevision]);

  const handleSingleFinish = useCallback(
    (
      nextValue: number,
      _otherValue: number | undefined,
      emitChange: boolean,
    ) => {
      if (isRange) {
        return;
      }

      const resolved = snapSliderValue(nextValue, min, max, step);

      if (emitChange) {
        onValueChange?.(resolved);
      }

      onValueCommit?.(resolved);

      /**
       * Reconcile even when the consumer keeps the same controlled prop.
       *
       * The consumer may accept or reject the optimistic UI interaction.
       */
      handleControlledInteractionReconcile();
    },
    [
      isRange,
      min,
      max,
      step,
      onValueChange,
      onValueCommit,
      handleControlledInteractionReconcile,
    ],
  );

  const handleLowerFinish = useCallback(
    (
      nextValue: number,
      otherValue: number | undefined,
      emitChange: boolean,
    ) => {
      if (!isRange) {
        return;
      }

      const upper = snapSliderValue(
        otherValue ?? resolvedRangeUpperValue,
        min,
        max,
        step,
      );

      const lower = Math.min(snapSliderValue(nextValue, min, max, step), upper);

      const next: [number, number] = [lower, upper];

      if (emitChange) {
        onValuesChange?.(next);
      }

      onValuesCommit?.(next);

      handleControlledInteractionReconcile();
    },
    [
      isRange,
      min,
      max,
      step,
      resolvedRangeUpperValue,
      onValuesChange,
      onValuesCommit,
      handleControlledInteractionReconcile,
    ],
  );

  const handleUpperFinish = useCallback(
    (
      nextValue: number,
      otherValue: number | undefined,
      emitChange: boolean,
    ) => {
      if (!isRange) {
        return;
      }

      const lower = snapSliderValue(
        otherValue ?? resolvedRangeLowerValue,
        min,
        max,
        step,
      );

      const upper = Math.max(snapSliderValue(nextValue, min, max, step), lower);

      const next: [number, number] = [lower, upper];

      if (emitChange) {
        onValuesChange?.(next);
      }

      onValuesCommit?.(next);

      handleControlledInteractionReconcile();
    },
    [
      isRange,
      min,
      max,
      step,
      resolvedRangeLowerValue,
      onValuesChange,
      onValuesCommit,
      handleControlledInteractionReconcile,
    ],
  );

  // ─── Theme colors ────────────────────────────────────────────────────────

  const lightTrackActive = tokens.colors.light.slider.track.active;

  const darkTrackActive = tokens.colors.dark.slider.track.active;

  const lightTrackInactive = tokens.colors.light.slider.track.inactive;

  const darkTrackInactive = tokens.colors.dark.slider.track.inactive;

  const lightTrackDisabled = tokens.colors.light.slider.track.disabled;

  const darkTrackDisabled = tokens.colors.dark.slider.track.disabled;

  const lightThumb = tokens.colors.light.slider.thumb.primary;

  const darkThumb = tokens.colors.dark.slider.thumb.primary;

  const lightThumbDisabled = tokens.colors.light.slider.thumb.disabled;

  const darkThumbDisabled = tokens.colors.dark.slider.thumb.disabled;

  const lightTooltipBg = tokens.colors.light.slider.tooltip.background;

  const darkTooltipBg = tokens.colors.dark.slider.tooltip.background;

  const lightTooltipText = tokens.colors.light.slider.tooltip.text;

  const darkTooltipText = tokens.colors.dark.slider.tooltip.text;

  const lightLabel = tokens.colors.light.input.label.primary;

  const darkLabel = tokens.colors.dark.input.label.primary;

  const lightLabelDisabled = tokens.colors.light.input.label.disabled;

  const darkLabelDisabled = tokens.colors.dark.input.label.disabled;

  const lightError = tokens.colors.light.input.error;

  const darkError = tokens.colors.dark.input.error;

  const thumbColor = useDerivedValue(() =>
    isInteractionDisabled
      ? interpolateColor(
          themeProgress.value,
          [0, 1],
          [darkThumbDisabled, lightThumbDisabled],
        )
      : interpolateColor(themeProgress.value, [0, 1], [darkThumb, lightThumb]),
  );

  const tooltipBg = useDerivedValue(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkTooltipBg, lightTooltipBg],
    ),
  );

  const tooltipText = useDerivedValue(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkTooltipText, lightTooltipText],
    ),
  );

  const trackActiveColor = useDerivedValue(() =>
    isInteractionDisabled
      ? interpolateColor(
          themeProgress.value,
          [0, 1],
          [darkTrackDisabled, lightTrackDisabled],
        )
      : interpolateColor(
          themeProgress.value,
          [0, 1],
          [darkTrackActive, lightTrackActive],
        ),
  );

  const trackInactiveColor = useDerivedValue(() =>
    isInteractionDisabled
      ? interpolateColor(
          themeProgress.value,
          [0, 1],
          [darkTrackDisabled, lightTrackDisabled],
        )
      : interpolateColor(
          themeProgress.value,
          [0, 1],
          [darkTrackInactive, lightTrackInactive],
        ),
  );

  const labelColor = useDerivedValue(() =>
    isInteractionDisabled
      ? interpolateColor(
          themeProgress.value,
          [0, 1],
          [darkLabelDisabled, lightLabelDisabled],
        )
      : interpolateColor(themeProgress.value, [0, 1], [darkLabel, lightLabel]),
  );

  const errorColor = useDerivedValue(() =>
    interpolateColor(themeProgress.value, [0, 1], [darkError, lightError]),
  );

  const colors = useMemo<ISliderColors>(
    () => ({
      thumbColor,
      tooltipBg,
      tooltipText,
      trackActiveColor,
      trackInactiveColor,
      labelColor,
      errorColor,
    }),
    [
      thumbColor,
      tooltipBg,
      tooltipText,
      trackActiveColor,
      trackInactiveColor,
      labelColor,
      errorColor,
    ],
  );

  // ─── Error typography ────────────────────────────────────────────────────

  const errorFontSize = tokens.typography.input.error.fontSize;

  const errorLineHeight = tokens.typography.input.error.lineHeight;

  const animatedErrorSizeStyle = useAnimatedStyle(() => ({
    fontSize: errorFontSize * fontScale.value,

    lineHeight:
      errorLineHeight != null ? errorLineHeight * fontScale.value : undefined,
  }));

  const animatedErrorColorStyle = useAnimatedStyle(() => ({
    color: errorColor.value,
  }));

  const hasError = error != null && error.length > 0;

  // ─── Accessibility ───────────────────────────────────────────────────────

  /**
   * ARCUI does not provide a generic screen-reader gesture instruction.
   *
   * Native adjustable semantics and increment/decrement actions describe the
   * interaction. Consumers may add an accessibilityHint when additional
   * application-specific guidance is genuinely useful.
   */
  const accessibilityHint = props.accessibilityHint;

  const singleAccessibilityLabel =
    props.range === true
      ? undefined
      : (props.accessibilityLabel ?? label ?? strings.sliderAccessibilityLabel);

  const lowerAccessibilityLabel =
    props.range === true
      ? (props.lowerAccessibilityLabel ??
        (label
          ? `${label}, ${strings.sliderLowerAccessibilityLabel}`
          : strings.sliderLowerAccessibilityLabel))
      : undefined;

  const upperAccessibilityLabel =
    props.range === true
      ? (props.upperAccessibilityLabel ??
        (label
          ? `${label}, ${strings.sliderUpperAccessibilityLabel}`
          : strings.sliderUpperAccessibilityLabel))
      : undefined;

  // ─── Public API validation ───────────────────────────────────────────────

  /**
   * TypeScript models single/range ownership as a discriminated controlled
   * union. Runtime validation keeps the same invariant explicit for JavaScript
   * consumers and malformed dynamic props.
   *
   * Keep throwing validation after all hooks so malformed dynamic props cannot
   * alter hook ordering.
   */
  if (initialIsRange !== isRange) {
    throw new Error(
      "[react-native-arc-ui] Slider cannot switch between single and range mode after mount. Remount it with a new key instead.",
    );
  }

  if (isRange) {
    if (rangeValues === undefined) {
      throw new Error(
        '[react-native-arc-ui] Slider range mode requires "values".',
      );
    }

    if (props.value !== undefined) {
      throw new Error(
        '[react-native-arc-ui] Slider range mode must not receive "value".',
      );
    }

    if (props.onValueChange !== undefined) {
      throw new Error(
        '[react-native-arc-ui] Slider range mode must not receive "onValueChange". Use "onValuesChange" instead.',
      );
    }

    if (props.onValueCommit !== undefined) {
      throw new Error(
        '[react-native-arc-ui] Slider range mode must not receive "onValueCommit". Use "onValuesCommit" instead.',
      );
    }

    if (props.accessibilityLabel !== undefined) {
      throw new Error(
        '[react-native-arc-ui] Slider range mode must not receive "accessibilityLabel". Use "lowerAccessibilityLabel" and "upperAccessibilityLabel" instead.',
      );
    }
  } else {
    if (singleValue === undefined) {
      throw new Error(
        '[react-native-arc-ui] Slider single-value mode requires "value".',
      );
    }

    if (props.values !== undefined) {
      throw new Error(
        '[react-native-arc-ui] Slider single-value mode must not receive "values".',
      );
    }

    if (props.onValuesChange !== undefined) {
      throw new Error(
        '[react-native-arc-ui] Slider single-value mode must not receive "onValuesChange". Use "onValueChange" instead.',
      );
    }

    if (props.onValuesCommit !== undefined) {
      throw new Error(
        '[react-native-arc-ui] Slider single-value mode must not receive "onValuesCommit". Use "onValueCommit" instead.',
      );
    }

    if (props.lowerAccessibilityLabel !== undefined) {
      throw new Error(
        '[react-native-arc-ui] Slider single-value mode must not receive "lowerAccessibilityLabel". Use "accessibilityLabel" instead.',
      );
    }

    if (props.upperAccessibilityLabel !== undefined) {
      throw new Error(
        '[react-native-arc-ui] Slider single-value mode must not receive "upperAccessibilityLabel". Use "accessibilityLabel" instead.',
      );
    }
  }

  /**
   * Numeric configuration degrades safely through Slider resolvers. Development
   * diagnostics make invalid consumer input visible while production keeps the
   * deterministic fallback behavior.
   */
  if (__DEV__ && !Number.isFinite(minimum)) {
    console.error(
      "[react-native-arc-ui] Slider: min must be a finite number. Falling back to 0.",
    );
  }

  if (__DEV__ && !Number.isFinite(maximum)) {
    console.error(
      "[react-native-arc-ui] Slider: max must be a finite number. Falling back to the resolved min.",
    );
  }

  if (
    __DEV__ &&
    Number.isFinite(minimum) &&
    Number.isFinite(maximum) &&
    maximum < minimum
  ) {
    console.error(
      "[react-native-arc-ui] Slider: max must be greater than or equal to min. Collapsing the Slider to min.",
    );
  }

  if (__DEV__ && (!Number.isFinite(requestedStep) || requestedStep <= 0)) {
    console.error(
      "[react-native-arc-ui] Slider: step must be a finite number greater than zero. Falling back to 1.",
    );
  }

  if (
    __DEV__ &&
    !isRange &&
    singleValue !== undefined &&
    !Number.isFinite(singleValue)
  ) {
    console.error(
      "[react-native-arc-ui] Slider: value must be a finite number. Falling back to the resolved min.",
    );
  }

  if (
    __DEV__ &&
    isRange &&
    rangeValues !== undefined &&
    (!Number.isFinite(rangeValues[0]) || !Number.isFinite(rangeValues[1]))
  ) {
    console.error(
      "[react-native-arc-ui] Slider: values must contain finite numbers. Invalid values fall back to the resolved min before range normalization.",
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <View
      testID={testID}
      style={[styles.container, containerTokenStyle, style]}
    >
      <SliderHeader
        layout={layout}
        label={label}
        min={min}
        max={max}
        step={step}
        isRange={isRange}
        singlePos={singlePos}
        rangeLoPos={rangeLoPos}
        rangeHiPos={rangeHiPos}
        colors={colors}
        testID={testID}
      />

      <View
        style={[styles.trackArea, trackAreaStyle]}
        onLayout={handleTrackLayout}
      >
        <View style={[styles.trackAndThumbArea, trackAndThumbAreaStyle]}>
          <SliderTrack
            isRange={isRange}
            singlePos={singlePos}
            rangeLoPos={rangeLoPos}
            rangeHiPos={rangeHiPos}
            singleSemanticValue={resolvedSingleValue}
            lowerSemanticValue={resolvedRangeLowerValue}
            upperSemanticValue={resolvedRangeUpperValue}
            min={min}
            max={max}
            step={step}
            sizes={sizes}
            colors={colors}
            disabled={isInteractionDisabled}
            onSingleFinish={handleSingleFinish}
            onLowerFinish={handleLowerFinish}
            onUpperFinish={handleUpperFinish}
            testID={testID ? `${testID}-track` : undefined}
          />

          {isRange ? (
            <>
              <SliderThumb
                kind="lower"
                position={rangeLoPos}
                otherPosition={rangeHiPos}
                isInteracting={rangeLoIsInteracting}
                semanticValue={resolvedRangeLowerValue}
                accessibilityMin={min}
                accessibilityMax={resolvedRangeUpperValue}
                accessibilityLabel={lowerAccessibilityLabel}
                accessibilityHint={accessibilityHint}
                min={min}
                max={max}
                step={step}
                sizes={sizes}
                colors={colors}
                onChange={onValuesChange ? handleLowerChange : undefined}
                onFinish={handleLowerFinish}
                onReconcile={handleControlledInteractionReconcile}
                showTooltip={showTooltip}
                disabled={isInteractionDisabled}
                testID={testID ? `${testID}-thumb-lo` : undefined}
              />

              <SliderThumb
                kind="upper"
                position={rangeHiPos}
                otherPosition={rangeLoPos}
                isInteracting={rangeHiIsInteracting}
                semanticValue={resolvedRangeUpperValue}
                accessibilityMin={resolvedRangeLowerValue}
                accessibilityMax={max}
                accessibilityLabel={upperAccessibilityLabel}
                accessibilityHint={accessibilityHint}
                min={min}
                max={max}
                step={step}
                sizes={sizes}
                colors={colors}
                onChange={onValuesChange ? handleUpperChange : undefined}
                onFinish={handleUpperFinish}
                onReconcile={handleControlledInteractionReconcile}
                showTooltip={showTooltip}
                disabled={isInteractionDisabled}
                testID={testID ? `${testID}-thumb-hi` : undefined}
              />
            </>
          ) : (
            <SliderThumb
              kind="single"
              position={singlePos}
              isInteracting={singleIsInteracting}
              semanticValue={resolvedSingleValue}
              accessibilityMin={min}
              accessibilityMax={max}
              accessibilityLabel={singleAccessibilityLabel}
              accessibilityHint={accessibilityHint}
              min={min}
              max={max}
              step={step}
              sizes={sizes}
              colors={colors}
              onChange={onValueChange ? handleSingleChange : undefined}
              onFinish={handleSingleFinish}
              onReconcile={handleControlledInteractionReconcile}
              showTooltip={showTooltip}
              disabled={isInteractionDisabled}
              testID={testID ? `${testID}-thumb` : undefined}
            />
          )}
        </View>
      </View>

      {hasError && (
        <View
          testID={testID ? `${testID}-error-row` : undefined}
          style={[styles.errorRow, errorRowTokenStyle]}
          accessible
          role="alert"
          accessibilityRole="alert"
          accessibilityLabel={error}
          accessibilityLiveRegion="polite"
        >
          <Icon
            type="alertCircle"
            size={tokens.sizings.icon.xs}
            lightColor={tokens.colors.light.input.error}
            darkColor={tokens.colors.dark.input.error}
          />

          <Animated.Text
            testID={testID ? `${testID}-error` : undefined}
            accessible={false}
            allowFontScaling={false}
            maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
            style={[
              styles.errorText,
              errorTypographyStyle,
              animatedErrorSizeStyle,
              animatedErrorColorStyle,
            ]}
          >
            {error}
          </Animated.Text>
        </View>
      )}
    </View>
  );
};

export const Slider = memo(SliderComponent);

Slider.displayName = "Slider";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  trackArea: {
    width: "100%",
    position: "relative",
  },

  trackAndThumbArea: {
    position: "absolute",
    left: 0,
    right: 0,
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  errorText: {
    flex: 1,
  },
});
