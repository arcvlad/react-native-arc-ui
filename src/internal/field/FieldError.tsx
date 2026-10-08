import { memo, useMemo } from "react";
import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { Icon } from "../../components/Icon/Icon";
import { useARCUISystem, useARCUITheme } from "../../contexts/hooks";
import { useEnteringExiting } from "../../hooks/useEnteringExiting";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { TFieldAnimatedString, TFieldTypography } from "./types";

interface IFieldError {
  children: string;
  color: TFieldAnimatedString;
  typography?: TFieldTypography;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

const FieldErrorComponent = ({
  children,
  color,
  typography,
  style,
  textStyle,
  testID,
}: IFieldError) => {
  const { tokens } = useARCUITheme();
  const { fontScale } = useARCUISystem();

  const { entering, exiting } = useEnteringExiting();

  const resolvedTypography = typography ?? tokens.typography.input.error;

  const fontSize = resolvedTypography.fontSize;
  const lineHeight = resolvedTypography.lineHeight;

  const rowStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xxs,
    }),
    [tokens.spacing.xxs],
  );

  const typographyStyle = useMemo(
    () => resolveTypographyStyle(resolvedTypography).style,
    [resolvedTypography],
  );

  const animatedTextColorStyle = useAnimatedStyle(() => ({
    color: color.value,
  }));

  const animatedTextSizeStyle = useAnimatedStyle(() => ({
    fontSize: fontSize * fontScale.value,

    lineHeight:
      lineHeight != null ? lineHeight * fontScale.value : undefined,
  }));

  return (
    <Animated.View
      testID={testID}
      entering={entering}
      exiting={exiting}
      accessible
      role="alert"
      accessibilityRole="alert"
      accessibilityLabel={children}
      accessibilityLiveRegion="polite"
      style={[styles.container, rowStyle, style]}
    >
      <Icon
        type="alertCircle"
        size={tokens.sizings.icon.xs}
        animatedColor={color}
      />

      <Animated.Text
        accessible={false}
        allowFontScaling={false}
        maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
        style={[
          styles.text,
          typographyStyle,
          textStyle,
          animatedTextSizeStyle,
          animatedTextColorStyle,
        ]}
      >
        {children}
      </Animated.Text>
    </Animated.View>
  );
};

export const FieldError = memo(FieldErrorComponent);

FieldError.displayName = "FieldError";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  text: {
    flex: 1,
  },
});
