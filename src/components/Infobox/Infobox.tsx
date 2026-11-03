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
import { resolveThemeColor } from "../../utils/resolveThemeColor";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import { Icon } from "../Icon/Icon";

import type { TIconType } from "../Icon/types";
import type { IInfobox, TInfoboxTone } from "./types";

const DEFAULT_ICON_BY_TONE = {
  info: "info",
  success: "check",
  warning: "alertCircle",
  danger: "xCircle",
} as const satisfies Record<TInfoboxTone, TIconType>;

const resolveInfoboxTone = (value: unknown): TInfoboxTone => {
  switch (value) {
    case "info":
    case "success":
    case "warning":
    case "danger":
      return value;

    case undefined:
      return "info";

    default:
      if (__DEV__) {
        console.error(
          `[react-native-arc-ui] Infobox tone "${String(
            value,
          )}" is invalid. Falling back to "info".`,
        );
      }

      return "info";
  }
};

const InfoboxComponent = ({
  ref,
  children,
  tone: toneProp = "info",
  colors,
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

  const tone = resolveInfoboxTone(toneProp);

  const lightSemanticColors = tokens.colors.light.infobox[tone];
  const darkSemanticColors = tokens.colors.dark.infobox[tone];

  const background = resolveThemeColor(
    colors?.background,
    lightSemanticColors.background,
    darkSemanticColors.background,
    "Infobox.colors.background",
  );

  const border = resolveThemeColor(
    colors?.border,
    lightSemanticColors.border,
    darkSemanticColors.border,
    "Infobox.colors.border",
  );

  const textColor = resolveThemeColor(
    colors?.text,
    lightSemanticColors.text,
    darkSemanticColors.text,
    "Infobox.colors.text",
  );

  const iconColor = resolveThemeColor(
    colors?.icon,
    lightSemanticColors.icon,
    darkSemanticColors.icon,
    "Infobox.colors.icon",
  );

  /**
   * Infobox tones are discrete semantic states rather than positions on
   * an ordinal axis.
   *
   * Each visual color therefore moves directly from its currently rendered
   * value toward the new tone/override target.
   */
  const lightBackgroundColor = useSharedValue(background.light);
  const darkBackgroundColor = useSharedValue(background.dark);

  const lightBorderColor = useSharedValue(border.light);
  const darkBorderColor = useSharedValue(border.dark);

  const lightTextColor = useSharedValue(textColor.light);
  const darkTextColor = useSharedValue(textColor.dark);

  const lightIconColor = useSharedValue(iconColor.light);
  const darkIconColor = useSharedValue(iconColor.dark);

  useEffect(() => {
    const updateColor = (value: SharedValue<string>, target: string) => {
      cancelAnimation(value);

      value.value = prefersReducedMotion
        ? target
        : withTiming(target, animationConfig);
    };

    updateColor(lightBackgroundColor, background.light);
    updateColor(darkBackgroundColor, background.dark);

    updateColor(lightBorderColor, border.light);
    updateColor(darkBorderColor, border.dark);

    updateColor(lightTextColor, textColor.light);
    updateColor(darkTextColor, textColor.dark);

    updateColor(lightIconColor, iconColor.light);
    updateColor(darkIconColor, iconColor.dark);

    return () => {
      cancelAnimation(lightBackgroundColor);
      cancelAnimation(darkBackgroundColor);

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
    background.light,
    background.dark,
    border.light,
    border.dark,
    textColor.light,
    textColor.dark,
    iconColor.light,
    iconColor.dark,
    lightBackgroundColor,
    darkBackgroundColor,
    lightBorderColor,
    darkBorderColor,
    lightTextColor,
    darkTextColor,
    lightIconColor,
    darkIconColor,
  ]);

  // ─── Theme-aware rendered colors ──────────────────

  /**
   * Container/text colors share the same dependencies and render lifecycle,
   * so keep them in one derived worklet. Icon remains separate because Icon's
   * public animatedColor contract requires a string Shared/DerivedValue.
   */
  const animatedSurfaceColors = useDerivedValue(() => ({
    background: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBackgroundColor.value, lightBackgroundColor.value],
    ),

    border: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBorderColor.value, lightBorderColor.value],
    ),

    text: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkTextColor.value, lightTextColor.value],
    ),
  }));

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

  // ─── Native style color ownership ────────────────

  const { resolvedConsumerStyle, styleOwnsBackground, styleOwnsBorder } =
    useMemo(() => {
      const flattenedStyle: ViewStyle = {
        ...(StyleSheet.flatten(style) ?? {}),
      };

      const hasBackgroundColorOverride = colors?.background !== undefined;
      const hasBorderColorOverride = colors?.border !== undefined;

      const resolvedStyle: ViewStyle = { ...flattenedStyle };

      if (hasBackgroundColorOverride) {
        delete resolvedStyle.backgroundColor;
      }

      if (hasBorderColorOverride) {
        delete resolvedStyle.borderColor;
        delete resolvedStyle.borderTopColor;
        delete resolvedStyle.borderRightColor;
        delete resolvedStyle.borderBottomColor;
        delete resolvedStyle.borderLeftColor;
        delete resolvedStyle.borderStartColor;
        delete resolvedStyle.borderEndColor;
      }

      return {
        resolvedConsumerStyle: resolvedStyle,
        styleOwnsBackground:
          !hasBackgroundColorOverride &&
          flattenedStyle.backgroundColor !== undefined,
        styleOwnsBorder:
          !hasBorderColorOverride && flattenedStyle.borderColor !== undefined,
      };
    }, [colors?.background, colors?.border, style]);

  // ─── Animated styles ──────────────────────────────

  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: styleOwnsBackground
      ? undefined
      : animatedSurfaceColors.value.background,
    borderColor: styleOwnsBorder
      ? undefined
      : animatedSurfaceColors.value.border,
  }));

  const animatedTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: textFontSize * fontScale.value,

    lineHeight:
      textLineHeight != null ? textLineHeight * fontScale.value : undefined,
  }));

  const animatedTextColorStyle = useAnimatedStyle(() => ({
    color: animatedSurfaceColors.value.text,
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
        type={icon ?? DEFAULT_ICON_BY_TONE[tone]}
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
        resolvedConsumerStyle,
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
