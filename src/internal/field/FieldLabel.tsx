import { memo, useMemo } from "react";
import type { StyleProp, TextStyle } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { useARCUISystem, useARCUITheme } from "../../contexts/hooks";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { TFieldAnimatedString, TFieldTypography } from "./types";

interface IFieldLabel {
  children: string;
  color: TFieldAnimatedString;
  typography?: TFieldTypography;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

const FieldLabelComponent = ({
  children,
  color,
  typography,
  style,
  testID,
}: IFieldLabel) => {
  const { tokens } = useARCUITheme();
  const { fontScale } = useARCUISystem();

  const resolvedTypography = typography ?? tokens.typography.input.label;

  const fontSize = resolvedTypography.fontSize;
  const lineHeight = resolvedTypography.lineHeight;

  const typographyStyle = useMemo(
    () => resolveTypographyStyle(resolvedTypography).style,
    [resolvedTypography],
  );

  const animatedColorStyle = useAnimatedStyle(() => ({
    color: color.value,
  }));

  const animatedSizeStyle = useAnimatedStyle(() => ({
    fontSize: fontSize * fontScale.value,

    lineHeight:
      lineHeight != null ? lineHeight * fontScale.value : undefined,
  }));

  return (
    <Animated.Text
      testID={testID}
      accessible={false}
      allowFontScaling={false}
      maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
      style={[typographyStyle, style, animatedSizeStyle, animatedColorStyle]}
    >
      {children}
    </Animated.Text>
  );
};

export const FieldLabel = memo(FieldLabelComponent);

FieldLabel.displayName = "FieldLabel";
