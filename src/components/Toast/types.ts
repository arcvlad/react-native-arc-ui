import type { ReactNode } from "react";

export type TToastId = string;

export type TToastPlacement = "top" | "bottom";

/**
 * Public Toast request accepted by showToast().
 */
export type TToastInput = {
  /**
   * Visible and announced Toast message.
   *
   * Must contain at least one non-whitespace character.
   * Empty or whitespace-only messages are semantic API misuse and throw.
   */
  message: string;

  /**
   * Optional decorative content rendered before the message.
   *
   * Toast accessibility semantics are owned by message. Decorative icon
   * content is intentionally hidden from the accessibility tree.
   */
  icon?: ReactNode;

  /**
   * Time in milliseconds before the Toast begins its normal exit lifecycle.
   *
   * Must be a finite non-negative number.
   *
   * 0 requests immediate dismissal.
   *
   * When omitted, ARCUI uses tokens.toastAnimations.displayDuration.
   * Invalid runtime values report in development and safely fall back to the
   * configured display duration.
   */
  duration?: number;

  /**
   * Screen edge used by this Toast.
   *
   * When omitted, ARCUI uses tokens.toastAnimations.placement.
   *
   * Malformed runtime JavaScript values report in development and safely
   * degrade to the bottom placement.
   */
  placement?: TToastPlacement;

  /**
   * Deterministic native root identifier for automation.
   *
   * The message descendant uses `${testID}-message`.
   */
  testID?: string;
};

/**
 * Internal provider-owned Toast entry.
 *
 * Placement is resolved once when the Toast is created so the visual item
 * never needs to reason about public override vs token fallback.
 */
export type TToastEntry = Omit<TToastInput, "placement"> & {
  id: TToastId;
  isOpen: boolean;
  placement: TToastPlacement;
};
