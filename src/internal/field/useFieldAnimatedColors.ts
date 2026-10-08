import {
  interpolateColor,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";

import { useARCUIAnimatedTheme, useARCUITheme } from "../../contexts/hooks";

interface IUseFieldAnimatedColors {
  focusedProgress: SharedValue<number>;
  errorProgress: SharedValue<number>;
  disabledProgress: SharedValue<number>;
  inactiveProgress: SharedValue<number>;
  hasValueProgress: SharedValue<number>;
}

const resolveBorderForTheme = (
  valueProgress: number,
  focusProgress: number,
  errorProgress: number,
  inactiveProgress: number,
  disabledProgress: number,
  withoutValue: string,
  withValue: string,
  focused: string,
  error: string,
  inactive: string,
  disabled: string,
): string => {
  "worklet";

  let resolved =
    valueProgress <= 0
      ? withoutValue
      : valueProgress >= 1
        ? withValue
        : interpolateColor(valueProgress, [0, 1], [withoutValue, withValue]);

  if (focusProgress >= 1) {
    resolved = focused;
  } else if (focusProgress > 0) {
    resolved = interpolateColor(focusProgress, [0, 1], [resolved, focused]);
  }

  if (errorProgress >= 1) {
    resolved = error;
  } else if (errorProgress > 0) {
    resolved = interpolateColor(errorProgress, [0, 1], [resolved, error]);
  }

  if (inactiveProgress >= 1) {
    resolved = inactive;
  } else if (inactiveProgress > 0) {
    resolved = interpolateColor(inactiveProgress, [0, 1], [resolved, inactive]);
  }

  if (disabledProgress >= 1) {
    resolved = disabled;
  } else if (disabledProgress > 0) {
    resolved = interpolateColor(disabledProgress, [0, 1], [resolved, disabled]);
  }

  return resolved;
};

const resolveBackgroundForTheme = (
  disabledProgress: number,
  primary: string,
  disabled: string,
): string => {
  "worklet";

  if (disabledProgress <= 0) {
    return primary;
  }

  if (disabledProgress >= 1) {
    return disabled;
  }

  return interpolateColor(disabledProgress, [0, 1], [primary, disabled]);
};

const resolveLabelForTheme = (
  errorProgress: number,
  disabledProgress: number,
  primary: string,
  error: string,
  disabled: string,
): string => {
  "worklet";

  let resolved = primary;

  if (errorProgress >= 1) {
    resolved = error;
  } else if (errorProgress > 0) {
    resolved = interpolateColor(errorProgress, [0, 1], [primary, error]);
  }

  if (disabledProgress >= 1) {
    resolved = disabled;
  } else if (disabledProgress > 0) {
    resolved = interpolateColor(disabledProgress, [0, 1], [resolved, disabled]);
  }

  return resolved;
};

const resolveTextForTheme = (
  disabledProgress: number,
  primary: string,
  disabled: string,
): string => {
  "worklet";

  if (disabledProgress <= 0) {
    return primary;
  }

  if (disabledProgress >= 1) {
    return disabled;
  }

  return interpolateColor(disabledProgress, [0, 1], [primary, disabled]);
};

const resolveIconForTheme = (
  disabledProgress: number,
  primary: string,
  disabled: string,
): string => {
  "worklet";

  if (disabledProgress <= 0) {
    return primary;
  }

  if (disabledProgress >= 1) {
    return disabled;
  }

  return interpolateColor(disabledProgress, [0, 1], [primary, disabled]);
};

/**
 * Resolves only the final colors consumed by field visuals.
 *
 * There are intentionally no intermediate DerivedValues for individual
 * token endpoints. This keeps the Reanimated dependency graph small even
 * when many fields are mounted at the same time.
 *
 * Stable 0/1 state values bypass interpolateColor completely. When the theme
 * is stable, only the active theme palette is resolved; both palettes are
 * evaluated only while themeProgress is actually transitioning.
 *
 * During a normal focus transition only borderColor is invalidated.
 */
export const useFieldAnimatedColors = ({
  focusedProgress,
  errorProgress,
  disabledProgress,
  inactiveProgress,
  hasValueProgress,
}: IUseFieldAnimatedColors) => {
  const { tokens } = useARCUITheme();
  const { themeProgress } = useARCUIAnimatedTheme();

  // ─── Token extraction ────────────────────────────────────────────────────────

  const lightBackgroundPrimary = tokens.colors.light.input.background.primary;

  const darkBackgroundPrimary = tokens.colors.dark.input.background.primary;

  const lightBackgroundDisabled = tokens.colors.light.input.background.disabled;

  const darkBackgroundDisabled = tokens.colors.dark.input.background.disabled;

  const lightBorderWithoutValue = tokens.colors.light.input.border.withoutValue;

  const darkBorderWithoutValue = tokens.colors.dark.input.border.withoutValue;

  const lightBorderWithValue = tokens.colors.light.input.border.withValue;

  const darkBorderWithValue = tokens.colors.dark.input.border.withValue;

  const lightBorderFocused = tokens.colors.light.input.border.focused;

  const darkBorderFocused = tokens.colors.dark.input.border.focused;

  const lightBorderError = tokens.colors.light.input.border.error;

  const darkBorderError = tokens.colors.dark.input.border.error;

  const lightBorderInactive = tokens.colors.light.input.border.inactive;

  const darkBorderInactive = tokens.colors.dark.input.border.inactive;

  const lightBorderDisabled = tokens.colors.light.input.border.disabled;

  const darkBorderDisabled = tokens.colors.dark.input.border.disabled;

  const lightLabelPrimary = tokens.colors.light.input.label.primary;

  const darkLabelPrimary = tokens.colors.dark.input.label.primary;

  const lightLabelDisabled = tokens.colors.light.input.label.disabled;

  const darkLabelDisabled = tokens.colors.dark.input.label.disabled;

  const lightTextPrimary = tokens.colors.light.input.text.withValue;

  const darkTextPrimary = tokens.colors.dark.input.text.withValue;

  const lightTextDisabled = tokens.colors.light.input.text.disabled;

  const darkTextDisabled = tokens.colors.dark.input.text.disabled;

  const lightPlaceholder = tokens.colors.light.input.text.placeholder;

  const darkPlaceholder = tokens.colors.dark.input.text.placeholder;

  const lightIconPrimary = tokens.colors.light.input.icon.primary;

  const darkIconPrimary = tokens.colors.dark.input.icon.primary;

  const lightIconDisabled = tokens.colors.light.input.icon.disabled;

  const darkIconDisabled = tokens.colors.dark.input.icon.disabled;

  const lightError = tokens.colors.light.input.error;

  const darkError = tokens.colors.dark.input.error;

  // ─── Border ──────────────────────────────────────────────────────────────────

  /**
   * Priority:
   *
   * disabled
   * > inactive
   * > error
   * > focused
   * > has value
   * > empty
   *
   * During the common focus path all other semantic progress values are
   * stable. A stable theme therefore resolves exactly one palette branch.
   *
   * Value presence intentionally participates here so clearing or populating
   * an unfocused field can transition smoothly between its empty and
   * populated border states.
   */
  const borderColor = useDerivedValue<string>(() => {
    const theme = themeProgress.value;

    const valueProgress = hasValueProgress.value;
    const focusProgress = focusedProgress.value;
    const currentErrorProgress = errorProgress.value;
    const currentInactiveProgress = inactiveProgress.value;
    const currentDisabledProgress = disabledProgress.value;

    if (theme <= 0) {
      return resolveBorderForTheme(
        valueProgress,
        focusProgress,
        currentErrorProgress,
        currentInactiveProgress,
        currentDisabledProgress,
        darkBorderWithoutValue,
        darkBorderWithValue,
        darkBorderFocused,
        darkBorderError,
        darkBorderInactive,
        darkBorderDisabled,
      );
    }

    if (theme >= 1) {
      return resolveBorderForTheme(
        valueProgress,
        focusProgress,
        currentErrorProgress,
        currentInactiveProgress,
        currentDisabledProgress,
        lightBorderWithoutValue,
        lightBorderWithValue,
        lightBorderFocused,
        lightBorderError,
        lightBorderInactive,
        lightBorderDisabled,
      );
    }

    const darkResolved = resolveBorderForTheme(
      valueProgress,
      focusProgress,
      currentErrorProgress,
      currentInactiveProgress,
      currentDisabledProgress,
      darkBorderWithoutValue,
      darkBorderWithValue,
      darkBorderFocused,
      darkBorderError,
      darkBorderInactive,
      darkBorderDisabled,
    );

    const lightResolved = resolveBorderForTheme(
      valueProgress,
      focusProgress,
      currentErrorProgress,
      currentInactiveProgress,
      currentDisabledProgress,
      lightBorderWithoutValue,
      lightBorderWithValue,
      lightBorderFocused,
      lightBorderError,
      lightBorderInactive,
      lightBorderDisabled,
    );

    return interpolateColor(theme, [0, 1], [darkResolved, lightResolved]);
  });

  // ─── Background ──────────────────────────────────────────────────────────────

  const backgroundColor = useDerivedValue<string>(() => {
    const theme = themeProgress.value;
    const disabled = disabledProgress.value;

    if (theme <= 0) {
      return resolveBackgroundForTheme(
        disabled,
        darkBackgroundPrimary,
        darkBackgroundDisabled,
      );
    }

    if (theme >= 1) {
      return resolveBackgroundForTheme(
        disabled,
        lightBackgroundPrimary,
        lightBackgroundDisabled,
      );
    }

    const darkResolved = resolveBackgroundForTheme(
      disabled,
      darkBackgroundPrimary,
      darkBackgroundDisabled,
    );

    const lightResolved = resolveBackgroundForTheme(
      disabled,
      lightBackgroundPrimary,
      lightBackgroundDisabled,
    );

    return interpolateColor(theme, [0, 1], [darkResolved, lightResolved]);
  });

  // ─── Label ───────────────────────────────────────────────────────────────────

  const labelColor = useDerivedValue<string>(() => {
    const theme = themeProgress.value;
    const error = errorProgress.value;
    const disabled = disabledProgress.value;

    if (theme <= 0) {
      return resolveLabelForTheme(
        error,
        disabled,
        darkLabelPrimary,
        darkError,
        darkLabelDisabled,
      );
    }

    if (theme >= 1) {
      return resolveLabelForTheme(
        error,
        disabled,
        lightLabelPrimary,
        lightError,
        lightLabelDisabled,
      );
    }

    const darkResolved = resolveLabelForTheme(
      error,
      disabled,
      darkLabelPrimary,
      darkError,
      darkLabelDisabled,
    );

    const lightResolved = resolveLabelForTheme(
      error,
      disabled,
      lightLabelPrimary,
      lightError,
      lightLabelDisabled,
    );

    return interpolateColor(theme, [0, 1], [darkResolved, lightResolved]);
  });

  // ─── Native input text ───────────────────────────────────────────────────────

  /**
   * Value presence intentionally does not participate here.
   *
   * Native text must appear immediately in its normal text color when the
   * first character is entered and disappear immediately when the field is
   * cleared. The placeholder owns the empty-state text presentation.
   *
   * Disabled and theme transitions remain animated independently.
   */
  const textColor = useDerivedValue<string>(() => {
    const theme = themeProgress.value;
    const disabled = disabledProgress.value;

    if (theme <= 0) {
      return resolveTextForTheme(disabled, darkTextPrimary, darkTextDisabled);
    }

    if (theme >= 1) {
      return resolveTextForTheme(disabled, lightTextPrimary, lightTextDisabled);
    }

    const darkResolved = resolveTextForTheme(
      disabled,
      darkTextPrimary,
      darkTextDisabled,
    );

    const lightResolved = resolveTextForTheme(
      disabled,
      lightTextPrimary,
      lightTextDisabled,
    );

    return interpolateColor(theme, [0, 1], [darkResolved, lightResolved]);
  });

  // ─── Icon ────────────────────────────────────────────────────────────────────

  const iconColor = useDerivedValue<string>(() => {
    const theme = themeProgress.value;
    const disabled = disabledProgress.value;

    if (theme <= 0) {
      return resolveIconForTheme(disabled, darkIconPrimary, darkIconDisabled);
    }

    if (theme >= 1) {
      return resolveIconForTheme(disabled, lightIconPrimary, lightIconDisabled);
    }

    const darkResolved = resolveIconForTheme(
      disabled,
      darkIconPrimary,
      darkIconDisabled,
    );

    const lightResolved = resolveIconForTheme(
      disabled,
      lightIconPrimary,
      lightIconDisabled,
    );

    return interpolateColor(theme, [0, 1], [darkResolved, lightResolved]);
  });

  // ─── Error ───────────────────────────────────────────────────────────────────

  const errorColor = useDerivedValue<string>(() => {
    const theme = themeProgress.value;

    if (theme <= 0) {
      return darkError;
    }

    if (theme >= 1) {
      return lightError;
    }

    return interpolateColor(theme, [0, 1], [darkError, lightError]);
  });

  // ─── Placeholder ─────────────────────────────────────────────────────────────

  const placeholderColor = useDerivedValue<string>(() => {
    const theme = themeProgress.value;

    if (theme <= 0) {
      return darkPlaceholder;
    }

    if (theme >= 1) {
      return lightPlaceholder;
    }

    return interpolateColor(theme, [0, 1], [darkPlaceholder, lightPlaceholder]);
  });

  return {
    backgroundColor,
    borderColor,
    labelColor,
    textColor,
    errorColor,
    iconColor,
    placeholderColor,
  };
};
