import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import {
  useARCUIStrings,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { FieldError } from "../../internal/field/FieldError";
import { FieldLabel } from "../../internal/field/FieldLabel";
import { useFieldAnimatedColors } from "../../internal/field/useFieldAnimatedColors";
import { useFieldMotion } from "../../internal/field/useFieldMotion";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { IInputOTP, TInputOTPRef } from "./types";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const NUMERIC_CHARACTER = /^[0-9]$/;

const ALPHANUMERIC_CHARACTER = /^[A-Za-z0-9]$/;

type TKeyPressEvent = Parameters<NonNullable<TextInputProps["onKeyPress"]>>[0];

const buildRows = (length: number): number[][] => {
  if (length <= 6) {
    return Array.from({ length: 1 }, () =>
      Array.from({ length }, (_, index) => index),
    );
  }

  return [
    Array.from({ length: 4 }, (_, index) => index),
    Array.from({ length: length - 4 }, (_, index) => index + 4),
  ];
};

/**
 * RegExp.test() becomes stateful when `g` or `y` is present because it mutates
 * lastIndex.
 *
 * InputOTP validates one character at a time, so ARCUI preserves the consumer
 * pattern while removing only those stateful flags.
 */
const createStableCharacterPattern = (pattern: RegExp): RegExp =>
  new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ""));

interface IOTPCell {
  index: number;
  char: string;
  length: number;

  secure: boolean;
  disabled: boolean;
  inactive: boolean;
  hasError: boolean;
  autoFocus: boolean;

  nativeProps: TextInputProps;

  accessibilityLabel: string;
  accessibilityHint?: string;

  layoutStyle: ViewStyle;

  setInputRef: (node: TextInput | null) => void;

  onFocusRequest: (index: number) => boolean;
  onChangeText: (index: number, text: string) => void;
  onBackspace: (index: number) => void;

  testID?: string;
}

const OTPCellComponent = ({
  index,
  char,
  length,
  secure,
  disabled,
  inactive,
  hasError,
  autoFocus,
  nativeProps,
  accessibilityLabel,
  accessibilityHint,
  layoutStyle,
  setInputRef,
  onFocusRequest,
  onChangeText,
  onBackspace,
  testID,
}: IOTPCell) => {
  const { tokens } = useARCUITheme();

  const { fontScale } = useARCUISystem();

  const interactionDisabled = disabled || inactive;

  const hasValue = char.length > 0;

  const {
    focusedProgress,
    errorProgress,
    disabledProgress,
    inactiveProgress,
    hasValueProgress,
    setFocused,
  } = useFieldMotion({
    hasError,
    disabled,
    inactive,
    hasValue,
  });

  const { backgroundColor, borderColor, textColor } = useFieldAnimatedColors({
    focusedProgress,
    errorProgress,
    disabledProgress,
    inactiveProgress,
    hasValueProgress,
  });

  const geometryStyle = useMemo<ViewStyle>(
    () => ({
      borderWidth: tokens.border.inputOTP,

      borderRadius: tokens.radius.inputOTP,
    }),
    [tokens.border.inputOTP, tokens.radius.inputOTP],
  );

  const typographyStyle = useMemo<TextStyle>(
    () => ({
      ...resolveTypographyStyle(tokens.typography.inputOTP.text).style,
      fontVariant: ["tabular-nums"],
      includeFontPadding: false,
    }),
    [tokens.typography.inputOTP.text],
  );

  const animatedSurfaceStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,

    borderColor: borderColor.value,
  }));

  const animatedTextColorStyle = useAnimatedStyle(() => ({
    color: textColor.value,
  }));

  const inputFontSize = tokens.typography.inputOTP.text.fontSize;
  const inputLineHeight = tokens.typography.inputOTP.text.lineHeight;

  const animatedTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: inputFontSize * fontScale.value,

    lineHeight:
      inputLineHeight != null ? inputLineHeight * fontScale.value : undefined,
  }));

  const handleFocus = useCallback(() => {
    const accepted = onFocusRequest(index);

    setFocused(accepted);
  }, [index, onFocusRequest, setFocused]);

  const handleBlur = useCallback(() => {
    setFocused(false);
  }, [setFocused]);

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText(index, text);
    },
    [index, onChangeText],
  );

  const handleKeyPress = useCallback(
    (event: TKeyPressEvent) => {
      if (event.nativeEvent.key !== "Backspace") {
        return;
      }

      onBackspace(index);
    },
    [index, onBackspace],
  );

  return (
    <AnimatedTextInput
      {...nativeProps}
      ref={setInputRef}
      testID={testID}
      value={char}
      onChangeText={handleChangeText}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      editable={!interactionDisabled}
      multiline={false}
      scrollEnabled={false}
      secureTextEntry={secure}
      caretHidden
      selectTextOnFocus
      autoFocus={autoFocus && !interactionDisabled}
      allowFontScaling={false}
      maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
      underlineColorAndroid="rgba(0,0,0,0)"
      accessibilityLabel={`${accessibilityLabel} ${index + 1}/${length}`}
      accessibilityHint={interactionDisabled ? undefined : accessibilityHint}
      aria-disabled={interactionDisabled}
      accessibilityState={{
        ...nativeProps.accessibilityState,

        disabled: interactionDisabled,
      }}
      textAlign="center"
      textAlignVertical="center"
      style={[
        styles.cell,
        layoutStyle,
        geometryStyle,
        typographyStyle,
        animatedTextSizeStyle,
        animatedSurfaceStyle,
        animatedTextColorStyle,
      ]}
    />
  );
};

const OTPCell = memo(OTPCellComponent);

OTPCell.displayName = "OTPCell";

const InputOTPComponent = ({
  ref: externalRef,
  value,
  onValueChange,
  onComplete,
  length = 6,
  secure = false,
  autoFocus = false,
  blurOnComplete = false,
  type = "numeric",
  allowedChars,
  label,
  error,
  disabled = false,
  active = true,
  style,
  testID,
  keyboardType,
  inputMode,
  textContentType,
  autoComplete,
  autoCapitalize,
  autoCorrect,
  spellCheck,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ...textInputProps
}: IInputOTP) => {
  const { tokens } = useARCUITheme();
  const strings = useARCUIStrings();

  // ─── Public API invariants ──────────────────────────────────────────────────

  if (!Number.isInteger(length) || length < 4 || length > 8) {
    throw new Error(
      "[react-native-arc-ui] InputOTP length must be an integer between 4 and 8.",
    );
  }

  const valueChars = useMemo(() => Array.from(value), [value]);

  if (valueChars.length > length) {
    throw new Error(
      "[react-native-arc-ui] InputOTP value cannot contain more characters than the configured length.",
    );
  }

  // ─── Semantic state ─────────────────────────────────────────────────────────

  const interactionDisabled = disabled || !active;

  const hasError = error != null && error.length > 0;

  const resolvedAllowedChars = useMemo(() => {
    if (allowedChars != null) {
      return createStableCharacterPattern(allowedChars);
    }

    return type === "numeric" ? NUMERIC_CHARACTER : ALPHANUMERIC_CHARACTER;
  }, [allowedChars, type]);

  const isValueAllowed = useMemo(
    () => valueChars.every((char) => resolvedAllowedChars.test(char)),
    [valueChars, resolvedAllowedChars],
  );

  const isComplete = valueChars.length === length && isValueAllowed;

  // ─── Cell refs ──────────────────────────────────────────────────────────────

  const cellRefs = useRef<Array<TextInput | null>>([]);

  const focusCell = useCallback(
    (index: number) => {
      const resolvedIndex = Math.min(Math.max(index, 0), length - 1);

      cellRefs.current[resolvedIndex]?.focus();
    },
    [length],
  );

  const blurCells = useCallback(() => {
    for (let index = 0; index < length; index += 1) {
      cellRefs.current[index]?.blur();
    }
  }, [length]);

  const resolvePreferredFocusIndex = useCallback(
    () => Math.min(valueChars.length, length - 1),
    [valueChars.length, length],
  );

  useImperativeHandle(
    externalRef,
    (): TInputOTPRef => ({
      focus: () => {
        if (interactionDisabled) {
          return;
        }

        focusCell(resolvePreferredFocusIndex());
      },

      blur: blurCells,
    }),
    [interactionDisabled, focusCell, resolvePreferredFocusIndex, blurCells],
  );

  /**
   * Release native focus immediately if the whole OTP becomes unavailable.
   */
  useEffect(() => {
    if (!interactionDisabled) {
      return;
    }

    blurCells();
  }, [interactionDisabled, blurCells]);

  // ─── Shared label / error motion ────────────────────────────────────────────

  const {
    focusedProgress,
    errorProgress,
    disabledProgress,
    inactiveProgress,
    hasValueProgress,
  } = useFieldMotion({
    hasError,
    disabled,
    inactive: !active,
    hasValue: valueChars.length > 0,
  });

  const { labelColor, errorColor } = useFieldAnimatedColors({
    focusedProgress,
    errorProgress,
    disabledProgress,
    inactiveProgress,
    hasValueProgress,
  });

  // ─── Cell focus ownership ───────────────────────────────────────────────────

  const handleCellFocusRequest = useCallback(
    (index: number): boolean => {
      /**
       * Filled cells may be revisited and edited.
       *
       * Empty cells after the first available position cannot represent a
       * meaningful string index because InputOTP intentionally has no holes.
       * Redirect those taps to the first empty cell.
       */
      if (valueChars.length < length && index > valueChars.length) {
        focusCell(valueChars.length);

        return false;
      }

      return true;
    },
    [valueChars.length, length, focusCell],
  );

  // ─── Controlled editing ─────────────────────────────────────────────────────

  const handleCellChange = useCallback(
    (requestedIndex: number, nextText: string) => {
      const rawChars = Array.from(nextText);

      const insertionIndex = Math.min(requestedIndex, valueChars.length);

      /**
       * A truly empty native value means deletion.
       *
       * An invalid non-empty character must not accidentally delete an existing
       * controlled character just because filtering produced an empty array.
       */
      if (rawChars.length === 0) {
        if (insertionIndex >= valueChars.length) {
          return;
        }

        const nextChars = [...valueChars];

        nextChars.splice(insertionIndex, 1);

        const nextValue = nextChars.join("");

        if (nextValue !== value) {
          onValueChange(nextValue);
        }

        return;
      }

      const filteredChars = rawChars.filter((char) =>
        resolvedAllowedChars.test(char),
      );

      if (filteredChars.length === 0) {
        return;
      }

      let nextChars: string[];

      /**
       * A full-length payload is normally OTP autofill or a complete-code paste.
       *
       * Treat it as the whole OTP regardless of which cell currently owns
       * native focus.
       */
      if (filteredChars.length >= length) {
        nextChars = filteredChars.slice(0, length);
      } else {
        const prefix = valueChars.slice(0, insertionIndex);

        const suffix = valueChars.slice(insertionIndex + filteredChars.length);

        nextChars = [...prefix, ...filteredChars, ...suffix].slice(0, length);
      }

      const nextValue = nextChars.join("");

      if (nextValue !== value) {
        onValueChange(nextValue);
      }

      const nextIsComplete =
        nextChars.length === length &&
        nextChars.every((char) => resolvedAllowedChars.test(char));

      if (nextIsComplete) {
        if (!blurOnComplete) {
          focusCell(length - 1);
        }

        return;
      }

      const nextFocusIndex = Math.min(
        insertionIndex + filteredChars.length,
        nextChars.length,
        length - 1,
      );

      focusCell(nextFocusIndex);
    },
    [
      valueChars,
      value,
      resolvedAllowedChars,
      length,
      onValueChange,
      blurOnComplete,
      focusCell,
    ],
  );

  const handleCellBackspace = useCallback(
    (index: number) => {
      /**
       * When the focused cell already contains a character, native
       * onChangeText("") owns deletion.
       *
       * This branch exists for the common OTP case where focus is already on
       * the next empty cell and Backspace should remove the previous digit.
       */
      const currentChar = valueChars[index] ?? "";

      if (currentChar.length > 0 || index <= 0) {
        return;
      }

      const previousIndex = Math.min(index - 1, valueChars.length - 1);

      if (previousIndex < 0) {
        return;
      }

      const nextChars = [...valueChars];

      nextChars.splice(previousIndex, 1);

      const nextValue = nextChars.join("");

      if (nextValue !== value) {
        onValueChange(nextValue);
      }

      focusCell(previousIndex);
    },
    [valueChars, value, onValueChange, focusCell],
  );

  // ─── Completion lifecycle ───────────────────────────────────────────────────

  const onCompleteRef = useRef(onComplete);

  const lastCompletedValueRef = useRef<string | null>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isComplete) {
      /**
       * Becoming incomplete arms completion again, including for the same code.
       */
      lastCompletedValueRef.current = null;

      return;
    }

    if (lastCompletedValueRef.current === value) {
      return;
    }

    lastCompletedValueRef.current = value;

    onCompleteRef.current?.(value);

    if (blurOnComplete) {
      blurCells();
    }
  }, [isComplete, value, blurOnComplete, blurCells]);

  // ─── Native configuration ───────────────────────────────────────────────────

  const resolvedKeyboardType = useMemo<TextInputProps["keyboardType"]>(() => {
    if (keyboardType !== undefined || inputMode !== undefined) {
      return keyboardType;
    }

    return type === "numeric" ? "number-pad" : "default";
  }, [keyboardType, inputMode, type]);

  const resolvedAccessibilityLabel =
    accessibilityLabel ?? label ?? strings.inputOTPAccessibilityLabel;

  const resolvedAccessibilityHint = accessibilityHint;

  const nativeCellProps = useMemo<TextInputProps>(
    () => ({
      ...textInputProps,

      keyboardType: resolvedKeyboardType,

      inputMode,

      textContentType: textContentType ?? "oneTimeCode",

      autoComplete: autoComplete ?? "one-time-code",

      autoCapitalize: autoCapitalize ?? "none",

      autoCorrect: autoCorrect ?? false,

      spellCheck: spellCheck ?? false,

      accessibilityState,
    }),
    [
      textInputProps,
      resolvedKeyboardType,
      inputMode,
      textContentType,
      autoComplete,
      autoCapitalize,
      autoCorrect,
      spellCheck,
      accessibilityState,
    ],
  );

  // ─── Layout ─────────────────────────────────────────────────────────────────

  const rows = useMemo(() => buildRows(length), [length]);

  const initialFocusIndex = Math.min(valueChars.length, length - 1);

  const rootLayoutStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xs,
    }),
    [tokens.spacing.xs],
  );

  const gridLayoutStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xs,
    }),
    [tokens.spacing.xs],
  );

  const rowLayoutStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xs,
    }),
    [tokens.spacing.xs],
  );

  /**
   * boxSize is the preferred maximum cell size.
   *
   * Cells can shrink equally on a narrow container instead of overflowing.
   */
  const cellLayoutStyle = useMemo<ViewStyle>(
    () => ({
      maxWidth: tokens.sizings.inputOTP.boxSize,

      aspectRatio: 1,
    }),
    [tokens.sizings.inputOTP.boxSize],
  );

  return (
    <View testID={testID} style={[styles.container, rootLayoutStyle, style]}>
      {label != null && label.length > 0 && (
        <FieldLabel
          testID={testID ? `${testID}-label` : undefined}
          color={labelColor}
          typography={tokens.typography.inputOTP.label}
        >
          {label}
        </FieldLabel>
      )}

      <View style={[styles.grid, gridLayoutStyle]}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.row, rowLayoutStyle]}>
            {row.map((index) => (
              <OTPCell
                key={index}
                testID={testID ? `${testID}-cell-${index}` : undefined}
                index={index}
                char={valueChars[index] ?? ""}
                length={length}
                secure={secure}
                disabled={disabled}
                inactive={!active}
                hasError={hasError}
                autoFocus={autoFocus && index === initialFocusIndex}
                nativeProps={nativeCellProps}
                accessibilityLabel={resolvedAccessibilityLabel}
                accessibilityHint={resolvedAccessibilityHint}
                layoutStyle={cellLayoutStyle}
                setInputRef={(node) => {
                  cellRefs.current[index] = node;
                }}
                onFocusRequest={handleCellFocusRequest}
                onChangeText={handleCellChange}
                onBackspace={handleCellBackspace}
              />
            ))}
          </View>
        ))}
      </View>

      {hasError && (
        <FieldError
          testID={testID ? `${testID}-error` : undefined}
          color={errorColor}
          typography={tokens.typography.inputOTP.error}
        >
          {error}
        </FieldError>
      )}
    </View>
  );
};

export const InputOTP = memo(InputOTPComponent);

InputOTP.displayName = "InputOTP";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  grid: {
    width: "100%",
  },

  row: {
    width: "100%",

    flexDirection: "row",

    justifyContent: "center",
  },

  cell: {
    flexGrow: 1,

    flexBasis: 0,

    minWidth: 0,

    padding: 0,

    margin: 0,
  },
});
