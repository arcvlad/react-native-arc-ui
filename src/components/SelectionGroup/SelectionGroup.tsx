import { memo, useCallback, useMemo } from "react";
import { View } from "react-native";

import { SelectionGroupContext } from "./SelectionGroupContext";
import type {
  ISelectionGroup,
  TSelectionGroupContext,
  TSelectionValue,
} from "./types";

const normalizeValues = (
  values: readonly TSelectionValue[],
): TSelectionValue[] => Array.from(new Set(values));

const SelectionGroupComponent = (props: ISelectionGroup) => {
  const {
    ref,
    children,
    multiple = false,
    value,
    values,
    onValueChange,
    onValuesChange,
    allowDeselect = false,
    ...viewProps
  } = props;

  /**
   * Multiple-selection input is normalized so duplicate consumer
   * values cannot create ambiguous group semantics.
   *
   * SelectionGroup never owns or mutates this state.
   */
  const selectedValues = useMemo<readonly TSelectionValue[]>(
    () => normalizeValues(values ?? []),
    [values],
  );

  const selectedValue = multiple ? null : (value ?? null);

  /**
   * Selection ownership details remain hidden from child controls.
   *
   * Children use isSelected / toggleValue for semantic ownership.
   * `multiple` is exposed separately only for compatibility validation
   * by selection-aware controls such as Radio.
   */
  const isSelected = useCallback(
    (selectionValue: TSelectionValue): boolean => {
      if (multiple) {
        return selectedValues.includes(selectionValue);
      }

      return selectedValue === selectionValue;
    },
    [multiple, selectedValue, selectedValues],
  );

  /**
   * Requests a selection change for one value.
   *
   * Single mode:
   * - selecting a different value requests that value;
   * - selecting the current value requests null only when
   *   allowDeselect=true;
   * - otherwise the current selection remains unchanged.
   *
   * Multiple mode:
   * - toggles the provided value in the requested values array.
   *
   * SelectionGroup is fully controlled and never mutates internal
   * semantic state.
   */
  const toggleValue = useCallback(
    (selectionValue: TSelectionValue): boolean => {
      if (multiple) {
        const isCurrentlySelected = selectedValues.includes(selectionValue);

        const nextValues = isCurrentlySelected
          ? selectedValues.filter((item) => item !== selectionValue)
          : [...selectedValues, selectionValue];

        onValuesChange?.(nextValues);

        return !isCurrentlySelected;
      }

      const isCurrentlySelected = selectedValue === selectionValue;

      if (isCurrentlySelected && !allowDeselect) {
        return true;
      }

      const nextValue = isCurrentlySelected ? null : selectionValue;

      onValueChange?.(nextValue);

      return nextValue === selectionValue;
    },
    [
      multiple,
      selectedValue,
      selectedValues,
      allowDeselect,
      onValueChange,
      onValuesChange,
    ],
  );

  const contextValue = useMemo<TSelectionGroupContext>(
    () => ({
      multiple,
      isSelected,
      toggleValue,
    }),
    [multiple, isSelected, toggleValue],
  );

  /**
   * TypeScript models single / multiple ownership as a discriminated
   * controlled union.
   *
   * Runtime validation keeps the same invariant explicit for JavaScript
   * consumers and malformed dynamic props.
   *
   * Keep this validation after all hooks so malformed dynamic props
   * cannot alter hook ordering.
   */
  if (multiple) {
    if (values === undefined) {
      throw new Error(
        '[react-native-arc-ui] SelectionGroup multiple={true} requires "values".',
      );
    }

    if (value !== undefined) {
      throw new Error(
        '[react-native-arc-ui] SelectionGroup multiple={true} must not receive "value".',
      );
    }

    if (onValueChange !== undefined) {
      throw new Error(
        '[react-native-arc-ui] SelectionGroup multiple={true} must not receive "onValueChange". Use "onValuesChange" instead.',
      );
    }

    if (props.allowDeselect !== undefined) {
      throw new Error(
        '[react-native-arc-ui] SelectionGroup "allowDeselect" is only valid in single-selection mode.',
      );
    }
  } else {
    if (value === undefined) {
      throw new Error(
        '[react-native-arc-ui] SelectionGroup single-selection mode requires "value". Use null when nothing is selected.',
      );
    }

    if (values !== undefined) {
      throw new Error(
        '[react-native-arc-ui] SelectionGroup single-selection mode must not receive "values".',
      );
    }

    if (onValuesChange !== undefined) {
      throw new Error(
        '[react-native-arc-ui] SelectionGroup single-selection mode must not receive "onValuesChange". Use "onValueChange" instead.',
      );
    }
  }

  return (
    <SelectionGroupContext.Provider value={contextValue}>
      <View ref={ref} {...viewProps}>
        {children}
      </View>
    </SelectionGroupContext.Provider>
  );
};

export const SelectionGroup = memo(SelectionGroupComponent);

SelectionGroup.displayName = "SelectionGroup";
