import type { StyleProp, ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";

export type TSliderLayout = "label-value" | "label-minmax" | "minmax" | "none";

export type TSliderRangeValue = readonly [number, number];

interface ISliderBase {
  /**
   * Minimum selectable value.
   *
   * @default 0
   */
  min?: number;

  /**
   * Maximum selectable value.
   *
   * @default 100
   */
  max?: number;

  /**
   * Value increment.
   *
   * Step is anchored to min.
   *
   * @default 1
   */
  step?: number;

  /**
   * Optional Slider label.
   */
  label?: string;

  /**
   * Optional validation error.
   */
  error?: string;

  /**
   * Header layout.
   *
   * @default "label-value"
   */
  layout?: TSliderLayout;

  /**
   * Shows the active-thumb tooltip while interacting.
   *
   * @default true
   */
  showTooltip?: boolean;

  /**
   * Disables Slider interaction and exposes disabled
   * accessibility state.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the Slider is active.
   *
   * Inactive Slider remains visible but is not interactive.
   *
   * @default true
   */
  active?: boolean;

  /**
   * Consumer container style.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Optional additional accessibility guidance.
   *
   * ARCUI does not provide a generic gesture instruction by default.
   */
  accessibilityHint?: string;

  testID?: string;
}

export interface ISingleSlider extends ISliderBase {
  /**
   * Single-value mode.
   *
   * @default false
   */
  range?: false;

  /**
   * Current semantic value.
   *
   * Slider is controlled. The consumer is the source of truth.
   */
  value: number;

  /**
   * Optional live semantic-change callback.
   *
   * Called while the user interacts only when the snapped value changes.
   * It is not called for every gesture frame; visual Slider motion remains
   * UI-thread driven independently of this callback.
   */
  onValueChange?: (value: number) => void;

  /**
   * Called once after a successful user interaction that changed the
   * semantic value completes.
   *
   * Use this for persistence, network work, analytics, or other work that
   * should happen only after the final value is known.
   */
  onValueCommit?: (value: number) => void;

  /**
   * Accessibility label for the adjustable thumb.
   *
   * Falls back to label, then to the localized ARCUI Slider label.
   */
  accessibilityLabel?: string;

  values?: never;
  onValuesChange?: never;
  onValuesCommit?: never;

  lowerAccessibilityLabel?: never;
  upperAccessibilityLabel?: never;
}

export interface IRangeSlider extends ISliderBase {
  /**
   * Enables two-thumb range mode.
   */
  range: true;

  /**
   * Current semantic [lower, upper] values.
   *
   * Slider is controlled. The consumer is the source of truth.
   */
  values: TSliderRangeValue;

  /**
   * Optional live semantic-change callback.
   *
   * Called while the user interacts only when a snapped lower or upper value
   * changes. It is not called for every gesture frame; visual Slider motion
   * remains UI-thread driven independently of this callback.
   */
  onValuesChange?: (values: [number, number]) => void;

  /**
   * Called once after a successful user interaction that changed the
   * semantic range completes.
   */
  onValuesCommit?: (values: [number, number]) => void;

  /**
   * Accessibility label for the lower thumb.
   *
   * Falls back to the localized ARCUI lower-value label.
   */
  lowerAccessibilityLabel?: string;

  /**
   * Accessibility label for the upper thumb.
   *
   * Falls back to the localized ARCUI upper-value label.
   */
  upperAccessibilityLabel?: string;

  value?: never;
  onValueChange?: never;
  onValueCommit?: never;

  accessibilityLabel?: never;
}

export type ISlider = ISingleSlider | IRangeSlider;

/**
 * Internal animated colors shared between Slider sub-components.
 */
export interface ISliderColors {
  thumbColor: SharedValue<string>;

  tooltipBg: SharedValue<string>;
  tooltipText: SharedValue<string>;

  trackActiveColor: SharedValue<string>;
  trackInactiveColor: SharedValue<string>;

  labelColor: SharedValue<string>;
  errorColor: SharedValue<string>;
}

/**
 * Resolved physical Slider geometry shared between
 * Track and Thumb.
 */
export interface ISliderSizes {
  thumbSize: number;
  thumbTouchSize: number;

  trackHeight: number;
  trackWidth: number;
  trackOffset: number;

  tooltipWidth: number;
  tooltipHeight: number;
  tooltipGap: number;
}
