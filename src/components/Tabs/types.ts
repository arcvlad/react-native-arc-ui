import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import type { IIcon } from "../Icon/types";

export type TTabType = "solid" | "border" | "text" | "underline" | "segment";

export type TTabBarPosition = "top" | "bottom" | "start" | "end";

export type TTabBarOrientation = "horizontal" | "vertical";

export type TTabBarSizeMode = "fill" | "content";

export type TTabBarLayout = "inline" | "overlay";

export type TTabBarAlignment = "start" | "center" | "end";

export type TTabIconPosition = "start" | "top";

export type TTabBadge = {
  variant: "dot";
  color?: string;
};

type TTabAccessibility = {
  /**
   * Optional additional accessibility guidance.
   *
   * ARCUI does not provide generic screen-reader gesture instructions.
   */
  accessibilityHint?: string;
};

type TTabTextContent = {
  label: string;
  icon?: never;
  iconPosition?: never;
  accessibilityLabel?: string;
};

type TTabIconTextContent = {
  label: string;
  icon: IIcon["type"];
  iconPosition?: TTabIconPosition;
  accessibilityLabel?: string;
};

type TTabIconContent = {
  label?: never;
  icon: IIcon["type"];
  iconPosition?: never;

  /**
   * Icon-only tabs require an explicit accessible name.
   */
  accessibilityLabel: string;
};

export type TTabContent = TTabAccessibility &
  (TTabTextContent | TTabIconTextContent | TTabIconContent);

interface ITabBase {
  value: string;
  badge?: TTabBadge;
  testID?: string;
}

export type ITab = ITabBase & TTabContent;

interface ITabSelection {
  /**
   * Current active tab.
   *
   * Tabs are controlled. The consumer is the semantic state owner.
   */
  activeTab: string;

  /**
   * Called when ARCUI requests a tab change.
   *
   * Updating activeTab remains the consumer's responsibility.
   */
  onActiveTabChange?: (tab: string) => void;
}

interface ITabBarBase {
  type?: TTabType;
  orientation?: TTabBarOrientation;
  sizeMode?: TTabBarSizeMode;

  /**
   * Inner spacing between the active segment indicator and its tab bounds.
   *
   * Only affects type="segment". Invalid or negative values fall back to
   * tokens.sizings.tabs.segmentInset.
   *
   * @default tokens.sizings.tabs.segmentInset
   */
  segmentInset?: number;

  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export type ITabBar = ITabBarBase & ITabSelection;

interface ITabNavigationBase {
  type?: TTabType;
  tabBarPosition?: TTabBarPosition;

  /**
   * Controls whether the TabBar participates in layout or floats above the
   * pager content.
   *
   * "inline" reserves layout space for the TabBar.
   * "overlay" lets page content occupy the complete TabNavigation bounds and
   * renders the TabBar above it. Overlay mode does not add content padding.
   *
   * @default "inline"
   */
  tabBarLayout?: TTabBarLayout;

  /**
   * Radius of the complete TabBar surface.
   *
   * When omitted, overlay bars use tokens.radius.tabs, segment bars keep their
   * existing tokens.radius.tabs radius, and other inline bars remain square.
   * Invalid or negative values fall back to that default behavior.
   */
  tabBarRadius?: number;

  /**
   * Fixed background color for the complete TabBar surface in both themes.
   *
   * Takes priority over tabBarDarkBackgroundColor/tabBarLightBackgroundColor
   * and the Tabs color tokens.
   */
  tabBarBackgroundColor?: string;

  /**
   * Dark-theme TabBar surface override. Used only when the matching light
   * override is also provided.
   */
  tabBarDarkBackgroundColor?: string;

  /**
   * Light-theme TabBar surface override. Used only when the matching dark
   * override is also provided.
   */
  tabBarLightBackgroundColor?: string;

  tabBarSizeMode?: TTabBarSizeMode;

  /**
   * Alignment of a content-sized TabBar along its available main axis.
   *
   * Has no visual effect while tabBarSizeMode is "fill".
   *
   * @default "start"
   */
  tabBarAlignment?: TTabBarAlignment;

  /**
   * Outer spacing applied around the complete TabBar.
   *
   * Invalid or negative values fall back to tokens.sizings.tabs.outerInset.
   *
   * @default tokens.sizings.tabs.outerInset
   */
  tabBarInset?: number;

  /**
   * Inner spacing between the active segment indicator and its tab bounds.
   *
   * Only affects type="segment". Invalid or negative values fall back to
   * tokens.sizings.tabs.segmentInset.
   *
   * @default tokens.sizings.tabs.segmentInset
   */
  segmentInset?: number;

  swipeEnabled?: boolean;

  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export type ITabNavigation = ITabNavigationBase & ITabSelection;

interface ITabScreenBase {
  value: string;
  badge?: TTabBadge;
  children: ReactNode;
  testID?: string;
}

export type ITabScreen = ITabScreenBase & TTabContent;

// Internal type guard helper for Tab children.
export type TTabChild = {
  value: string;
};

// Internal type guard helper for TabScreen children.
export type TTabScreenChild = {
  value: string;
  label?: string;
  icon?: IIcon["type"];
};
