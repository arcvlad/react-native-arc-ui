import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { StyleSheet, View } from "react-native";

import { useARCUISystem, useARCUITheme } from "../../contexts/hooks";
import { errors } from "../../utils/errors";
import { platformElevation } from "../../utils/platformUtils";
import { resolveSafeArea } from "../../utils/resolveSafeArea";
import { ToastItem } from "./ToastItem";
import type {
  TToastEntry,
  TToastId,
  TToastInput,
  TToastPlacement,
} from "./types";

type TToastController = {
  show: (toast: TToastInput) => TToastId;
  hide: (id: TToastId) => void;
};

type TToastProviderProps = {
  children: ReactNode;
};

type TToastProviderState = {
  toasts: TToastEntry[];
  heights: ReadonlyMap<TToastId, number>;
};

let nextToastId = 0;

/**
 * ARCUI is normally mounted once, but keeping a controller registry makes the
 * imperative Toast API deterministic if multiple providers temporarily exist
 * during development, tests, or navigation transitions.
 *
 * The most recently mounted provider owns the imperative API.
 */
const toastControllers: TToastController[] = [];

const getToastController = (): TToastController => {
  const controller = toastControllers[toastControllers.length - 1];

  if (!controller) {
    throw new Error(
      "[react-native-arc-ui] Toast API requires ARCUI to be mounted before calling showToast() or hideToast().",
    );
  }

  return controller;
};

/**
 * Shows a Toast through ARCUI's global Toast provider.
 *
 * Returns the Toast id so the same Toast can be dismissed early with
 * hideToast(id).
 */
export const showToast = (toast: TToastInput): TToastId =>
  getToastController().show(toast);

/**
 * Requests one Toast to begin its normal exit lifecycle.
 *
 * Unknown or already-closing ids are intentionally a no-op.
 */
export const hideToast = (id: TToastId): void => {
  getToastController().hide(id);
};

const resolveMaximumToDisplay = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
};

const DEFAULT_STACK_OVERLAP = 0.75;
const DEFAULT_STACK_GAP = 0;

const FALLBACK_RUNTIME_PLACEMENT: TToastPlacement = "bottom";

const isToastPlacement = (value: unknown): value is TToastPlacement =>
  value === "top" || value === "bottom";

const resolveStackOverlap = (value: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_STACK_OVERLAP;
  }

  return Math.min(1, Math.max(0, value));
};

const resolveStackGap = (value: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_STACK_GAP;
  }

  return Math.max(0, value);
};

const resolveStackOffsets = (
  entries: TToastEntry[],
  heights: ReadonlyMap<TToastId, number>,
  visibleRatio: number,
  gap: number,
): ReadonlyMap<TToastId, number> => {
  const offsets = new Map<TToastId, number>();

  let offset = 0;

  /**
   * Entries remain chronological (oldest -> newest) so React's normal sibling
   * paint order places the newest Toast visually above older Toasts.
   *
   * Offsets are calculated from newest -> oldest because the newest Toast is
   * always anchored directly to its configured screen edge.
   *
   * stackOverlap determines how much of the previous Toast remains visible,
   * while stackGap adds explicit spacing between visual stack levels.
   */
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];

    offsets.set(entry.id, offset);

    offset += (heights.get(entry.id) ?? 0) * visibleRatio + gap;
  }

  return offsets;
};

const enforcePlacementCapacity = (
  entries: TToastEntry[],
  placement: TToastPlacement,
  maximumToDisplay: number,
): TToastEntry[] => {
  const placementEntries = entries.filter(
    (entry) => entry.placement === placement,
  );

  const overflow = placementEntries.length - maximumToDisplay;

  if (overflow <= 0) {
    return entries;
  }

  const idsToEvict = new Set(
    placementEntries.slice(0, overflow).map((entry) => entry.id),
  );

  return entries.filter((entry) => !idsToEvict.has(entry.id));
};

export const ToastProvider = ({ children }: TToastProviderProps) => {
  const { tokens } = useARCUITheme();
  const { safeAreaInsets } = useARCUISystem();

  const safeTop = resolveSafeArea(
    safeAreaInsets.top,
    tokens.safeArea.toast.top,
  );

  const safeRight = resolveSafeArea(
    safeAreaInsets.right,
    tokens.safeArea.toast.right,
  );

  const safeBottom = resolveSafeArea(
    safeAreaInsets.bottom,
    tokens.safeArea.toast.bottom,
  );

  const safeLeft = resolveSafeArea(
    safeAreaInsets.left,
    tokens.safeArea.toast.left,
  );

  const maximumToDisplayPerPlacement = resolveMaximumToDisplay(
    tokens.sizings.toast.maxVisibleItemsPerPlacement,
  );

  const stackOverlap = resolveStackOverlap(tokens.sizings.toast.stackOverlap);

  const stackGap = resolveStackGap(tokens.sizings.toast.stackGap);

  const stackVisibleRatio = 1 - stackOverlap;

  const defaultPlacement = tokens.toastAnimations.placement;

  /**
   * Toast entries and measured heights are one semantic provider state.
   *
   * Keeping them together lets removal / capacity eviction clean up layout
   * metadata in the same state transition, without synchronizing React state
   * from an effect.
   */
  const [state, setState] = useState<TToastProviderState>(() => ({
    toasts: [],
    heights: new Map(),
  }));

  const { toasts, heights: toastHeights } = state;

  const handleToastHeightChange = useCallback(
    (id: TToastId, height: number): void => {
      if (!Number.isFinite(height) || height <= 0) {
        return;
      }

      setState((current) => {
        const previous = current.heights.get(id);

        if (previous !== undefined && Math.abs(previous - height) < 0.5) {
          return current;
        }

        const heights = new Map(current.heights);

        heights.set(id, height);

        return {
          ...current,
          heights,
        };
      });
    },
    [],
  );

  const show = useCallback(
    (toast: TToastInput): TToastId => {
      if (
        typeof toast.message !== "string" ||
        toast.message.trim().length === 0
      ) {
        throw new Error(
          errors.prop(
            "Toast",
            "message",
            "Expected a non-empty string containing message content.",
          ),
        );
      }

      if (
        __DEV__ &&
        toast.duration !== undefined &&
        (!Number.isFinite(toast.duration) || toast.duration < 0)
      ) {
        console.error(
          errors.prop(
            "Toast",
            "duration",
            "Expected a finite non-negative number. Falling back to the configured Toast display duration.",
          ),
        );
      }

      const requestedPlacement: unknown = toast.placement;

      if (
        __DEV__ &&
        requestedPlacement !== undefined &&
        !isToastPlacement(requestedPlacement)
      ) {
        console.error(
          errors.prop(
            "Toast",
            "placement",
            'Expected "top" or "bottom". Falling back to "bottom".',
          ),
        );
      }

      const resolvedDefaultPlacement = isToastPlacement(defaultPlacement)
        ? defaultPlacement
        : FALLBACK_RUNTIME_PLACEMENT;

      const placement =
        requestedPlacement === undefined
          ? resolvedDefaultPlacement
          : isToastPlacement(requestedPlacement)
            ? requestedPlacement
            : FALLBACK_RUNTIME_PLACEMENT;

      nextToastId += 1;

      const id = `toast-${nextToastId}`;

      const entry: TToastEntry = {
        ...toast,
        id,
        isOpen: true,
        placement,
      };

      setState((current) => {
        const requestedToasts = [...current.toasts, entry];

        /**
         * Capacity belongs to each screen edge independently.
         *
         * Normal timeout / hideToast dismissal uses the animated exit
         * lifecycle. Capacity eviction instead removes the oldest entry on
         * the same placement immediately so a rapid burst can never grow that
         * mounted stack beyond the configured maximum.
         */
        const toasts = enforcePlacementCapacity(
          requestedToasts,
          placement,
          maximumToDisplayPerPlacement,
        );

        /**
         * Capacity eviction may remove an already-measured Toast.
         * Prune its layout metadata in the same semantic state transition.
         */
        if (toasts.length === requestedToasts.length) {
          return {
            ...current,
            toasts,
          };
        }

        const activeIds = new Set(toasts.map((item) => item.id));
        const heights = new Map(current.heights);

        for (const measuredId of current.heights.keys()) {
          if (!activeIds.has(measuredId)) {
            heights.delete(measuredId);
          }
        }

        return {
          toasts,
          heights,
        };
      });

      return id;
    },
    [defaultPlacement, maximumToDisplayPerPlacement],
  );

  const hide = useCallback((id: TToastId): void => {
    setState((current) => {
      let changed = false;

      const toasts = current.toasts.map((entry) => {
        if (entry.id !== id || !entry.isOpen) {
          return entry;
        }

        changed = true;

        return {
          ...entry,
          isOpen: false,
        };
      });

      if (!changed) {
        return current;
      }

      return {
        ...current,
        toasts,
      };
    });
  }, []);

  const completeClose = useCallback((id: TToastId): void => {
    setState((current) => {
      const entry = current.toasts.find((item) => item.id === id);

      /**
       * A stale completion must never remove a currently-open Toast.
       */
      if (!entry || entry.isOpen) {
        return current;
      }

      const heights = new Map(current.heights);

      heights.delete(id);

      return {
        toasts: current.toasts.filter((item) => item.id !== id),
        heights,
      };
    });
  }, []);

  const controller = useMemo<TToastController>(
    () => ({
      show,
      hide,
    }),
    [show, hide],
  );

  useLayoutEffect(() => {
    toastControllers.push(controller);

    return () => {
      const index = toastControllers.lastIndexOf(controller);

      if (index !== -1) {
        toastControllers.splice(index, 1);
      }
    };
  }, [controller]);

  const { topToasts, bottomToasts } = useMemo(() => {
    const top: TToastEntry[] = [];
    const bottom: TToastEntry[] = [];

    for (const toast of toasts) {
      if (toast.placement === "top") {
        top.push(toast);
      } else {
        bottom.push(toast);
      }
    }

    return {
      topToasts: top,
      bottomToasts: bottom,
    };
  }, [toasts]);

  const { topOffsets, bottomOffsets } = useMemo(
    () => ({
      topOffsets: resolveStackOffsets(
        topToasts,
        toastHeights,
        stackVisibleRatio,
        stackGap,
      ),

      bottomOffsets: resolveStackOffsets(
        bottomToasts,
        toastHeights,
        stackVisibleRatio,
        stackGap,
      ),
    }),
    [topToasts, bottomToasts, toastHeights, stackVisibleRatio, stackGap],
  );

  return (
    <>
      {children}

      {toasts.length > 0 && (
        <View
          pointerEvents="none"
          style={[
            styles.overlay,
            {
              top: safeTop,
              right: safeRight,
              bottom: safeBottom,
              left: safeLeft,
              zIndex: tokens.zIndex.toast,
            },
            platformElevation(tokens.zIndex.toast),
          ]}
        >
          {topToasts.length > 0 && (
            <View pointerEvents="none" style={[styles.stack, styles.topStack]}>
              {topToasts.map((toast, index) => (
                <ToastItem
                  key={toast.id}
                  toast={toast}
                  stackOffset={topOffsets.get(toast.id) ?? 0}
                  stackDepth={topToasts.length - 1 - index}
                  onHeightChange={handleToastHeightChange}
                  onRequestClose={hide}
                  onExitComplete={completeClose}
                />
              ))}
            </View>
          )}

          {bottomToasts.length > 0 && (
            <View
              pointerEvents="none"
              style={[styles.stack, styles.bottomStack]}
            >
              {bottomToasts.map((toast, index) => (
                <ToastItem
                  key={toast.id}
                  toast={toast}
                  stackOffset={bottomOffsets.get(toast.id) ?? 0}
                  stackDepth={bottomToasts.length - 1 - index}
                  onHeightChange={handleToastHeightChange}
                  onRequestClose={hide}
                  onExitComplete={completeClose}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </>
  );
};

ToastProvider.displayName = "ToastProvider";

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
  },

  stack: {
    position: "absolute",
    left: 0,
    right: 0,
    width: "100%",
  },

  topStack: {
    top: 0,
  },

  bottomStack: {
    bottom: 0,
  },
});
