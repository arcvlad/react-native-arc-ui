import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type AccessibilityValue,
  type BlurEvent,
  type FocusEvent,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import {
  useARCUIStrings,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { FieldError } from "../../internal/field/FieldError";
import { FieldLabel } from "../../internal/field/FieldLabel";
import { useFieldAnimatedColors } from "../../internal/field/useFieldAnimatedColors";
import { useFieldMotion } from "../../internal/field/useFieldMotion";
import {
  formatNumber,
  isPotentialNumericText,
  normalizeNumberPrecision,
  parseNumericText,
  resolveNumberValue,
  stepNumber,
} from "../../utils/numberUtils";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { inputNumberInteractionConfig } from "./config";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { IInputNumber } from "./types";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const MAX_DECIMALS = 100;

const InputNumberComponent = ({
  ref: externalRef,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  decimals,
  label,
  error,
  disabled = false,
  active = true,
  decrementButtonType = "border",
  incrementButtonType = "border",
  valueType = "border",
  shape = "rounded",
  style,
  inputStyle,
  decrementAccessibilityLabel,
  decrementAccessibilityHint,
  incrementAccessibilityLabel,
  incrementAccessibilityHint,
  testID,
  onFocus,
  onBlur,
  keyboardType,
  inputMode,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  accessibilityValue,
  ...textInputProps
}: IInputNumber) => {
  const { tokens } = useARCUITheme();
  const { fontScale } = useARCUISystem();
  const strings = useARCUIStrings();

  const prefersReducedMotion = useReducedMotion();

  // ─── Public API invariants ──────────────────────────────────────────────────

  if (!Number.isFinite(value)) {
    throw new Error(
      "[react-native-arc-ui] InputNumber value must be a finite number.",
    );
  }

  if (min !== undefined && !Number.isFinite(min)) {
    throw new Error(
      "[react-native-arc-ui] InputNumber min must be a finite number.",
    );
  }

  if (max !== undefined && !Number.isFinite(max)) {
    throw new Error(
      "[react-native-arc-ui] InputNumber max must be a finite number.",
    );
  }

  if (min !== undefined && max !== undefined && min > max) {
    throw new Error(
      "[react-native-arc-ui] InputNumber min cannot be greater than max.",
    );
  }

  if (!Number.isFinite(step) || step <= 0) {
    throw new Error(
      "[react-native-arc-ui] InputNumber step must be a finite number greater than zero.",
    );
  }

  if (
    decimals !== undefined &&
    (!Number.isInteger(decimals) || decimals < 0 || decimals > MAX_DECIMALS)
  ) {
    throw new Error(
      `[react-native-arc-ui] InputNumber decimals must be an integer between 0 and ${MAX_DECIMALS}.`,
    );
  }

  if ((decimals === undefined || decimals === 0) && !Number.isInteger(step)) {
    throw new Error(
      "[react-native-arc-ui] InputNumber step must be an integer when decimals is undefined or 0.",
    );
  }

  if (
    decimals !== undefined &&
    decimals > 0 &&
    normalizeNumberPrecision(step, decimals) === 0
  ) {
    throw new Error(
      "[react-native-arc-ui] InputNumber step is too small for the configured decimal precision.",
    );
  }

  // ─── Resolved numeric configuration ─────────────────────────────────────────

  const resolvedMin = useMemo(
    () =>
      min === undefined ? undefined : normalizeNumberPrecision(min, decimals),
    [min, decimals],
  );

  const resolvedMax = useMemo(
    () =>
      max === undefined ? undefined : normalizeNumberPrecision(max, decimals),
    [max, decimals],
  );

  const normalizedValue = useMemo(
    () => normalizeNumberPrecision(value, decimals),
    [value, decimals],
  );

  const formattedValue = useMemo(
    () => formatNumber(value, decimals),
    [value, decimals],
  );

  const allowDecimal = decimals !== undefined && decimals > 0;

  const allowNegative = resolvedMin === undefined || resolvedMin < 0;

  const hasError = error != null && error.length > 0;

  const interactionDisabled = disabled || !active;

  const isAtMin = resolvedMin !== undefined && normalizedValue <= resolvedMin;

  const isAtMax = resolvedMax !== undefined && normalizedValue >= resolvedMax;

  // ─── Ref ownership ───────────────────────────────────────────────────────────

  const internalRef = useRef<TextInput>(null);

  const setRef = useCallback(
    (node: TextInput | null) => {
      internalRef.current = node;

      if (externalRef == null) {
        return;
      }

      if (typeof externalRef === "function") {
        externalRef(node);

        return;
      }

      externalRef.current = node;
    },
    [externalRef],
  );

  // ─── Numeric editing buffer ──────────────────────────────────────────────────

  /**
   * Controlled numeric value remains the semantic source of truth.
   *
   * editingText only exists because temporary native editing states such as
   * "", "-", "12." or "-." cannot be represented by a number.
   */
  const [editingText, setEditingText] = useState<string | null>(null);

  const editingTextRef = useRef<string | null>(null);

  const focusedRef = useRef(false);

  const updateEditingText = useCallback((next: string | null) => {
    editingTextRef.current = next;

    setEditingText(next);
  }, []);

  const inputText = editingText ?? formattedValue;

  const formatValue = useCallback(
    (nextValue: number) => formatNumber(nextValue, decimals),
    [decimals],
  );

  // ─── Shared field motion ─────────────────────────────────────────────────────

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
    inactive: !active,

    /**
     * InputNumber always has a semantic numeric value even if the temporary
     * editing buffer is currently empty.
     */
    hasValue: true,
  });

  const { backgroundColor, borderColor, labelColor, textColor, errorColor } =
    useFieldAnimatedColors({
      focusedProgress,
      errorProgress,
      disabledProgress,
      inactiveProgress,
      hasValueProgress,
    });

  /**
   * Transparent means transparent at rest.
   *
   * Focus and error still expose semantic field feedback, while disabled and
   * inactive suppress that temporary border.
   */
  const transparentBorderColor = useDerivedValue(() => {
    const semanticLevel = Math.max(focusedProgress.value, errorProgress.value);

    const suppressionLevel = Math.max(
      disabledProgress.value,
      inactiveProgress.value,
    );

    const visibility = semanticLevel * (1 - suppressionLevel);

    if (visibility <= 0) {
      return "rgba(0,0,0,0)";
    }

    if (visibility >= 1) {
      return borderColor.value;
    }

    return interpolateColor(
      visibility,
      [0, 1],
      ["rgba(0,0,0,0)", borderColor.value],
    );
  });

  // ─── Geometry ────────────────────────────────────────────────────────────────

  const controlSize = tokens.sizings.inputNumber.controlSize;

  const shapeRadius = useMemo(() => {
    switch (shape) {
      case "square":
        return 0;

      case "circle":
        return controlSize / 2;

      case "rounded":
      default:
        return tokens.radius.inputNumber;
    }
  }, [shape, controlSize, tokens.radius.inputNumber]);

  const rootLayoutStyle = useMemo<ViewStyle>(
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

  const valueGeometryStyle = useMemo<ViewStyle>(
    () => ({
      minHeight: tokens.sizings.inputNumber.minHeight,

      borderWidth: tokens.border.inputNumber,

      borderRadius: shapeRadius,

      paddingHorizontal: tokens.spacing.s,

      paddingVertical: tokens.spacing.xs,
    }),
    [
      tokens.sizings.inputNumber.minHeight,
      tokens.border.inputNumber,
      shapeRadius,
      tokens.spacing.s,
      tokens.spacing.xs,
    ],
  );

  const buttonContentStyle = useMemo<ViewStyle>(
    () => ({
      width: controlSize,
      height: controlSize,
      minHeight: controlSize,
      paddingHorizontal: 0,
      paddingVertical: 0,
    }),
    [controlSize],
  );

  const inputTypographyStyle = useMemo<TextStyle>(
    () => ({
      ...resolveTypographyStyle(tokens.typography.inputNumber.text).style,
      fontVariant: ["tabular-nums"],
    }),
    [tokens.typography.inputNumber.text],
  );

  const inputFontSize = tokens.typography.inputNumber.text.fontSize;

  // ─── Animated value presentation ─────────────────────────────────────────────

  const animatedValueBorderStyle = useAnimatedStyle(() => ({
    borderColor:
      valueType === "border" ? borderColor.value : transparentBorderColor.value,
  }));

  const animatedValueBackgroundStyle = useAnimatedStyle(() => ({
    backgroundColor:
      valueType === "border" ? backgroundColor.value : "rgba(0,0,0,0)",
  }));

  const inputLineHeight = tokens.typography.inputNumber.text.lineHeight;

  const animatedInputSizeStyle = useAnimatedStyle(() => ({
    fontSize: inputFontSize * fontScale.value,

    lineHeight:
      inputLineHeight != null ? inputLineHeight * fontScale.value : undefined,
  }));

  const animatedInputColorStyle = useAnimatedStyle(() => ({
    color: textColor.value,
  }));

  // ─── Step icon press feedback ────────────────────────────────────────────────

  /**
   * Button remains the owner of the actual interaction and its container
   * animation.
   *
   * InputNumber only adds local feedback to its own +/- icon content because
   * those icons are custom Button children and therefore do not receive
   * Button's pressed text-color animation.
   */
  const decrementPressProgress = useSharedValue(0);

  const incrementPressProgress = useSharedValue(0);

  const pressAnimationType = tokens.pressAnimation.type;

  const pressAnimationDuration = tokens.pressAnimation.duration;

  const scaleDownValue = tokens.pressAnimation.scaleDownValue;

  const scaleUpValue = tokens.pressAnimation.scaleUpValue;

  const pressedIconOpacity = inputNumberInteractionConfig.pressedIconOpacity;

  const iconPressAnimationConfig = useMemo(
    () => ({
      duration: pressAnimationDuration,
    }),
    [pressAnimationDuration],
  );

  const animateIconPress = useCallback(
    (progress: SharedValue<number>, pressed: boolean) => {
      cancelAnimation(progress);

      if (pressAnimationType === "none") {
        progress.value = 0;

        return;
      }

      const target = pressed ? 1 : 0;

      if (prefersReducedMotion) {
        progress.value = target;

        return;
      }

      progress.value = withTiming(target, iconPressAnimationConfig);
    },
    [pressAnimationType, prefersReducedMotion, iconPressAnimationConfig],
  );

  const decrementIconPressStyle = useAnimatedStyle(() => {
    const progress = decrementPressProgress.value;

    if (pressAnimationType === "none") {
      return {
        opacity: 1,
        transform: [
          {
            scale: 1,
          },
        ],
      };
    }

    /**
     * Reduced Motion converts movement feedback into an instant opacity
     * response regardless of the configured scale animation.
     */
    if (prefersReducedMotion || pressAnimationType === "highlight") {
      return {
        opacity: 1 - progress * (1 - pressedIconOpacity),

        transform: [
          {
            scale: 1,
          },
        ],
      };
    }

    const targetScale =
      pressAnimationType === "scaleDown" ? scaleDownValue : scaleUpValue;

    return {
      opacity: 1,

      transform: [
        {
          scale: 1 + progress * (targetScale - 1),
        },
      ],
    };
  });

  const incrementIconPressStyle = useAnimatedStyle(() => {
    const progress = incrementPressProgress.value;

    if (pressAnimationType === "none") {
      return {
        opacity: 1,
        transform: [
          {
            scale: 1,
          },
        ],
      };
    }

    if (prefersReducedMotion || pressAnimationType === "highlight") {
      return {
        opacity: 1 - progress * (1 - pressedIconOpacity),

        transform: [
          {
            scale: 1,
          },
        ],
      };
    }

    const targetScale =
      pressAnimationType === "scaleDown" ? scaleDownValue : scaleUpValue;

    return {
      opacity: 1,

      transform: [
        {
          scale: 1 + progress * (targetScale - 1),
        },
      ],
    };
  });

  /**
   * Reset any local icon state if the global Button animation strategy changes.
   */
  useEffect(() => {
    cancelAnimation(decrementPressProgress);

    cancelAnimation(incrementPressProgress);

    decrementPressProgress.value = 0;
    incrementPressProgress.value = 0;
  }, [
    pressAnimationType,
    prefersReducedMotion,
    decrementPressProgress,
    incrementPressProgress,
  ]);

  /**
   * Cancel local icon feedback when InputNumber unmounts.
   *
   * Normal press replacement/reversal remains owned by animateIconPress().
   */
  useEffect(
    () => () => {
      cancelAnimation(decrementPressProgress);
      cancelAnimation(incrementPressProgress);
    },
    [decrementPressProgress, incrementPressProgress],
  );

  // ─── Keyboard configuration ──────────────────────────────────────────────────

  const resolvedKeyboardType = useMemo<TextInputProps["keyboardType"]>(() => {
    if (keyboardType !== undefined || inputMode !== undefined) {
      return keyboardType;
    }

    if (Platform.OS === "ios") {
      if (allowNegative) {
        return "numbers-and-punctuation";
      }

      return allowDecimal ? "decimal-pad" : "number-pad";
    }

    return "numeric";
  }, [keyboardType, inputMode, allowNegative, allowDecimal]);

  // ─── Keyboard editing ────────────────────────────────────────────────────────

  const handleTextChange = useCallback(
    (nextText: string) => {
      const numericTextOptions = {
        allowDecimal,
        allowNegative,
      };

      if (!isPotentialNumericText(nextText, numericTextOptions)) {
        return;
      }

      updateEditingText(nextText);

      const parsed = parseNumericText(nextText, numericTextOptions);

      /**
       * Empty, "-", ".", "-.", "12." etc. are legitimate temporary editing
       * states but do not yet emit a semantic numeric value.
       */
      if (parsed === null) {
        return;
      }

      const nextValue = resolveNumberValue(parsed, {
        min: resolvedMin,
        max: resolvedMax,
        decimals,
      });

      if (!Object.is(nextValue, value)) {
        onValueChange(nextValue);
      }
    },
    [
      allowDecimal,
      allowNegative,
      updateEditingText,
      resolvedMin,
      resolvedMax,
      decimals,
      value,
      onValueChange,
    ],
  );

  const handleFocusWrapped = useCallback(
    (event: FocusEvent) => {
      focusedRef.current = true;

      updateEditingText(formatValue(value));

      setFocused(true);

      onFocus?.(event);
    },
    [updateEditingText, formatValue, value, setFocused, onFocus],
  );

  const handleBlurWrapped = useCallback(
    (event: BlurEvent) => {
      focusedRef.current = false;

      const currentText = editingTextRef.current;

      if (currentText != null) {
        const parsed = parseNumericText(currentText, {
          allowDecimal,
          allowNegative,
        });

        if (parsed !== null) {
          const nextValue = resolveNumberValue(parsed, {
            min: resolvedMin,
            max: resolvedMax,
            decimals,
          });

          if (!Object.is(nextValue, value)) {
            onValueChange(nextValue);
          }
        }
      }

      /**
       * Invalid/empty temporary input reverts to the current controlled value
       * once editing ends.
       */
      updateEditingText(null);

      setFocused(false);

      onBlur?.(event);
    },
    [
      allowDecimal,
      allowNegative,
      resolvedMin,
      resolvedMax,
      decimals,
      value,
      onValueChange,
      updateEditingText,
      setFocused,
      onBlur,
    ],
  );

  const handleValueContainerPress = useCallback(() => {
    if (interactionDisabled) {
      return;
    }

    const input = internalRef.current;

    if (input == null || input.isFocused()) {
      return;
    }

    input.focus();
  }, [interactionDisabled]);

  // ─── Step interaction ────────────────────────────────────────────────────────

  const repeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Local interaction value prevents long-press repeat from depending on how
   * quickly the controlled parent rerenders after each onValueChange.
   */
  const interactionValueRef = useRef<number | null>(null);

  /**
   * Pressable may emit onPress after onLongPress. This prevents the release
   * from producing one additional step after a long-press sequence.
   */
  const suppressNextPressRef = useRef(false);

  const clearRepeat = useCallback(() => {
    if (repeatTimerRef.current == null) {
      return;
    }

    clearInterval(repeatTimerRef.current);

    repeatTimerRef.current = null;
  }, []);

  const isDirectionBlocked = useCallback(
    (currentValue: number, direction: -1 | 1): boolean => {
      if (direction === -1 && resolvedMin !== undefined) {
        return currentValue <= resolvedMin;
      }

      if (direction === 1 && resolvedMax !== undefined) {
        return currentValue >= resolvedMax;
      }

      return false;
    },
    [resolvedMin, resolvedMax],
  );

  const resolveStepBase = useCallback((): number => {
    /**
     * A focused field may contain a newer valid editing value than the latest
     * controlled render, so stepping should start from what the user sees.
     */
    if (focusedRef.current) {
      const currentText = editingTextRef.current;

      if (currentText != null) {
        const parsed = parseNumericText(currentText, {
          allowDecimal,
          allowNegative,
        });

        if (parsed !== null) {
          return resolveNumberValue(parsed, {
            min: resolvedMin,
            max: resolvedMax,
            decimals,
          });
        }
      }
    }

    return normalizeNumberPrecision(value, decimals);
  }, [allowDecimal, allowNegative, resolvedMin, resolvedMax, decimals, value]);

  const applyStep = useCallback(
    (direction: -1 | 1): number | null => {
      const currentValue = interactionValueRef.current ?? resolveStepBase();

      if (isDirectionBlocked(currentValue, direction)) {
        return null;
      }

      const nextValue = stepNumber({
        value: currentValue,
        step,
        direction,
        min: resolvedMin,
        max: resolvedMax,
        decimals,
      });

      if (Object.is(nextValue, currentValue)) {
        return null;
      }

      interactionValueRef.current = nextValue;

      /**
       * Buttons remain usable while the native TextInput is focused.
       * Keep the visible editing buffer synchronized with button stepping.
       */
      if (focusedRef.current) {
        updateEditingText(formatValue(nextValue));
      }

      if (!Object.is(nextValue, value)) {
        onValueChange(nextValue);
      }

      return nextValue;
    },
    [
      resolveStepBase,
      isDirectionBlocked,
      step,
      resolvedMin,
      resolvedMax,
      decimals,
      updateEditingText,
      formatValue,
      value,
      onValueChange,
    ],
  );

  const handleStepPressIn = useCallback(() => {
    clearRepeat();

    suppressNextPressRef.current = false;

    interactionValueRef.current = resolveStepBase();
  }, [clearRepeat, resolveStepBase]);

  const handleStepPressOut = useCallback(() => {
    clearRepeat();

    interactionValueRef.current = null;
  }, [clearRepeat]);

  const handleStepPress = useCallback(
    (direction: -1 | 1) => {
      if (suppressNextPressRef.current) {
        suppressNextPressRef.current = false;

        return;
      }

      if (interactionValueRef.current == null) {
        interactionValueRef.current = resolveStepBase();
      }

      applyStep(direction);
    },
    [resolveStepBase, applyStep],
  );

  const handleStepLongPress = useCallback(
    (direction: -1 | 1) => {
      suppressNextPressRef.current = true;

      /**
       * Long press performs its first repeated step immediately instead of
       * waiting for the first interval tick.
       */
      const firstValue = applyStep(direction);

      if (firstValue == null || isDirectionBlocked(firstValue, direction)) {
        return;
      }

      clearRepeat();

      repeatTimerRef.current = setInterval(() => {
        const nextValue = applyStep(direction);

        if (nextValue == null || isDirectionBlocked(nextValue, direction)) {
          clearRepeat();
        }
      }, inputNumberInteractionConfig.repeatInterval);
    },
    [applyStep, isDirectionBlocked, clearRepeat],
  );

  // ─── Decrement interaction ───────────────────────────────────────────────────

  const handleDecrementPressIn = useCallback(() => {
    handleStepPressIn();

    animateIconPress(decrementPressProgress, true);
  }, [handleStepPressIn, animateIconPress, decrementPressProgress]);

  const handleDecrement = useCallback(() => {
    handleStepPress(-1);
  }, [handleStepPress]);

  const handleLongPressDecrement = useCallback(() => {
    handleStepLongPress(-1);
  }, [handleStepLongPress]);

  const handleDecrementPressOut = useCallback(() => {
    handleStepPressOut();

    animateIconPress(decrementPressProgress, false);
  }, [handleStepPressOut, animateIconPress, decrementPressProgress]);

  // ─── Increment interaction ───────────────────────────────────────────────────

  const handleIncrementPressIn = useCallback(() => {
    handleStepPressIn();

    animateIconPress(incrementPressProgress, true);
  }, [handleStepPressIn, animateIconPress, incrementPressProgress]);

  const handleIncrement = useCallback(() => {
    handleStepPress(1);
  }, [handleStepPress]);

  const handleLongPressIncrement = useCallback(() => {
    handleStepLongPress(1);
  }, [handleStepLongPress]);

  const handleIncrementPressOut = useCallback(() => {
    handleStepPressOut();

    animateIconPress(incrementPressProgress, false);
  }, [handleStepPressOut, animateIconPress, incrementPressProgress]);

  /**
   * Stop semantic repeat immediately if interaction or numeric configuration
   * changes.
   *
   * value is intentionally not a dependency: controlled updates are expected
   * throughout an active long-press repeat sequence.
   */
  useEffect(() => {
    clearRepeat();

    interactionValueRef.current = null;
  }, [disabled, active, step, resolvedMin, resolvedMax, decimals, clearRepeat]);

  useEffect(
    () => () => {
      clearRepeat();
    },
    [clearRepeat],
  );

  // ─── Button state ────────────────────────────────────────────────────────────

  const decrementButtonDisabled = disabled || (active && isAtMin);

  const incrementButtonDisabled = disabled || (active && isAtMax);

  /**
   * Icon is rendered as custom Button children, so InputNumber resolves its
   * semantic disabled/inactive color locally while Button still owns its
   * container state.
   */
  const decrementIconState = decrementButtonDisabled
    ? "disabled"
    : !active
      ? "inactive"
      : "primary";

  const incrementIconState = incrementButtonDisabled
    ? "disabled"
    : !active
      ? "inactive"
      : "primary";

  const decrementIconLight =
    tokens.colors.light.button[decrementButtonType].text[decrementIconState];

  const decrementIconDark =
    tokens.colors.dark.button[decrementButtonType].text[decrementIconState];

  const incrementIconLight =
    tokens.colors.light.button[incrementButtonType].text[incrementIconState];

  const incrementIconDark =
    tokens.colors.dark.button[incrementButtonType].text[incrementIconState];

  const decrementIcon = useMemo(
    () => (
      <Icon
        type="minus"
        size={tokens.sizings.icon.m}
        lightColor={decrementIconLight}
        darkColor={decrementIconDark}
      />
    ),
    [tokens.sizings.icon.m, decrementIconLight, decrementIconDark],
  );

  const incrementIcon = useMemo(
    () => (
      <Icon
        type="plus"
        size={tokens.sizings.icon.m}
        lightColor={incrementIconLight}
        darkColor={incrementIconDark}
      />
    ),
    [tokens.sizings.icon.m, incrementIconLight, incrementIconDark],
  );

  /**
   * Match Button's own interaction availability and immediately clear local
   * icon feedback if a boundary/state change disables the control while held.
   */
  useEffect(() => {
    if (!disabled && active && !isAtMin) {
      return;
    }

    cancelAnimation(decrementPressProgress);

    decrementPressProgress.value = 0;
  }, [disabled, active, isAtMin, decrementPressProgress]);

  useEffect(() => {
    if (!disabled && active && !isAtMax) {
      return;
    }

    cancelAnimation(incrementPressProgress);

    incrementPressProgress.value = 0;
  }, [disabled, active, isAtMax, incrementPressProgress]);

  // ─── Accessibility ───────────────────────────────────────────────────────────

  /**
   * React Native's min/max/now accessibility range fields are integer-based.
   * InputNumber supports decimals, so expose the value textually instead.
   */
  const resolvedAccessibilityValue = useMemo<AccessibilityValue>(
    () => ({
      text: accessibilityValue?.text ?? formattedValue,
    }),
    [accessibilityValue?.text, formattedValue],
  );

  const buttonAccessibilityValue = useMemo<AccessibilityValue>(
    () => ({
      text: formattedValue,
    }),
    [formattedValue],
  );

  return (
    <View testID={testID} style={[styles.container, rootLayoutStyle, style]}>
      {label != null && label.length > 0 && (
        <FieldLabel
          testID={testID ? `${testID}-label` : undefined}
          color={labelColor}
          typography={tokens.typography.inputNumber.label}
        >
          {label}
        </FieldLabel>
      )}

      <View style={[styles.row, rowLayoutStyle]}>
        <Button
          testID={testID ? `${testID}-decrement` : undefined}
          type={decrementButtonType}
          radius={shapeRadius}
          contentStyle={buttonContentStyle}
          active={active}
          disabled={decrementButtonDisabled}
          onPressIn={handleDecrementPressIn}
          onPress={handleDecrement}
          onLongPress={handleLongPressDecrement}
          onPressOut={handleDecrementPressOut}
          delayLongPress={inputNumberInteractionConfig.longPressDelay}
          accessibilityLabel={
            decrementAccessibilityLabel ??
            strings.inputNumberDecrementAccessibilityLabel
          }
          accessibilityHint={decrementAccessibilityHint}
          accessibilityValue={buttonAccessibilityValue}
        >
          <Animated.View pointerEvents="none" style={decrementIconPressStyle}>
            {decrementIcon}
          </Animated.View>
        </Button>

        <Pressable
          accessible={false}
          onPress={handleValueContainerPress}
          style={styles.valuePressable}
        >
          <Animated.View
            style={[
              styles.valueSurface,
              valueGeometryStyle,
              animatedValueBackgroundStyle,
              animatedValueBorderStyle,
            ]}
          >
            <AnimatedTextInput
              {...textInputProps}
              ref={setRef}
              testID={testID ? `${testID}-input` : undefined}
              value={inputText}
              editable={!interactionDisabled}
              multiline={false}
              scrollEnabled={false}
              textAlignVertical="center"
              onChangeText={handleTextChange}
              onFocus={handleFocusWrapped}
              onBlur={handleBlurWrapped}
              keyboardType={resolvedKeyboardType}
              inputMode={inputMode}
              selectTextOnFocus
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              allowFontScaling={false}
              maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
              accessibilityLabel={accessibilityLabel ?? label}
              accessibilityHint={accessibilityHint}
              aria-disabled={interactionDisabled}
              accessibilityState={{
                ...accessibilityState,

                disabled: interactionDisabled,
              }}
              accessibilityValue={resolvedAccessibilityValue}
              style={[
                styles.input,
                inputTypographyStyle,
                inputStyle,
                animatedInputSizeStyle,
                animatedInputColorStyle,
              ]}
            />
          </Animated.View>
        </Pressable>

        <Button
          testID={testID ? `${testID}-increment` : undefined}
          type={incrementButtonType}
          radius={shapeRadius}
          contentStyle={buttonContentStyle}
          active={active}
          disabled={incrementButtonDisabled}
          onPressIn={handleIncrementPressIn}
          onPress={handleIncrement}
          onLongPress={handleLongPressIncrement}
          onPressOut={handleIncrementPressOut}
          delayLongPress={inputNumberInteractionConfig.longPressDelay}
          accessibilityLabel={
            incrementAccessibilityLabel ??
            strings.inputNumberIncrementAccessibilityLabel
          }
          accessibilityHint={incrementAccessibilityHint}
          accessibilityValue={buttonAccessibilityValue}
        >
          <Animated.View pointerEvents="none" style={incrementIconPressStyle}>
            {incrementIcon}
          </Animated.View>
        </Button>
      </View>

      {hasError && (
        <FieldError
          testID={testID ? `${testID}-error` : undefined}
          color={errorColor}
          typography={tokens.typography.inputNumber.error}
        >
          {error}
        </FieldError>
      )}
    </View>
  );
};

export const InputNumber = memo(InputNumberComponent);

InputNumber.displayName = "InputNumber";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  valuePressable: {
    flex: 1,
  },

  valueSurface: {
    flex: 1,
    justifyContent: "center",
  },

  input: {
    flex: 1,
    padding: 0,
    margin: 0,
    textAlign: "center",
  },
});
