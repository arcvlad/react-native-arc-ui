import { useCallback, useState } from "react";

export type TInputModifier =
  | "normal"
  | "focused"
  | "disabled"
  | "inactive"
  | "error";

export interface IUseInputState {
  disabled?: boolean;
  active?: boolean;
  error?: string;
  forceFocused?: boolean;
}

export type TUseInputStateResult = {
  isFocused: boolean;
  modifier: TInputModifier;
  handleFocus: () => void;
  handleBlur: () => void;
};

/**
 * Public semantic state resolver for custom input-like components.
 *
 * This hook intentionally exposes React state because its result is designed
 * for render-time composition. ARCUI's internal animated field primitives use
 * SharedValues instead so visual focus feedback does not require React
 * rerenders.
 *
 * Modifier priority: disabled → inactive → error → focused → normal.
 */
export const useInputState = ({
  disabled = false,
  active = true,
  error,
  forceFocused = false,
}: IUseInputState): TUseInputStateResult => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  let modifier: TInputModifier = "normal";

  if (disabled) {
    modifier = "disabled";
  } else if (!active) {
    modifier = "inactive";
  } else if (error && error.length > 0) {
    modifier = "error";
  } else if (isFocused || forceFocused) {
    modifier = "focused";
  }

  return {
    isFocused,
    modifier,
    handleFocus,
    handleBlur,
  };
};
