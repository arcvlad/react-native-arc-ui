import { memo, type ReactElement } from "react";
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useDerivedValue,
} from "react-native-reanimated";
import Svg, { G } from "react-native-svg";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { resolveNonNegativeMetric } from "../../utils/numberUtils";

import type { IIcon } from "./types";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const AnimatedG = Animated.createAnimatedComponent(G);

const IconComponent = ({
  ref,
  type,
  size,
  color,
  darkColor,
  lightColor,
  animatedColor,
  reverseThemeColor = false,
  scaleWithFont = false,
  strokeWidth,
  accessible,
  accessibilityLabel,
  ...svgProps
}: IIcon) => {
  const { tokens, iconSet } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale } = useARCUISystem();

  /**
   * Runtime lookup intentionally accepts unknown strings.
   *
   * TypeScript consumers are constrained by TIconType, while JavaScript
   * consumers still receive graceful behavior instead of a render crash.
   */
  const runtimeIconRegistry: Readonly<
    Record<string, ReactElement | undefined>
  > = iconSet;

  // ─── Resolution ──────────────────────────────────

  const resolvedSize = resolveNonNegativeMetric(size, tokens.sizings.icon.m);

  const resolvedStrokeWidth = resolveNonNegativeMetric(
    strokeWidth,
    tokens.sizings.icon.strokeWidth,
  );

  const path = runtimeIconRegistry[type];

  if (__DEV__ && path == null) {
    console.error(
      `[react-native-arc-ui] Icon type "${type}" not found. ` +
        `Available types: ${Object.keys(iconSet).join(", ")}`,
    );
  }

  // ─── Theme resolution ────────────────────────────

  const defaultDarkColor = tokens.colors.dark.icon.primary;

  const defaultLightColor = tokens.colors.light.icon.primary;

  /**
   * reverseThemeColor applies only to ARCUI defaults.
   *
   * Explicit color inputs describe the consumer's intended colors and
   * therefore must not be silently reversed.
   */
  const resolvedDefaultDarkColor = reverseThemeColor
    ? defaultLightColor
    : defaultDarkColor;

  const resolvedDefaultLightColor = reverseThemeColor
    ? defaultDarkColor
    : defaultLightColor;

  const hasThemeColorPair = darkColor != null && lightColor != null;

  /**
   * Color ownership priority:
   *
   * animatedColor
   * -> fixed color
   * -> complete theme pair
   * -> ARCUI default / reversed default
   *
   * animatedColor is already the final rendered color, so Icon never
   * applies another theme interpolation on top of it.
   */
  const resolvedColor = useDerivedValue<string>(() => {
    if (animatedColor != null) {
      return animatedColor.value;
    }

    if (color != null) {
      return color;
    }

    if (hasThemeColorPair) {
      return interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkColor, lightColor],
      );
    }

    return interpolateColor(
      themeProgress.value,
      [0, 1],
      [resolvedDefaultDarkColor, resolvedDefaultLightColor],
    );
  });

  // ─── Animated SVG props ──────────────────────────

  /**
   * IMPORTANT — keep animated color on the inner G, not on the root Svg.
   *
   * This separation is intentional and runtime-validated.
   *
   * ARCUI's SVG animation probe confirmed that color-like props animate
   * frame-by-frame when applied to react-native-svg shape/group nodes:
   *
   * - Path stroke
   * - Circle stroke / fill
   * - G color / stroke / fill
   *
   * The same animated color-like props applied to the root Svg rendered only
   * their final value on the tested runtime, producing a visible snap at the
   * end of the animation.
   *
   * In particular:
   *
   *   AnimatedSvg.color  -> child currentColor  = final-value snap
   *   AnimatedSvg.stroke / fill                 = final-value snap
   *   AnimatedG.color    -> child currentColor  = smooth
   *
   * currentColor inheritance itself is therefore not the issue. The important
   * distinction is that animated paint state lives inside the SVG render tree
   * rather than on its root container.
   *
   * Keep responsibilities separated:
   *
   *   AnimatedSvg
   *   - viewport / SVG container
   *   - animated width / height
   *   - ref / accessibility
   *
   *   AnimatedG
   *   - animated glyph color
   *   - currentColor inheritance for the icon glyph tree
   *
   * Do not move color back to AnimatedSvg without first reproducing and
   * validating the SVG animation probe on the supported ARCUI runtime matrix.
   */
  const animatedSvgProps = useAnimatedProps(() => {
    const resolvedFontScale = scaleWithFont ? fontScale.value : 1;

    return {
      width: resolvedSize * resolvedFontScale,
      height: resolvedSize * resolvedFontScale,
    };
  });

  /**
   * Color is owned by the animated group.
   *
   * Existing glyphs can continue using inherited root stroke=currentColor,
   * explicit fill=currentColor, or their existing geometry unchanged.
   */
  const animatedColorProps = useAnimatedProps(() => ({
    color: resolvedColor.value,
  }));

  // ─── Accessibility ───────────────────────────────

  /**
   * Icons are decorative by default.
   *
   * Supplying an accessibilityLabel makes a standalone Icon meaningful
   * unless the consumer explicitly overrides accessible.
   */
  const resolvedAccessible = accessible ?? accessibilityLabel != null;

  // ─── Render ──────────────────────────────────────

  return (
    <AnimatedSvg
      ref={ref}
      {...svgProps}
      accessible={resolvedAccessible}
      accessibilityLabel={accessibilityLabel}
      animatedProps={animatedSvgProps}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={resolvedStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* AnimatedG intentionally owns paint animation. See rationale above. */}
      <AnimatedG animatedProps={animatedColorProps}>{path ?? null}</AnimatedG>
    </AnimatedSvg>
  );
};

export const Icon = memo(IconComponent);

Icon.displayName = "Icon";
