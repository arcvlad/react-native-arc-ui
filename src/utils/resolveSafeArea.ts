import type { TSafeAreaOffset } from "../tokens/SafeArea";

export const resolveSafeArea = (
  inset: number,
  offset: TSafeAreaOffset,
): number => {
  if (offset === false) {
    return 0;
  }

  return Math.max(0, inset) + Math.max(0, offset);
};
