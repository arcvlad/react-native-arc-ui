import { createContext, useContext } from "react";

import type { TSelectionGroupContext } from "./types";

export const SelectionGroupContext =
  createContext<TSelectionGroupContext | null>(null);

/**
 * Returns the nearest SelectionGroup context.
 *
 * null is a valid result because selection-aware components can also
 * operate independently outside a SelectionGroup.
 */
export const useSelectionGroup = (): TSelectionGroupContext | null =>
  useContext(SelectionGroupContext);
