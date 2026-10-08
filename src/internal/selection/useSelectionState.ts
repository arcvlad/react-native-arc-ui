import { useCallback } from "react";

import { useSelectionGroup } from "../../components/SelectionGroup/SelectionGroupContext";
import type { TSelectionValue } from "../../components/SelectionGroup/types";

export type TSelectionGroupPolicy = "single" | "multiple" | "any";

type TUseSelectionStateOptions = {
  componentName: string;

  checked?: boolean;

  onCheckedChange?: (checked: boolean) => void;

  value?: TSelectionValue;

  groupPolicy: TSelectionGroupPolicy;
};

type TUseSelectionStateResult = {
  resolvedChecked: boolean;

  toggleChecked: () => boolean;
};

export const useSelectionState = ({
  componentName,
  checked,
  onCheckedChange,
  value,
  groupPolicy,
}: TUseSelectionStateOptions): TUseSelectionStateResult => {
  const selectionGroup = useSelectionGroup();

  let resolvedChecked: boolean;

  if (selectionGroup != null) {
    if (value === undefined) {
      throw new Error(
        `[react-native-arc-ui] ${componentName} inside SelectionGroup requires a value.`,
      );
    }

    if (checked !== undefined) {
      throw new Error(
        `[react-native-arc-ui] ${componentName} inside SelectionGroup must not receive checked. SelectionGroup owns the selected state.`,
      );
    }

    if (groupPolicy === "single" && selectionGroup.multiple) {
      throw new Error(
        `[react-native-arc-ui] ${componentName} cannot be used inside SelectionGroup multiple={true}.`,
      );
    }

    if (groupPolicy === "multiple" && !selectionGroup.multiple) {
      throw new Error(
        `[react-native-arc-ui] ${componentName} requires SelectionGroup multiple={true}.`,
      );
    }

    resolvedChecked = selectionGroup.isSelected(value);
  } else {
    if (value !== undefined) {
      throw new Error(
        `[react-native-arc-ui] ${componentName} value is only valid inside SelectionGroup.`,
      );
    }

    if (checked === undefined) {
      throw new Error(
        `[react-native-arc-ui] ${componentName} used outside SelectionGroup requires checked.`,
      );
    }

    resolvedChecked = checked;
  }

  const toggleChecked = useCallback((): boolean => {
    if (selectionGroup != null && value !== undefined) {
      const nextChecked = selectionGroup.toggleValue(value);

      /**
       * A group may legitimately reject a requested deselection.
       *
       * Example:
       * single SelectionGroup + allowDeselect=false.
       *
       * Child-level notification represents an actual resulting state
       * change, not merely an interaction attempt.
       */
      if (nextChecked !== resolvedChecked) {
        onCheckedChange?.(nextChecked);
      }

      return nextChecked;
    }

    /**
     * Standalone ARCUI selection controls are explicitly controlled.
     *
     * ARCUI reports the requested next value. The consumer remains the
     * semantic state owner and decides whether/when to update checked.
     */
    const nextChecked = !resolvedChecked;

    onCheckedChange?.(nextChecked);

    return nextChecked;
  }, [selectionGroup, value, resolvedChecked, onCheckedChange]);

  return {
    resolvedChecked,
    toggleChecked,
  };
};
