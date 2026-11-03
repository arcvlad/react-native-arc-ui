import type { StyleProp, ViewStyle } from "react-native";

import type { TThemeColor } from "../../types/colors";
import type { IIcon } from "../Icon/types";

export type TSelectValue = string;

export interface ISelectBorderColors {
  default?: TThemeColor;
  focused?: TThemeColor;
  error?: TThemeColor;
  inactive?: TThemeColor;
  disabled?: TThemeColor;
}

export interface ISelectTwoStateColors {
  default?: TThemeColor;
  disabled?: TThemeColor;
}

export interface ISelectTextColors extends ISelectTwoStateColors {
  placeholder?: TThemeColor;
}

export interface ISelectItemBackgroundColors {
  default?: TThemeColor;
  selected?: TThemeColor;
  pressed?: TThemeColor;
}

export interface ISelectItemContentColors {
  default?: TThemeColor;
  selected?: TThemeColor;
  disabled?: TThemeColor;
}

export interface ISelectItemColors {
  background?: Readonly<ISelectItemBackgroundColors>;
  text?: Readonly<ISelectItemContentColors>;
  icon?: Readonly<ISelectItemContentColors>;
}

export interface ISelectSearchColors {
  text?: TThemeColor;
  placeholder?: TThemeColor;
  icon?: TThemeColor;
}

export interface ISelectColors {
  border?: Readonly<ISelectBorderColors>;
  background?: Readonly<ISelectTwoStateColors>;
  label?: Readonly<ISelectTwoStateColors>;
  text?: Readonly<ISelectTextColors>;
  icon?: Readonly<ISelectTwoStateColors>;
  loading?: TThemeColor;
  error?: TThemeColor;
  item?: Readonly<ISelectItemColors>;
  search?: Readonly<ISelectSearchColors>;
  emptyState?: TThemeColor;
  groupHeader?: TThemeColor;
}

export type TSelectOption = {
  /**
   * Visible option label.
   */
  label: string;

  /**
   * Stable option identity.
   */
  value: TSelectValue;

  /**
   * Prevents this option from being selected.
   */
  disabled?: boolean;

  /**
   * Optional leading icon.
   */
  icon?: IIcon["type"];

  /**
   * Optional visual group name.
   */
  group?: string;
};

type TSelectBaseProps = {
  /**
   * Available Select options.
   *
   * Select never mutates this array.
   *
   * @default []
   */
  options?: readonly TSelectOption[];

  /**
   * Per-instance ARCUI-owned color overrides.
   *
   * Partial overrides fall back to Select tokens for the matching visual state.
   */
  colors?: Readonly<ISelectColors>;

  // ─── Search ──────────────────────────────────────────────────────────────

  /**
   * Enables local filtering.
   *
   * When onSearchAsync is supplied, filtering is delegated
   * to the consumer instead.
   *
   * @default false
   */
  searchable?: boolean;

  /**
   * Called after the configured debounce when remote/external
   * search is being used.
   *
   * The consumer owns the resulting options.
   */
  onSearchAsync?: (query: string) => void;

  /**
   * Search callback debounce in milliseconds.
   *
   * @default 300
   */
  searchDebounce?: number;

  /**
   * Search input placeholder.
   */
  searchPlaceholder?: string;

  /**
   * Consumer-owned loading state for external search.
   *
   * This avoids Select guessing the lifetime of asynchronous work.
   *
   * @default false
   */
  searchLoading?: boolean;

  // ─── Content ─────────────────────────────────────────────────────────────

  /**
   * Optional field label.
   */
  label?: string;

  /**
   * Placeholder shown while no value is selected.
   */
  placeholder?: string;

  /**
   * Optional validation message.
   */
  error?: string;

  /**
   * Label shown when no options match.
   *
   * Falls back to the localized ARCUI empty-state string.
   */
  emptyLabel?: string;

  // ─── Availability ────────────────────────────────────────────────────────

  /**
   * Disables interaction and applies disabled visuals.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Inactive retains its dedicated visual state while preventing
   * interaction.
   *
   * @default true
   */
  active?: boolean;

  // ─── Geometry ────────────────────────────────────────────────────────────

  /**
   * Base option-row height before ARCUI font scaling.
   *
   * Falls back to tokens.sizings.select.itemHeight.
   */
  itemHeight?: number;

  /**
   * Maximum number of structural list rows visible before internal scrolling.
   *
   * Search, group-header, option, and empty-state rows each count toward this
   * limit. Falls back to tokens.sizings.select.maxVisibleItems.
   */
  maxVisibleItems?: number;

  /**
   * Maximum number of selected chips rendered in the trigger.
   *
   * Remaining selections are represented by a +N chip.
   *
   * Falls back to tokens.sizings.select.maxChipsVisible.
   */
  maxChipsVisible?: number;

  // ─── Accessibility ───────────────────────────────────────────────────────

  /**
   * Overrides the trigger accessibility label.
   *
   * Falls back to label, then placeholder where possible.
   */
  accessibilityLabel?: string;

  /**
   * Optional additional accessibility guidance for the Select trigger.
   *
   * ARCUI does not provide generic screen-reader gesture instructions.
   */
  accessibilityHint?: string;

  /**
   * Overrides the search input accessibility label.
   */
  searchAccessibilityLabel?: string;

  // ─── Native / test surface ───────────────────────────────────────────────

  style?: StyleProp<ViewStyle>;

  testID?: string;
};

export interface ISingleSelect extends TSelectBaseProps {
  /**
   * Single-selection mode.
   *
   * @default false
   */
  multiple?: false;

  /**
   * Current selected value.
   *
   * Select is controlled. null represents no selection.
   */
  value: TSelectValue | null;

  /**
   * Called when Select requests a selected-value change.
   */
  onValueChange?: (value: TSelectValue | null) => void;

  values?: never;

  onValuesChange?: never;

  maxSelect?: never;
}

export interface IMultipleSelect extends TSelectBaseProps {
  /**
   * Enables multiple-selection mode.
   */
  multiple: true;

  /**
   * Current selected values.
   *
   * Select is controlled and never mutates the supplied array.
   */
  values: readonly TSelectValue[];

  /**
   * Called with the requested next selected-value array.
   */
  onValuesChange?: (values: TSelectValue[]) => void;

  /**
   * Maximum number of simultaneously selected values.
   *
   * Omit for no explicit maximum.
   */
  maxSelect?: number;

  value?: never;

  onValueChange?: never;
}

export type ISelect = ISingleSelect | IMultipleSelect;
