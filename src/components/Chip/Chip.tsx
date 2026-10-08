import { memo, useCallback, useEffect, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  interpolateColor,
  LinearTransition,
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
import { resolveNonNegativeMetric } from "../../utils/numberUtils";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { resolveTextContent } from "../../utils/reactNode";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import { Icon } from "../Icon/Icon";
import type { IIcon } from "../Icon/types";
import { useSelectionGroup } from "../SelectionGroup/SelectionGroupContext";
import type { IChip, TChipType } from "./types";

const resolveChipType = (value: string, fallback: TChipType): TChipType => {
  switch (value) {
    case "solid":
    case "border":
    case "transparent":
      return value;

    default:
      if (__DEV__) {
        console.error(
          `[react-native-arc-ui] Chip type "${value}" is invalid. Falling back to "${fallback}".`,
        );
      }

      return fallback;
  }
};

const ChipComponent = ({
  ref,
  children,
  type = "border",
  selectedType,
  value,
  selected,
  onSelectedChange,
  disabled = false,
  animation,
  iconLeft,
  iconRight,
  showCheckOnSelected = true,
  radius,
  style,
  containerStyle,
  onPress,
  onPressIn,
  onPressOut,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  testID,
  ...pressableProps
}: IChip) => {
  const { tokens } = useARCUITheme();
  const { themeProgress } = useARCUIAnimatedTheme();
  const { fontScale } = useARCUISystem();

  const group = useSelectionGroup();
  const prefersReducedMotion = useReducedMotion();

  const { entering, exiting } = useEnteringExiting();

  // ─── Resolved props ────────────────────────────────────────────────────────

  const resolvedDisabled = disabled === true;

  const resolvedType = resolveChipType(type, "border");

  const resolvedSelectedType =
    selectedType === undefined
      ? resolvedType
      : resolveChipType(selectedType, resolvedType);

  /**
   * A plain action Chip must not silently become selectable.
   *
   * Selection semantics are enabled by SelectionGroup or by an explicit
   * standalone selected prop. ARCUI never owns Chip selection internally.
   */
  const isSelectable = group !== null || selected !== undefined;

  const groupedSelected =
    group !== null && value !== undefined ? group.isSelected(value) : false;

  /**
   * SelectionGroup owns selection when present.
   *
   * Standalone selectable Chip is fully controlled through selected.
   */
  const resolvedSelected =
    group !== null ? groupedSelected : (selected ?? false);

  const resolvedAnimation = animation ?? tokens.pressAnimation.type;

  const resolvedRadius = resolveNonNegativeMetric(radius, tokens.radius.chip);

  const resolvedIconSize = tokens.typography.chip.text.fontSize;

  const textContent = useMemo(() => resolveTextContent(children), [children]);

  const isTextContent = textContent !== null;

  const resolvedAccessibilityLabel =
    accessibilityLabel ??
    (isTextContent && textContent.length > 0 ? textContent : undefined);

  const shouldShowCheck = resolvedSelected && showCheckOnSelected;

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

  const layoutTransition = useMemo(
    () =>
      prefersReducedMotion
        ? undefined
        : LinearTransition.duration(tokens.animations.enterDuration),
    [prefersReducedMotion, tokens.animations.enterDuration],
  );

  const chipTokenStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.sizings.chip.gap,
      paddingVertical: tokens.sizings.chip.paddingVertical,
      paddingHorizontal: tokens.sizings.chip.paddingHorizontal,
      borderWidth: tokens.border.chip,
      borderRadius: resolvedRadius,
    }),
    [
      tokens.sizings.chip.gap,
      tokens.sizings.chip.paddingVertical,
      tokens.sizings.chip.paddingHorizontal,
      tokens.border.chip,
      resolvedRadius,
    ],
  );

  const labelTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.chip.text).style,
    [tokens.typography.chip.text],
  );

  const chipLineHeight = tokens.typography.chip.text.lineHeight;

  // ─── Base presentation: light ────────────────────────

  const lightBackgroundPrimary =
    tokens.colors.light.chip[resolvedType].background.primary;

  const lightBackgroundPressed =
    tokens.colors.light.chip[resolvedType].background.pressed;

  const lightBackgroundDisabled =
    tokens.colors.light.chip[resolvedType].background.disabled;

  const lightBorderPrimary =
    tokens.colors.light.chip[resolvedType].border.primary;

  const lightBorderPressed =
    tokens.colors.light.chip[resolvedType].border.pressed;

  const lightBorderDisabled =
    tokens.colors.light.chip[resolvedType].border.disabled;

  const lightTextPrimary = tokens.colors.light.chip[resolvedType].text.primary;

  const lightTextPressed = tokens.colors.light.chip[resolvedType].text.pressed;

  const lightTextDisabled =
    tokens.colors.light.chip[resolvedType].text.disabled;

  const lightIconPrimary = tokens.colors.light.chip[resolvedType].icon.primary;

  const lightIconPressed = tokens.colors.light.chip[resolvedType].icon.pressed;

  const lightIconDisabled =
    tokens.colors.light.chip[resolvedType].icon.disabled;

  // ─── Selected presentation: light ────────────────────

  const lightBackgroundSelected =
    tokens.colors.light.chip[resolvedSelectedType].background.selected;

  const lightBackgroundSelectedPressed =
    tokens.colors.light.chip[resolvedSelectedType].background.pressed;

  const lightBackgroundSelectedDisabled =
    tokens.colors.light.chip[resolvedSelectedType].background.disabled;

  const lightBorderSelected =
    tokens.colors.light.chip[resolvedSelectedType].border.selected;

  const lightBorderSelectedPressed =
    tokens.colors.light.chip[resolvedSelectedType].border.pressed;

  const lightBorderSelectedDisabled =
    tokens.colors.light.chip[resolvedSelectedType].border.disabled;

  const lightTextSelected =
    tokens.colors.light.chip[resolvedSelectedType].text.selected;

  const lightTextSelectedPressed =
    tokens.colors.light.chip[resolvedSelectedType].text.pressed;

  const lightTextSelectedDisabled =
    tokens.colors.light.chip[resolvedSelectedType].text.disabled;

  const lightIconSelected =
    tokens.colors.light.chip[resolvedSelectedType].icon.selected;

  const lightIconSelectedPressed =
    tokens.colors.light.chip[resolvedSelectedType].icon.pressed;

  const lightIconSelectedDisabled =
    tokens.colors.light.chip[resolvedSelectedType].icon.disabled;

  // ─── Base presentation: dark ─────────────────────────

  const darkBackgroundPrimary =
    tokens.colors.dark.chip[resolvedType].background.primary;

  const darkBackgroundPressed =
    tokens.colors.dark.chip[resolvedType].background.pressed;

  const darkBackgroundDisabled =
    tokens.colors.dark.chip[resolvedType].background.disabled;

  const darkBorderPrimary =
    tokens.colors.dark.chip[resolvedType].border.primary;

  const darkBorderPressed =
    tokens.colors.dark.chip[resolvedType].border.pressed;

  const darkBorderDisabled =
    tokens.colors.dark.chip[resolvedType].border.disabled;

  const darkTextPrimary = tokens.colors.dark.chip[resolvedType].text.primary;

  const darkTextPressed = tokens.colors.dark.chip[resolvedType].text.pressed;

  const darkTextDisabled = tokens.colors.dark.chip[resolvedType].text.disabled;

  const darkIconPrimary = tokens.colors.dark.chip[resolvedType].icon.primary;

  const darkIconPressed = tokens.colors.dark.chip[resolvedType].icon.pressed;

  const darkIconDisabled = tokens.colors.dark.chip[resolvedType].icon.disabled;

  // ─── Selected presentation: dark ─────────────────────

  const darkBackgroundSelected =
    tokens.colors.dark.chip[resolvedSelectedType].background.selected;

  const darkBackgroundSelectedPressed =
    tokens.colors.dark.chip[resolvedSelectedType].background.pressed;

  const darkBackgroundSelectedDisabled =
    tokens.colors.dark.chip[resolvedSelectedType].background.disabled;

  const darkBorderSelected =
    tokens.colors.dark.chip[resolvedSelectedType].border.selected;

  const darkBorderSelectedPressed =
    tokens.colors.dark.chip[resolvedSelectedType].border.pressed;

  const darkBorderSelectedDisabled =
    tokens.colors.dark.chip[resolvedSelectedType].border.disabled;

  const darkTextSelected =
    tokens.colors.dark.chip[resolvedSelectedType].text.selected;

  const darkTextSelectedPressed =
    tokens.colors.dark.chip[resolvedSelectedType].text.pressed;

  const darkTextSelectedDisabled =
    tokens.colors.dark.chip[resolvedSelectedType].text.disabled;

  const darkIconSelected =
    tokens.colors.dark.chip[resolvedSelectedType].icon.selected;

  const darkIconSelectedPressed =
    tokens.colors.dark.chip[resolvedSelectedType].icon.pressed;

  const darkIconSelectedDisabled =
    tokens.colors.dark.chip[resolvedSelectedType].icon.disabled;

  // ─── Independent state dimensions ────────────────────

  const selectedProgress = useSharedValue(resolvedSelected ? 1 : 0);

  const disabledProgress = useSharedValue(resolvedDisabled ? 1 : 0);

  const pressProgress = useSharedValue(0);

  const scale = useSharedValue(1);

  useEffect(() => {
    const selectedTarget = resolvedSelected ? 1 : 0;

    const disabledTarget = resolvedDisabled ? 1 : 0;

    cancelAnimation(selectedProgress);

    cancelAnimation(disabledProgress);

    if (prefersReducedMotion) {
      selectedProgress.value = selectedTarget;

      disabledProgress.value = disabledTarget;

      return;
    }

    selectedProgress.value = withTiming(selectedTarget, animationConfig);

    disabledProgress.value = withTiming(disabledTarget, animationConfig);
  }, [
    resolvedSelected,
    resolvedDisabled,
    prefersReducedMotion,
    selectedProgress,
    disabledProgress,
    animationConfig,
  ]);

  /**
   * Clear transient press state whenever interaction configuration changes.
   */
  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(pressProgress);

    scale.value = 1;
    pressProgress.value = 0;
  }, [
    resolvedDisabled,
    resolvedAnimation,
    prefersReducedMotion,
    scale,
    pressProgress,
  ]);

  // ─── Colors ──────────────────────────────────────────

  const stateColors = useDerivedValue(() => {
    /**
     * Presentation itself is an animated dimension:
     *
     * type.primary
     *      ↓ selectedProgress
     * selectedType.selected
     *
     * Pressed and disabled targets follow the currently transitioning
     * presentation, preventing a selected solid Chip from flashing back
     * to the base border presentation while pressed.
     */

    const lightBackgroundBase = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightBackgroundPrimary, lightBackgroundSelected],
    );

    const lightBackgroundPressTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightBackgroundPressed, lightBackgroundSelectedPressed],
    );

    const lightBackgroundWithPress = interpolateColor(
      pressProgress.value,
      [0, 1],
      [lightBackgroundBase, lightBackgroundPressTarget],
    );

    const lightBackgroundDisabledTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightBackgroundDisabled, lightBackgroundSelectedDisabled],
    );

    const lightBackground = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightBackgroundWithPress, lightBackgroundDisabledTarget],
    );

    const darkBackgroundBase = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkBackgroundPrimary, darkBackgroundSelected],
    );

    const darkBackgroundPressTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkBackgroundPressed, darkBackgroundSelectedPressed],
    );

    const darkBackgroundWithPress = interpolateColor(
      pressProgress.value,
      [0, 1],
      [darkBackgroundBase, darkBackgroundPressTarget],
    );

    const darkBackgroundDisabledTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkBackgroundDisabled, darkBackgroundSelectedDisabled],
    );

    const darkBackground = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkBackgroundWithPress, darkBackgroundDisabledTarget],
    );

    const lightBorderBase = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightBorderPrimary, lightBorderSelected],
    );

    const lightBorderPressTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightBorderPressed, lightBorderSelectedPressed],
    );

    const lightBorderWithPress = interpolateColor(
      pressProgress.value,
      [0, 1],
      [lightBorderBase, lightBorderPressTarget],
    );

    const lightBorderDisabledTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightBorderDisabled, lightBorderSelectedDisabled],
    );

    const lightBorder = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightBorderWithPress, lightBorderDisabledTarget],
    );

    const darkBorderBase = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkBorderPrimary, darkBorderSelected],
    );

    const darkBorderPressTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkBorderPressed, darkBorderSelectedPressed],
    );

    const darkBorderWithPress = interpolateColor(
      pressProgress.value,
      [0, 1],
      [darkBorderBase, darkBorderPressTarget],
    );

    const darkBorderDisabledTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkBorderDisabled, darkBorderSelectedDisabled],
    );

    const darkBorder = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkBorderWithPress, darkBorderDisabledTarget],
    );

    const lightTextBase = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightTextPrimary, lightTextSelected],
    );

    const lightTextPressTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightTextPressed, lightTextSelectedPressed],
    );

    const lightTextWithPress = interpolateColor(
      pressProgress.value,
      [0, 1],
      [lightTextBase, lightTextPressTarget],
    );

    const lightTextDisabledTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightTextDisabled, lightTextSelectedDisabled],
    );

    const lightText = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightTextWithPress, lightTextDisabledTarget],
    );

    const darkTextBase = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkTextPrimary, darkTextSelected],
    );

    const darkTextPressTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkTextPressed, darkTextSelectedPressed],
    );

    const darkTextWithPress = interpolateColor(
      pressProgress.value,
      [0, 1],
      [darkTextBase, darkTextPressTarget],
    );

    const darkTextDisabledTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkTextDisabled, darkTextSelectedDisabled],
    );

    const darkText = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkTextWithPress, darkTextDisabledTarget],
    );

    const lightIconBase = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightIconPrimary, lightIconSelected],
    );

    const lightIconPressTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightIconPressed, lightIconSelectedPressed],
    );

    const lightIconWithPress = interpolateColor(
      pressProgress.value,
      [0, 1],
      [lightIconBase, lightIconPressTarget],
    );

    const lightIconDisabledTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [lightIconDisabled, lightIconSelectedDisabled],
    );

    const lightIcon = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightIconWithPress, lightIconDisabledTarget],
    );

    const darkIconBase = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkIconPrimary, darkIconSelected],
    );

    const darkIconPressTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkIconPressed, darkIconSelectedPressed],
    );

    const darkIconWithPress = interpolateColor(
      pressProgress.value,
      [0, 1],
      [darkIconBase, darkIconPressTarget],
    );

    const darkIconDisabledTarget = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [darkIconDisabled, darkIconSelectedDisabled],
    );

    const darkIcon = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkIconWithPress, darkIconDisabledTarget],
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

      icon: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkIcon, lightIcon],
      ),
    };
  });

  const animatedIconColor = useDerivedValue<string>(
    () => stateColors.value.icon,
  );

  // ─── Styles ──────────────────────────────────────────

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
    backgroundColor: stateColors.value.background,
    borderColor: stateColors.value.border,
  }));

  const labelFontSize = tokens.typography.chip.text.fontSize;

  const animatedTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: labelFontSize * fontScale.value,

    lineHeight:
      chipLineHeight != null ? chipLineHeight * fontScale.value : undefined,
  }));

  const animatedTextColorStyle = useAnimatedStyle(() => ({
    color: stateColors.value.text,
  }));

  // ─── Interaction ─────────────────────────────────────

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      if (resolvedDisabled) return;

      if (group !== null && value !== undefined) {
        const nextSelected = group.toggleValue(value);

        if (nextSelected !== resolvedSelected) {
          onSelectedChange?.(nextSelected);
        }
      } else if (selected !== undefined) {
        /**
         * Standalone selectable Chip is fully controlled.
         *
         * ARCUI reports the requested next state and never mutates
         * semantic selection internally.
         */
        onSelectedChange?.(!resolvedSelected);
      }

      /**
       * onPress remains the normal action callback in every Chip mode.
       */
      onPress?.(event);
    },
    [
      resolvedDisabled,
      group,
      value,
      selected,
      resolvedSelected,
      onSelectedChange,
      onPress,
    ],
  );

  const handleOnPressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (resolvedDisabled) return;

      onPressIn?.(event);

      if (resolvedAnimation === "none") {
        return;
      }

      /**
       * Reduced Motion removes scale movement but preserves immediate
       * semantic press feedback.
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
      resolvedDisabled,
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

  /**
   * Persistent built-in icons keep their layout node mounted.
   *
   * Enter/exit behavior belongs to the wrapper while semantic color
   * transitions are rendered directly by Icon on the UI thread.
   */
  const renderPersistentIcon = (
    iconType: IIcon["type"],
    testIDSuffix: string,
  ) => (
    <Animated.View
      testID={testID ? `${testID}-${testIDSuffix}` : undefined}
      entering={entering}
      exiting={exiting}
      style={styles.icon}
    >
      <Icon
        type={iconType}
        size={resolvedIconSize}
        scaleWithFont
        animatedColor={animatedIconColor}
      />
    </Animated.View>
  );

  /**
   * Keep ownership validation after all hooks so malformed dynamic props
   * cannot alter hook ordering.
   */
  if (group !== null) {
    if (value === undefined) {
      throw new Error(
        "[react-native-arc-ui] Chip inside SelectionGroup requires a value.",
      );
    }

    if (selected !== undefined) {
      throw new Error(
        "[react-native-arc-ui] Chip inside SelectionGroup must not receive selected. SelectionGroup owns the selected state.",
      );
    }
  } else {
    if (value !== undefined) {
      throw new Error(
        "[react-native-arc-ui] Chip value is only valid inside SelectionGroup.",
      );
    }

    if (selected === undefined && onSelectedChange !== undefined) {
      throw new Error(
        "[react-native-arc-ui] Standalone Chip onSelectedChange requires selected.",
      );
    }
  }

  return (
    <Animated.View layout={layoutTransition}>
      <Pressable
        {...pressableProps}
        ref={ref}
        testID={testID}
        style={style}
        disabled={resolvedDisabled}
        role="button"
        accessibilityRole="button"
        accessibilityLabel={resolvedAccessibilityLabel}
        accessibilityHint={accessibilityHint}
        aria-selected={isSelectable ? resolvedSelected : undefined}
        aria-disabled={resolvedDisabled}
        accessibilityState={{
          ...accessibilityState,
          selected: isSelectable ? resolvedSelected : undefined,
          disabled: resolvedDisabled,
        }}
        onPress={handleOnPress}
        onPressIn={handleOnPressIn}
        onPressOut={handleOnPressOut}
      >
        <Animated.View
          layout={layoutTransition}
          style={[
            styles.chip,
            chipTokenStyle,
            containerStyle,
            animatedContainerStyle,
          ]}
        >
          {iconLeft && renderPersistentIcon(iconLeft, "icon-left")}

          {isTextContent ? (
            <Animated.Text
              testID={testID ? `${testID}-label` : undefined}
              allowFontScaling={false}
              maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
              numberOfLines={1}
              style={[
                styles.label,
                labelTypographyStyle,
                animatedTextSizeStyle,
                animatedTextColorStyle,
              ]}
            >
              {textContent}
            </Animated.Text>
          ) : (
            <Animated.View
              testID={testID ? `${testID}-content` : undefined}
              style={styles.customContent}
            >
              {children}
            </Animated.View>
          )}

          {iconRight &&
            !shouldShowCheck &&
            renderPersistentIcon(iconRight, "icon-right")}

          {shouldShowCheck && (
            <Animated.View
              testID={testID ? `${testID}-check` : undefined}
              entering={entering}
              exiting={exiting}
              style={styles.icon}
            >
              <Icon
                type="check"
                size={resolvedIconSize}
                scaleWithFont
                animatedColor={animatedIconColor}
              />
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export const Chip = memo(ChipComponent);

Chip.displayName = "Chip";

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",

    /**
     * Exiting icons remain mounted briefly while layout transitions resolve.
     * Clipping prevents them from being drawn outside the animated Chip edge.
     */
    overflow: "hidden",
  },

  icon: {
    flexShrink: 0,
  },

  label: {
    flexShrink: 1,
  },

  customContent: {
    flexShrink: 1,
  },
});
