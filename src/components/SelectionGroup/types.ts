import type { ReactNode, Ref } from "react";
import type { View, ViewProps } from "react-native";

export type TSelectionValue = string;

interface ISelectionGroupBase extends Omit<ViewProps, "children" | "ref"> {
  /**
   * Native SelectionGroup container ref.
   */
  ref?: Ref<View>;

  children: ReactNode;
}

export interface ISingleSelectionGroup extends ISelectionGroupBase {
  /**
   * Single-selection mode.
   *
   * @default false
   */
  multiple?: false;

  /**
   * Current selected value.
   *
   * SelectionGroup is controlled. The consumer owns this state.
   * null represents no selection.
   */
  value: TSelectionValue | null;

  /**
   * Called when SelectionGroup requests a selected-value change.
   */
  onValueChange?: (value: TSelectionValue | null) => void;

  /**
   * Whether selecting the currently selected value requests
   * clearing the selection.
   *
   * Useful for controls such as Accordion where the active item
   * can be collapsed by selecting it again.
   *
   * @default false
   */
  allowDeselect?: boolean;

  values?: never;
  onValuesChange?: never;
}

export interface IMultipleSelectionGroup extends ISelectionGroupBase {
  /**
   * Enables multiple-selection mode.
   */
  multiple: true;

  /**
   * Current selected values.
   *
   * SelectionGroup is controlled. The consumer owns this state.
   */
  values: readonly TSelectionValue[];

  /**
   * Called when SelectionGroup requests a selected-values change.
   */
  onValuesChange?: (values: TSelectionValue[]) => void;

  value?: never;
  onValueChange?: never;
  allowDeselect?: never;
}

export type ISelectionGroup = ISingleSelectionGroup | IMultipleSelectionGroup;

/**
 * Internal contract consumed by selection-aware ARCUI components.
 */
export type TSelectionGroupContext = {
  /**
   * Exposed internally only so selection-aware controls can validate
   * whether their semantics support this group mode.
   *
   * Selection ownership still goes exclusively through
   * isSelected / toggleValue.
   */
  multiple: boolean;

  isSelected: (value: TSelectionValue) => boolean;

  /**
   * Requests a selection change and returns the resulting requested
   * selected state for the provided value.
   *
   * SelectionGroup itself never mutates semantic state.
   */
  toggleValue: (value: TSelectionValue) => boolean;
};
