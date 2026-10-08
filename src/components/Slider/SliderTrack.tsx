import { memo, useMemo } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { useARCUITheme } from "../../contexts/hooks";
import { resolveAnimation } from "../../utils/resolveAnimation";

import type { ISliderColors, ISliderSizes } from "./types";
import {
  clampSliderNormalized,
  sliderNormalizedToSnappedNormalized,
  sliderNormalizedToValue,
} from "./utils";

interface ISliderTrack {
  isRange: boolean;

  singlePos: SharedValue<number>;
  rangeLoPos: SharedValue<number>;
  rangeHiPos: SharedValue<number>;

  singleSemanticValue: number;
  lowerSemanticValue: number;
  upperSemanticValue: number;

  min: number;
  max: number;
  step: number;

  sizes: ISliderSizes;
  colors: ISliderColors;

  disabled: boolean;

  onSingleFinish: (
    value: number,
    otherValue: number | undefined,
    emitChange: boolean,
  ) => void;
  onLowerFinish: (
    value: number,
    otherValue: number | undefined,
    emitChange: boolean,
  ) => void;
  onUpperFinish: (
    value: number,
    otherValue: number | undefined,
    emitChange: boolean,
  ) => void;

  testID?: string;
}

const SliderTrackComponent = ({
  isRange,
  singlePos,
  rangeLoPos,
  rangeHiPos,
  singleSemanticValue,
  lowerSemanticValue,
  upperSemanticValue,
  min,
  max,
  step,
  sizes,
  colors,
  disabled,
  onSingleFinish,
  onLowerFinish,
  onUpperFinish,
  testID,
}: ISliderTrack) => {
  const { tokens } = useARCUITheme();

  const prefersReducedMotion = useReducedMotion();

  const { trackHeight, trackWidth, trackOffset } = sizes;

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.sliderAnimations, tokens.animations),
    [tokens.sliderAnimations, tokens.animations],
  );

  const trackGeometryStyle = useMemo<ViewStyle>(
    () => ({
      left: trackOffset,
      right: trackOffset,
      height: trackHeight,
      borderRadius: trackHeight / 2,
    }),
    [trackOffset, trackHeight],
  );

  const tap = Gesture.Tap()
    .enabled(!disabled && trackWidth > 0)
    .onEnd((event) => {
      "worklet";

      if (trackWidth <= 0) {
        return;
      }

      const normalized = clampSliderNormalized(
        (event.x - trackOffset) / trackWidth,
      );

      const snapped = sliderNormalizedToSnappedNormalized(
        normalized,
        min,
        max,
        step,
      );

      if (!isRange) {
        const value = sliderNormalizedToValue(snapped, min, max, step);

        if (value === singleSemanticValue) {
          return;
        }

        cancelAnimation(singlePos);

        singlePos.value = prefersReducedMotion
          ? snapped
          : withTiming(snapped, animationConfig);

        /**
         * A track tap is one complete discrete interaction.
         * The JS-side finish handler emits change first, then commit.
         */
        runOnJS(onSingleFinish)(value, undefined, true);

        return;
      }

      const lowerPosition = rangeLoPos.value;

      const upperPosition = rangeHiPos.value;

      const lowerDistance = Math.abs(snapped - lowerPosition);

      const upperDistance = Math.abs(snapped - upperPosition);

      let useLower = lowerDistance <= upperDistance;

      /**
       * When both thumbs overlap, use the side of
       * the tap to determine which thumb should move.
       */
      if (lowerPosition === upperPosition && lowerDistance === upperDistance) {
        useLower = snapped <= lowerPosition;
      }

      if (useLower) {
        const target = Math.min(snapped, upperPosition);

        const value = sliderNormalizedToValue(target, min, max, step);

        if (value === lowerSemanticValue) {
          return;
        }

        cancelAnimation(rangeLoPos);

        rangeLoPos.value = prefersReducedMotion
          ? target
          : withTiming(target, animationConfig);

        const otherValue = sliderNormalizedToValue(
          upperPosition,
          min,
          max,
          step,
        );

        runOnJS(onLowerFinish)(value, otherValue, true);

        return;
      }

      const target = Math.max(snapped, lowerPosition);

      const value = sliderNormalizedToValue(target, min, max, step);

      if (value === upperSemanticValue) {
        return;
      }

      cancelAnimation(rangeHiPos);

      rangeHiPos.value = prefersReducedMotion
        ? target
        : withTiming(target, animationConfig);

      const otherValue = sliderNormalizedToValue(lowerPosition, min, max, step);

      runOnJS(onUpperFinish)(value, otherValue, true);
    });

  const animatedBaseStyle = useAnimatedStyle(() => ({
    backgroundColor: colors.trackInactiveColor.value,
  }));

  const animatedFillStyle = useAnimatedStyle(() => {
    if (isRange) {
      const lower = clampSliderNormalized(rangeLoPos.value);
      const upper = clampSliderNormalized(rangeHiPos.value);
      const width = Math.max(0, upper - lower);

      if (trackWidth <= 0) {
        /**
         * Initial layout fallback.
         *
         * The fill can render from normalized percentages before the measured
         * track width is available. Gesture math still waits for onLayout.
         */
        return {
          left: `${lower * 100}%` as `${number}%`,
          width: `${width * 100}%` as `${number}%`,
          backgroundColor: colors.trackActiveColor.value,
        };
      }

      return {
        left: lower * trackWidth,
        width: width * trackWidth,
        backgroundColor: colors.trackActiveColor.value,
      };
    }

    const normalized = clampSliderNormalized(singlePos.value);

    if (trackWidth <= 0) {
      return {
        left: 0,
        width: `${normalized * 100}%` as `${number}%`,
        backgroundColor: colors.trackActiveColor.value,
      };
    }

    return {
      left: 0,
      width: normalized * trackWidth,
      backgroundColor: colors.trackActiveColor.value,
    };
  });

  return (
    <GestureDetector gesture={tap}>
      <View style={styles.touchArea}>
        <Animated.View
          testID={testID}
          style={[styles.track, trackGeometryStyle, animatedBaseStyle]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              },
              {
                borderRadius: trackHeight / 2,
              },
              animatedFillStyle,
            ]}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

export const SliderTrack = memo(SliderTrackComponent);

SliderTrack.displayName = "SliderTrack";

const styles = StyleSheet.create({
  touchArea: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
  },

  track: {
    position: "absolute",
    overflow: "hidden",
  },
});
