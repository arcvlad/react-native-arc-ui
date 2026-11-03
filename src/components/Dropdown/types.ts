import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import type { TThemeColor } from "../../types/colors";
import type { IIcon } from "../Icon/types";

export type TDropdownPlacement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end";

export type TDropdownItemTone = "neutral" | "danger";

export interface IDropdownItemBackgroundColors {
  default?: TThemeColor;
  pressed?: TThemeColor;
  disabled?: TThemeColor;
}

export interface IDropdownItemContentColors {
  default?: TThemeColor;
  disabled?: TThemeColor;
}

export interface IDropdownItemColors {
  background?: Readonly<IDropdownItemBackgroundColors>;
  text?: Readonly<IDropdownItemContentColors>;
  icon?: Readonly<IDropdownItemContentColors>;
}

export interface IDropdownColors {
  background?: TThemeColor;
  border?: TThemeColor;
  separator?: TThemeColor;
  item?: Readonly<IDropdownItemColors>;
}

export type TDropdownTriggerProps = {
  /**
   * Toggles the Dropdown.
   *
   * The trigger owns its visual presentation while ARCUI owns
   * measurement, positioning, open state, and dismissal.
   */
  onPress: () => void;

  /**
   * Whether this Dropdown is currently presented by the host.
   */
  isOpen: boolean;

  /**
   * Mirrors the Dropdown disabled state so custom triggers can
   * expose the same interaction state visually and semantically.
   */
  disabled: boolean;
};

export type TDropdownItem = {
  /**
   * Human-readable item label.
   */
  label: string;

  /**
   * Stable item identity returned through onSelect.
   *
   * Values must be unique within a Dropdown.
   * Duplicate values are rejected as an identity invariant.
   */
  value: string;

  icon?: IIcon["type"];

  disabled?: boolean;

  /**
   * Semantic item palette.
   *
   * @default "neutral"
   */
  tone?: TDropdownItemTone;

  /**
   * Per-item ARCUI-owned color overrides.
   *
   * Resolution priority:
   * item colors > Dropdown colors.item > tone > Dropdown tokens.
   */
  colors?: Readonly<IDropdownItemColors>;

  /**
   * Renders a separator below this item.
   */
  separator?: boolean;

  /**
   * Optional item-level test identifier.
   *
   * When omitted, Dropdown derives one from its own testID and value.
   */
  testID?: string;
};

export interface IDropdown {
  items: readonly TDropdownItem[];

  /**
   * Called after an enabled item is selected.
   *
   * The full item is provided so consumers do not need to search
   * their items array again when metadata is required.
   */
  onSelect: (value: string, item: TDropdownItem) => void;

  /**
   * Render prop for the trigger.
   *
   * ARCUI does not clone or inspect the returned element.
   */
  trigger: (props: TDropdownTriggerProps) => ReactNode;

  /**
   * Preferred placement.
   *
   * ARCUI may flip vertically when the opposite side provides
   * more usable viewport space.
   *
   * @default "bottom-end"
   */
  placement?: TDropdownPlacement;

  /**
   * Maximum number of normal item heights visible before scrolling.
   *
   * Larger accessibility text may naturally require more height
   * per item and is still constrained by the available viewport.
   */
  maxVisibleItems?: number;

  disabled?: boolean;

  /**
   * Per-instance ARCUI-owned color overrides.
   */
  colors?: Readonly<IDropdownColors>;

  /**
   * Style applied to the trigger measurement wrapper.
   */
  style?: StyleProp<ViewStyle>;

  testID?: string;
}
