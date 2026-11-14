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
import { resolveThemeColor } from "../../utils/resolveThemeColor";
import { SpinnerLoader } from "../SpinnerLoader/SpinnerLoader";
import { resolveTextContent } from "../../utils/reactNode";
import type { IButton, TButtonTone } from "./types";
import { resolveTypographyStyle } from "../../utils/resolveTypography";

/**
 * iconLeft / iconRight accept arbitrary React nodes, so Button cannot
 * reliably control their colors. Muting the whole icon subtree is the
 * universal fallback for disabled and inactive states.
 */
const MUTED_ICON_OPACITY = 0.3;

const resolveButtonType = (value: string): NonNullable<IButton["type"]> => {
  switch (value) {
    case "solid":
    case "border":
    case "transparent":
      return value;

    default:
      if (__DEV__) {
        console.error(
          `[react-native-arc-ui] Button type "${String(
            value,
          )}" is invalid. Falling back to "solid".`,
        );
      }

      return "solid";
  }
};

const resolveButtonTone = (value: string): TButtonTone => {
  switch (value) {
    case "primary":
    case "secondary":
    case "neutral":
    case "danger":
      return value;

    default:
      if (__DEV__) {
        console.error(
          `[react-native-arc-ui] Button tone "${String(
            value,
          )}" is invalid. Falling back to "primary".`,
        );
      }

      return "primary";
  }
};

const ButtonComponent = ({
  children,
  contentStyle,
  type: typeProp = "solid",
  tone = "primary",
  colors,
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

  const type = resolveButtonType(typeProp);
  const resolvedTone = resolveButtonTone(tone);

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

  // ─── Theme / tone color endpoints ─────────────────────────────────────────

  const lightTone = tokens.colors.light.button[resolvedTone][type];
  const darkTone = tokens.colors.dark.button[resolvedTone][type];

  const resolvedBackgroundDefault = resolveThemeColor(
    colors?.background?.default,
    lightTone.background.primary,
    darkTone.background.primary,
    "Button colors.background.default",
  );
  const resolvedBackgroundPressed = resolveThemeColor(
    colors?.background?.pressed,
    lightTone.background.pressed,
    darkTone.background.pressed,
    "Button colors.background.pressed",
  );
  const resolvedBackgroundDisabled = resolveThemeColor(
    colors?.background?.disabled,
    lightTone.background.disabled,
    darkTone.background.disabled,
    "Button colors.background.disabled",
  );
  const resolvedBackgroundInactive = resolveThemeColor(
    colors?.background?.inactive,
    lightTone.background.inactive,
    darkTone.background.inactive,
    "Button colors.background.inactive",
  );

  const lightBackgroundPrimary = resolvedBackgroundDefault.light;
  const darkBackgroundPrimary = resolvedBackgroundDefault.dark;
  const lightBackgroundPressed = resolvedBackgroundPressed.light;
  const darkBackgroundPressed = resolvedBackgroundPressed.dark;
  const lightBackgroundDisabled = resolvedBackgroundDisabled.light;
  const darkBackgroundDisabled = resolvedBackgroundDisabled.dark;
  const lightBackgroundInactive = resolvedBackgroundInactive.light;
  const darkBackgroundInactive = resolvedBackgroundInactive.dark;

  const resolvedBorderDefault = resolveThemeColor(
    colors?.border?.default,
    lightTone.border.primary,
    darkTone.border.primary,
    "Button colors.border.default",
  );
  const resolvedBorderPressed = resolveThemeColor(
    colors?.border?.pressed,
    lightTone.border.pressed,
    darkTone.border.pressed,
    "Button colors.border.pressed",
  );
  const resolvedBorderDisabled = resolveThemeColor(
    colors?.border?.disabled,
    lightTone.border.disabled,
    darkTone.border.disabled,
    "Button colors.border.disabled",
  );
  const resolvedBorderInactive = resolveThemeColor(
    colors?.border?.inactive,
    lightTone.border.inactive,
    darkTone.border.inactive,
    "Button colors.border.inactive",
  );

  const lightBorderPrimary = resolvedBorderDefault.light;
  const darkBorderPrimary = resolvedBorderDefault.dark;
  const lightBorderPressed = resolvedBorderPressed.light;
  const darkBorderPressed = resolvedBorderPressed.dark;
  const lightBorderDisabled = resolvedBorderDisabled.light;
  const darkBorderDisabled = resolvedBorderDisabled.dark;
  const lightBorderInactive = resolvedBorderInactive.light;
  const darkBorderInactive = resolvedBorderInactive.dark;

  const resolvedTextDefault = resolveThemeColor(
    colors?.text?.default,
    lightTone.text.primary,
    darkTone.text.primary,
    "Button colors.text.default",
  );
  const resolvedTextPressed = resolveThemeColor(
    colors?.text?.pressed,
    lightTone.text.pressed,
    darkTone.text.pressed,
    "Button colors.text.pressed",
  );
  const resolvedTextDisabled = resolveThemeColor(
    colors?.text?.disabled,
    lightTone.text.disabled,
    darkTone.text.disabled,
    "Button colors.text.disabled",
  );
  const resolvedTextInactive = resolveThemeColor(
    colors?.text?.inactive,
    lightTone.text.inactive,
    darkTone.text.inactive,
    "Button colors.text.inactive",
  );

  const lightTextPrimary = resolvedTextDefault.light;
  const darkTextPrimary = resolvedTextDefault.dark;
  const lightTextPressed = resolvedTextPressed.light;
  const darkTextPressed = resolvedTextPressed.dark;
  const lightTextDisabled = resolvedTextDisabled.light;
  const darkTextDisabled = resolvedTextDisabled.dark;
  const lightTextInactive = resolvedTextInactive.light;
  const darkTextInactive = resolvedTextInactive.dark;

  const resolvedLoading = resolveThemeColor(
    colors?.loading,
    lightTone.loading,
    darkTone.loading,
    "Button colors.loading",
  );

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
              colors={{
                indicator: resolvedLoading,
              }}
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
