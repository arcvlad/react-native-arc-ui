import type { ReactNode, Ref } from "react";
import type { PressableProps, StyleProp, View, ViewStyle } from "react-native";

import type { TPressAnimation } from "../../tokens";
import type { IIcon } from "../Icon/types";
import type { TSelectionValue } from "../SelectionGroup/types";

export type TChipType = "solid" | "border" | "transparent";

interface IChipBase extends Omit<
  PressableProps,
  "children" | "role" | "accessibilityRole" | "aria-selected" | "aria-disabled"
> {
  /**
   * React 19 ref-as-prop.
   *
   * Exposes the underlying native Pressable View.
   */
  ref?: Ref<View>;

  children: ReactNode;

  type?: TChipType;

  animation?: TPressAnimation;

  iconLeft?: IIcon["type"];
  iconRight?: IIcon["type"];

  containerStyle?: StyleProp<ViewStyle>;

  radius?: number;
}

interface ISelectableChip {
  /**
   * Visual presentation used while selected.
   *
   * When omitted, the Chip keeps its base type and uses that
   * presentation's selected color tokens.
   */
  selectedType?: TChipType;

  /**
   * Called when Chip requests a selection-state change.
   *
   * Standalone:
   * the consumer owns selected.
   *
   * SelectionGroup:
   * optional child-level notification after the group resolves an
   * actual selection change.
   */
  onSelectedChange?: (selected: boolean) => void;

  /**
   * Replaces iconRight with a check while selected.
   *
   * @default true
   */
  showCheckOnSelected?: boolean;
}

interface IActionChip {
  value?: never;
  selected?: never;
  selectedType?: never;
  onSelectedChange?: never;
  showCheckOnSelected?: never;
}

interface IStandaloneSelectableChip extends ISelectableChip {
  /**
   * Standalone semantic selection state.
   *
   * The consumer is the source of truth.
   */
  selected: boolean;

  value?: never;
}

interface IGroupedSelectableChip extends ISelectableChip {
  /**
   * SelectionGroup identity.
   *
   * SelectionGroup owns the selected state.
   */
  value: TSelectionValue;

  selected?: never;
}

export type IChip = IChipBase &
  (IActionChip | IStandaloneSelectableChip | IGroupedSelectableChip);
