import { memo, useMemo } from "react";
import { StyleSheet, View, type StyleProp, type TextStyle } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { useARCUISystem, useARCUITheme } from "../../contexts/hooks";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { TFieldAnimatedString, TFieldTypography } from "./types";

interface IFieldCharCount {
  count: number;
  maxLength?: number;
  color: TFieldAnimatedString;
  typography: TFieldTypography;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

const FieldCharCountComponent = ({
  count,
  maxLength,
  color,
  typography,
  style,
  testID,
}: IFieldCharCount) => {
  const { tokens } = useARCUITheme();
  const { fontScale } = useARCUISystem();

  const fontSize = typography.fontSize;
  const lineHeight = typography.lineHeight;

  const typographyStyle = useMemo<TextStyle>(
    () => ({
      ...resolveTypographyStyle(typography).style,
      fontVariant: ["tabular-nums"],
    }),
    [typography],
  );

  const animatedSizeStyle = useAnimatedStyle(() => ({
    fontSize: fontSize * fontScale.value,

    lineHeight:
      lineHeight != null ? lineHeight * fontScale.value : undefined,
  }));

  const animatedColorStyle = useAnimatedStyle(() => ({
    color: color.value,
  }));

  const text = maxLength != null ? `${count}/${maxLength}` : `${count}`;

  /**
   * When a hard limit exists, reserve enough horizontal space for the
   * widest count shape from the first render.
   *
   * Combined with tabular numerals this keeps the neighboring error text
   * width stable while the count changes.
   */
  const reservedText = maxLength != null ? `${maxLength}/${maxLength}` : text;

  return (
    <View style={styles.container}>
      <Animated.Text
        accessible={false}
        allowFontScaling={false}
        maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
        numberOfLines={1}
        style={[typographyStyle, styles.measure, style, animatedSizeStyle]}
      >
        {reservedText}
      </Animated.Text>

      <Animated.Text
        testID={testID}
        accessible
        accessibilityLabel={text}
        allowFontScaling={false}
        maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
        numberOfLines={1}
        style={[
          typographyStyle,
          styles.value,
          style,
          animatedSizeStyle,
          animatedColorStyle,
        ]}
      >
        {text}
      </Animated.Text>
    </View>
  );
};

export const FieldCharCount = memo(FieldCharCountComponent);

FieldCharCount.displayName = "FieldCharCount";

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
    position: "relative",
  },

  measure: {
    opacity: 0,
  },

  value: {
    position: "absolute",
    top: 0,
    right: 0,
    textAlign: "right",
  },
});
