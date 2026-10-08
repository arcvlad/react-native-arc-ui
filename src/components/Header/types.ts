import type { ReactNode, Ref } from "react";
import type { StyleProp, View, ViewProps, ViewStyle } from "react-native";

import type { IIcon } from "../Icon/types";
import type { TPressAnimation } from "../../tokens/Animations";

export type THeaderTitleAlign = "start" | "center";

export interface IHeaderControl {
  icon: THeaderAction["icon"];
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  disabled?: boolean;
  mirrorInRTL?: boolean;
  radius: number;
  animation: TPressAnimation;
  testID?: string;
}

export type THeaderAction = {
  /**
   * ARCUI icon rendered inside the action control.
   */
  icon: IIcon["type"];

  /**
   * Called when the action is activated.
   */
  onPress: () => void;

  /**
   * Required because Header actions are icon-only controls.
   */
  accessibilityLabel: string;

  /**
   * Optional additional accessibility guidance.
   *
   * Prefer a label that already explains the action clearly and use
   * a hint only when the resulting behavior is not obvious.
   */
  accessibilityHint?: string;

  disabled?: boolean;
  testID?: string;
};

type THeaderBase = Omit<ViewProps, "children" | "style"> & {
  /**
   * React 19 ref-as-prop.
   */
  ref?: Ref<View>;

  /**
   * Header title.
   *
   * Textual ReactNode content receives ARCUI Header typography and
   * accessibility semantics. Arbitrary ReactNode content is rendered
   * as consumer-owned custom content.
   */
  title?: ReactNode;

  /**
   * Minimum height of the toolbar content area, excluding safe-area
   * padding.
   *
   * @default tokens.sizings.header.minHeight
   */
  minHeight?: number;

  /**
   * Maximum number of lines for ARCUI-rendered textual titles.
   *
   * Custom ReactNode titles own their own text behavior.
   *
   * @default tokens.sizings.header.numberOfLines
   */
  titleNumberOfLines?: number;

  /**
   * Controls whether the built-in back action is shown.
   *
   * When omitted, Header automatically shows it if either a local
   * onBack or ARCUI-level onBack callback exists.
   */
  showBack?: boolean;

  /**
   * Overrides the ARCUI-level onBack callback for this Header.
   */
  onBack?: () => void;

  /**
   * Accessibility label for the built-in back control.
   *
   * When omitted, Header uses ARCUI's configured back label.
   */
  backAccessibilityLabel?: string;

  /**
   * Optional additional accessibility guidance for the back control.
   */
  backAccessibilityHint?: string;

  /**
   * Whether to render the semantic bottom border.
   *
   * @default true
   */
  showBorder?: boolean;

  /**
   * Border radius of built-in back and action controls.
   *
   * @default tokens.radius.headerControl
   */
  controlRadius?: number;

  /**
   * Press feedback used by built-in back and action controls.
   *
   * When omitted, Header uses the global ARCUI press animation.
   *
   * @default tokens.pressAnimation.type
   */
  controlAnimation?: TPressAnimation;

  style?: StyleProp<ViewStyle>;
};

type THeaderActions = {
  /**
   * Built-in icon actions rendered at the logical end of the Header.
   */
  actions?: readonly THeaderAction[];

  /**
   * Built-in actions and arbitrary end content intentionally cannot
   * own the same slot.
   */
  endContent?: never;
};

type THeaderCustomEnd = {
  actions?: never;

  /**
   * Arbitrary consumer-owned content rendered at the logical end.
   */
  endContent?: ReactNode;
};

type THeaderStartTitle = {
  /**
   * Aligns the title to the logical start of its available content.
   *
   * @default "start"
   */
  titleAlign?: "start";

  centerSideMinWidth?: never;
};

type THeaderCenterTitle = {
  /**
   * Keeps the title mathematically centered between equal logical sides.
   */
  titleAlign: "center";

  /**
   * Optional minimum width applied equally to both sides.
   *
   * Built-in back and action controls are accounted for automatically,
   * so this is mainly useful with arbitrary endContent.
   */
  centerSideMinWidth?: number;
};

export type IHeader = THeaderBase &
  (THeaderActions | THeaderCustomEnd) &
  (THeaderStartTitle | THeaderCenterTitle);
