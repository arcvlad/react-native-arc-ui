import { memo, useMemo } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { useARCUISystem, useARCUITheme } from "../../contexts/hooks";

import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { ISliderColors, TSliderLayout } from "./types";
import { formatSliderValue, sliderNormalizedToValue } from "./utils";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface ISliderHeader {
  layout: TSliderLayout;
  label?: string;

  min: number;
  max: number;
  step: number;

  isRange: boolean;

  singlePos: SharedValue<number>;
  rangeLoPos: SharedValue<number>;
  rangeHiPos: SharedValue<number>;

  colors: ISliderColors;

  testID?: string;
}

const SliderHeaderComponent = ({
  layout,
  label,
  min,
  max,
  step,
  isRange,
  singlePos,
  rangeLoPos,
  rangeHiPos,
  colors,
  testID,
}: ISliderHeader) => {
  const { tokens } = useARCUITheme();
  const { fontScale } = useARCUISystem();

  const labelTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.slider.label).style,
    [tokens.typography.slider.label],
  );

  const valueTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.slider.value).style,
    [tokens.typography.slider.value],
  );

  const rowTokenStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xs,
    }),
    [tokens.spacing.xs],
  );

  const valueInputTokenStyle = useMemo<TextStyle>(
    () => ({
      minWidth: tokens.sizings.slider.headerValueMinWidth,
    }),
    [tokens.sizings.slider.headerValueMinWidth],
  );

  const labelFontSize = tokens.typography.slider.label.fontSize;

  const valueFontSize = tokens.typography.slider.value.fontSize;

  const labelLineHeight = tokens.typography.slider.label.lineHeight;

  const animatedLabelSizeStyle = useAnimatedStyle(() => ({
    fontSize: labelFontSize * fontScale.value,

    lineHeight:
      labelLineHeight != null
        ? labelLineHeight * fontScale.value
        : undefined,
  }));

  const valueLineHeight = tokens.typography.slider.value.lineHeight;

  const animatedValueSizeStyle = useAnimatedStyle(() => ({
    fontSize: valueFontSize * fontScale.value,

    lineHeight:
      valueLineHeight != null
        ? valueLineHeight * fontScale.value
        : undefined,
  }));

  const animatedTextColorStyle = useAnimatedStyle(() => ({
    color: colors.labelColor.value,
  }));

  const animatedSingleValueProps = useAnimatedProps(() => {
    const value = sliderNormalizedToValue(singlePos.value, min, max, step);

    return {
      value: formatSliderValue(value),
    };
  });

  const animatedRangeValueProps = useAnimatedProps(() => {
    const lower = sliderNormalizedToValue(rangeLoPos.value, min, max, step);

    const upper = sliderNormalizedToValue(rangeHiPos.value, min, max, step);

    return {
      value: `${formatSliderValue(lower)} – ${formatSliderValue(upper)}`,
    };
  });

  if (layout === "none") {
    return null;
  }

  if (layout === "label-value") {
    return (
      <View style={[styles.row, rowTokenStyle]}>
        {label && (
          <Animated.Text
            testID={testID ? `${testID}-label` : undefined}
            accessible={false}
            allowFontScaling={false}
            maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
            numberOfLines={1}
            style={[
              styles.labelText,
              labelTypographyStyle,
              animatedLabelSizeStyle,
              animatedTextColorStyle,
            ]}
          >
            {label}
          </Animated.Text>
        )}

        <AnimatedTextInput
          testID={testID ? `${testID}-value` : undefined}
          accessible={false}
          allowFontScaling={false}
          pointerEvents="none"
          editable={false}
          caretHidden
          numberOfLines={1}
          maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
          animatedProps={
            isRange ? animatedRangeValueProps : animatedSingleValueProps
          }
          style={[
            styles.valueInput,
            valueInputTokenStyle,
            valueTypographyStyle,
            animatedValueSizeStyle,
            animatedTextColorStyle,
          ]}
        />
      </View>
    );
  }

  if (layout === "label-minmax") {
    return (
      <View style={[styles.row, rowTokenStyle]}>
        {label && (
          <Animated.Text
            testID={testID ? `${testID}-label` : undefined}
            accessible={false}
            allowFontScaling={false}
            maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
            numberOfLines={1}
            style={[
              styles.labelText,
              labelTypographyStyle,
              animatedLabelSizeStyle,
              animatedTextColorStyle,
            ]}
          >
            {label}
          </Animated.Text>
        )}

        <Animated.Text
          testID={testID ? `${testID}-minmax` : undefined}
          accessible={false}
          allowFontScaling={false}
          maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
          numberOfLines={1}
          style={[
            labelTypographyStyle,
            animatedLabelSizeStyle,
            animatedTextColorStyle,
          ]}
        >
          {`${formatSliderValue(min)} – ${formatSliderValue(max)}`}
        </Animated.Text>
      </View>
    );
  }

  return (
    <View style={[styles.row, rowTokenStyle]}>
      <Animated.Text
        testID={testID ? `${testID}-min` : undefined}
        accessible={false}
        allowFontScaling={false}
        maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
        style={[
          labelTypographyStyle,
          animatedLabelSizeStyle,
          animatedTextColorStyle,
        ]}
      >
        {formatSliderValue(min)}
      </Animated.Text>

      <Animated.Text
        testID={testID ? `${testID}-max` : undefined}
        accessible={false}
        allowFontScaling={false}
        maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
        style={[
          labelTypographyStyle,
          animatedLabelSizeStyle,
          animatedTextColorStyle,
        ]}
      >
        {formatSliderValue(max)}
      </Animated.Text>
    </View>
  );
};

export const SliderHeader = memo(SliderHeaderComponent);

SliderHeader.displayName = "SliderHeader";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelText: {
    flex: 1,
    flexShrink: 1,
  },
  valueInput: {
    padding: 0,
    margin: 0,
    flexShrink: 0,
    textAlign: "right",
  },
});
