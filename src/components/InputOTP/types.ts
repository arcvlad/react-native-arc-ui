import type { Ref } from "react";
import type { StyleProp, TextInputProps, ViewStyle } from "react-native";

export type TInputOTPType = "numeric" | "alphanumeric";

export type TInputOTPRef = {
  /**
   * Focuses the first empty cell.
   *
   * When the code is already complete, the last cell is focused.
   */
  focus: () => void;

  /**
   * Blurs the currently focused OTP cell.
   */
  blur: () => void;
};

type TInputOTPNativeProps = Omit<
  TextInputProps,
  | "value"
  | "defaultValue"
  | "onChangeText"
  | "onFocus"
  | "onBlur"
  | "onKeyPress"
  | "style"
  | "multiline"
  | "scrollEnabled"
  | "editable"
  | "maxLength"
  | "secureTextEntry"
  | "caretHidden"
  | "selectTextOnFocus"
  | "textAlign"
  | "textAlignVertical"
  | "allowFontScaling"
  | "maxFontSizeMultiplier"
  | "placeholder"
  | "placeholderTextColor"
  | "autoFocus"
  | "underlineColorAndroid"
  | "accessibilityValue"
  | "testID"
>;

export type IInputOTP = TInputOTPNativeProps & {
  /**
   * Imperative InputOTP API.
   */
  ref?: Ref<TInputOTPRef>;

  /**
   * Controlled OTP value.
   */
  value: string;

  /**
   * Called whenever ARCUI resolves a new valid OTP value.
   */
  onValueChange: (value: string) => void;

  /**
   * Called whenever the controlled value becomes a complete valid OTP.
   *
   * The same code can complete again after first becoming incomplete.
   */
  onComplete?: (value: string) => void;

  /**
   * Number of OTP cells.
   *
   * Must be an integer between 4 and 8.
   *
   * @default 6
   */
  length?: number;

  /**
   * Uses native secure text presentation for entered characters.
   *
   * @default false
   */
  secure?: boolean;

  /**
   * Focuses the first available cell after mount.
   *
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Blurs InputOTP after a complete valid code is resolved.
   *
   * @default false
   */
  blurOnComplete?: boolean;

  /**
   * Semantic OTP character set.
   *
   * numeric:
   * 0-9
   *
   * alphanumeric:
   * 0-9, A-Z, a-z
   *
   * @default "numeric"
   */
  type?: TInputOTPType;

  /**
   * Optional per-character validation override.
   *
   * When supplied, this replaces the character set derived from `type`.
   *
   * Stateful `g` and `y` flags are handled safely by ARCUI.
   */
  allowedChars?: RegExp;

  label?: string;

  error?: string;

  /**
   * Fully disabled semantic state.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the field participates in the current interaction flow.
   *
   * @default true
   */
  active?: boolean;

  /**
   * Root component style.
   */
  style?: StyleProp<ViewStyle>;

  testID?: string;
};
