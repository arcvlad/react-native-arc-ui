import { memo, useCallback, useEffect, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  interpolate,
  interpolateColor,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { useEnteringExiting } from "../../hooks/useEnteringExiting";
import { hardwareAcceleration } from "../../utils/platformUtils";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { SpinnerLoader } from "../SpinnerLoader/SpinnerLoader";
import { resolveTextContent } from "../../utils/reactNode";
import type { IButton } from "./types";
import { resolveTypographyStyle } from "../../utils/resolveTypography";

/**
 * iconLeft / iconRight accept arbitrary React nodes, so Button cannot
 * reliably control their colors. Muting the whole icon subtree is the
 * universal fallback for disabled and inactive states.
 */
const MUTED_ICON_OPACITY = 0.3;

const ButtonComponent = ({
  children,
  contentStyle,
  type = "solid",
  radius,
  borderWidth,
  animation,
  active = true,
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  onPress,
  onPressIn,
  onPressOut,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  testID,
  ...pressableProps
}: IButton) => {
  const { tokens } = useARCUITheme();
  const { themeProgress } = useARCUIAnimatedTheme();
  const { fontScale } = useARCUISystem();

  const prefersReducedMotion = useReducedMotion();
  const { entering, exiting } = useEnteringExiting();

  const resolvedAnimation = animation ?? tokens.pressAnimation.type;

  const resolvedRadius = radius ?? tokens.radius.button;

  const resolvedBorderWidth = borderWidth ?? tokens.border.button;

  /**
   * All three states make the native Pressable non-interactive.
   *
   * disabled and inactive retain distinct visual states.
   * loading retains the current visual state and replaces content
   * with loading feedback.
   */
  const isInteractionDisabled = disabled || !active || loading;

  const textContent = useMemo(() => resolveTextContent(children), [children]);

  const isTextContent = textContent !== null;

  const resolvedAccessibilityLabel =
    accessibilityLabel ?? (isTextContent ? textContent : undefined);

  // ─── Animation configuration ──────────────────────────────────────────────

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.animations),
    [tokens.animations],
  );

  const pressAnimationConfig = useMemo(
    () => ({
      duration: tokens.pressAnimation.duration,
    }),
    [tokens.pressAnimation.duration],
  );

  /**
   * Used only for layout changes inside Button:
   *
   * label ↔ icon + label
   * label ↔ label + icon
   *
   * The entire layout tree is owned by Button, so this does not impose
   * any animation contract on consumer-owned siblings or parents.
   */
  const contentLayoutTransition = useMemo(
    () =>
      LinearTransition.duration(animationConfig.duration)
        .easing(animationConfig.easing)
        .reduceMotion(ReduceMotion.System),
    [animationConfig.duration, animationConfig.easing],
  );

  // ─── Static token styles ──────────────────────────────────────────────────

  const containerGeometryStyle = useMemo<ViewStyle>(
    () => ({
      borderRadius: resolvedRadius,
      borderWidth: resolvedBorderWidth,
    }),
    [resolvedRadius, resolvedBorderWidth],
  );

  const contentTokenStyle = useMemo<ViewStyle>(
    () => ({
      minHeight: tokens.sizings.button.minHeight,
      paddingVertical: tokens.spacing.s,
      paddingHorizontal: tokens.spacing.l,
      gap: tokens.spacing.xxs,
    }),
    [
      tokens.sizings.button.minHeight,
      tokens.spacing.s,
      tokens.spacing.l,
      tokens.spacing.xxs,
    ],
  );

  /**
   * ARCUI-managed scalable metrics are separated from native static
   * typography so design-system TextStyle properties can pass through.
   */
  const {
    fontSize: labelFontSize,
    lineHeight: labelLineHeight,
    style: labelTypographyStyle,
  } = resolveTypographyStyle(tokens.typography.button.label);

  // ─── Theme token values ───────────────────────────────────────────────────

  const lightBackgroundPrimary =
    tokens.colors.light.button[type].background.primary;
  const lightBackgroundPressed =
    tokens.colors.light.button[type].background.pressed;
  const lightBackgroundDisabled =
    tokens.colors.light.button[type].background.disabled;
  const lightBackgroundInactive =
    tokens.colors.light.button[type].background.inactive;

  const darkBackgroundPrimary =
    tokens.colors.dark.button[type].background.primary;
  const darkBackgroundPressed =
    tokens.colors.dark.button[type].background.pressed;
  const darkBackgroundDisabled =
    tokens.colors.dark.button[type].background.disabled;
  const darkBackgroundInactive =
    tokens.colors.dark.button[type].background.inactive;

  const lightBorderPrimary = tokens.colors.light.button[type].border.primary;
  const lightBorderPressed = tokens.colors.light.button[type].border.pressed;
  const lightBorderDisabled = tokens.colors.light.button[type].border.disabled;
  const lightBorderInactive = tokens.colors.light.button[type].border.inactive;

  const darkBorderPrimary = tokens.colors.dark.button[type].border.primary;
  const darkBorderPressed = tokens.colors.dark.button[type].border.pressed;
  const darkBorderDisabled = tokens.colors.dark.button[type].border.disabled;
  const darkBorderInactive = tokens.colors.dark.button[type].border.inactive;

  const lightTextPrimary = tokens.colors.light.button[type].text.primary;
  const lightTextPressed = tokens.colors.light.button[type].text.pressed;
  const lightTextDisabled = tokens.colors.light.button[type].text.disabled;
  const lightTextInactive = tokens.colors.light.button[type].text.inactive;

  const darkTextPrimary = tokens.colors.dark.button[type].text.primary;
  const darkTextPressed = tokens.colors.dark.button[type].text.pressed;
  const darkTextDisabled = tokens.colors.dark.button[type].text.disabled;
  const darkTextInactive = tokens.colors.dark.button[type].text.inactive;

  // ─── Semantic animated state ──────────────────────────────────────────────

  /**
   * Independent semantic progress values avoid animating through unrelated
   * numeric enum states.
   */
  const pressProgress = useSharedValue(0);

  const disabledProgress = useSharedValue(disabled ? 1 : 0);

  const inactiveProgress = useSharedValue(!disabled && !active ? 1 : 0);

  const loadingProgress = useSharedValue(loading ? 1 : 0);

  const scale = useSharedValue(1);

  /**
   * State priority:
   *
   * disabled > inactive > pressed > primary
   *
   * Each semantic state owns its own progress value.
   */
  useEffect(() => {
    const disabledTarget = disabled ? 1 : 0;
    const inactiveTarget = !disabled && !active ? 1 : 0;

    cancelAnimation(disabledProgress);
    cancelAnimation(inactiveProgress);

    if (prefersReducedMotion) {
      disabledProgress.value = disabledTarget;
      inactiveProgress.value = inactiveTarget;

      return;
    }

    disabledProgress.value = withTiming(disabledTarget, animationConfig);

    inactiveProgress.value = withTiming(inactiveTarget, animationConfig);
  }, [
    disabled,
    active,
    prefersReducedMotion,
    disabledProgress,
    inactiveProgress,
    animationConfig,
  ]);

  /**
   * If interaction becomes unavailable, or the configured press animation
   * changes, immediately clear any press state that may still be active.
   */
  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(pressProgress);

    scale.value = 1;
    pressProgress.value = 0;
  }, [isInteractionDisabled, resolvedAnimation, scale, pressProgress]);

  useEffect(() => {
    cancelAnimation(loadingProgress);

    if (prefersReducedMotion) {
      loadingProgress.value = loading ? 1 : 0;
      return;
    }

    loadingProgress.value = withTiming(loading ? 1 : 0, animationConfig);
  }, [loading, prefersReducedMotion, loadingProgress, animationConfig]);

  // ─── Colors ───────────────────────────────────────────────────────────────

  const stateColors = useDerivedValue(() => {
    /**
     * Background
     */
    const lightPressedBackground = interpolateColor(
      pressProgress.value,
      [0, 1],
      [lightBackgroundPrimary, lightBackgroundPressed],
    );

    const lightInactiveBackground = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [lightPressedBackground, lightBackgroundInactive],
    );

    const lightBackground = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightInactiveBackground, lightBackgroundDisabled],
    );

    const darkPressedBackground = interpolateColor(
      pressProgress.value,
      [0, 1],
      [darkBackgroundPrimary, darkBackgroundPressed],
    );

    const darkInactiveBackground = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [darkPressedBackground, darkBackgroundInactive],
    );

    const darkBackground = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkInactiveBackground, darkBackgroundDisabled],
    );

    /**
     * Border
     */
    const lightPressedBorder = interpolateColor(
      pressProgress.value,
      [0, 1],
      [lightBorderPrimary, lightBorderPressed],
    );

    const lightInactiveBorder = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [lightPressedBorder, lightBorderInactive],
    );

    const lightBorder = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightInactiveBorder, lightBorderDisabled],
    );

    const darkPressedBorder = interpolateColor(
      pressProgress.value,
      [0, 1],
      [darkBorderPrimary, darkBorderPressed],
    );

    const darkInactiveBorder = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [darkPressedBorder, darkBorderInactive],
    );

    const darkBorder = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkInactiveBorder, darkBorderDisabled],
    );

    /**
     * Text
     */
    const lightPressedText = interpolateColor(
      pressProgress.value,
      [0, 1],
      [lightTextPrimary, lightTextPressed],
    );

    const lightInactiveText = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [lightPressedText, lightTextInactive],
    );

    const lightText = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightInactiveText, lightTextDisabled],
    );

    const darkPressedText = interpolateColor(
      pressProgress.value,
      [0, 1],
      [darkTextPrimary, darkTextPressed],
    );

    const darkInactiveText = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [darkPressedText, darkTextInactive],
    );

    const darkText = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkInactiveText, darkTextDisabled],
    );

    return {
      background: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkBackground, lightBackground],
      ),

      border: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkBorder, lightBorder],
      ),

      text: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkText, lightText],
      ),
    };
  });

  // ─── Animated styles ──────────────────────────────────────────────────────

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: stateColors.value.background,
    borderColor: stateColors.value.border,
  }));

  const animatedTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: labelFontSize * fontScale.value,

    lineHeight:
      labelLineHeight != null ? labelLineHeight * fontScale.value : undefined,
  }));

  const animatedTextColorStyle = useAnimatedStyle(() => ({
    color: stateColors.value.text,
  }));

  /**
   * Intentional opacity exception:
   *
   * iconLeft / iconRight may contain any React node, so their internal
   * color cannot be controlled safely by Button.
   */
  const animatedIconStyle = useAnimatedStyle(() => {
    const inactiveOpacity = interpolate(
      inactiveProgress.value,
      [0, 1],
      [1, MUTED_ICON_OPACITY],
    );

    return {
      opacity: interpolate(
        disabledProgress.value,
        [0, 1],
        [inactiveOpacity, MUTED_ICON_OPACITY],
      ),
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(loadingProgress.value, [0, 1], [1, 0]),
  }));

  // ─── Interaction ──────────────────────────────────────────────────────────

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      /**
       * Pressable.disabled is the primary interaction guard.
       * This remains as a defensive invariant if state changes during
       * the native press lifecycle.
       */
      if (isInteractionDisabled) {
        return;
      }

      onPress?.(event);
    },
    [isInteractionDisabled, onPress],
  );

  const handleOnPressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (isInteractionDisabled) {
        return;
      }

      onPressIn?.(event);

      if (resolvedAnimation === "none") {
        return;
      }

      /**
       * Reduced motion disables scale movement.
       *
       * Scale-based press modes fall back to an instant pressed-color
       * state so the user still receives interaction feedback.
       */
      if (prefersReducedMotion) {
        cancelAnimation(pressProgress);
        pressProgress.value = 1;

        return;
      }

      if (resolvedAnimation === "scaleUp") {
        cancelAnimation(scale);

        scale.value = withTiming(
          tokens.pressAnimation.scaleUpValue,
          pressAnimationConfig,
        );

        return;
      }

      if (resolvedAnimation === "scaleDown") {
        cancelAnimation(scale);

        scale.value = withTiming(
          tokens.pressAnimation.scaleDownValue,
          pressAnimationConfig,
        );

        return;
      }

      if (resolvedAnimation === "highlight") {
        cancelAnimation(pressProgress);

        pressProgress.value = withTiming(1, pressAnimationConfig);
      }
    },
    [
      isInteractionDisabled,
      onPressIn,
      resolvedAnimation,
      prefersReducedMotion,
      pressProgress,
      scale,
      tokens.pressAnimation.scaleUpValue,
      tokens.pressAnimation.scaleDownValue,
      pressAnimationConfig,
    ],
  );

  const handleOnPressOut = useCallback(
    (event: GestureResponderEvent) => {
      /**
       * Always restore internal visual state when RN completes a press.
       */
      cancelAnimation(scale);
      cancelAnimation(pressProgress);

      if (prefersReducedMotion) {
        scale.value = 1;
        pressProgress.value = 0;
      } else {
        if (
          resolvedAnimation === "scaleUp" ||
          resolvedAnimation === "scaleDown"
        ) {
          scale.value = withTiming(1, pressAnimationConfig);
        } else {
          scale.value = 1;
        }

        if (resolvedAnimation === "highlight") {
          pressProgress.value = withTiming(0, pressAnimationConfig);
        } else {
          pressProgress.value = 0;
        }
      }

      /**
       * If onPressIn was delivered, its matching onPressOut should still be
       * allowed even if state changed while the pointer was held down.
       */
      onPressOut?.(event);
    },
    [
      onPressOut,
      resolvedAnimation,
      prefersReducedMotion,
      scale,
      pressProgress,
      pressAnimationConfig,
    ],
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Pressable
      {...pressableProps}
      testID={testID}
      disabled={isInteractionDisabled}
      role="button"
      accessibilityRole="button"
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      aria-disabled={isInteractionDisabled}
      aria-busy={loading || accessibilityState?.busy}
      accessibilityState={{
        ...accessibilityState,
        disabled: isInteractionDisabled,
        busy: loading || accessibilityState?.busy,
      }}
      onPress={handleOnPress}
      onPressIn={handleOnPressIn}
      onPressOut={handleOnPressOut}
    >
      <Animated.View
        {...hardwareAcceleration}
        style={[containerGeometryStyle, animatedContainerStyle]}
      >
        <Animated.View
          layout={contentLayoutTransition}
          style={[
            styles.content,
            contentTokenStyle,
            contentStyle,
            animatedContentStyle,
          ]}
        >
          {iconLeft != null && (
            <Animated.View
              layout={contentLayoutTransition}
              entering={entering}
              exiting={exiting}
              style={styles.icon}
            >
              {/*
               * Separate wrapper prevents the entering/exiting opacity
               * animation from competing with disabled/inactive opacity.
               */}
              <Animated.View style={animatedIconStyle}>
                {iconLeft}
              </Animated.View>
            </Animated.View>
          )}

          {isTextContent ? (
            <Animated.View
              layout={contentLayoutTransition}
              style={styles.labelWrapper}
            >
              <Animated.Text
                testID={testID ? `${testID}-label` : undefined}
                allowFontScaling={false}
                maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
                style={[
                  styles.label,
                  labelTypographyStyle,
                  animatedTextSizeStyle,
                  animatedTextColorStyle,
                ]}
              >
                {textContent}
              </Animated.Text>
            </Animated.View>
          ) : (
            <Animated.View
              layout={contentLayoutTransition}
              style={styles.customContent}
            >
              {children}
            </Animated.View>
          )}

          {iconRight != null && (
            <Animated.View
              layout={contentLayoutTransition}
              entering={entering}
              exiting={exiting}
              style={styles.icon}
            >
              <Animated.View style={animatedIconStyle}>
                {iconRight}
              </Animated.View>
            </Animated.View>
          )}
        </Animated.View>

        {loading && (
          <Animated.View
            testID={testID ? `${testID}-loading` : undefined}
            pointerEvents="none"
            entering={entering}
            exiting={exiting}
            style={styles.loadingOverlay}
          >
            <SpinnerLoader
              darkColor={tokens.colors.dark.button[type].loading}
              lightColor={tokens.colors.light.button[type].loading}
            />
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
};

export const Button = memo(ButtonComponent);

Button.displayName = "Button";

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  labelWrapper: {
    flexShrink: 1,
  },

  label: {
    textAlign: "center",
  },

  customContent: {
    flexShrink: 1,
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
