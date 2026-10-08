import { memo, useMemo } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import {
  resolveDimension,
  resolveNonNegativeMetric,
} from "../../utils/numberUtils";
import { resolveTextContent } from "../../utils/reactNode";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type {
  IDivider,
  TDividerLabelPosition,
  TDividerOrientation,
} from "./types";

const resolveDividerOrientation = (value: string): TDividerOrientation => {
  switch (value) {
    case "horizontal":
    case "vertical":
      return value;

    default:
      if (__DEV__) {
        console.error(
          `[react-native-arc-ui] Divider orientation "${String(
            value,
          )}" is invalid. Falling back to "horizontal".`,
        );
      }

      return "horizontal";
  }
};

const resolveDividerLabelPosition = (value: string): TDividerLabelPosition => {
  switch (value) {
    case "start":
    case "center":
    case "end":
      return value;

    default:
      if (__DEV__) {
        console.error(
          `[react-native-arc-ui] Divider labelPosition "${String(
            value,
          )}" is invalid. Falling back to "center".`,
        );
      }

      return "center";
  }
};

const DividerComponent = ({
  ref,
  orientation = "horizontal",
  length = "100%",
  thickness,
  color,
  darkColor,
  lightColor,
  radius,
  label,
  labelPosition = "center",
  style,
  testID,
  ...props
}: IDivider) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale } = useARCUISystem();

  const resolvedOrientation = resolveDividerOrientation(orientation);

  const resolvedLabelPosition = resolveDividerLabelPosition(labelPosition);

  const resolvedLength = resolveDimension(length, "100%");

  const resolvedThickness = resolveNonNegativeMetric(
    thickness,
    tokens.sizings.divider.thickness,
  );

  const resolvedRadius = resolveNonNegativeMetric(
    radius,
    tokens.radius.divider,
  );

  /**
   * Theme color resolution contract:
   *
   * 1. color -> fixed in both themes
   * 2. darkColor + lightColor -> theme-aware pair
   * 3. only one pair value -> ignore incomplete pair
   * 4. nothing -> semantic Divider tokens
   */
  const hasCustomThemePair =
    darkColor !== undefined && lightColor !== undefined;

  const resolvedLightLineColor =
    color ??
    (hasCustomThemePair ? lightColor : tokens.colors.light.divider.line);

  const resolvedDarkLineColor =
    color ?? (hasCustomThemePair ? darkColor : tokens.colors.dark.divider.line);

  const lightLabelColor = tokens.colors.light.divider.label;

  const darkLabelColor = tokens.colors.dark.divider.label;

  const resolvedLabelText =
    resolvedOrientation === "horizontal" ? resolveTextContent(label) : null;

  /**
   * Empty textual ReactNodes and boolean ReactNode sentinels behave exactly
   * like no label and therefore do not create unnecessary gaps or empty
   * layout slots.
   *
   * A non-textual ReactNode returns null from resolveTextContent and remains
   * valid consumer-owned custom content.
   */
  const hasLabel =
    resolvedOrientation === "horizontal" &&
    label !== undefined &&
    label !== null &&
    typeof label !== "boolean" &&
    (resolvedLabelText === null || resolvedLabelText.length > 0);

  const rootDimensionStyle = useMemo<ViewStyle>(
    () =>
      resolvedOrientation === "horizontal"
        ? {
            width: resolvedLength,
          }
        : {
            width: resolvedThickness,
            height: resolvedLength,
          },
    [resolvedOrientation, resolvedLength, resolvedThickness],
  );

  const lineDimensionStyle = useMemo<ViewStyle>(
    () =>
      resolvedOrientation === "horizontal"
        ? {
            height: resolvedThickness,
            borderRadius: resolvedRadius,
          }
        : {
            width: resolvedThickness,
            height: "100%",
            borderRadius: resolvedRadius,
          },
    [resolvedOrientation, resolvedThickness, resolvedRadius],
  );

  const labelTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.divider.label).style,
    [tokens.typography.divider.label],
  );

  const animatedLineStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [resolvedDarkLineColor, resolvedLightLineColor],
    ),
  }));

  const labelFontSize = tokens.typography.divider.label.fontSize;
  const labelLineHeight = tokens.typography.divider.label.lineHeight;

  const animatedLabelSizeStyle = useAnimatedStyle(() => ({
    fontSize: labelFontSize * fontScale.value,

    lineHeight:
      labelLineHeight != null ? labelLineHeight * fontScale.value : undefined,
  }));

  const animatedLabelColorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkLabelColor, lightLabelColor],
    ),
  }));

  const lineStyle = [
    resolvedOrientation === "horizontal"
      ? styles.horizontalLine
      : styles.verticalLine,
    lineDimensionStyle,
    animatedLineStyle,
  ];

  const startLine = (
    <Animated.View
      accessible={false}
      pointerEvents="none"
      testID={testID ? `${testID}-line-start` : undefined}
      style={lineStyle}
    />
  );

  const endLine = (
    <Animated.View
      accessible={false}
      pointerEvents="none"
      testID={testID ? `${testID}-line-end` : undefined}
      style={lineStyle}
    />
  );

  const singleLine = (
    <Animated.View
      accessible={false}
      pointerEvents="none"
      testID={testID ? `${testID}-line` : undefined}
      style={lineStyle}
    />
  );

  const labelNode = !hasLabel ? null : resolvedLabelText !== null ? (
    <Animated.Text
      allowFontScaling={false}
      maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
      style={[
        styles.label,
        labelTypographyStyle,
        animatedLabelSizeStyle,
        animatedLabelColorStyle,
      ]}
      testID={testID ? `${testID}-label` : undefined}
    >
      {resolvedLabelText}
    </Animated.Text>
  ) : (
    <View
      style={styles.customLabel}
      testID={testID ? `${testID}-label-content` : undefined}
    >
      {label}
    </View>
  );

  const horizontalContent = !hasLabel ? (
    singleLine
  ) : resolvedLabelPosition === "start" ? (
    <>
      {labelNode}
      {endLine}
    </>
  ) : resolvedLabelPosition === "end" ? (
    <>
      {startLine}
      {labelNode}
    </>
  ) : (
    <>
      {startLine}
      {labelNode}
      {endLine}
    </>
  );

  return (
    <View
      ref={ref}
      testID={testID}
      {...props}
      style={[
        resolvedOrientation === "horizontal"
          ? styles.horizontal
          : styles.vertical,

        resolvedOrientation === "horizontal" &&
          hasLabel && {
            gap: tokens.sizings.divider.labelGap,
          },

        rootDimensionStyle,
        style,
      ]}
    >
      {resolvedOrientation === "horizontal" ? horizontalContent : singleLine}
    </View>
  );
};

export const Divider = memo(DividerComponent);

Divider.displayName = "Divider";

const styles = StyleSheet.create({
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
  },

  vertical: {
    alignItems: "center",
  },

  horizontalLine: {
    flex: 1,
  },

  verticalLine: {
    flexShrink: 0,
  },

  label: {
    textAlign: "center",
  },

  customLabel: {
    flexShrink: 0,
  },
});
