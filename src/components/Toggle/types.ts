import type { ReactNode } from "react";
import type { PressableProps, StyleProp, TextStyle } from "react-native";

import type { TPressAnimation } from "../../tokens/Animations";
import type { TSelectionValue } from "../SelectionGroup/types";

interface IToggleBase extends Omit<
  PressableProps,
  "children" | "role" | "accessibilityRole" | "aria-checked" | "aria-disabled"
> {
  /**
   * Optional Toggle content.
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

  /**
   * Press feedback behavior.
   *
   * Falls back to tokens.pressAnimation.type.
   */
  animation?: TPressAnimation;

  /**
   * Whether the Toggle is active.
   *
   * Inactive keeps its dedicated visual state while preventing
   * interaction.
   *
   * @default true
   */
  active?: boolean;

  /**
   * Track width.
   *
   * Falls back to tokens.sizings.toggle.width.
   */
  width?: number;

  /**
   * Track height.
   *
   * Falls back to tokens.sizings.toggle.height.
   */
  height?: number;

  /**
   * Circular thumb diameter.
   *
   * Falls back to tokens.sizings.toggle.thumbSize.
   */
  thumbSize?: number;

  /**
   * Optional validation message.
   *
   * A non-empty value enables the Toggle error visual state.
   */
  error?: string;

  /**
   * Style applied only to textual Toggle content.
   */
  textStyle?: StyleProp<TextStyle>;
}

interface IStandaloneToggle {
  /**
   * Standalone semantic state.
   *
   * The consumer is the source of truth.
   */
  checked: boolean;

  value?: never;
}

interface IGroupedToggle {
  /**
   * SelectionGroup identity.
   *
   * SelectionGroup owns the checked state.
   */
  value: TSelectionValue;

  checked?: never;
}

export type IToggle = IToggleBase & (IStandaloneToggle | IGroupedToggle);
