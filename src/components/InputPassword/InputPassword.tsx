import { memo, useCallback, useState } from "react";

import { useARCUIStrings } from "../../contexts/hooks";
import { Input } from "../Input/Input";
import type { IInputPassword } from "./types";

const InputPasswordComponent = ({
  loading = false,
  ...inputProps
}: IInputPassword) => {
  const strings = useARCUIStrings();

  const [showPassword, setShowPassword] = useState(false);

  /**
   * Loading temporarily owns the trailing slot.
   *
   * Keep the native field secure while the visibility control is unavailable,
   * without mutating the user's visibility preference in React state.
   */
  const passwordVisible = showPassword && !loading;

  const handleToggle = useCallback(() => {
    setShowPassword((current) => !current);
  }, []);

  return (
    <Input
      {...inputProps}
      type="text"
      loading={loading}
      secureTextEntry={!passwordVisible}
      rightAction={{
        icon: passwordVisible ? "eyeOff" : "eye",
        onPress: handleToggle,
        accessibilityLabel: passwordVisible
          ? strings.inputPasswordHideAccessibilityLabel
          : strings.inputPasswordShowAccessibilityLabel,
      }}
      clearable={false}
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
    />
  );
};

export const InputPassword = memo(InputPasswordComponent);

InputPassword.displayName = "InputPassword";
