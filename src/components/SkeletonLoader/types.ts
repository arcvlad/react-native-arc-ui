import type { DimensionValue, StyleProp, ViewStyle } from "react-native";

export type TSkeletonLoaderVariant = "rect" | "square" | "circle";

interface ISkeletonLoaderBase {
  /**
   * Shimmer-band angle in degrees.
   *
   * Falls back to tokens.skeletonAnimations.angle.
   */
  angle?: number;

  style?: StyleProp<ViewStyle>;

  testID?: string;
}

export interface IRectSkeletonLoader extends ISkeletonLoaderBase {
  variant?: "rect";

  width?: DimensionValue;

  height?: DimensionValue;

  radius?: number;

  size?: never;
}

export interface ISquareSkeletonLoader extends ISkeletonLoaderBase {
  variant: "square";

  size?: number;

  radius?: number;

  width?: never;

  height?: never;
}

export interface ICircleSkeletonLoader extends ISkeletonLoaderBase {
  variant: "circle";

  size?: number;

  radius?: never;

  width?: never;

  height?: never;
}

export type ISkeletonLoader =
  | IRectSkeletonLoader
  | ISquareSkeletonLoader
  | ICircleSkeletonLoader;
