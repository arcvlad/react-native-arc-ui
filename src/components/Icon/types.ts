import type { ReactElement, Ref } from "react";
import type Svg from "react-native-svg";
import type { SvgProps } from "react-native-svg";

import type { DerivedValue, SharedValue } from "react-native-reanimated";

import type { TRequiredIconType } from "./defaultIcons";

type TLockedIconSvgProps =
  | "children"
  | "width"
  | "height"
  | "viewBox"
  | "fill"
  | "stroke"
  | "strokeWidth"
  | "strokeLinecap"
  | "strokeLinejoin"
  | "color"
  | "onPress"
  | "onPressIn"
  | "onPressOut"
  | "onLongPress";

/**
 * ARCUI-compatible icon registry.
 *
 * Every configured icon set must provide ARCUI's required icon names.
 * Additional library-specific or application-specific glyphs are allowed.
 */
export type TIconSet = Readonly<
  Record<TRequiredIconType, ReactElement> &
    Partial<Record<string, ReactElement>>
>;

/**
 * Icon name from the active ARCUI icon set.
 *
 * ARCUI's required names remain available to autocomplete, while configured
 * icon sets may expose additional library-specific or application-specific
 * names.
 */
export type TIconType = TRequiredIconType | (string & Record<never, never>);

/**
 * UI-thread-owned Icon color.
 *
 * ARCUI 1.x explicitly supports Reanimated as a peer dependency, so the
 * public contract uses the real exported Reanimated value types rather than
 * maintaining a structural lookalike.
 */
export type TIconAnimatedColor = SharedValue<string> | DerivedValue<string>;

export interface IIcon extends Omit<SvgProps, TLockedIconSvgProps> {
  /**
   * React 19 ref-as-prop.
   */
  ref?: Ref<Svg>;

  /**
   * Icon name from the active ARCUI icon set.
   */
  type: TIconType;

  /**
   * Rendered icon size.
   *
   * @default tokens.sizings.icon.m
   */
  size?: number;

  /**
   * Fixed color used in every theme.
   *
   * Ignored when animatedColor is provided.
   */
  color?: string;

  /**
   * Theme-aware color pair.
   *
   * Both values must be provided. An incomplete pair is ignored.
   *
   * Ignored when animatedColor or color is provided.
   */
  darkColor?: string;
  lightColor?: string;

  /**
   * Final UI-thread color owned by the caller.
   *
   * When provided, this is the complete source of truth for Icon color
   * and takes precedence over color, darkColor, lightColor,
   * reverseThemeColor and ARCUI's default icon colors.
   */
  animatedColor?: TIconAnimatedColor;

  /**
   * Reverses ARCUI's default dark/light icon colors.
   *
   * Explicit color props are never reversed.
   *
   * @default false
   */
  reverseThemeColor?: boolean;

  /**
   * Whether Icon size follows ARCUI's accessibility font scale.
   *
   * Icon is a geometric primitive by default, so explicit size means
   * the actual rendered size unless this behavior is opted into.
   *
   * @default false
   */
  scaleWithFont?: boolean;

  /**
   * Stroke width for stroke-based icon glyphs.
   *
   * @default tokens.sizings.icon.strokeWidth
   */
  strokeWidth?: number;
}
