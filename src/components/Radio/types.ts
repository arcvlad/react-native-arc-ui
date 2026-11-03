import type { ReactNode } from "react";
import type { PressableProps, StyleProp, TextStyle } from "react-native";

import type { TPressAnimation } from "../../tokens/Animations";
import type { TThemeColor } from "../../types/colors";
import type { TSelectionValue } from "../SelectionGroup/types";

export interface IRadioColors {
  border?: Readonly<{
    default?: TThemeColor;
    pressed?: TThemeColor;
    inactive?: TThemeColor;
    disabled?: TThemeColor;
  }>;

  background?: Readonly<{
    unchecked?: TThemeColor;
    checked?: TThemeColor;
    pressed?: TThemeColor;
    inactive?: TThemeColor;
    disabled?: TThemeColor;
  }>;

  text?: Readonly<{
    default?: TThemeColor;
    inactive?: TThemeColor;
    disabled?: TThemeColor;
  }>;

  /**
   * Validation color used by the error ring, error icon, and error text.
   */
  error?: TThemeColor;
}

interface IRadioBase extends Omit<
  PressableProps,
  "children" | "role" | "accessibilityRole" | "aria-checked" | "aria-disabled"
> {
  /**
   * Optional Radio content.
   *
   * Textual content receives ARCUI typography and accessibility
   * handling. Custom React content is rendered as-is.
   */
  children?: ReactNode;

  /**
   * Called when the checked state is requested to change.
   *
   * Standalone:
   * the consumer owns checked and should update it when appropriate.
   *
   * SelectionGroup:
   * optional child-level notification after the group resolves an
   * actual state change. SelectionGroup remains the state owner.
   */
  onCheckedChange?: (checked: boolean) => void;

  colors?: Readonly<IRadioColors>;

  /**
   * Press feedback behavior.
   *
   * Falls back to tokens.pressAnimation.type.
   */
  animation?: TPressAnimation;

  /**
   * Whether the Radio is active.
   *
   * Inactive keeps its dedicated visual state while preventing
   * interaction.
   *
   * @default true
   */
  active?: boolean;

  /**
   * Outer Radio diameter before ARCUI font scaling.
   *
   * Falls back to tokens.sizings.radio.size.
   */
  size?: number;

  /**
   * Optional validation message.
   */
  error?: string;

  /**
   * Style applied only to textual Radio content.
   */
  textStyle?: StyleProp<TextStyle>;
}

interface IStandaloneRadio {
  /**
   * Standalone semantic state.
   *
   * The consumer is the source of truth.
   */
  checked: boolean;

  value?: never;
}

interface IGroupedRadio {
  /**
   * SelectionGroup identity.
   *
   * Radio supports only single-selection SelectionGroup mode.
   */
  value: TSelectionValue;

  checked?: never;
}

export type IRadio = IRadioBase & (IStandaloneRadio | IGroupedRadio);
