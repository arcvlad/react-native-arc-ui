import { memo, useCallback, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { useEnteringExiting } from "../../hooks/useEnteringExiting";
import { useSelectionMotion } from "../../internal/selection/useSelectionMotion";
import { useSelectionPress } from "../../internal/selection/useSelectionPress";
import { useSelectionState } from "../../internal/selection/useSelectionState";
import { isFiniteNumber } from "../../utils/numberUtils";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { resolveTextContent } from "../../utils/reactNode";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import { Icon } from "../Icon/Icon";
import type { IToggle } from "./types";

const assertValidTokenGeometry = (
  width: number,
  height: number,
  thumbSize: number,
  borderWidth: number,
): void => {
  if (!isFiniteNumber(width) || width <= 0) {
    throw new Error(
      "[react-native-arc-ui] tokens.sizings.toggle.width must be a finite number greater than 0.",
    );
  }

  if (!isFiniteNumber(height) || height <= 0) {
    throw new Error(
      "[react-native-arc-ui] tokens.sizings.toggle.height must be a finite number greater than 0.",
    );
  }

  if (!isFiniteNumber(thumbSize) || thumbSize <= 0) {
    throw new Error(
      "[react-native-arc-ui] tokens.sizings.toggle.thumbSize must be a finite number greater than 0.",
    );
  }

  if (!isFiniteNumber(borderWidth) || borderWidth < 0) {
    throw new Error(
      "[react-native-arc-ui] tokens.border.toggle must be a finite non-negative number.",
    );
  }

  if (width <= height) {
    throw new Error(
      "[react-native-arc-ui] Toggle token geometry requires tokens.sizings.toggle.width to be greater than tokens.sizings.toggle.height.",
    );
  }

  if (thumbSize >= height) {
    throw new Error(
      "[react-native-arc-ui] Toggle token geometry requires tokens.sizings.toggle.thumbSize to be smaller than tokens.sizings.toggle.height.",
    );
  }

  const innerTrackHeight = height - borderWidth * 2;

  if (innerTrackHeight <= 0) {
    throw new Error(
      "[react-native-arc-ui] Toggle token geometry requires tokens.border.toggle to leave positive inner track height.",
    );
  }

  if (thumbSize > innerTrackHeight) {
    throw new Error(
      "[react-native-arc-ui] Toggle token geometry requires tokens.sizings.toggle.thumbSize to fit inside the track after tokens.border.toggle is applied.",
    );
  }
};

const ToggleComponent = ({
  children,
  value,
  checked,
  onCheckedChange,
  animation,
  active = true,
  disabled,
  width,
  height,
  thumbSize,
  error,
  textStyle,
  style,
  onPress,
  onPressIn,
  onPressOut,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  testID,
  ...pressableProps
}: IToggle) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale } = useARCUISystem();

  const { entering, exiting } = useEnteringExiting();

  // ─── Native prop normalization ───────────────────────────────────────────

  /**
   * React Native PressableProps allows:
   *
   * boolean | null | undefined
   *
   * ARCUI selection infrastructure operates on strict boolean
   * semantics.
   */
  const resolvedDisabled = disabled === true;

  const isInteractionDisabled = resolvedDisabled || !active;

  // ─── Selection ownership ─────────────────────────────────────────────────

  const { resolvedChecked, toggleChecked } = useSelectionState({
    componentName: "Toggle",

    checked,

    onCheckedChange,

    value,

    /**
     * Toggle can represent:
     *
     * - a standalone controlled boolean;
     * - one option inside a single SelectionGroup;
     * - one independent option inside a multiple SelectionGroup.
     */
    groupPolicy: "any",
  });

  // ─── Resolved props ──────────────────────────────────────────────────────

  const resolvedAnimation = animation ?? tokens.pressAnimation.type;

  const defaultWidth = tokens.sizings.toggle.width;

  const defaultHeight = tokens.sizings.toggle.height;

  const defaultThumbSize = tokens.sizings.toggle.thumbSize;

  const resolvedBorderWidth = tokens.border.toggle;

  /**
   * Design-system geometry is an architecture invariant.
   *
   * Consumer geometry can safely fall back to these values only when the
   * configured Toggle geometry itself is valid.
   */
  assertValidTokenGeometry(
    defaultWidth,
    defaultHeight,
    defaultThumbSize,
    resolvedBorderWidth,
  );

  /**
   * width / height / thumbSize are cosmetic per-instance overrides.
   *
   * Invalid runtime values therefore degrade to the configured Toggle
   * geometry instead of crashing the application.
   */
  const requestedWidth = width ?? defaultWidth;

  const requestedHeight = height ?? defaultHeight;

  const requestedThumbSize = thumbSize ?? defaultThumbSize;

  let geometryError: string | null = null;

  if (!isFiniteNumber(requestedWidth) || requestedWidth <= 0) {
    geometryError = "width must be a finite number greater than 0.";
  } else if (!isFiniteNumber(requestedHeight) || requestedHeight <= 0) {
    geometryError = "height must be a finite number greater than 0.";
  } else if (!isFiniteNumber(requestedThumbSize) || requestedThumbSize <= 0) {
    geometryError = "thumbSize must be a finite number greater than 0.";
  } else if (requestedWidth <= requestedHeight) {
    geometryError = "width must be greater than height.";
  } else if (requestedThumbSize >= requestedHeight) {
    geometryError = "thumbSize must be smaller than height.";
  } else {
    const requestedInnerTrackHeight = requestedHeight - resolvedBorderWidth * 2;

    if (
      requestedInnerTrackHeight <= 0 ||
      requestedThumbSize > requestedInnerTrackHeight
    ) {
      geometryError =
        "thumbSize must fit inside the track after the configured border width is applied.";
    }
  }

  if (__DEV__ && geometryError !== null) {
    console.error(
      `[react-native-arc-ui] <Toggle> — invalid geometry. ${geometryError} Falling back to tokens.sizings.toggle.`,
    );
  }

  const useDefaultGeometry = geometryError !== null;

  const resolvedWidth = useDefaultGeometry ? defaultWidth : requestedWidth;

  const resolvedHeight = useDefaultGeometry ? defaultHeight : requestedHeight;

  const resolvedThumbSize = useDefaultGeometry
    ? defaultThumbSize
    : requestedThumbSize;

  const innerTrackWidth = resolvedWidth - resolvedBorderWidth * 2;

  const innerTrackHeight = resolvedHeight - resolvedBorderWidth * 2;

  /**
   * Thumb is centered inside the track's inner content box.
   *
   * Border belongs to the outer track geometry and must not be counted
   * again by absolute child positioning.
   */
  const thumbInset = (innerTrackHeight - resolvedThumbSize) / 2;

  /**
   * Horizontal distance between unchecked and checked positions.
   */
  const thumbTravel = innerTrackWidth - resolvedThumbSize - thumbInset * 2;

  const hasError = error != null && error.length > 0;

  // ─── Content / accessibility fallback ────────────────────────────────────

  const hasContent =
    children !== null &&
    children !== undefined &&
    typeof children !== "boolean";

  const textContent = useMemo(
    () => (hasContent ? resolveTextContent(children) : null),
    [children, hasContent],
  );

  const isTextContent = textContent !== null;

  const resolvedAccessibilityLabel =
    accessibilityLabel ??
    (isTextContent && textContent.length > 0 ? textContent : undefined);

  // ─── Animation configuration ─────────────────────────────────────────────

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.toggleAnimations, tokens.animations),
    [tokens.toggleAnimations, tokens.animations],
  );

  // ─── Shared semantic motion ──────────────────────────────────────────────

  const {
    checkedProgress,
    disabledProgress,
    inactiveProgress,
    errorProgress,
    prefersReducedMotion,
  } = useSelectionMotion({
    checked: resolvedChecked,

    disabled: resolvedDisabled,

    inactive: !active,

    hasError,

    animationConfig,
  });

  // ─── Shared press lifecycle ──────────────────────────────────────────────

  const { pressProgress, scale, handlePressIn, handlePressOut } =
    useSelectionPress({
      interactionDisabled: isInteractionDisabled,

      animation: resolvedAnimation,

      duration: tokens.pressAnimation.duration,

      scaleUpValue: tokens.pressAnimation.scaleUpValue,

      scaleDownValue: tokens.pressAnimation.scaleDownValue,

      prefersReducedMotion,

      onPressIn,
      onPressOut,
    });

  // ─── Static token styles ─────────────────────────────────────────────────

  const rowTokenStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xs,
    }),
    [tokens.spacing.xs],
  );

  const errorRowTokenStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xxs,

      paddingTop: tokens.spacing.xxs,
    }),
    [tokens.spacing.xxs],
  );

  const labelTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.toggle.text).style,
    [tokens.typography.toggle.text],
  );

  const errorTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.toggle.error).style,
    [tokens.typography.toggle.error],
  );

  const labelFontSize = tokens.typography.toggle.text.fontSize;

  const errorFontSize = tokens.typography.toggle.error.fontSize;

  // ─── Theme token extraction ──────────────────────────────────────────────

  const lightTrackBorderPrimary =
    tokens.colors.light.toggle.track.border.primary;

  const lightTrackBorderPressed =
    tokens.colors.light.toggle.track.border.pressed;

  const lightTrackBorderDisabled =
    tokens.colors.light.toggle.track.border.disabled;

  const lightTrackBorderInactive =
    tokens.colors.light.toggle.track.border.inactive;

  const darkTrackBorderPrimary = tokens.colors.dark.toggle.track.border.primary;

  const darkTrackBorderPressed = tokens.colors.dark.toggle.track.border.pressed;

  const darkTrackBorderDisabled =
    tokens.colors.dark.toggle.track.border.disabled;

  const darkTrackBorderInactive =
    tokens.colors.dark.toggle.track.border.inactive;

  const lightTrackBackgroundPrimary =
    tokens.colors.light.toggle.track.background.primary;

  const lightTrackBackgroundPressed =
    tokens.colors.light.toggle.track.background.pressed;

  const lightTrackBackgroundDisabled =
    tokens.colors.light.toggle.track.background.disabled;

  const lightTrackBackgroundInactive =
    tokens.colors.light.toggle.track.background.inactive;

  const darkTrackBackgroundPrimary =
    tokens.colors.dark.toggle.track.background.primary;

  const darkTrackBackgroundPressed =
    tokens.colors.dark.toggle.track.background.pressed;

  const darkTrackBackgroundDisabled =
    tokens.colors.dark.toggle.track.background.disabled;

  const darkTrackBackgroundInactive =
    tokens.colors.dark.toggle.track.background.inactive;

  const lightThumbUnchecked = tokens.colors.light.toggle.thumb.unchecked;

  const lightThumbChecked = tokens.colors.light.toggle.thumb.checked;

  const lightThumbPressedUnchecked =
    tokens.colors.light.toggle.thumb.pressedUnchecked;

  const lightThumbPressedChecked =
    tokens.colors.light.toggle.thumb.pressedChecked;

  const lightThumbDisabledUnchecked =
    tokens.colors.light.toggle.thumb.disabledUnchecked;

  const lightThumbDisabledChecked =
    tokens.colors.light.toggle.thumb.disabledChecked;

  const lightThumbInactiveUnchecked =
    tokens.colors.light.toggle.thumb.inactiveUnchecked;

  const lightThumbInactiveChecked =
    tokens.colors.light.toggle.thumb.inactiveChecked;

  const darkThumbUnchecked = tokens.colors.dark.toggle.thumb.unchecked;

  const darkThumbChecked = tokens.colors.dark.toggle.thumb.checked;

  const darkThumbPressedUnchecked =
    tokens.colors.dark.toggle.thumb.pressedUnchecked;

  const darkThumbPressedChecked =
    tokens.colors.dark.toggle.thumb.pressedChecked;

  const darkThumbDisabledUnchecked =
    tokens.colors.dark.toggle.thumb.disabledUnchecked;

  const darkThumbDisabledChecked =
    tokens.colors.dark.toggle.thumb.disabledChecked;

  const darkThumbInactiveUnchecked =
    tokens.colors.dark.toggle.thumb.inactiveUnchecked;

  const darkThumbInactiveChecked =
    tokens.colors.dark.toggle.thumb.inactiveChecked;

  const lightTextPrimary = tokens.colors.light.toggle.text.primary;

  const lightTextDisabled = tokens.colors.light.toggle.text.disabled;

  const lightTextInactive = tokens.colors.light.toggle.text.inactive;

  const darkTextPrimary = tokens.colors.dark.toggle.text.primary;

  const darkTextDisabled = tokens.colors.dark.toggle.text.disabled;

  const darkTextInactive = tokens.colors.dark.toggle.text.inactive;

  const lightError = tokens.colors.light.states.danger;

  const darkError = tokens.colors.dark.states.danger;

  // ─── Toggle-owned visual resolution ──────────────────────────────────────

  /**
   * Shared selection infrastructure supplies semantic progress values.
   *
   * Toggle owns how those values are rendered:
   *
   * disabled
   * ↓
   * inactive
   * ↓
   * error
   * ↓
   * pressed
   * ↓
   * normal
   *
   * Animated styles are split by visual element and meaningful dependency
   * lifecycle. This keeps checked thumb motion independent from unrelated
   * track/label calculations while preserving the shared selection model.
   */

  /**
   * Track and textual/custom content use the same press scale SharedValue.
   *
   * Reanimated 3+ supports sharing one animated style across animated
   * components, so no duplicate scale mapper is required here.
   */
  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  // ─── Track ────────────────────────────────────────────────────────────────

  const animatedTrackGeometryStyle = useAnimatedStyle(() => {
    const scaledWidth = resolvedWidth * fontScale.value;

    const scaledHeight = resolvedHeight * fontScale.value;

    return {
      width: scaledWidth,

      height: scaledHeight,

      borderRadius: scaledHeight / 2,

      borderWidth: resolvedBorderWidth * fontScale.value,
    };
  });

  const animatedTrackColorStyle = useAnimatedStyle(() => {
    // Border: pressed → error → inactive → disabled.

    const lightPressedBorder = interpolateColor(
      pressProgress.value,
      [0, 1],
      [lightTrackBorderPrimary, lightTrackBorderPressed],
    );

    const lightErrorBorder = interpolateColor(
      errorProgress.value,
      [0, 1],
      [lightPressedBorder, lightError],
    );

    const lightInactiveBorder = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [lightErrorBorder, lightTrackBorderInactive],
    );

    const lightBorder = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightInactiveBorder, lightTrackBorderDisabled],
    );

    const darkPressedBorder = interpolateColor(
      pressProgress.value,
      [0, 1],
      [darkTrackBorderPrimary, darkTrackBorderPressed],
    );

    const darkErrorBorder = interpolateColor(
      errorProgress.value,
      [0, 1],
      [darkPressedBorder, darkError],
    );

    const darkInactiveBorder = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [darkErrorBorder, darkTrackBorderInactive],
    );

    const darkBorder = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkInactiveBorder, darkTrackBorderDisabled],
    );

    /**
     * Current ARCUI defaults are transparent in every state, but the full
     * semantic chain remains intentional so custom themes can provide
     * state-specific track backgrounds without changing Toggle.tsx.
     */
    const lightPressedBackground = interpolateColor(
      pressProgress.value,
      [0, 1],
      [lightTrackBackgroundPrimary, lightTrackBackgroundPressed],
    );

    const lightInactiveBackground = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [lightPressedBackground, lightTrackBackgroundInactive],
    );

    const lightBackground = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightInactiveBackground, lightTrackBackgroundDisabled],
    );

    const darkPressedBackground = interpolateColor(
      pressProgress.value,
      [0, 1],
      [darkTrackBackgroundPrimary, darkTrackBackgroundPressed],
    );

    const darkInactiveBackground = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [darkPressedBackground, darkTrackBackgroundInactive],
    );

    const darkBackground = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkInactiveBackground, darkTrackBackgroundDisabled],
    );

    return {
      borderColor: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkBorder, lightBorder],
      ),

      backgroundColor: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkBackground, lightBackground],
      ),
    };
  });

  // ─── Thumb ────────────────────────────────────────────────────────────────

  /**
   * Geometry depends only on checked progress + ARCUI font scale.
   *
   * Press/theme/modifier color changes therefore do not re-run thumb layout
   * calculations.
   */
  const animatedThumbGeometryStyle = useAnimatedStyle(() => {
    const scaledThumbSize = resolvedThumbSize * fontScale.value;

    const scaledInset = thumbInset * fontScale.value;

    const translateX = checkedProgress.value * thumbTravel * fontScale.value;

    return {
      position: "absolute",

      left: scaledInset,

      top: scaledInset,

      width: scaledThumbSize,

      height: scaledThumbSize,

      borderRadius: scaledThumbSize / 2,

      transform: [
        {
          translateX,
        },
      ],
    };
  });

  const animatedThumbColorStyle = useAnimatedStyle(() => {
    const lightThumbBase = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [lightThumbUnchecked, lightThumbChecked],
    );

    const lightThumbPressedTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [lightThumbPressedUnchecked, lightThumbPressedChecked],
    );

    const lightPressedThumb = interpolateColor(
      pressProgress.value,
      [0, 1],
      [lightThumbBase, lightThumbPressedTarget],
    );

    const lightThumbInactiveTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [lightThumbInactiveUnchecked, lightThumbInactiveChecked],
    );

    const lightInactiveThumb = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [lightPressedThumb, lightThumbInactiveTarget],
    );

    const lightThumbDisabledTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [lightThumbDisabledUnchecked, lightThumbDisabledChecked],
    );

    const lightThumb = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightInactiveThumb, lightThumbDisabledTarget],
    );

    const darkThumbBase = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [darkThumbUnchecked, darkThumbChecked],
    );

    const darkThumbPressedTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [darkThumbPressedUnchecked, darkThumbPressedChecked],
    );

    const darkPressedThumb = interpolateColor(
      pressProgress.value,
      [0, 1],
      [darkThumbBase, darkThumbPressedTarget],
    );

    const darkThumbInactiveTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [darkThumbInactiveUnchecked, darkThumbInactiveChecked],
    );

    const darkInactiveThumb = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [darkPressedThumb, darkThumbInactiveTarget],
    );

    const darkThumbDisabledTarget = interpolateColor(
      checkedProgress.value,
      [0, 1],
      [darkThumbDisabledUnchecked, darkThumbDisabledChecked],
    );

    const darkThumb = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkInactiveThumb, darkThumbDisabledTarget],
    );

    return {
      backgroundColor: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkThumb, lightThumb],
      ),
    };
  });

  // ─── Label ────────────────────────────────────────────────────────────────

  const labelLineHeight = tokens.typography.toggle.text.lineHeight;

  const animatedTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: labelFontSize * fontScale.value,

    lineHeight:
      labelLineHeight != null ? labelLineHeight * fontScale.value : undefined,
  }));

  const animatedTextColorStyle = useAnimatedStyle(() => {
    const lightInactiveText = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [lightTextPrimary, lightTextInactive],
    );

    const lightText = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightInactiveText, lightTextDisabled],
    );

    const darkInactiveText = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [darkTextPrimary, darkTextInactive],
    );

    const darkText = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkInactiveText, darkTextDisabled],
    );

    return {
      color: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkText, lightText],
      ),
    };
  });

  // ─── Error ────────────────────────────────────────────────────────────────

  const errorLineHeight = tokens.typography.toggle.error.lineHeight;

  const animatedErrorTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: errorFontSize * fontScale.value,

    lineHeight:
      errorLineHeight != null ? errorLineHeight * fontScale.value : undefined,
  }));

  const animatedErrorTextColorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkError, lightError],
    ),
  }));

  // ─── Selection interaction ───────────────────────────────────────────────

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      if (isInteractionDisabled) {
        return;
      }

      toggleChecked();

      onPress?.(event);
    },
    [isInteractionDisabled, toggleChecked, onPress],
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <Pressable
      {...pressableProps}
      testID={testID}
      style={style}
      disabled={isInteractionDisabled}
      role="switch"
      accessibilityRole="switch"
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      aria-checked={resolvedChecked}
      aria-disabled={isInteractionDisabled}
      accessibilityState={{
        ...accessibilityState,

        checked: resolvedChecked,

        disabled: isInteractionDisabled,
      }}
      onPress={handleOnPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.toggleContainer, rowTokenStyle]}>
        <Animated.View
          testID={testID ? `${testID}-track` : undefined}
          style={[
            styles.track,
            animatedTrackGeometryStyle,
            animatedTrackColorStyle,
            animatedScaleStyle,
          ]}
        >
          <Animated.View
            testID={testID ? `${testID}-thumb` : undefined}
            style={[animatedThumbGeometryStyle, animatedThumbColorStyle]}
          />
        </Animated.View>

        {hasContent &&
          (isTextContent ? (
            <Animated.Text
              testID={testID ? `${testID}-label` : undefined}
              allowFontScaling={false}
              maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
              style={[
                styles.text,
                labelTypographyStyle,
                animatedTextSizeStyle,
                animatedTextColorStyle,
                animatedScaleStyle,
                textStyle,
              ]}
            >
              {textContent}
            </Animated.Text>
          ) : (
            <Animated.View style={[styles.customContent, animatedScaleStyle]}>
              {children}
            </Animated.View>
          ))}
      </Animated.View>

      {hasError && (
        <Animated.View
          testID={testID ? `${testID}-error-row` : undefined}
          entering={entering}
          exiting={exiting}
          accessible
          role="alert"
          accessibilityRole="alert"
          accessibilityLabel={error}
          accessibilityLiveRegion="polite"
          style={[styles.errorContainer, errorRowTokenStyle]}
        >
          <Icon
            type="alertCircle"
            size={tokens.sizings.icon.xs}
            darkColor={darkError}
            lightColor={lightError}
          />

          <Animated.Text
            testID={testID ? `${testID}-error` : undefined}
            accessible={false}
            allowFontScaling={false}
            maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
            style={[
              styles.errorText,
              errorTypographyStyle,
              animatedErrorTextSizeStyle,
              animatedErrorTextColorStyle,
            ]}
          >
            {error}
          </Animated.Text>
        </Animated.View>
      )}
    </Pressable>
  );
};

export const Toggle = memo(ToggleComponent);

Toggle.displayName = "Toggle";

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row",

    alignItems: "center",
  },

  /**
   * Same multiline philosophy as Checkbox and Radio:
   * the control belongs to the beginning of the label.
   */
  track: {
    flexShrink: 0,

    alignSelf: "flex-start",
  },

  text: {
    flexShrink: 1,
  },

  customContent: {
    flexShrink: 1,
  },

  errorContainer: {
    flexDirection: "row",

    alignItems: "center",
  },

  errorText: {
    flexShrink: 1,
  },
});
