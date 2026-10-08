import type { Ref } from "react";
import type {
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from "react-native";

export type IInputArea = Omit<
  TextInputProps,
  | "style"
  | "multiline"
  | "scrollEnabled"
  | "numberOfLines"
  | "textAlignVertical"
  | "allowFontScaling"
  | "maxFontSizeMultiplier"
  | "placeholderTextColor"
  | "testID"
> & {
  /**
   * React 19 ref-as-prop.
   */
  ref?: Ref<TextInput>;

  label?: string;

  error?: string;

  /**
   * Fully disabled semantic state.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the field is currently active in the interaction flow.
   *
   * active=false prevents editing and uses ARCUI's inactive presentation
   * without representing the field as fully disabled.
   *
   * @default true
   */
  active?: boolean;

  /**
   * Whether the character count is rendered below the field.
   *
   * When enabled, the counter is always present, including at zero characters.
   *
   * @default true
   */
  showCharCount?: boolean;

  /**
   * Minimum height of the complete textarea field surface.
   *
   * Defaults to tokens.sizings.inputArea.minHeight.
   */
  minHeight?: number;

  /**
   * Maximum height of the complete textarea field surface before native
   * scrolling takes over.
   *
   * Defaults to tokens.sizings.inputArea.maxHeight.
   */
  maxHeight?: number;

  /**
   * Root field style.
   *
   * Use inputStyle for the native TextInput itself.
   */
  style?: StyleProp<ViewStyle>;

  inputStyle?: StyleProp<TextStyle>;

  /**
   * Applied to the ARCUI field root.
   *
   * Internal elements receive stable suffixes.
   */
  testID?: string;
};
