import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import type { IIcon } from "../Icon/types";

export type TDropdownPlacement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end";

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
   * Uses the semantic destructive item colors.
   *
   * Explicit color overrides still take precedence.
   */
  destructive?: boolean;

  /**
   * Renders a separator below this item.
   */
  separator?: boolean;

  /**
   * Fixed label and icon color in both themes.
   *
   * Takes precedence over darkColor/lightColor and semantic tokens.
   */
  color?: string;

  /**
   * Theme-aware label and icon colors.
   *
   * Both values must be supplied for the pair to override
   * semantic Dropdown tokens.
   */
  darkColor?: string;
  lightColor?: string;

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
   * Style applied to the trigger measurement wrapper.
   */
  style?: StyleProp<ViewStyle>;

  testID?: string;
}
