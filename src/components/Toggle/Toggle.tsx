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
import { resolveThemeColor } from "../../utils/resolveThemeColor";
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
  colors,
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

  // ─── Theme color endpoints ───────────────────────────────────────────────

  const resolvedTrackBorderDefault = resolveThemeColor(
    colors?.track?.border?.default,
    tokens.colors.light.toggle.track.border.primary,
    tokens.colors.dark.toggle.track.border.primary,
    "Toggle colors.track.border.default",
  );
  const resolvedTrackBorderPressed = resolveThemeColor(
    colors?.track?.border?.pressed,
    tokens.colors.light.toggle.track.border.pressed,
    tokens.colors.dark.toggle.track.border.pressed,
    "Toggle colors.track.border.pressed",
  );
  const resolvedTrackBorderDisabled = resolveThemeColor(
    colors?.track?.border?.disabled,
    tokens.colors.light.toggle.track.border.disabled,
    tokens.colors.dark.toggle.track.border.disabled,
    "Toggle colors.track.border.disabled",
  );
  const resolvedTrackBorderInactive = resolveThemeColor(
    colors?.track?.border?.inactive,
    tokens.colors.light.toggle.track.border.inactive,
    tokens.colors.dark.toggle.track.border.inactive,
    "Toggle colors.track.border.inactive",
  );

  const lightTrackBorderPrimary = resolvedTrackBorderDefault.light;
  const darkTrackBorderPrimary = resolvedTrackBorderDefault.dark;
  const lightTrackBorderPressed = resolvedTrackBorderPressed.light;
  const darkTrackBorderPressed = resolvedTrackBorderPressed.dark;
  const lightTrackBorderDisabled = resolvedTrackBorderDisabled.light;
  const darkTrackBorderDisabled = resolvedTrackBorderDisabled.dark;
  const lightTrackBorderInactive = resolvedTrackBorderInactive.light;
  const darkTrackBorderInactive = resolvedTrackBorderInactive.dark;

  const resolvedTrackBackgroundDefault = resolveThemeColor(
    colors?.track?.background?.default,
    tokens.colors.light.toggle.track.background.primary,
    tokens.colors.dark.toggle.track.background.primary,
    "Toggle colors.track.background.default",
  );
  const resolvedTrackBackgroundPressed = resolveThemeColor(
    colors?.track?.background?.pressed,
    tokens.colors.light.toggle.track.background.pressed,
    tokens.colors.dark.toggle.track.background.pressed,
    "Toggle colors.track.background.pressed",
  );
  const resolvedTrackBackgroundDisabled = resolveThemeColor(
    colors?.track?.background?.disabled,
    tokens.colors.light.toggle.track.background.disabled,
    tokens.colors.dark.toggle.track.background.disabled,
    "Toggle colors.track.background.disabled",
  );
  const resolvedTrackBackgroundInactive = resolveThemeColor(
    colors?.track?.background?.inactive,
    tokens.colors.light.toggle.track.background.inactive,
    tokens.colors.dark.toggle.track.background.inactive,
    "Toggle colors.track.background.inactive",
  );

  const lightTrackBackgroundPrimary = resolvedTrackBackgroundDefault.light;
  const darkTrackBackgroundPrimary = resolvedTrackBackgroundDefault.dark;
  const lightTrackBackgroundPressed = resolvedTrackBackgroundPressed.light;
  const darkTrackBackgroundPressed = resolvedTrackBackgroundPressed.dark;
  const lightTrackBackgroundDisabled = resolvedTrackBackgroundDisabled.light;
  const darkTrackBackgroundDisabled = resolvedTrackBackgroundDisabled.dark;
  const lightTrackBackgroundInactive = resolvedTrackBackgroundInactive.light;
  const darkTrackBackgroundInactive = resolvedTrackBackgroundInactive.dark;

  const resolvedThumbUnchecked = resolveThemeColor(
    colors?.thumb?.unchecked,
    tokens.colors.light.toggle.thumb.unchecked,
    tokens.colors.dark.toggle.thumb.unchecked,
    "Toggle colors.thumb.unchecked",
  );
  const resolvedThumbChecked = resolveThemeColor(
    colors?.thumb?.checked,
    tokens.colors.light.toggle.thumb.checked,
    tokens.colors.dark.toggle.thumb.checked,
    "Toggle colors.thumb.checked",
  );
  const resolvedThumbPressedUnchecked = resolveThemeColor(
    colors?.thumb?.pressedUnchecked,
    tokens.colors.light.toggle.thumb.pressedUnchecked,
    tokens.colors.dark.toggle.thumb.pressedUnchecked,
    "Toggle colors.thumb.pressedUnchecked",
  );
  const resolvedThumbPressedChecked = resolveThemeColor(
    colors?.thumb?.pressedChecked,
    tokens.colors.light.toggle.thumb.pressedChecked,
    tokens.colors.dark.toggle.thumb.pressedChecked,
    "Toggle colors.thumb.pressedChecked",
  );
  const resolvedThumbDisabledUnchecked = resolveThemeColor(
    colors?.thumb?.disabledUnchecked,
    tokens.colors.light.toggle.thumb.disabledUnchecked,
    tokens.colors.dark.toggle.thumb.disabledUnchecked,
    "Toggle colors.thumb.disabledUnchecked",
  );
  const resolvedThumbDisabledChecked = resolveThemeColor(
    colors?.thumb?.disabledChecked,
    tokens.colors.light.toggle.thumb.disabledChecked,
    tokens.colors.dark.toggle.thumb.disabledChecked,
    "Toggle colors.thumb.disabledChecked",
  );
  const resolvedThumbInactiveUnchecked = resolveThemeColor(
    colors?.thumb?.inactiveUnchecked,
    tokens.colors.light.toggle.thumb.inactiveUnchecked,
    tokens.colors.dark.toggle.thumb.inactiveUnchecked,
    "Toggle colors.thumb.inactiveUnchecked",
  );
  const resolvedThumbInactiveChecked = resolveThemeColor(
    colors?.thumb?.inactiveChecked,
    tokens.colors.light.toggle.thumb.inactiveChecked,
    tokens.colors.dark.toggle.thumb.inactiveChecked,
    "Toggle colors.thumb.inactiveChecked",
  );

  const lightThumbUnchecked = resolvedThumbUnchecked.light;
  const darkThumbUnchecked = resolvedThumbUnchecked.dark;
  const lightThumbChecked = resolvedThumbChecked.light;
  const darkThumbChecked = resolvedThumbChecked.dark;
  const lightThumbPressedUnchecked = resolvedThumbPressedUnchecked.light;
  const darkThumbPressedUnchecked = resolvedThumbPressedUnchecked.dark;
  const lightThumbPressedChecked = resolvedThumbPressedChecked.light;
  const darkThumbPressedChecked = resolvedThumbPressedChecked.dark;
  const lightThumbDisabledUnchecked = resolvedThumbDisabledUnchecked.light;
  const darkThumbDisabledUnchecked = resolvedThumbDisabledUnchecked.dark;
  const lightThumbDisabledChecked = resolvedThumbDisabledChecked.light;
  const darkThumbDisabledChecked = resolvedThumbDisabledChecked.dark;
  const lightThumbInactiveUnchecked = resolvedThumbInactiveUnchecked.light;
  const darkThumbInactiveUnchecked = resolvedThumbInactiveUnchecked.dark;
  const lightThumbInactiveChecked = resolvedThumbInactiveChecked.light;
  const darkThumbInactiveChecked = resolvedThumbInactiveChecked.dark;

  const resolvedTextDefault = resolveThemeColor(
    colors?.text?.default,
    tokens.colors.light.toggle.text.primary,
    tokens.colors.dark.toggle.text.primary,
    "Toggle colors.text.default",
  );
  const resolvedTextDisabled = resolveThemeColor(
    colors?.text?.disabled,
    tokens.colors.light.toggle.text.disabled,
    tokens.colors.dark.toggle.text.disabled,
    "Toggle colors.text.disabled",
  );
  const resolvedTextInactive = resolveThemeColor(
    colors?.text?.inactive,
    tokens.colors.light.toggle.text.inactive,
    tokens.colors.dark.toggle.text.inactive,
    "Toggle colors.text.inactive",
  );

  const lightTextPrimary = resolvedTextDefault.light;
  const darkTextPrimary = resolvedTextDefault.dark;
  const lightTextDisabled = resolvedTextDisabled.light;
  const darkTextDisabled = resolvedTextDisabled.dark;
  const lightTextInactive = resolvedTextInactive.light;
  const darkTextInactive = resolvedTextInactive.dark;

  const resolvedError = resolveThemeColor(
    colors?.error,
    tokens.colors.light.toggle.error,
    tokens.colors.dark.toggle.error,
    "Toggle colors.error",
  );
  const lightError = resolvedError.light;
  const darkError = resolvedError.dark;

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
            colors={{
              icon: {
                light: lightError,
                dark: darkError,
              },
            }}
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
