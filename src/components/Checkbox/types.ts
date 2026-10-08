import type { ReactNode } from "react";
import type { PressableProps, StyleProp, TextStyle } from "react-native";

import type { TPressAnimation } from "../../tokens/Animations";
import type { TSelectionValue } from "../SelectionGroup/types";

interface ICheckboxBase extends Omit<
  PressableProps,
  "children" | "role" | "accessibilityRole" | "aria-checked" | "aria-disabled"
> {
  /**
   * Optional Checkbox content.
   *
   * Text content receives ARCUI typography and accessibility
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

  /**
   * Press feedback behavior.
   *
   * Falls back to tokens.pressAnimation.type.
   */
  animation?: TPressAnimation;

  /**
   * Whether the Checkbox is active.
   *
   * Inactive keeps its dedicated visual state while preventing
   * interaction.
   *
   * @default true
   */
  active?: boolean;

  /**
   * Outer Checkbox box size.
   *
   * Falls back to tokens.sizings.checkbox.size.
   */
  size?: number;

  /**
   * Optional validation message.
   *
   * A non-empty value enables the Checkbox error visual state.
   */
  error?: string;

  /**
   * Style applied only to textual Checkbox content.
   */
  textStyle?: StyleProp<TextStyle>;
}

interface IStandaloneCheckbox {
  /**
   * Standalone semantic state.
   *
   * The consumer is the source of truth.
   */
  checked: boolean;

  value?: never;
}

interface IGroupedCheckbox {
  /**
   * SelectionGroup identity.
   *
   * SelectionGroup owns the checked state.
   */
  value: TSelectionValue;

  checked?: never;
}

export type ICheckbox = ICheckboxBase &
  (IStandaloneCheckbox | IGroupedCheckbox);
