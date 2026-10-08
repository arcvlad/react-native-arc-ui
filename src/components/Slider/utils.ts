export interface ISliderResolvedConfig {
  min: number;
  max: number;
  step: number;
}

/**
 * Keeps numeric Slider configuration predictable even when
 * invalid runtime values reach the component.
 *
 * max < min collapses the Slider to min.
 * Invalid/non-positive step falls back to 1.
 */
export const resolveSliderConfig = (
  min: number,
  max: number,
  step: number,
): ISliderResolvedConfig => {
  const resolvedMin = Number.isFinite(min) ? min : 0;

  const requestedMax = Number.isFinite(max) ? max : resolvedMin;

  const resolvedMax = Math.max(resolvedMin, requestedMax);

  const resolvedStep = Number.isFinite(step) && step > 0 ? step : 1;

  return {
    min: resolvedMin,
    max: resolvedMax,
    step: resolvedStep,
  };
};

/**
 * Clamp a semantic Slider value into its valid range.
 */
export const clampSliderValue = (
  value: number,
  min: number,
  max: number,
): number => {
  "worklet";

  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

/**
 * Clamp normalized visual progress to 0...1.
 */
export const clampSliderNormalized = (normalized: number): number => {
  "worklet";

  if (!Number.isFinite(normalized)) {
    return 0;
  }

  return Math.min(Math.max(normalized, 0), 1);
};

/**
 * Snap a semantic value to the Slider step grid.
 *
 * The grid is anchored to min rather than zero.
 *
 * max is always a valid terminal value, even when the range
 * is not exactly divisible by step.
 *
 * Example:
 *
 * min = 0
 * max = 10
 * step = 3
 *
 * valid values:
 * 0, 3, 6, 9, 10
 */
export const snapSliderValue = (
  value: number,
  min: number,
  max: number,
  step: number,
): number => {
  "worklet";

  if (max <= min) {
    return min;
  }

  const resolvedValue = Number.isFinite(value) ? value : min;

  const resolvedStep = Number.isFinite(step) && step > 0 ? step : 1;

  const clamped = clampSliderValue(resolvedValue, min, max);

  const stepIndex = Math.round((clamped - min) / resolvedStep);

  const gridCandidate = clampSliderValue(
    min + stepIndex * resolvedStep,
    min,
    max,
  );

  /**
   * max is an explicit terminal value.
   *
   * When max is closer than the nearest normal grid point,
   * prefer max.
   */
  const resolved =
    Math.abs(max - clamped) < Math.abs(gridCandidate - clamped)
      ? max
      : gridCandidate;

  /**
   * Remove ordinary floating-point noise without imposing
   * a fixed public decimal precision.
   */
  return Math.round(resolved * 1e10) / 1e10;
};

/**
 * Resolve and normalize a two-thumb range.
 *
 * Both values are clamped/snapped and the resulting tuple
 * is always ordered lower -> upper.
 */
export const resolveSliderRangeValues = (
  values: readonly [number, number],
  min: number,
  max: number,
  step: number,
): [number, number] => {
  const first = snapSliderValue(values[0], min, max, step);

  const second = snapSliderValue(values[1], min, max, step);

  return first <= second ? [first, second] : [second, first];
};

/**
 * Convert a semantic Slider value to normalized UI-thread
 * progress.
 *
 * Returned value is always within 0...1.
 */
export const sliderValueToNormalized = (
  value: number,
  min: number,
  max: number,
  step: number,
): number => {
  "worklet";

  if (max <= min) {
    return 0;
  }

  const snapped = snapSliderValue(value, min, max, step);

  return clampSliderNormalized((snapped - min) / (max - min));
};

/**
 * Convert normalized progress to a snapped semantic value.
 */
export const sliderNormalizedToValue = (
  normalized: number,
  min: number,
  max: number,
  step: number,
): number => {
  "worklet";

  if (max <= min) {
    return min;
  }

  const progress = clampSliderNormalized(normalized);

  const raw = min + progress * (max - min);

  return snapSliderValue(raw, min, max, step);
};

/**
 * Convert arbitrary normalized progress directly to the
 * normalized position of its nearest valid semantic value.
 *
 * Useful for tap interactions where both the position and
 * resulting semantic value must land on the same step.
 */
export const sliderNormalizedToSnappedNormalized = (
  normalized: number,
  min: number,
  max: number,
  step: number,
): number => {
  "worklet";

  const value = sliderNormalizedToValue(normalized, min, max, step);

  return sliderValueToNormalized(value, min, max, step);
};

/**
 * Stable display formatting without forcing consumers into
 * a predefined number of decimal places.
 */
export const formatSliderValue = (value: number): string => {
  "worklet";

  if (!Number.isFinite(value)) {
    return "";
  }

  const normalized = Math.round(value * 1e10) / 1e10;

  return String(normalized);
};

/**
 * Resolve the next semantic value used by accessibility
 * increment/decrement actions.
 *
 * max is treated as a valid terminal value even when it does
 * not belong to the regular step grid.
 *
 * Example:
 *
 * min = 0
 * max = 10
 * step = 3
 *
 * 9 increment -> 10
 * 10 decrement -> 9
 */
export const getAdjacentSliderValue = (
  value: number,
  direction: "increment" | "decrement",
  min: number,
  max: number,
  step: number,
): number => {
  "worklet";

  const current = snapSliderValue(value, min, max, step);

  if (direction === "increment") {
    if (current >= max) {
      return max;
    }

    return snapSliderValue(current + step, min, max, step);
  }

  if (current <= min) {
    return min;
  }

  /**
   * max may be a terminal point outside the regular step
   * grid.
   *
   * Example:
   * 0, 3, 6, 9, 10
   *
   * decrementing from 10 must produce 9.
   */
  const lastGridIndex = Math.floor((max - min) / step);

  const lastGridValue = Math.round((min + lastGridIndex * step) * 1e10) / 1e10;

  if (current === max && lastGridValue < max) {
    return lastGridValue;
  }

  return snapSliderValue(current - step, min, max, step);
};

/**
 * React Native accessibilityValue requires integer
 * min/max/now values.
 *
 * Slider semantic values may be decimal, so accessibility
 * exposes their normalized positions on a fixed integer scale.
 *
 * The real semantic value is still exposed through
 * accessibilityValue.text.
 */
const SLIDER_ACCESSIBILITY_SCALE = 1_000_000;

export const sliderValueToAccessibilityInteger = (
  value: number,
  min: number,
  max: number,
  step: number,
): number => {
  const normalized = sliderValueToNormalized(value, min, max, step);

  return Math.round(normalized * SLIDER_ACCESSIBILITY_SCALE);
};
