import React, { memo, useMemo, type ReactElement, type ReactNode } from "react";
import { StyleSheet } from "react-native";

import { SelectionGroup } from "../SelectionGroup/SelectionGroup";
import type {
  IMultipleSelectionGroup,
  ISingleSelectionGroup,
} from "../SelectionGroup/types";
import { Accordion } from "./Accordion";
import type { TAccordionGroupPosition, TAccordionInternalProps } from "./types";

interface IAccordionGroupBase {
  /**
   * AccordionGroup accepts direct Accordion children.
   *
   * Empty conditional children are allowed, but other rendered element
   * types are rejected because they would incorrectly participate in the
   * internal SelectionGroup context.
   */
  children: ReactNode;
}

type TAccordionGroupSingleProps = Omit<
  ISingleSelectionGroup,
  "children" | "allowDeselect"
>;

type TAccordionGroupMultipleProps = Omit<
  IMultipleSelectionGroup,
  "children" | "allowDeselect"
>;

export type IAccordionGroup = IAccordionGroupBase &
  (TAccordionGroupSingleProps | TAccordionGroupMultipleProps);

const getGroupPosition = (
  index: number,
  count: number,
): TAccordionGroupPosition => {
  if (count <= 1) {
    return "single";
  }

  if (index === 0) {
    return "first";
  }

  if (index === count - 1) {
    return "last";
  }

  return "middle";
};

const isAccordionElement = (
  child: ReactNode,
): child is ReactElement<TAccordionInternalProps> =>
  React.isValidElement(child) && child.type === Accordion;

const AccordionGroupComponent = (props: IAccordionGroup) => {
  const positionedChildren = useMemo(() => {
    const childArray = React.Children.toArray(props.children);
    const values = new Set<string>();

    return childArray.map((child, index) => {
      if (!isAccordionElement(child)) {
        throw new Error(
          "[react-native-arc-ui] AccordionGroup accepts only direct Accordion children.",
        );
      }

      const childValue = child.props.value;

      if (childValue === undefined) {
        throw new Error(
          '[react-native-arc-ui] Accordion inside AccordionGroup requires a "value".',
        );
      }

      if (values.has(childValue)) {
        throw new Error(
          `[react-native-arc-ui] AccordionGroup requires unique Accordion values. Duplicate value "${childValue}".`,
        );
      }

      values.add(childValue);

      return React.cloneElement(child, {
        _groupPosition: getGroupPosition(index, childArray.length),
      });
    });
  }, [props.children]);

  if (props.multiple) {
    const { children: _children, style, ...selectionGroupProps } = props;

    return (
      <SelectionGroup
        {...selectionGroupProps}
        style={[styles.container, style]}
      >
        {positionedChildren}
      </SelectionGroup>
    );
  }

  const { children: _children, style, ...selectionGroupProps } = props;

  return (
    <SelectionGroup
      {...selectionGroupProps}
      allowDeselect
      style={[styles.container, style]}
    >
      {positionedChildren}
    </SelectionGroup>
  );
};

export const AccordionGroup = memo(AccordionGroupComponent);

AccordionGroup.displayName = "AccordionGroup";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
