import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { type LayoutChangeEvent, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { useARCUIAnimatedTheme, useARCUITheme } from "../../contexts/hooks";
import { resolveAnimation } from "../../utils/resolveAnimation";
import type { ISkeletonLoader } from "./types";
import {
  resolveDimension,
  resolveFiniteMetric,
  resolveNonNegativeMetric,
} from "../../utils/numberUtils";

interface ISkeletonLayout {
  width: number;
  height: number;
}

const SkeletonLoaderComponent = ({
  variant = "rect",
  width,
  height,
  size,
  radius,
  angle,
  style,
  testID,
}: ISkeletonLoader) => {
  const { tokens } = useARCUITheme();
  const { themeProgress } = useARCUIAnimatedTheme();

  const prefersReducedMotion = useReducedMotion();

  const [layout, setLayout] = useState<ISkeletonLayout>({
    width: 0,
    height: 0,
  });

  // ─── Resolved props / tokens ─────────────────────────────────────────────

  const isFixedShape = variant === "circle" || variant === "square";

  const resolvedSize = resolveNonNegativeMetric(
    size,
    tokens.sizings.skeleton.size,
  );

  const resolvedWidth = isFixedShape
    ? resolvedSize
    : resolveDimension(width ?? "100%", "100%");

  const resolvedHeight = isFixedShape
    ? resolvedSize
    : resolveDimension(
        height ?? tokens.sizings.skeleton.height,
        tokens.sizings.skeleton.height,
      );

  const resolvedRadius =
    variant === "circle"
      ? resolvedSize / 2
      : resolveNonNegativeMetric(radius, tokens.radius.skeleton);

  const resolvedAngle = resolveFiniteMetric(
    angle,
    tokens.skeletonAnimations.angle,
  );

  const requestedShimmerWidthRatio =
    tokens.skeletonAnimations.shimmerWidthRatio;

  const shimmerWidthRatio = Number.isFinite(requestedShimmerWidthRatio)
    ? Math.min(1, Math.max(0, requestedShimmerWidthRatio))
    : 0;

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.skeletonAnimations, tokens.animations),
    [tokens.skeletonAnimations, tokens.animations],
  );

  // ─── Component geometry ──────────────────────────────────────────────────

  const geometryStyle = useMemo<ViewStyle>(
    () => ({
      width: resolvedWidth,
      height: resolvedHeight,
      borderRadius: resolvedRadius,
      overflow: "hidden",
    }),
    [resolvedWidth, resolvedHeight, resolvedRadius],
  );

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout;

    setLayout((current) => {
      if (current.width === nextWidth && current.height === nextHeight) {
        return current;
      }

      return {
        width: nextWidth,
        height: nextHeight,
      };
    });
  }, []);

  // ─── Theme colors ────────────────────────────────────────────────────────

  const lightBase = tokens.colors.light.skeleton.base;

  const darkBase = tokens.colors.dark.skeleton.base;

  const lightHighlight = tokens.colors.light.skeleton.highlight;

  const darkHighlight = tokens.colors.dark.skeleton.highlight;

  // ─── Base surface ────────────────────────────────────────────────────────

  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBase, lightBase],
    ),
  }));

  // ─── Shimmer geometry ────────────────────────────────────────────────────

  /**
   * Predictable shimmer geometry:
   *
   * shimmerWidth = Skeleton width × shimmerWidthRatio
   *
   * No minimum, maximum or height-based correction is applied.
   */
  const shimmerWidth = layout.width * shimmerWidthRatio;

  /**
   * Internal rendering surface.
   *
   * This only provides enough vertical space for the statically
   * rotated shimmer to cover the Skeleton without clipping.
   */
  const shimmerHeight =
    layout.height > 0 ? Math.max(layout.height * 4, shimmerWidth * 2) : 0;

  const shimmerTop = (layout.height - shimmerHeight) / 2;

  /**
   * Rotation increases the horizontal visual footprint of the shimmer.
   *
   * The translated wrapper itself remains shimmerWidth wide, while its
   * rotated content can extend beyond both horizontal edges.
   *
   * Account for that overflow when calculating travel so the complete
   * visual band is outside the Skeleton before withRepeat resets.
   */
  const shimmerAngleRadians = (resolvedAngle * Math.PI) / 180;

  const rotatedShimmerWidth =
    Math.abs(shimmerWidth * Math.cos(shimmerAngleRadians)) +
    Math.abs(shimmerHeight * Math.sin(shimmerAngleRadians));

  const shimmerHorizontalOverflow = Math.max(
    0,
    (rotatedShimmerWidth - shimmerWidth) / 2,
  );

  const shimmerGeometryStyle = useMemo<ViewStyle>(
    () => ({
      position: "absolute",
      width: shimmerWidth,
      height: shimmerHeight,
      top: shimmerTop,
      left: 0,
    }),
    [shimmerWidth, shimmerHeight, shimmerTop],
  );

  /**
   * Angle affects only the visual shimmer band.
   * Travel remains horizontal.
   */
  const rotatedShimmerStyle = useMemo<ViewStyle>(
    () => ({
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      transform: [
        {
          rotate: `${resolvedAngle}deg`,
        },
      ],
    }),
    [resolvedAngle],
  );

  // ─── Shimmer motion ──────────────────────────────────────────────────────

  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(shimmerProgress);

    shimmerProgress.value = 0;

    if (prefersReducedMotion || layout.width <= 0 || shimmerWidth <= 0) {
      return;
    }

    shimmerProgress.value = withRepeat(
      withTiming(1, animationConfig),
      -1,
      false,
    );

    return () => {
      cancelAnimation(shimmerProgress);
    };
  }, [
    prefersReducedMotion,
    layout.width,
    shimmerWidth,
    shimmerHorizontalOverflow,
    shimmerProgress,
    animationConfig,
  ]);

  /**
   * The only continuously animated shimmer property.
   *
   * SVG, gradient stops and rotation remain static.
   *
   * Horizontal travel includes the visual overflow created by rotation
   * so repeat resets always happen fully outside the Skeleton.
   */
  const animatedShimmerStyle = useAnimatedStyle(() => {
    const start = -(shimmerWidth + shimmerHorizontalOverflow);

    const end = layout.width + shimmerHorizontalOverflow;

    return {
      transform: [
        {
          translateX: start + (end - start) * shimmerProgress.value,
        },
      ],
    };
  }, [layout.width, shimmerWidth, shimmerHorizontalOverflow]);

  // ─── Theme crossfade ─────────────────────────────────────────────────────

  const animatedDarkShimmerStyle = useAnimatedStyle(() => ({
    opacity: 1 - themeProgress.value,
  }));

  const animatedLightShimmerStyle = useAnimatedStyle(() => ({
    opacity: themeProgress.value,
  }));

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <Animated.View
      testID={testID}
      onLayout={handleLayout}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[animatedContainerStyle, style, geometryStyle]}
    >
      {!prefersReducedMotion && shimmerWidth > 0 && layout.height > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[shimmerGeometryStyle, animatedShimmerStyle]}
        >
          {/* Dark theme shimmer */}

          <Animated.View
            style={[rotatedShimmerStyle, animatedDarkShimmerStyle]}
          >
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
            >
              <Defs>
                <LinearGradient
                  id="skeleton-shimmer-dark"
                  x1={0}
                  y1={0}
                  x2={1}
                  y2={0}
                >
                  <Stop offset={0} stopColor={darkHighlight} stopOpacity={0} />

                  <Stop
                    offset={0.1}
                    stopColor={darkHighlight}
                    stopOpacity={0.07}
                  />

                  <Stop
                    offset={0.2}
                    stopColor={darkHighlight}
                    stopOpacity={0.14}
                  />

                  <Stop
                    offset={0.3}
                    stopColor={darkHighlight}
                    stopOpacity={0.21}
                  />

                  <Stop
                    offset={0.4}
                    stopColor={darkHighlight}
                    stopOpacity={0.28}
                  />

                  <Stop
                    offset={0.5}
                    stopColor={darkHighlight}
                    stopOpacity={0.3}
                  />

                  <Stop
                    offset={0.6}
                    stopColor={darkHighlight}
                    stopOpacity={0.28}
                  />

                  <Stop
                    offset={0.7}
                    stopColor={darkHighlight}
                    stopOpacity={0.21}
                  />

                  <Stop
                    offset={0.8}
                    stopColor={darkHighlight}
                    stopOpacity={0.14}
                  />

                  <Stop
                    offset={0.9}
                    stopColor={darkHighlight}
                    stopOpacity={0.07}
                  />

                  <Stop offset={1} stopColor={darkHighlight} stopOpacity={0} />
                </LinearGradient>
              </Defs>

              <Rect width={1} height={1} fill="url(#skeleton-shimmer-dark)" />
            </Svg>
          </Animated.View>

          {/* Light theme shimmer */}

          <Animated.View
            style={[rotatedShimmerStyle, animatedLightShimmerStyle]}
          >
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
            >
              <Defs>
                <LinearGradient
                  id="skeleton-shimmer-light"
                  x1={0}
                  y1={0}
                  x2={1}
                  y2={0}
                >
                  <Stop offset={0} stopColor={lightHighlight} stopOpacity={0} />

                  <Stop
                    offset={0.1}
                    stopColor={lightHighlight}
                    stopOpacity={0.1}
                  />

                  <Stop
                    offset={0.2}
                    stopColor={lightHighlight}
                    stopOpacity={0.25}
                  />

                  <Stop
                    offset={0.3}
                    stopColor={lightHighlight}
                    stopOpacity={0.4}
                  />

                  <Stop
                    offset={0.4}
                    stopColor={lightHighlight}
                    stopOpacity={0.55}
                  />

                  <Stop
                    offset={0.5}
                    stopColor={lightHighlight}
                    stopOpacity={0.6}
                  />

                  <Stop
                    offset={0.6}
                    stopColor={lightHighlight}
                    stopOpacity={0.55}
                  />

                  <Stop
                    offset={0.7}
                    stopColor={lightHighlight}
                    stopOpacity={0.4}
                  />

                  <Stop
                    offset={0.8}
                    stopColor={lightHighlight}
                    stopOpacity={0.25}
                  />

                  <Stop
                    offset={0.9}
                    stopColor={lightHighlight}
                    stopOpacity={0.1}
                  />

                  <Stop offset={1} stopColor={lightHighlight} stopOpacity={0} />
                </LinearGradient>
              </Defs>

              <Rect width={1} height={1} fill="url(#skeleton-shimmer-light)" />
            </Svg>
          </Animated.View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

export const SkeletonLoader = memo(SkeletonLoaderComponent);

SkeletonLoader.displayName = "SkeletonLoader";
