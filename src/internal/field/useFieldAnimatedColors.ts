import {
  interpolateColor,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";

import { useARCUIAnimatedTheme, useARCUITheme } from "../../contexts/hooks";
import type { IFieldColors } from "../../types/fieldColors";
import { resolveThemeColor } from "../../utils/resolveThemeColor";

interface IUseFieldAnimatedColors {
  colors?: Readonly<IFieldColors>;
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
  colors,
  focusedProgress,
  errorProgress,
  disabledProgress,
  inactiveProgress,
  hasValueProgress,
}: IUseFieldAnimatedColors) => {
  const { tokens } = useARCUITheme();
  const { themeProgress } = useARCUIAnimatedTheme();

  // ─── Theme color endpoints ───────────────────────────────────────────────

  const resolvedBackgroundDefault = resolveThemeColor(
    colors?.background?.default,
    tokens.colors.light.input.background.primary,
    tokens.colors.dark.input.background.primary,
    "Field colors.background.default",
  );
  const resolvedBackgroundDisabled = resolveThemeColor(
    colors?.background?.disabled,
    tokens.colors.light.input.background.disabled,
    tokens.colors.dark.input.background.disabled,
    "Field colors.background.disabled",
  );

  const lightBackgroundPrimary = resolvedBackgroundDefault.light;
  const darkBackgroundPrimary = resolvedBackgroundDefault.dark;
  const lightBackgroundDisabled = resolvedBackgroundDisabled.light;
  const darkBackgroundDisabled = resolvedBackgroundDisabled.dark;

  const resolvedBorderEmpty = resolveThemeColor(
    colors?.border?.empty,
    tokens.colors.light.input.border.withoutValue,
    tokens.colors.dark.input.border.withoutValue,
    "Field colors.border.empty",
  );
  const resolvedBorderFilled = resolveThemeColor(
    colors?.border?.filled,
    tokens.colors.light.input.border.withValue,
    tokens.colors.dark.input.border.withValue,
    "Field colors.border.filled",
  );
  const resolvedBorderFocused = resolveThemeColor(
    colors?.border?.focused,
    tokens.colors.light.input.border.focused,
    tokens.colors.dark.input.border.focused,
    "Field colors.border.focused",
  );
  const resolvedBorderError = resolveThemeColor(
    colors?.border?.error,
    tokens.colors.light.input.border.error,
    tokens.colors.dark.input.border.error,
    "Field colors.border.error",
  );
  const resolvedBorderInactive = resolveThemeColor(
    colors?.border?.inactive,
    tokens.colors.light.input.border.inactive,
    tokens.colors.dark.input.border.inactive,
    "Field colors.border.inactive",
  );
  const resolvedBorderDisabled = resolveThemeColor(
    colors?.border?.disabled,
    tokens.colors.light.input.border.disabled,
    tokens.colors.dark.input.border.disabled,
    "Field colors.border.disabled",
  );

  const lightBorderWithoutValue = resolvedBorderEmpty.light;
  const darkBorderWithoutValue = resolvedBorderEmpty.dark;
  const lightBorderWithValue = resolvedBorderFilled.light;
  const darkBorderWithValue = resolvedBorderFilled.dark;
  const lightBorderFocused = resolvedBorderFocused.light;
  const darkBorderFocused = resolvedBorderFocused.dark;
  const lightBorderError = resolvedBorderError.light;
  const darkBorderError = resolvedBorderError.dark;
  const lightBorderInactive = resolvedBorderInactive.light;
  const darkBorderInactive = resolvedBorderInactive.dark;
  const lightBorderDisabled = resolvedBorderDisabled.light;
  const darkBorderDisabled = resolvedBorderDisabled.dark;

  const resolvedLabelDefault = resolveThemeColor(
    colors?.label?.default,
    tokens.colors.light.input.label.primary,
    tokens.colors.dark.input.label.primary,
    "Field colors.label.default",
  );
  const resolvedLabelDisabled = resolveThemeColor(
    colors?.label?.disabled,
    tokens.colors.light.input.label.disabled,
    tokens.colors.dark.input.label.disabled,
    "Field colors.label.disabled",
  );

  const lightLabelPrimary = resolvedLabelDefault.light;
  const darkLabelPrimary = resolvedLabelDefault.dark;
  const lightLabelDisabled = resolvedLabelDisabled.light;
  const darkLabelDisabled = resolvedLabelDisabled.dark;

  const resolvedTextDefault = resolveThemeColor(
    colors?.text?.default,
    tokens.colors.light.input.text.withValue,
    tokens.colors.dark.input.text.withValue,
    "Field colors.text.default",
  );
  const resolvedTextDisabled = resolveThemeColor(
    colors?.text?.disabled,
    tokens.colors.light.input.text.disabled,
    tokens.colors.dark.input.text.disabled,
    "Field colors.text.disabled",
  );

  const lightTextPrimary = resolvedTextDefault.light;
  const darkTextPrimary = resolvedTextDefault.dark;
  const lightTextDisabled = resolvedTextDisabled.light;
  const darkTextDisabled = resolvedTextDisabled.dark;

  const resolvedPlaceholder = resolveThemeColor(
    colors?.placeholder,
    tokens.colors.light.input.text.placeholder,
    tokens.colors.dark.input.text.placeholder,
    "Field colors.placeholder",
  );
  const lightPlaceholder = resolvedPlaceholder.light;
  const darkPlaceholder = resolvedPlaceholder.dark;

  const resolvedIconDefault = resolveThemeColor(
    colors?.icon?.default,
    tokens.colors.light.input.icon.primary,
    tokens.colors.dark.input.icon.primary,
    "Field colors.icon.default",
  );
  const resolvedIconDisabled = resolveThemeColor(
    colors?.icon?.disabled,
    tokens.colors.light.input.icon.disabled,
    tokens.colors.dark.input.icon.disabled,
    "Field colors.icon.disabled",
  );

  const lightIconPrimary = resolvedIconDefault.light;
  const darkIconPrimary = resolvedIconDefault.dark;
  const lightIconDisabled = resolvedIconDisabled.light;
  const darkIconDisabled = resolvedIconDisabled.dark;

  const resolvedError = resolveThemeColor(
    colors?.error,
    tokens.colors.light.input.error,
    tokens.colors.dark.input.error,
    "Field colors.error",
  );
  const lightError = resolvedError.light;
  const darkError = resolvedError.dark;

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
