import type { Ref } from "react";
import type {
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
  ViewStyle,
  AccessibilityValue,
} from "react-native";

import type { IButton } from "../Button/types";

export type TInputNumberButtonType = NonNullable<IButton["type"]>;

export type TInputNumberButtonShape = "square" | "rounded" | "circle";

export type TInputNumberValueType = "border" | "transparent";

type TInputNumberNativeProps = Omit<
  TextInputProps,
  | "value"
  | "defaultValue"
  | "onChangeText"
  | "style"
  | "multiline"
  | "scrollEnabled"
  | "textAlignVertical"
  | "editable"
  | "selectTextOnFocus"
  | "allowFontScaling"
  | "maxFontSizeMultiplier"
  | "placeholder"
  | "placeholderTextColor"
  | "secureTextEntry"
  | "autoCapitalize"
  | "autoCorrect"
  | "spellCheck"
  | "accessibilityValue"
  | "testID"
>;

export type IInputNumber = TInputNumberNativeProps & {
  /**
   * React 19 ref-as-prop.
   */
  ref?: Ref<TextInput>;

  /**
   * Controlled numeric value.
   */
  value: number;

  /**
   * Called whenever ARCUI resolves a new valid semantic numeric value.
   */
  onValueChange: (value: number) => void;

  /**
   * Optional lower bound.
   *
   * No lower bound is applied when omitted.
   */
  min?: number;

  /**
   * Optional upper bound.
   *
   * No upper bound is applied when omitted.
   */
  max?: number;

  /**
   * Amount applied by increment/decrement controls.
   *
   * Must be greater than zero.
   *
   * @default 1
   */
  step?: number;

  /**
   * Number of decimal places used for numeric normalization and display.
   *
   * undefined means integer-only.
   */
  decimals?: number;

  label?: string;

  error?: string;

  /**
   * Fully disabled semantic state.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the control is active in the current interaction flow.
   *
   * @default true
   */
  active?: boolean;

  /**
   * Visual type of the decrement button.
   *
   * @default "border"
   */
  decrementButtonType?: TInputNumberButtonType;

  /**
   * Visual type of the increment button.
   *
   * @default "border"
   */
  incrementButtonType?: TInputNumberButtonType;

  /**
   * Resting presentation of the numeric value surface.
   *
   * transparent still exposes focused/error semantic feedback.
   *
   * @default "border"
   */
  valueType?: TInputNumberValueType;

  /**
   * Shape language shared by both step controls and the numeric surface.
   *
   * @default "rounded"
   */
  shape?: TInputNumberButtonShape;

  /**
   * Root component style.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Native numeric TextInput style.
   *
   * ARCUI-owned font size and semantic color retain final precedence.
   */
  inputStyle?: StyleProp<TextStyle>;

  /**
   * Optional accessibility override for the decrement action.
   *
   * Falls back to the localized ARCUI decrement-action label.
   */
  decrementAccessibilityLabel?: string;

  decrementAccessibilityHint?: string;

  /**
   * Optional accessibility override for the increment action.
   *
   * Falls back to the localized ARCUI increment-action label.
   */
  incrementAccessibilityLabel?: string;

  incrementAccessibilityHint?: string;

  /**
   * Accessibility representation of the current numeric value.
   *
   * InputNumber intentionally exposes only textual accessibility values because
   * React Native's numeric accessibility range values are integer-based while
   * InputNumber supports decimals.
   *
   * Consumer text overrides ARCUI's formatted numeric value.
   */
  accessibilityValue?: Pick<AccessibilityValue, "text">;

  testID?: string;
};
