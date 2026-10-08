import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";

import type { IIcon } from "../Icon/types";
import type { TSelectionValue } from "../SelectionGroup/types";

export type TAccordionType = "solid" | "border" | "transparent";

export type TAccordionGroupPosition = "single" | "first" | "middle" | "last";

interface IAccordionBase extends Pick<
  PressableProps,
  "accessibilityLabel" | "accessibilityHint"
> {
  children: ReactNode;

  title: string;
  subtitle?: string;

  /**
   * Visual presentation.
   *
   * @default "transparent"
   */
  type?: TAccordionType;

  /**
   * Prevents user interaction without changing the current expanded state.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Called when Accordion requests an expanded-state change.
   *
   * Standalone:
   * the consumer owns `expanded` and receives the requested next state.
   *
   * SelectionGroup / AccordionGroup:
   * optional child-level notification after the group resolves the requested
   * selected state for this Accordion value.
   *
   * In a controlled group, this callback does not imply that the parent has
   * already committed the requested group state.
   */
  onExpandedChange?: (expanded: boolean) => void;

  /**
   * Maximum number of title lines.
   *
   * 0 means unlimited.
   * Falls back to tokens.sizings.accordion.titleNumberOfLines.
   */
  titleNumberOfLines?: number;

  /**
   * Maximum number of subtitle lines.
   *
   * 0 means unlimited.
   * Falls back to tokens.sizings.accordion.subtitleNumberOfLines.
   */
  subtitleNumberOfLines?: number;

  style?: StyleProp<ViewStyle>;

  testID?: string;
}

type TAccordionIconProps =
  | {
      /**
       * Built-in ARCUI icon.
       */
      icon?: IIcon["type"];

      customIcon?: never;
    }
  | {
      icon?: never;

      /**
       * Consumer-owned custom icon content.
       *
       * Useful for custom SVG icons or other arbitrary React content.
       */
      customIcon?: ReactNode;
    };

interface IStandaloneAccordion {
  /**
   * Standalone semantic expansion state.
   *
   * The consumer is the source of truth.
   */
  expanded: boolean;

  value?: never;
}

interface IGroupedAccordion {
  /**
   * Selection identity when Accordion participates in SelectionGroup
   * or AccordionGroup.
   *
   * The group owns the expanded state.
   */
  value: TSelectionValue;

  expanded?: never;
}

export type IAccordion = IAccordionBase &
  TAccordionIconProps &
  (IStandaloneAccordion | IGroupedAccordion);

/**
 * Internal props used by AccordionGroup for connected visual styling.
 *
 * These are intentionally not part of Accordion's public API.
 */
export type TAccordionInternalProps = IAccordion & {
  _groupPosition?: TAccordionGroupPosition;
};
