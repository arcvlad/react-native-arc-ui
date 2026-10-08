import type { Ref } from "react";
import type {
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from "react-native";

import type { TIconType } from "../Icon/types";

export type TInputType = "text" | "email" | "phone" | "url";

export type TInputRightAction = {
  /**
   * ARCUI-owned built-in action icon.
   */
  icon: TIconType;

  onPress: () => void;

  /**
   * Required because the action is icon-only.
   */
  accessibilityLabel: string;

  accessibilityHint?: string;
};

type TInputBase = Omit<
  TextInputProps,
  | "style"
  | "multiline"
  | "scrollEnabled"
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
   * active=false uses ARCUI's inactive presentation and prevents
   * editing without representing the field as the disabled visual state.
   *
   * @default true
   */
  active?: boolean;

  /**
   * Convenience preset for native TextInput behavior.
   *
   * Explicit native TextInput props override the preset.
   *
   * @default "text"
   */
  type?: TInputType;

  /**
   * ARCUI-owned decorative built-in icon.
   */
  iconLeft?: TIconType;

  /**
   * Whether the clear action appears while the field has text.
   *
   * Priority:
   * loading > rightAction/iconRight > clearable
   *
   * @default true
   */
  clearable?: boolean;

  /**
   * Shows loading feedback in the trailing slot.
   *
   * @default false
   */
  loading?: boolean;

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
   * The native TextInput receives `${testID}-input`.
   */
  testID?: string;
};

type TInputWithDecorativeRightIcon = {
  /**
   * ARCUI-owned decorative trailing icon.
   */
  iconRight?: TIconType;

  rightAction?: never;
};

type TInputWithRightAction = {
  iconRight?: never;

  /**
   * Interactive trailing action.
   *
   * Mutually exclusive with iconRight.
   */
  rightAction: TInputRightAction;
};

export type IInput = TInputBase &
  (TInputWithDecorativeRightIcon | TInputWithRightAction);
