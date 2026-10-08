import type { IInput } from "../Input/types";

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
