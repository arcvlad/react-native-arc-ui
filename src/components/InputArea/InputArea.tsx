import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type BlurEvent,
  type FocusEvent,
  type TextInputContentSizeChangeEvent,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useARCUISystem, useARCUITheme } from "../../contexts/hooks";
import { FieldCharCount } from "../../internal/field/FieldCharCount";
import { FieldError } from "../../internal/field/FieldError";
import { FieldLabel } from "../../internal/field/FieldLabel";
import { useFieldAnimatedColors } from "../../internal/field/useFieldAnimatedColors";
import { useFieldMotion } from "../../internal/field/useFieldMotion";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { IInputArea } from "./types";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const InputAreaComponent = ({
  ref: externalRef,
  label,
  error,
  disabled = false,
  active = true,
  showCharCount = true,
  minHeight,
  maxHeight,
  style,
  inputStyle,
  testID,
  value,
  defaultValue,
  editable,
  maxLength,
  onChangeText,
  onContentSizeChange,
  onFocus,
  onBlur,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ...textInputProps
}: IInputArea) => {
  const { tokens } = useARCUITheme();
  const { fontScale } = useARCUISystem();

  const prefersReducedMotion = useReducedMotion();

  const tokenMinHeight = tokens.sizings.inputArea.minHeight;
  const tokenMaxHeight = tokens.sizings.inputArea.maxHeight;

  const isValidMinHeight =
    minHeight === undefined || (Number.isFinite(minHeight) && minHeight >= 0);

  const isValidMaxHeight =
    maxHeight === undefined || (Number.isFinite(maxHeight) && maxHeight >= 0);

  let resolvedMinHeight = isValidMinHeight
    ? (minHeight ?? tokenMinHeight)
    : tokenMinHeight;

  let resolvedMaxHeight = isValidMaxHeight
    ? (maxHeight ?? tokenMaxHeight)
    : tokenMaxHeight;

  if (__DEV__ && !isValidMinHeight) {
    console.error(
      "[react-native-arc-ui] InputArea: invalid minHeight. Falling back to tokens.sizings.inputArea.minHeight.",
    );
  }

  if (__DEV__ && !isValidMaxHeight) {
    console.error(
      "[react-native-arc-ui] InputArea: invalid maxHeight. Falling back to tokens.sizings.inputArea.maxHeight.",
    );
  }

  if (resolvedMinHeight > resolvedMaxHeight) {
    if (__DEV__) {
      console.error(
        "[react-native-arc-ui] InputArea: minHeight cannot be greater than maxHeight. Falling back to InputArea sizing tokens.",
      );
    }

    resolvedMinHeight = tokenMinHeight;
    resolvedMaxHeight = tokenMaxHeight;
  }

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

  // ─── Interaction semantics ──────────────────────────────────────────────────

  const interactionDisabled = disabled || !active;

  const resolvedEditable = !interactionDisabled && (editable ?? true);

  const hasError = error != null && error.length > 0;

  // ─── Controlled / uncontrolled content semantics ────────────────────────────

  const isControlled = value !== undefined;

  const [initialIsControlled] = useState(isControlled);

  const initialUncontrolledCount = defaultValue?.length ?? 0;

  const initialUncontrolledHasValue = initialUncontrolledCount > 0;

  const uncontrolledCountRef = useRef(initialUncontrolledCount);

  const uncontrolledHasValueRef = useRef(initialUncontrolledHasValue);

  const [uncontrolledCount, setUncontrolledCount] = useState(
    initialUncontrolledCount,
  );

  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(
    initialUncontrolledHasValue,
  );

  const hasValue = isControlled ? value.length > 0 : uncontrolledHasValue;

  const count = isControlled ? value.length : uncontrolledCount;

  /**
   * When character counting is enabled after being disabled, synchronize the
   * render-time count with the native uncontrolled value mirror.
   *
   * While showCharCount=false, normal typing does not cause count-only React
   * rerenders.
   */
  useEffect(() => {
    if (isControlled || !showCharCount) {
      return;
    }

    setUncontrolledCount(uncontrolledCountRef.current);
  }, [isControlled, showCharCount]);

  // ─── UI-thread semantic motion ───────────────────────────────────────────────

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
    hasValue,
  });

  const {
    backgroundColor,
    borderColor,
    labelColor,
    textColor,
    errorColor,
    placeholderColor,
  } = useFieldAnimatedColors({
    focusedProgress,
    errorProgress,
    disabledProgress,
    inactiveProgress,
    hasValueProgress,
  });

  // ─── Auto-grow height motion ────────────────────────────────────────────────

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.animations),
    [tokens.animations],
  );

  const animatedHeight = useSharedValue(resolvedMinHeight);

  const heightTargetRef = useRef(resolvedMinHeight);

  const lastContentHeightRef = useRef<number | null>(null);

  const fieldVerticalInset = tokens.spacing.xs * 2 + tokens.border.input * 2;

  const resolveFieldHeight = useCallback(
    (contentHeight: number) =>
      Math.min(
        Math.max(contentHeight + fieldVerticalInset, resolvedMinHeight),
        resolvedMaxHeight,
      ),
    [fieldVerticalInset, resolvedMinHeight, resolvedMaxHeight],
  );

  const updateHeight = useCallback(
    (target: number) => {
      if (heightTargetRef.current === target) {
        return;
      }

      heightTargetRef.current = target;

      cancelAnimation(animatedHeight);

      if (prefersReducedMotion) {
        animatedHeight.value = target;

        return;
      }

      animatedHeight.value = withTiming(target, animationConfig);
    },
    [animatedHeight, prefersReducedMotion, animationConfig],
  );

  /**
   * If Reduced Motion is enabled while an auto-grow transition is running,
   * snap immediately to the already-requested height.
   */
  useEffect(() => {
    if (!prefersReducedMotion) {
      return;
    }

    cancelAnimation(animatedHeight);

    animatedHeight.value = heightTargetRef.current;
  }, [animatedHeight, prefersReducedMotion]);

  /**
   * Cancel any active auto-grow transition when InputArea unmounts.
   *
   * Normal replacement/reversal remains owned by updateHeight().
   */
  useEffect(
    () => () => {
      cancelAnimation(animatedHeight);
    },
    [animatedHeight],
  );

  /**
   * Re-clamp the current measured content when min/max configuration changes.
   */
  useEffect(() => {
    const lastContentHeight = lastContentHeightRef.current;

    const target =
      lastContentHeight == null
        ? resolvedMinHeight
        : resolveFieldHeight(lastContentHeight);

    updateHeight(target);
  }, [resolvedMinHeight, resolvedMaxHeight, resolveFieldHeight, updateHeight]);

  const handleContentSizeChange = useCallback(
    (event: TextInputContentSizeChangeEvent) => {
      const contentHeight = Math.max(0, event.nativeEvent.contentSize.height);

      lastContentHeightRef.current = contentHeight;

      updateHeight(resolveFieldHeight(contentHeight));

      onContentSizeChange?.(event);
    },
    [resolveFieldHeight, updateHeight, onContentSizeChange],
  );

  // ─── Static presentation ─────────────────────────────────────────────────────

  const rootLayoutStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xs,
    }),
    [tokens.spacing.xs],
  );

  const fieldLayoutStyle = useMemo<ViewStyle>(
    () => ({
      borderWidth: tokens.border.input,
      borderRadius: tokens.radius.input,

      paddingHorizontal: tokens.spacing.s,
      paddingVertical: tokens.spacing.xs,
    }),
    [
      tokens.border.input,
      tokens.radius.input,
      tokens.spacing.s,
      tokens.spacing.xs,
    ],
  );

  const bottomRowLayoutStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xs,
    }),
    [tokens.spacing.xs],
  );

  const inputTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.inputArea.text).style,
    [tokens.typography.inputArea.text],
  );

  const inputFontSize = tokens.typography.inputArea.text.fontSize;

  // ─── Isolated UI-thread styles / props ──────────────────────────────────────

  const animatedFieldHeightStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  const inputLineHeight = tokens.typography.inputArea.text.lineHeight;

  const animatedInputSizeStyle = useAnimatedStyle(() => ({
    fontSize: inputFontSize * fontScale.value,

    lineHeight:
      inputLineHeight != null ? inputLineHeight * fontScale.value : undefined,
  }));

  const animatedInputColorStyle = useAnimatedStyle(() => ({
    color: textColor.value,
  }));

  const animatedInputProps = useAnimatedProps(() => ({
    placeholderTextColor: placeholderColor.value,
  }));

  // ─── Native focus / blur ─────────────────────────────────────────────────────

  const handleFocusWrapped = useCallback(
    (event: FocusEvent) => {
      setFocused(true);

      onFocus?.(event);
    },
    [setFocused, onFocus],
  );

  const handleBlurWrapped = useCallback(
    (event: BlurEvent) => {
      setFocused(false);

      onBlur?.(event);
    },
    [setFocused, onBlur],
  );

  // ─── Text changes ────────────────────────────────────────────────────────────

  const handleChangeText = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        const nextCount = nextValue.length;
        const nextHasValue = nextCount > 0;

        uncontrolledCountRef.current = nextCount;

        if (uncontrolledHasValueRef.current !== nextHasValue) {
          uncontrolledHasValueRef.current = nextHasValue;

          setUncontrolledHasValue(nextHasValue);
        }

        if (showCharCount) {
          setUncontrolledCount((current) =>
            current === nextCount ? current : nextCount,
          );
        }
      }

      onChangeText?.(nextValue);
    },
    [isControlled, showCharCount, onChangeText],
  );

  // ─── Container interaction ──────────────────────────────────────────────────

  const handleContainerPress = useCallback(() => {
    if (!resolvedEditable) {
      return;
    }

    const input = internalRef.current;

    if (input == null || input.isFocused()) {
      return;
    }

    input.focus();
  }, [resolvedEditable]);

  // ─── Bottom row ──────────────────────────────────────────────────────────────

  const hasBottomRow = hasError || showCharCount;

  /**
   * Preserve the native TextInput controlled/uncontrolled API without allowing
   * ownership to change during one InputArea lifetime.
   */
  if (initialIsControlled !== isControlled) {
    throw new Error(
      "[react-native-arc-ui] InputArea cannot switch between controlled and uncontrolled value ownership after mount. Remount it with a new key instead.",
    );
  }

  return (
    <View testID={testID} style={[styles.container, rootLayoutStyle, style]}>
      {label != null && label.length > 0 && (
        <FieldLabel
          testID={testID ? `${testID}-label` : undefined}
          color={labelColor}
          typography={tokens.typography.inputArea.label}
        >
          {label}
        </FieldLabel>
      )}

      <Pressable accessible={false} onPress={handleContainerPress}>
        <Animated.View
          style={[
            styles.field,
            fieldLayoutStyle,
            animatedFieldHeightStyle,
            animatedBackgroundStyle,
            animatedBorderStyle,
          ]}
        >
          <AnimatedTextInput
            {...textInputProps}
            ref={setRef}
            testID={testID ? `${testID}-input` : undefined}
            value={value}
            defaultValue={defaultValue}
            editable={resolvedEditable}
            maxLength={maxLength}
            multiline
            scrollEnabled
            textAlignVertical="top"
            onChangeText={handleChangeText}
            onContentSizeChange={handleContentSizeChange}
            onFocus={handleFocusWrapped}
            onBlur={handleBlurWrapped}
            animatedProps={animatedInputProps}
            allowFontScaling={false}
            maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityHint={accessibilityHint}
            aria-disabled={interactionDisabled}
            accessibilityState={{
              ...accessibilityState,

              disabled: interactionDisabled,
            }}
            style={[
              inputTypographyStyle,
              inputStyle,
              styles.input,
              animatedInputSizeStyle,
              animatedInputColorStyle,
            ]}
          />
        </Animated.View>
      </Pressable>

      {hasBottomRow && (
        <View style={[styles.bottomRow, bottomRowLayoutStyle]}>
          {hasError ? (
            <FieldError
              testID={testID ? `${testID}-error` : undefined}
              color={errorColor}
              typography={tokens.typography.inputArea.error}
              style={styles.error}
            >
              {error}
            </FieldError>
          ) : (
            <View style={styles.bottomSpacer} />
          )}

          {showCharCount && (
            <FieldCharCount
              testID={testID ? `${testID}-char-count` : undefined}
              count={count}
              maxLength={maxLength}
              color={labelColor}
              typography={tokens.typography.inputArea.error}
            />
          )}
        </View>
      )}
    </View>
  );
};

export const InputArea = memo(InputAreaComponent);

InputArea.displayName = "InputArea";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  field: {
    overflow: "hidden",
  },

  input: {
    flex: 1,
    padding: 0,
    margin: 0,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  error: {
    flex: 1,
  },

  bottomSpacer: {
    flex: 1,
  },
});
