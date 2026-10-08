import { createContext, useContext } from "react";
import type { DerivedValue, SharedValue } from "react-native-reanimated";

import type { TTabBarOrientation, TTabBarSizeMode, TTabType } from "./types";

export type TTabLayout = {
  offset: number;
  size: number;
};

type TTabAnimatedValue<T> = SharedValue<T> | DerivedValue<T>;

export type TTabContextValue = {
  activeTab: string;

  onActiveTabChange: (value: string) => void;

  type: TTabType;

  orientation: TTabBarOrientation;

  sizeMode: TTabBarSizeMode;

  tabValues: readonly string[];

  onTabLayout: (value: string, offset: number, size: number) => void;

  activeTextColor: TTabAnimatedValue<string>;

  inactiveTextColor: TTabAnimatedValue<string>;

  tabProgressShared: TTabAnimatedValue<number>;
};

export const TabContext = createContext<TTabContextValue | null>(null);

export const useTabContext = (): TTabContextValue => {
  const context = useContext(TabContext);

  if (!context) {
    throw new Error(
      "[react-native-arc-ui] Tab must be used inside TabBar or TabNavigation.",
    );
  }

  return context;
};
