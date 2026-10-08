import { type ReactElement } from "react";
import { Circle, Line, Path, Polyline } from "react-native-svg";

/**
 * ARCUI's required default icon set.
 *
 * Glyph geometry follows Feather Icons.
 *
 * This set contains the icons ARCUI guarantees are available even when
 * no custom icon set is configured.
 */
export const defaultIcons = {
  check: <Polyline points="20 6 9 17 4 12" />,

  alertCircle: (
    <>
      <Circle cx={12} cy={12} r={10} />

      <Line x1={12} y1={8} x2={12} y2={12} />

      <Line x1={12} y1={16} x2={12.01} y2={16} />
    </>
  ),

  info: (
    <>
      <Circle cx={12} cy={12} r={10} />

      <Line x1={12} y1={16} x2={12} y2={12} />

      <Line x1={12} y1={8} x2={12.01} y2={8} />
    </>
  ),

  chevronDown: <Polyline points="6 9 12 15 18 9" />,

  chevronLeft: <Polyline points="15 18 9 12 15 6" />,

  chevronRight: <Polyline points="9 18 15 12 9 6" />,

  search: (
    <>
      <Circle cx={11} cy={11} r={8} />

      <Line x1={21} y1={21} x2={16.65} y2={16.65} />
    </>
  ),

  xCircle: (
    <>
      <Circle cx={12} cy={12} r={10} />

      <Line x1={15} y1={9} x2={9} y2={15} />

      <Line x1={9} y1={9} x2={15} y2={15} />
    </>
  ),

  eye: (
    <>
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />

      <Circle cx={12} cy={12} r={3} />
    </>
  ),

  eyeOff: (
    <>
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />

      <Line x1={1} y1={1} x2={23} y2={23} />
    </>
  ),

  plus: (
    <>
      <Line x1={12} y1={5} x2={12} y2={19} />

      <Line x1={5} y1={12} x2={19} y2={12} />
    </>
  ),

  minus: <Line x1={5} y1={12} x2={19} y2={12} />,
} as const satisfies Record<string, ReactElement>;

export type TRequiredIconType = keyof typeof defaultIcons;

export default defaultIcons;
