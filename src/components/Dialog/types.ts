import type { ReactElement } from "react";

import type { TThemeColor } from "../../types/colors";
import type { IButton, IButtonColors, TButtonTone } from "../Button/types";
import type { IIcon } from "../Icon/types";

export type TDialogActionType = NonNullable<IButton["type"]>;

export interface IDialogColors {
  backdrop?: TThemeColor;
  background?: TThemeColor;
  title?: TThemeColor;
  message?: TThemeColor;
  icon?: TThemeColor;
}

export interface TDialogAction {
  /**
   * Visible action label.
   */
  label: string;

  /**
   * Visual Button presentation.
   *
   * When omitted, Dialog resolves a presentation based on action order:
   * first -> solid
   * second -> border
   * remaining -> transparent
   */
  type?: TDialogActionType;

  /**
   * Semantic Button palette for this action.
   *
   * @default "primary"
   */
  tone?: TButtonTone;

  /**
   * Per-action Button color overrides.
   */
  colors?: Readonly<IButtonColors>;

  /**
   * Action callback.
   *
   * Returning a Promise automatically enables the action loading state
   * until the Promise settles.
   */
  onPress?: () => void | Promise<void>;

  /**
   * Whether Dialog should close after a successful action.
   *
   * @default true
   */
  autoDismiss?: boolean;

  disabled?: boolean;

  testID?: string;
}

interface TDialogBase {
  title?: string;

  message?: string;

  /**
   * Per-instance ARCUI-owned Dialog color overrides.
   */
  colors?: Readonly<IDialogColors>;

  /**
   * Explicit Dialog actions.
   *
   * ARCUI does not generate an implicit confirmation action.
   */
  actions?: readonly TDialogAction[];

  /**
   * Allows passive dismissal through supported platform interactions such
   * as backdrop press, Android back, and accessibility escape.
   *
   * @default false
   */
  dismissible?: boolean;

  /**
   * Called after the Dialog has completed its exit animation and is no
   * longer visible.
   */
  onDismiss?: () => void;

  testID?: string;
}

type TDialogBuiltInIcon = {
  icon?: IIcon["type"];
  customIcon?: never;
};

type TDialogCustomIcon = {
  icon?: never;
  customIcon?: ReactElement | null;
};

/**
 * Configuration accepted by showDialog().
 *
 * Dialog intentionally supports a single active instance. Internal
 * lifecycle identifiers protect async actions and replacements from
 * closing a newer Dialog.
 */
export type TDialog = TDialogBase & (TDialogBuiltInIcon | TDialogCustomIcon);
