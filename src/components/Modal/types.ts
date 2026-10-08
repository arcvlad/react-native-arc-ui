import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

export type TModalHeight = number | `${number}%`;

export type TModalCloseReason =
  | "controlled"
  | "backdrop"
  | "close-button"
  | "back"
  | "swipe"
  | "accessibility";

export interface IModal {
  /**
   * Controls modal visibility.
   */
  visible: boolean;

  /**
   * Called when the user requests dismissal through:
   * - backdrop press
   * - swipe gesture
   * - default close button
   * - Android hardware back
   * - accessibility escape
   *
   * Parent-controlled visible=true -> false does not call onClose.
   */
  onClose: () => void;

  /**
   * Modal content.
   *
   * Modal is declaratively rehosted into ARCUI's root Host layer.
   * Local Context ancestry below <ARCUI /> is therefore not guaranteed
   * to remain available inside rehosted content.
   */
  children: ReactNode;

  title?: string;

  subtitle?: string;

  /**
   * Replaces the default close action.
   *
   * Consumer owns interaction and accessibility behavior of the custom action.
   */
  rightAction?: ReactNode;

  /**
   * Total bottom-sheet height.
   *
   * number -> pixels
   * percentage -> percentage of currently available safe sheet height
   */
  height?: TModalHeight;

  /**
   * Per-stack-level top offset.
   *
   * undefined -> tokens.sizings.modal.stackOffset
   * number    -> explicit offset
   * false     -> no stack offset
   */
  stackOffset?: number | false;

  /**
   * Wrap content in ARCUI's internal ScrollView.
   *
   * @default true
   */
  scrollable?: boolean;

  /**
   * Explicit swipe dismissal distance in pixels.
   *
   * When omitted:
   * renderedSheetHeight * tokens.modalAnimations.dismissThreshold
   */
  dismissDistance?: number;

  /**
   * Explicit swipe dismissal velocity in px/s.
   *
   * Falls back to tokens.modalAnimations.dismissVelocity.
   */
  dismissVelocity?: number;

  style?: StyleProp<ViewStyle>;

  testID?: string;
}

/**
 * Stable React-owned identity of one Modal declaration.
 *
 * Reference equality is intentional.
 */
export interface IModalOwner {
  readonly kind: "modal";
}

export interface IModalEntry {
  id: number;
  node: ReactNode;
}

export interface IModalStackEntry {
  id: number;
  owner: IModalOwner;
}

export interface IModalHostContext {
  mount: (owner: IModalOwner, node: ReactNode) => number;

  update: (id: number, node: ReactNode) => void;

  remove: (id: number) => void;
}

export interface IModalStackContext {
  activeCount: number;

  /**
   * Internal semantic stack.
   *
   * Content updates do not mutate this array.
   */
  activeEntries: IModalStackEntry[];

  topId: number | null;
}
