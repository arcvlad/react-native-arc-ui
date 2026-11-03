import type { IInput, IInputColors } from "../Input/types";

export type IInputPasswordColors = IInputColors;

export type IInputPassword = Omit<
  IInput,
  | "type"
  | "iconRight"
  | "rightAction"
  | "clearable"
  | "secureTextEntry"
  | "autoCapitalize"
  | "autoCorrect"
  | "spellCheck"
>;
