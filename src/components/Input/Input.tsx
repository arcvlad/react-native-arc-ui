import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type BlurEvent,
  type FocusEvent,
  type GestureResponderEvent,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
} from "react-native-reanimated";

import {
  useARCUIStrings,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { useEnteringExiting } from "../../hooks/useEnteringExiting";
import { FieldError } from "../../internal/field/FieldError";
import { FieldLabel } from "../../internal/field/FieldLabel";
import { useFieldAnimatedColors } from "../../internal/field/useFieldAnimatedColors";
import { useFieldMotion } from "../../internal/field/useFieldMotion";
import { Icon } from "../Icon/Icon";
import { SpinnerLoader } from "../SpinnerLoader/SpinnerLoader";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { IInput, TInputType } from "./types";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const TYPE_PROPS: Record<TInputType, Partial<TextInputProps>> = {
  text: {},

  email: {
    keyboardType: "email-address",
    autoCapitalize: "none",
    autoCorrect: false,
  },

  phone: {
    keyboardType: "phone-pad",
  },

  url: {
    keyboardType: "url",
    autoCapitalize: "none",
    autoCorrect: false,
  },
};

const InputComponent = ({
  ref: externalRef,
  label,
  error,
  disabled = false,
  active = true,
  type = "text",
  iconLeft,
  iconRight,
  rightAction,
  clearable = true,
  loading = false,
  style,
  inputStyle,
  testID,
  value,
  defaultValue,
  editable,
  onChangeText,
  onFocus,
  onBlur,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ...textInputProps
}: IInput) => {
  const { tokens } = useARCUITheme();
  const { fontScale } = useARCUISystem();
  const strings = useARCUIStrings();

  const { entering, exiting } = useEnteringExiting();

  // ─── Public API invariants ─────────────────────────

  if (iconRight != null && rightAction != null) {
    throw new Error(
      "[react-native-arc-ui] Input iconRight and rightAction are mutually exclusive.",
    );
  }

  if (
    rightAction != null &&
    (typeof rightAction.accessibilityLabel !== "string" ||
      rightAction.accessibilityLabel.trim().length === 0)
  ) {
    throw new Error(
      "[react-native-arc-ui] Input rightAction requires a non-empty accessibilityLabel.",
    );
  }

  // ─── Ref ownership ─────────────────────────────────

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

  // ─── Interaction semantics ─────────────────────────

  const interactionDisabled = disabled || !active;

  const resolvedEditable = !interactionDisabled && (editable ?? true);

  const hasError = error != null && error.length > 0;

  // ─── Controlled / uncontrolled value presence ─────

  const isControlled = value !== undefined;

  const [initialIsControlled] = useState(isControlled);

  /**
   * Native TextInput remains the source of truth for uncontrolled
   * text. React only mirrors whether the field is empty.
   */
  const initialUncontrolledHasValue = (defaultValue?.length ?? 0) > 0;

  const uncontrolledHasValueRef = useRef(initialUncontrolledHasValue);

  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(
    initialUncontrolledHasValue,
  );

  const hasValue = isControlled ? value.length > 0 : uncontrolledHasValue;

  // ─── UI-thread semantic motion ─────────────────────

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
    iconColor,
    placeholderColor,
  } = useFieldAnimatedColors({
    focusedProgress,
    errorProgress,
    disabledProgress,
    inactiveProgress,
    hasValueProgress,
  });

  // ─── Isolated UI-thread styles ─────────────────────

  /**
   * Focus invalidates only this style.
   */
  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  /**
   * Disabled/theme changes invalidate this style, but focus does not.
   */
  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  /**
   * Native text color is independent from focus.
   */
  const animatedInputColorStyle = useAnimatedStyle(() => ({
    color: textColor.value,
  }));

  /**
   * Font scaling has its own dependency lifecycle.
   */
  const inputFontSize = tokens.typography.input.text.fontSize;
  const inputLineHeight = tokens.typography.input.text.lineHeight;

  const animatedInputSizeStyle = useAnimatedStyle(() => ({
    fontSize: inputFontSize * fontScale.value,

    lineHeight:
      inputLineHeight != null ? inputLineHeight * fontScale.value : undefined,
  }));

  /**
   * Placeholder color changes only with theme.
   */
  const animatedInputProps = useAnimatedProps(() => ({
    placeholderTextColor: placeholderColor.value,
  }));

  // ─── Static presentation ───────────────────────────

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

      gap: tokens.spacing.xs,

      minHeight: tokens.sizings.input.minHeight,
    }),
    [
      tokens.border.input,
      tokens.radius.input,
      tokens.spacing.s,
      tokens.spacing.xs,
      tokens.sizings.input.minHeight,
    ],
  );

  const inputTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.input.text).style,
    [tokens.typography.input.text],
  );

  // ─── Native focus / blur ───────────────────────────

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

  // ─── Text changes ──────────────────────────────────

  const handleChangeText = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        const nextHasValue = nextValue.length > 0;

        if (uncontrolledHasValueRef.current !== nextHasValue) {
          uncontrolledHasValueRef.current = nextHasValue;

          setUncontrolledHasValue(nextHasValue);
        }
      }

      onChangeText?.(nextValue);
    },
    [isControlled, onChangeText],
  );

  const handleClear = useCallback(() => {
    if (!isControlled) {
      internalRef.current?.clear();

      if (uncontrolledHasValueRef.current) {
        uncontrolledHasValueRef.current = false;

        setUncontrolledHasValue(false);
      }
    }

    onChangeText?.("");
  }, [isControlled, onChangeText]);

  // ─── Container interaction ─────────────────────────

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

  // ─── Trailing actions ──────────────────────────────

  const handleRightActionPress = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();

      rightAction?.onPress();
    },
    [rightAction],
  );

  const handleClearPress = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();

      handleClear();
    },
    [handleClear],
  );

  // ─── Trailing priority ─────────────────────────────

  const showLoading = loading;

  const showRightAction = rightAction != null && !loading;

  const showIconRight = iconRight != null && !loading;

  const showClear =
    clearable &&
    hasValue &&
    !loading &&
    iconRight == null &&
    rightAction == null &&
    resolvedEditable;

  const trailingKey = showLoading
    ? "loading"
    : showRightAction
      ? `action-${rightAction.icon}`
      : showIconRight
        ? `icon-${iconRight}`
        : showClear
          ? "clear"
          : null;

  /**
   * Native TextInput supports both controlled and uncontrolled ownership.
   *
   * ARCUI preserves both native modes, but switching between them during the
   * same component lifetime is not supported because it can expose stale
   * uncontrolled visual state.
   */
  if (initialIsControlled !== isControlled) {
    throw new Error(
      "[react-native-arc-ui] Input cannot switch between controlled and uncontrolled value ownership after mount. Remount it with a new key instead.",
    );
  }

  return (
    <View testID={testID} style={[styles.container, rootLayoutStyle, style]}>
      {label != null && label.length > 0 && (
        <FieldLabel
          testID={testID ? `${testID}-label` : undefined}
          color={labelColor}
        >
          {label}
        </FieldLabel>
      )}

      <Pressable accessible={false} onPress={handleContainerPress}>
        <Animated.View
          style={[
            styles.field,
            fieldLayoutStyle,
            animatedBackgroundStyle,
            animatedBorderStyle,
          ]}
        >
          {iconLeft != null && (
            <View pointerEvents="none">
              <Icon
                testID={testID ? `${testID}-icon-left` : undefined}
                type={iconLeft}
                size={tokens.sizings.icon.s}
                animatedColor={iconColor}
              />
            </View>
          )}

          <AnimatedTextInput
            {...TYPE_PROPS[type]}
            {...textInputProps}
            ref={setRef}
            testID={testID ? `${testID}-input` : undefined}
            value={value}
            defaultValue={defaultValue}
            editable={resolvedEditable}
            multiline={false}
            onChangeText={handleChangeText}
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

              busy: loading || accessibilityState?.busy,
            }}
            style={[
              styles.input,
              inputTypographyStyle,
              inputStyle,
              animatedInputSizeStyle,
              animatedInputColorStyle,
            ]}
          />

          {trailingKey != null && (
            <Animated.View key={trailingKey}>
              {showLoading && (
                <Animated.View
                  entering={entering}
                  exiting={exiting}
                  pointerEvents="none"
                >
                  <SpinnerLoader
                    testID={testID ? `${testID}-loading` : undefined}
                    size={tokens.sizings.icon.s}
                    lightColor={tokens.colors.light.input.icon.primary}
                    darkColor={tokens.colors.dark.input.icon.primary}
                  />
                </Animated.View>
              )}

              {showRightAction && rightAction != null && (
                <Animated.View entering={entering} exiting={exiting}>
                  <Pressable
                    testID={testID ? `${testID}-action` : undefined}
                    onPress={handleRightActionPress}
                    disabled={interactionDisabled}
                    hitSlop={tokens.spacing.xs}
                    role="button"
                    accessibilityRole="button"
                    aria-disabled={interactionDisabled}
                    accessibilityLabel={rightAction.accessibilityLabel}
                    accessibilityHint={rightAction.accessibilityHint}
                    accessibilityState={{
                      disabled: interactionDisabled,
                    }}
                  >
                    <Icon
                      type={rightAction.icon}
                      size={tokens.sizings.icon.s}
                      animatedColor={iconColor}
                    />
                  </Pressable>
                </Animated.View>
              )}

              {showIconRight && iconRight != null && (
                <View pointerEvents="none">
                  <Icon
                    testID={testID ? `${testID}-icon-right` : undefined}
                    type={iconRight}
                    size={tokens.sizings.icon.s}
                    animatedColor={iconColor}
                  />
                </View>
              )}

              {showClear && (
                <Animated.View entering={entering} exiting={exiting}>
                  <Pressable
                    testID={testID ? `${testID}-clear` : undefined}
                    onPress={handleClearPress}
                    hitSlop={tokens.spacing.xs}
                    role="button"
                    accessibilityRole="button"
                    accessibilityLabel={strings.inputClearAccessibilityLabel}
                  >
                    <Icon
                      type="xCircle"
                      size={tokens.sizings.icon.s}
                      lightColor={tokens.colors.light.input.clearButton}
                      darkColor={tokens.colors.dark.input.clearButton}
                    />
                  </Pressable>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>

      {hasError && (
        <FieldError
          testID={testID ? `${testID}-error` : undefined}
          color={errorColor}
        >
          {error}
        </FieldError>
      )}
    </View>
  );
};

export const Input = memo(InputComponent);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  field: {
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
});
