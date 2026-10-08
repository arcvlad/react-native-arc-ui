import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type NamedExoticComponent,
} from "react";
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  interpolate,
  interpolateColor,
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
import { resolveAnimation } from "../../utils/resolveAnimation";
import { Icon } from "../Icon/Icon";
import { useSelectionGroup } from "../SelectionGroup/SelectionGroupContext";

import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type {
  IAccordion,
  TAccordionInternalProps,
  TAccordionType,
} from "./types";

const CONTENT_HEIGHT_EPSILON = 0.5;

const resolveAccordionType = (value: string): TAccordionType => {
  switch (value) {
    case "solid":
    case "border":
    case "transparent":
      return value;

    default:
      if (__DEV__) {
        console.error(
          `[react-native-arc-ui] Accordion type "${value}" is invalid. Falling back to "transparent".`,
        );
      }

      return "transparent";
  }
};

const resolveNumberOfLines = (value: number): number | undefined => {
  if (!Number.isFinite(value) || value <= 0) {
    return undefined;
  }

  return Math.max(1, Math.floor(value));
};

const getBorderRadiusStyle = (
  position: TAccordionInternalProps["_groupPosition"],
  radius: number,
): ViewStyle => {
  switch (position) {
    case "first":
      return {
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      };

    case "middle":
      return {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      };

    case "last":
      return {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
      };

    case "single":
    default:
      return {
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
      };
  }
};

const AccordionComponent = ({
  children,
  title,
  subtitle,
  value,
  icon,
  customIcon,
  type = "transparent",
  disabled = false,
  expanded: expandedProp,
  onExpandedChange,
  titleNumberOfLines,
  subtitleNumberOfLines,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
  _groupPosition = "single",
}: TAccordionInternalProps) => {
  const { tokens } = useARCUITheme();
  const { themeProgress } = useARCUIAnimatedTheme();
  const { fontScale } = useARCUISystem();
  const prefersReducedMotion = useReducedMotion();

  const group = useSelectionGroup();

  const resolvedType = resolveAccordionType(type);

  const accordionAnimationConfig = useMemo(
    () => resolveAnimation(tokens.accordionAnimations, tokens.animations),
    [tokens.accordionAnimations, tokens.animations],
  );

  // ─── Selection / expansion state ───────────────────────────────────────────

  const isGroupExpanded =
    group !== null && value !== undefined ? group.isSelected(value) : false;

  /**
   * SelectionGroup owns expansion when present.
   *
   * Standalone Accordion is explicitly controlled through expanded.
   * ARCUI never owns semantic expansion state internally.
   */
  const isExpanded = group !== null ? isGroupExpanded : (expandedProp ?? false);

  const handlePress = useCallback(() => {
    if (disabled) {
      return;
    }

    if (group !== null) {
      if (value === undefined) {
        return;
      }

      const nextExpanded = group.toggleValue(value);

      if (nextExpanded !== isExpanded) {
        onExpandedChange?.(nextExpanded);
      }

      return;
    }

    onExpandedChange?.(!isExpanded);
  }, [disabled, group, value, isExpanded, onExpandedChange]);

  // ─── Motion state ──────────────────────────────────────────────────────────

  /**
   * Expansion and disabled are intentionally independent visual dimensions.
   *
   * A disabled Accordion can remain expanded, and transitioning between
   * unrelated visual states must never travel through intermediate state
   * indices purely because of numeric ordering.
   */
  const expansionProgress = useSharedValue(isExpanded ? 1 : 0);

  const disabledProgress = useSharedValue(disabled ? 1 : 0);

  useEffect(() => {
    cancelAnimation(expansionProgress);

    const target = isExpanded ? 1 : 0;

    if (prefersReducedMotion) {
      expansionProgress.value = target;
      return;
    }

    expansionProgress.value = withTiming(target, accordionAnimationConfig);
  }, [
    isExpanded,
    prefersReducedMotion,
    expansionProgress,
    accordionAnimationConfig,
  ]);

  useEffect(() => {
    cancelAnimation(disabledProgress);

    const target = disabled ? 1 : 0;

    if (prefersReducedMotion) {
      disabledProgress.value = target;
      return;
    }

    disabledProgress.value = withTiming(target, accordionAnimationConfig);
  }, [
    disabled,
    prefersReducedMotion,
    disabledProgress,
    accordionAnimationConfig,
  ]);

  // ─── Content measurement ───────────────────────────────────────────────────

  const contentHeight = useSharedValue(0);
  const animatedHeight = useSharedValue(0);

  const hasMeasured = useRef(false);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nextHeight = event.nativeEvent.layout.height;

      if (
        !Number.isFinite(nextHeight) ||
        nextHeight < 0 ||
        Math.abs(nextHeight - contentHeight.value) < CONTENT_HEIGHT_EPSILON
      ) {
        return;
      }

      const isFirstMeasurement = !hasMeasured.current;

      hasMeasured.current = true;
      contentHeight.value = nextHeight;

      if (!isExpanded) {
        return;
      }

      cancelAnimation(animatedHeight);

      /**
       * An initially expanded Accordion should appear at its real measured
       * height immediately instead of animating from an artificial zero
       * height after the first native layout pass.
       */
      if (isFirstMeasurement || prefersReducedMotion) {
        animatedHeight.value = nextHeight;
        return;
      }

      animatedHeight.value = withTiming(nextHeight, accordionAnimationConfig);
    },
    [
      isExpanded,
      prefersReducedMotion,
      contentHeight,
      animatedHeight,
      accordionAnimationConfig,
    ],
  );

  useEffect(() => {
    if (!hasMeasured.current) {
      return;
    }

    cancelAnimation(animatedHeight);

    const targetHeight = isExpanded ? contentHeight.value : 0;

    if (prefersReducedMotion) {
      animatedHeight.value = targetHeight;
      return;
    }

    animatedHeight.value = withTiming(targetHeight, accordionAnimationConfig);
  }, [
    isExpanded,
    prefersReducedMotion,
    animatedHeight,
    contentHeight,
    accordionAnimationConfig,
  ]);

  // ─── Color tokens ──────────────────────────────────────────────────────────

  const lightBackground =
    tokens.colors.light.accordion[resolvedType].background.primary;

  const lightBackgroundDisabled =
    tokens.colors.light.accordion[resolvedType].background.disabled;

  const darkBackground =
    tokens.colors.dark.accordion[resolvedType].background.primary;

  const darkBackgroundDisabled =
    tokens.colors.dark.accordion[resolvedType].background.disabled;

  const lightBorder =
    tokens.colors.light.accordion[resolvedType].border.primary;

  const lightBorderDisabled =
    tokens.colors.light.accordion[resolvedType].border.disabled;

  const darkBorder = tokens.colors.dark.accordion[resolvedType].border.primary;

  const darkBorderDisabled =
    tokens.colors.dark.accordion[resolvedType].border.disabled;

  const lightTitle = tokens.colors.light.accordion[resolvedType].text.primary;

  const lightTitleDisabled =
    tokens.colors.light.accordion[resolvedType].text.disabled;

  const darkTitle = tokens.colors.dark.accordion[resolvedType].text.primary;

  const darkTitleDisabled =
    tokens.colors.dark.accordion[resolvedType].text.disabled;

  const lightSubtitle =
    tokens.colors.light.accordion[resolvedType].text.subtitle;

  const lightSubtitleDisabled =
    tokens.colors.light.accordion[resolvedType].text.disabled;

  const darkSubtitle = tokens.colors.dark.accordion[resolvedType].text.subtitle;

  const darkSubtitleDisabled =
    tokens.colors.dark.accordion[resolvedType].text.disabled;

  const lightIconPrimary =
    tokens.colors.light.accordion[resolvedType].icon.primary;

  const lightIconDisabled =
    tokens.colors.light.accordion[resolvedType].icon.disabled;

  const darkIconPrimary =
    tokens.colors.dark.accordion[resolvedType].icon.primary;

  const darkIconDisabled =
    tokens.colors.dark.accordion[resolvedType].icon.disabled;

  // ─── Animated colors ───────────────────────────────────────────────────────

  const preserveGroupBorder =
    resolvedType === "border" && _groupPosition !== "single";

  const stateColors = useDerivedValue(() => {
    const resolvedLightBackground = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightBackground, lightBackgroundDisabled],
    );

    const resolvedDarkBackground = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkBackground, darkBackgroundDisabled],
    );

    const resolvedLightBorder = preserveGroupBorder
      ? lightBorder
      : interpolateColor(
          disabledProgress.value,
          [0, 1],
          [lightBorder, lightBorderDisabled],
        );

    const resolvedDarkBorder = preserveGroupBorder
      ? darkBorder
      : interpolateColor(
          disabledProgress.value,
          [0, 1],
          [darkBorder, darkBorderDisabled],
        );

    const resolvedLightTitle = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightTitle, lightTitleDisabled],
    );

    const resolvedDarkTitle = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkTitle, darkTitleDisabled],
    );

    const resolvedLightSubtitle = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightSubtitle, lightSubtitleDisabled],
    );

    const resolvedDarkSubtitle = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkSubtitle, darkSubtitleDisabled],
    );

    const resolvedLightIcon = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightIconPrimary, lightIconDisabled],
    );

    const resolvedDarkIcon = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkIconPrimary, darkIconDisabled],
    );

    return {
      background: interpolateColor(
        themeProgress.value,
        [0, 1],
        [resolvedDarkBackground, resolvedLightBackground],
      ),

      border: interpolateColor(
        themeProgress.value,
        [0, 1],
        [resolvedDarkBorder, resolvedLightBorder],
      ),

      title: interpolateColor(
        themeProgress.value,
        [0, 1],
        [resolvedDarkTitle, resolvedLightTitle],
      ),

      subtitle: interpolateColor(
        themeProgress.value,
        [0, 1],
        [resolvedDarkSubtitle, resolvedLightSubtitle],
      ),

      icon: interpolateColor(
        themeProgress.value,
        [0, 1],
        [resolvedDarkIcon, resolvedLightIcon],
      ),
    };
  });

  const animatedIconColor = useDerivedValue<string>(
    () => stateColors.value.icon,
  );

  // ─── Animated styles ───────────────────────────────────────────────────────

  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: stateColors.value.background,
    borderColor: stateColors.value.border,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  const titleFontSize = tokens.typography.accordion.title.fontSize;
  const titleLineHeight = tokens.typography.accordion.title.lineHeight;

  const animatedTitleSizeStyle = useAnimatedStyle(() => ({
    fontSize: titleFontSize * fontScale.value,

    lineHeight:
      titleLineHeight != null ? titleLineHeight * fontScale.value : undefined,
  }));

  const animatedTitleColorStyle = useAnimatedStyle(() => ({
    color: stateColors.value.title,
  }));

  const subtitleFontSize = tokens.typography.accordion.subtitle.fontSize;
  const subtitleLineHeight = tokens.typography.accordion.subtitle.lineHeight;

  const animatedSubtitleSizeStyle = useAnimatedStyle(() => ({
    fontSize: subtitleFontSize * fontScale.value,

    lineHeight:
      subtitleLineHeight != null
        ? subtitleLineHeight * fontScale.value
        : undefined,
  }));

  const animatedSubtitleColorStyle = useAnimatedStyle(() => ({
    color: stateColors.value.subtitle,
  }));

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(expansionProgress.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  // ─── Static token styles ───────────────────────────────────────────────────

  const borderRadiusStyle = useMemo(
    () => getBorderRadiusStyle(_groupPosition, tokens.radius.accordion),
    [_groupPosition, tokens.radius.accordion],
  );

  const borderStyle = useMemo<ViewStyle>(() => {
    if (resolvedType === "transparent") {
      return {
        borderWidth: 0,
      };
    }

    const width = tokens.border.accordion;

    switch (_groupPosition) {
      case "first":
      case "middle":
        return {
          borderTopWidth: width,
          borderRightWidth: width,
          borderBottomWidth: 0,
          borderLeftWidth: width,
        };

      case "last":
      case "single":
      default:
        return {
          borderWidth: width,
        };
    }
  }, [resolvedType, _groupPosition, tokens.border.accordion]);

  const headerTokenStyle = useMemo<ViewStyle>(
    () => ({
      minHeight: tokens.sizings.accordion.headerMinHeight,
      paddingHorizontal: tokens.spacing.m,
      paddingVertical: tokens.spacing.s,
      gap: tokens.spacing.s,
    }),
    [
      tokens.sizings.accordion.headerMinHeight,
      tokens.spacing.m,
      tokens.spacing.s,
    ],
  );

  const titleContainerTokenStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xxs,
    }),
    [tokens.spacing.xxs],
  );

  const contentTokenStyle = useMemo<ViewStyle>(
    () => ({
      paddingHorizontal: tokens.spacing.m,
      paddingBottom: tokens.spacing.s,
    }),
    [tokens.spacing.m, tokens.spacing.s],
  );

  /**
   * fontSize / lineHeight are applied separately because ARCUI owns
   * manual font scaling. Remaining native typography passes through.
   */
  const titleTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.accordion.title).style,
    [tokens.typography.accordion.title],
  );

  const subtitleTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.accordion.subtitle).style,
    [tokens.typography.accordion.subtitle],
  );

  // ─── Text limits ───────────────────────────────────────────────────────────

  const resolvedTitleNumberOfLines = resolveNumberOfLines(
    titleNumberOfLines ?? tokens.sizings.accordion.titleNumberOfLines,
  );

  const resolvedSubtitleNumberOfLines = resolveNumberOfLines(
    subtitleNumberOfLines ?? tokens.sizings.accordion.subtitleNumberOfLines,
  );

  /**
   * Keep ownership validation after all hooks so malformed dynamic props
   * cannot alter hook ordering.
   */
  if (group !== null) {
    if (value === undefined) {
      throw new Error(
        '[react-native-arc-ui] Accordion inside SelectionGroup or AccordionGroup requires a "value".',
      );
    }

    if (expandedProp !== undefined) {
      throw new Error(
        '[react-native-arc-ui] Accordion inside SelectionGroup or AccordionGroup must not receive "expanded". The group owns expansion state.',
      );
    }
  } else {
    if (value !== undefined) {
      throw new Error(
        '[react-native-arc-ui] Accordion "value" is only valid inside SelectionGroup or AccordionGroup.',
      );
    }

    if (expandedProp === undefined) {
      throw new Error(
        '[react-native-arc-ui] Standalone Accordion requires "expanded".',
      );
    }
  }

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,
        borderRadiusStyle,
        borderStyle,
        animatedContainerStyle,
        style,
      ]}
    >
      <Pressable
        testID={testID ? `${testID}-header` : undefined}
        onPress={handlePress}
        disabled={disabled}
        role="button"
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityHint={accessibilityHint}
        aria-expanded={isExpanded}
        aria-disabled={disabled}
        accessibilityState={{
          expanded: isExpanded,
          disabled,
        }}
      >
        <Animated.View style={[styles.header, headerTokenStyle]}>
          {(icon !== undefined || customIcon != null) && (
            <View
              testID={testID ? `${testID}-icon` : undefined}
              style={styles.leftIcon}
            >
              {customIcon != null ? (
                customIcon
              ) : icon !== undefined ? (
                <Icon type={icon} animatedColor={animatedIconColor} />
              ) : null}
            </View>
          )}

          <View style={[styles.titleContainer, titleContainerTokenStyle]}>
            <Animated.Text
              testID={testID ? `${testID}-title` : undefined}
              allowFontScaling={false}
              maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
              style={[
                styles.title,
                titleTypographyStyle,
                animatedTitleSizeStyle,
                animatedTitleColorStyle,
              ]}
              numberOfLines={resolvedTitleNumberOfLines}
            >
              {title}
            </Animated.Text>

            {subtitle !== undefined && (
              <Animated.Text
                testID={testID ? `${testID}-subtitle` : undefined}
                allowFontScaling={false}
                maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
                style={[
                  styles.subtitle,
                  subtitleTypographyStyle,
                  animatedSubtitleSizeStyle,
                  animatedSubtitleColorStyle,
                ]}
                numberOfLines={resolvedSubtitleNumberOfLines}
              >
                {subtitle}
              </Animated.Text>
            )}
          </View>

          <Animated.View
            testID={testID ? `${testID}-chevron` : undefined}
            style={animatedChevronStyle}
          >
            <Icon type="chevronDown" animatedColor={animatedIconColor} />
          </Animated.View>
        </Animated.View>
      </Pressable>

      <Animated.View
        testID={testID ? `${testID}-content` : undefined}
        style={[styles.contentContainer, animatedContentStyle]}
        pointerEvents={isExpanded ? "auto" : "none"}
        accessibilityElementsHidden={!isExpanded}
        importantForAccessibility={isExpanded ? "auto" : "no-hide-descendants"}
      >
        <View style={styles.contentMeasure} onLayout={handleLayout}>
          <View style={[styles.content, contentTokenStyle]}>{children}</View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

/**
 * Public Accordion intentionally exposes IAccordion only.
 *
 * TAccordionInternalProps adds the optional _groupPosition field used by
 * AccordionGroup internally, but it must not appear in the public API.
 */
export const Accordion = memo(
  AccordionComponent,
) as NamedExoticComponent<IAccordion>;

Accordion.displayName = "Accordion";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  leftIcon: {
    justifyContent: "center",
    alignItems: "center",
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    flexShrink: 1,
  },

  subtitle: {
    flexShrink: 1,
  },

  contentContainer: {
    overflow: "hidden",
  },

  /**
   * Content stays mounted and laid out at its natural height while the
   * outer container animates its visible height.
   *
   * This preserves child state and avoids JS-driven measurement loops.
   */
  contentMeasure: {
    position: "absolute",
    width: "100%",
  },

  content: {},
});
