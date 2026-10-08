import { memo, useEffect, useMemo } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
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
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { resolveTextContent } from "../../utils/reactNode";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import { Icon } from "../Icon/Icon";

import type { TIconType } from "../Icon/types";
import type { IInfobox, TInfoboxType } from "./types";

const DEFAULT_ICON_BY_TYPE = {
  default: "info",
  warning: "alertCircle",
  danger: "xCircle",
} as const satisfies Record<TInfoboxType, TIconType>;

const InfoboxComponent = ({
  ref,
  children,
  type = "default",
  icon,
  customIcon,
  style,
  testID,
  ...viewProps
}: IInfobox) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale } = useARCUISystem();

  const prefersReducedMotion = useReducedMotion();

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.infoboxAnimations, tokens.animations),
    [tokens.infoboxAnimations, tokens.animations],
  );

  // ─── Semantic color targets ───────────────────────

  const lightSemanticColors = tokens.colors.light.infobox[type];

  const darkSemanticColors = tokens.colors.dark.infobox[type];

  /**
   * Infobox semantic types are discrete states rather than positions on
   * an ordinal axis.
   *
   * Each visual color therefore moves directly from its currently
   * rendered value toward the new semantic target.
   */
  const lightBorderColor = useSharedValue(lightSemanticColors.border);

  const darkBorderColor = useSharedValue(darkSemanticColors.border);

  const lightTextColor = useSharedValue(lightSemanticColors.text);

  const darkTextColor = useSharedValue(darkSemanticColors.text);

  const lightIconColor = useSharedValue(lightSemanticColors.icon);

  const darkIconColor = useSharedValue(darkSemanticColors.icon);

  useEffect(() => {
    const updateColor = (value: SharedValue<string>, target: string) => {
      cancelAnimation(value);

      value.value = prefersReducedMotion
        ? target
        : withTiming(target, animationConfig);
    };

    updateColor(lightBorderColor, lightSemanticColors.border);

    updateColor(darkBorderColor, darkSemanticColors.border);

    updateColor(lightTextColor, lightSemanticColors.text);

    updateColor(darkTextColor, darkSemanticColors.text);

    updateColor(lightIconColor, lightSemanticColors.icon);

    updateColor(darkIconColor, darkSemanticColors.icon);

    return () => {
      cancelAnimation(lightBorderColor);
      cancelAnimation(darkBorderColor);

      cancelAnimation(lightTextColor);
      cancelAnimation(darkTextColor);

      cancelAnimation(lightIconColor);
      cancelAnimation(darkIconColor);
    };
  }, [
    prefersReducedMotion,
    animationConfig,

    lightSemanticColors.border,
    lightSemanticColors.text,
    lightSemanticColors.icon,

    darkSemanticColors.border,
    darkSemanticColors.text,
    darkSemanticColors.icon,

    lightBorderColor,
    darkBorderColor,
    lightTextColor,
    darkTextColor,
    lightIconColor,
    darkIconColor,
  ]);

  // ─── Theme-aware rendered colors ──────────────────

  const animatedBorderColor = useDerivedValue<string>(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBorderColor.value, lightBorderColor.value],
    ),
  );

  const animatedTextColor = useDerivedValue<string>(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkTextColor.value, lightTextColor.value],
    ),
  );

  const animatedIconColor = useDerivedValue<string>(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkIconColor.value, lightIconColor.value],
    ),
  );

  // ─── Layout ───────────────────────────────────────

  const containerLayoutStyle = useMemo<ViewStyle>(
    () => ({
      borderRadius: tokens.radius.infobox,
      borderWidth: tokens.border.infobox,
      gap: tokens.spacing.xs,
      paddingVertical: tokens.spacing.xs,
      paddingHorizontal: tokens.spacing.s,
    }),
    [
      tokens.radius.infobox,
      tokens.border.infobox,
      tokens.spacing.xs,
      tokens.spacing.s,
    ],
  );

  const {
    fontSize: textFontSize,
    lineHeight: textLineHeight,
    style: textTypographyStyle,
  } = useMemo(
    () => resolveTypographyStyle(tokens.typography.infobox.text),
    [tokens.typography.infobox.text],
  );

  // ─── Animated styles ──────────────────────────────

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: animatedBorderColor.value,
  }));

  const animatedTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: textFontSize * fontScale.value,

    lineHeight:
      textLineHeight != null ? textLineHeight * fontScale.value : undefined,
  }));

  const animatedTextColorStyle = useAnimatedStyle(() => ({
    color: animatedTextColor.value,
  }));

  // ─── Content ──────────────────────────────────────

  const resolvedText = resolveTextContent(children);

  const contentNode =
    resolvedText !== null ? (
      <Animated.Text
        testID={testID ? `${testID}-text` : undefined}
        allowFontScaling={false}
        maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
        style={[
          textTypographyStyle,
          animatedTextSizeStyle,
          animatedTextColorStyle,
        ]}
      >
        {resolvedText}
      </Animated.Text>
    ) : (
      children
    );

  const iconNode =
    customIcon !== undefined ? (
      customIcon
    ) : (
      <Icon
        type={icon ?? DEFAULT_ICON_BY_TYPE[type]}
        testID={testID ? `${testID}-icon` : undefined}
        scaleWithFont
        animatedColor={animatedIconColor}
        accessible={false}
      />
    );

  // ─── Render ───────────────────────────────────────

  return (
    <Animated.View
      ref={ref}
      {...viewProps}
      testID={testID}
      style={[
        styles.container,
        containerLayoutStyle,
        animatedContainerStyle,
        style,
      ]}
    >
      {iconNode}

      <View style={styles.content}>{contentNode}</View>
    </Animated.View>
  );
};

export const Infobox = memo(InfoboxComponent);

Infobox.displayName = "Infobox";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },

  content: {
    flexShrink: 1,
    justifyContent: "center",
  },
});
