import type { ViewProps } from "react-native";

import type { TThemeColor } from "../../types/colors";

export interface IProgressBarColors {
  track?: TThemeColor;

  fill?: Readonly<{
    default?: TThemeColor;
    disabled?: TThemeColor;
  }>;

  label?: TThemeColor;
  value?: TThemeColor;
}

export interface IProgressBar extends Omit<
  ViewProps,
  | "children"
  | "accessible"
  | "accessibilityRole"
  | "accessibilityState"
  | "accessibilityValue"
  | "role"
  | "aria-disabled"
  | "aria-valuemin"
  | "aria-valuemax"
  | "aria-valuenow"
> {
  /**
   * Current progress value.
   *
   * Finite values are clamped to the 0–100 range.
   *
   * @default 0
   */
  value?: number;

  /**
   * Optional visual label displayed above the progress track.
   *
   * Also becomes the default accessibility label unless the consumer
   * provides accessibilityLabel explicitly.
   */
  label?: string;

  /**
   * Displays the current clamped percentage on the right side of the header.
   *
   * @default false
   */
  showValue?: boolean;

  /**
   * Applies the disabled visual state and accessibility state.
   *
   * @default false
   */
  disabled?: boolean;

  colors?: Readonly<IProgressBarColors>;

  /**
   * Track height in pixels.
   *
   * Falls back to tokens.sizings.progressBar.height.
   */
  height?: number;

  /**
   * Track radius in pixels.
   *
   * Falls back to tokens.radius.progressBar.
   */
  radius?: number;
}
