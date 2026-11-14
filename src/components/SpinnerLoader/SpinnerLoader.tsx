import { memo, useEffect, useMemo } from "react";
import Animated, {
  cancelAnimation,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { resolveThemeColor } from "../../utils/resolveThemeColor";

import type { ISpinnerLoader } from "./types";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Visible portion of the circular spinner track.
 *
 * Kept internal because this is SpinnerLoader geometry rather than
 * application-level sizing or layout configuration.
 */
const SPINNER_ARC_RATIO = 0.75;

const SpinnerLoaderComponent = ({
  ref,
  size,
  scaleWithFont = false,
  colors,
  style,
  ...viewProps
}: ISpinnerLoader) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale } = useARCUISystem();

  const prefersReducedMotion = useReducedMotion();

  // ─── Resolved geometry ───────────────────────────────────────────────────

  const tokenSize = tokens.sizings.spinnerLoader.size;

  const hasValidSize =
    size === undefined || (Number.isFinite(size) && size > 0);

  const resolvedSize = hasValidSize ? (size ?? tokenSize) : tokenSize;

  if (__DEV__ && !hasValidSize) {
    console.error(
      "[react-native-arc-ui] SpinnerLoader: size must be a finite number greater than zero. Falling back to tokens.sizings.spinnerLoader.size.",
    );
  }

  const resolvedBorderWidth = tokens.border.spinnerLoader;

  /**
   * SVG geometry is expressed in the component's unscaled coordinate space.
   *
   * When scaleWithFont is enabled, the outer SVG viewport scales the complete
   * geometry proportionally, including stroke width.
   */
  const center = resolvedSize / 2;

  const radius = Math.max(0, (resolvedSize - resolvedBorderWidth) / 2);

  const circumference = 2 * Math.PI * radius;

  const visibleArcLength = circumference * SPINNER_ARC_RATIO;

  const hiddenArcLength = circumference - visibleArcLength;

  // ─── Animation ───────────────────────────────────────────────────────────

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.spinnerLoaderAnimations, tokens.animations),
    [tokens.spinnerLoaderAnimations, tokens.animations],
  );

  const rotation = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(rotation);

    rotation.value = 0;

    if (prefersReducedMotion) {
      return () => {
        cancelAnimation(rotation);
      };
    }

    rotation.value = withRepeat(withTiming(360, animationConfig), -1, false);

    return () => {
      cancelAnimation(rotation);
    };
  }, [animationConfig, prefersReducedMotion, rotation]);

  // ─── Theme colors ────────────────────────────────────────────────────────

  const resolvedIndicatorColor = resolveThemeColor(
    colors?.indicator,
    tokens.colors.light.spinnerLoader.color,
    tokens.colors.dark.spinnerLoader.color,
    "SpinnerLoader colors.indicator",
  );

  const resolvedLightIndicator = resolvedIndicatorColor.light;
  const resolvedDarkIndicator = resolvedIndicatorColor.dark;

  const spinnerColor = useDerivedValue<string>(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [resolvedDarkIndicator, resolvedLightIndicator],
    ),
  );

  // ─── Animated geometry ───────────────────────────────────────────────────

  const animatedSizeStyle = useAnimatedStyle(() => {
    const scale = scaleWithFont ? fontScale.value : 1;

    const renderedSize = resolvedSize * scale;

    return {
      width: renderedSize,
      height: renderedSize,
    };
  });

  const animatedRotationStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotation.value}deg`,
      },
    ],
  }));

  const animatedCircleProps = useAnimatedProps(() => ({
    stroke: spinnerColor.value,
  }));

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <Animated.View ref={ref} {...viewProps} style={[style, animatedSizeStyle]}>
      <Animated.View
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          },
          animatedRotationStyle,
        ]}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${resolvedSize} ${resolvedSize}`}
        >
          <AnimatedCircle
            animatedProps={animatedCircleProps}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={resolvedBorderWidth}
            strokeLinecap="round"
            strokeDasharray={[visibleArcLength, hiddenArcLength]}
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};

export const SpinnerLoader = memo(SpinnerLoaderComponent);

SpinnerLoader.displayName = "SpinnerLoader";
