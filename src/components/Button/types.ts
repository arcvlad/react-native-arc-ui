import { type ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import type { TPressAnimation } from "../../tokens";

export interface IButton extends Omit<
  PressableProps,
  "children" | "role" | "accessibilityRole" | "aria-disabled" | "aria-busy"
> {
  children: ReactNode;

  /**
   * Style applied to the internal content row.
   */
  contentStyle?: StyleProp<ViewStyle>;

  type?: "solid" | "border" | "transparent";

  /**
   * Instance-level override for tokens.radius.button.
   */
  radius?: number;

  /**
   * Instance-level override for tokens.border.button.
   */
  borderWidth?: number;

  /**
   * Press feedback behavior.
   * Falls back to tokens.pressAnimation.type.
   */
  animation?: TPressAnimation;

  /**
   * Inactive keeps its dedicated visual state but prevents interaction.
   */
  active?: boolean;

  /**
   * Displays SpinnerLoader and prevents interaction.
   */
  loading?: boolean;

  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}
