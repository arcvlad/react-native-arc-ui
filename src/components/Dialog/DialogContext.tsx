import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { StyleSheet, View } from "react-native";

import type { TDialog } from "./types";

type TDialogEntry = {
  id: number;
  dialog: TDialog;

  /**
   * Internal lifecycle state.
   *
   * true  -> Dialog should be presented
   * false -> Dialog should animate out
   *
   * This intentionally does not exist on the public TDialog API.
   */
  isOpen: boolean;
};

type TDialogContext = {
  activeDialog: TDialogEntry | null;

  /**
   * Requests the active Dialog to begin closing.
   *
   * The id guard prevents stale async callbacks from closing a newer
   * Dialog instance.
   */
  requestClose: (id: number) => boolean;

  /**
   * Called by the visual Dialog host after its exit animation completes.
   *
   * Only the matching active Dialog may complete its lifecycle.
   */
  completeClose: (id: number) => void;
};

type TDialogController = {
  show: (dialog: TDialog) => void;
  hide: () => void;
};

type TDialogProviderProps = {
  children: ReactNode;
  renderDialog: ReactNode;
};

const DialogContext = createContext<TDialogContext | null>(null);

let nextDialogId = 0;

/**
 * ARCUI is normally mounted once, but keeping a small controller registry
 * makes imperative Dialog APIs deterministic if more than one provider
 * temporarily exists during development, tests, or navigation transitions.
 *
 * The most recently mounted provider owns the imperative API.
 */
const dialogControllers: TDialogController[] = [];

const getDialogController = (): TDialogController => {
  const controller = dialogControllers[dialogControllers.length - 1];

  if (!controller) {
    throw new Error(
      "[react-native-arc-ui] Dialog API requires ARCUI to be mounted before calling showDialog() or hideDialog().",
    );
  }

  return controller;
};

/**
 * Shows a Dialog through ARCUI's single global Dialog host.
 *
 * If another Dialog is already active, the current one exits first and
 * the latest requested Dialog becomes the pending replacement.
 */
export const showDialog = (dialog: TDialog): void => {
  getDialogController().show(dialog);
};

/**
 * Closes the current Dialog through the same lifecycle used by actions,
 * backdrop dismissal, Android back, and accessibility escape.
 */
export const hideDialog = (): void => {
  getDialogController().hide();
};

export const DialogProvider = ({
  children,
  renderDialog,
}: TDialogProviderProps) => {
  const [activeDialog, setActiveDialog] = useState<TDialogEntry | null>(null);

  /**
   * Refs provide synchronous lifecycle ownership for imperative calls.
   *
   * React state alone is not sufficient because multiple showDialog()
   * calls can occur before React commits the previous state update.
   */
  const activeDialogRef = useRef<TDialogEntry | null>(null);

  /**
   * Dialog intentionally supports a single visible instance.
   *
   * This is not a stack. If a replacement is requested while another
   * Dialog is exiting, only the latest pending request is retained.
   */
  const pendingDialogRef = useRef<TDialogEntry | null>(null);

  const commitActiveDialog = useCallback((entry: TDialogEntry | null) => {
    activeDialogRef.current = entry;

    setActiveDialog(entry);
  }, []);

  const requestClose = useCallback(
    (id: number): boolean => {
      const current = activeDialogRef.current;

      if (current === null || current.id !== id || !current.isOpen) {
        return false;
      }

      commitActiveDialog({
        ...current,
        isOpen: false,
      });

      return true;
    },
    [commitActiveDialog],
  );

  const show = useCallback(
    (dialog: TDialog) => {
      nextDialogId += 1;

      const nextEntry: TDialogEntry = {
        id: nextDialogId,
        dialog,
        isOpen: true,
      };

      const current = activeDialogRef.current;

      /**
       * No Dialog is active: present immediately.
       */
      if (current === null) {
        commitActiveDialog(nextEntry);

        return;
      }

      /**
       * A Dialog already owns the host.
       *
       * Keep only the newest replacement request and let the current
       * Dialog complete its normal exit lifecycle first.
       */
      pendingDialogRef.current = nextEntry;

      if (current.isOpen) {
        commitActiveDialog({
          ...current,
          isOpen: false,
        });
      }
    },
    [commitActiveDialog],
  );

  const hide = useCallback(() => {
    /**
     * hideDialog() represents an explicit request to clear the Dialog
     * host, so an as-yet-unpresented replacement is cancelled as well.
     */
    pendingDialogRef.current = null;

    const current = activeDialogRef.current;

    if (current === null) {
      return;
    }

    requestClose(current.id);
  }, [requestClose]);

  const completeClose = useCallback(
    (id: number) => {
      const current = activeDialogRef.current;

      /**
       * A stale animation callback must never complete a newer Dialog.
       */
      if (current === null || current.id !== id) {
        return;
      }

      const pending = pendingDialogRef.current;

      pendingDialogRef.current = null;

      /**
       * Clear ownership before onDismiss.
       *
       * If onDismiss itself calls showDialog(), that newer request wins
       * over an older pending replacement.
       */
      commitActiveDialog(null);

      try {
        current.dialog.onDismiss?.();
      } finally {
        /**
         * onDismiss may have already presented another Dialog.
         *
         * Promote the previously pending replacement only when the host
         * is still free.
         */
        if (activeDialogRef.current === null && pending !== null) {
          commitActiveDialog(pending);
        }
      }
    },
    [commitActiveDialog],
  );

  const controller = useMemo(
    () => ({
      show,
      hide,
    }),
    [show, hide],
  );

  useLayoutEffect(() => {
    dialogControllers.push(controller);

    return () => {
      const index = dialogControllers.lastIndexOf(controller);

      if (index !== -1) {
        dialogControllers.splice(index, 1);
      }
    };
  }, [controller]);

  const contextValue = useMemo<TDialogContext>(
    () => ({
      activeDialog,
      requestClose,
      completeClose,
    }),
    [activeDialog, requestClose, completeClose],
  );

  return (
    <DialogContext.Provider value={contextValue}>
      <View
        style={styles.application}
        accessibilityElementsHidden={activeDialog !== null}
        importantForAccessibility={
          activeDialog !== null ? "no-hide-descendants" : "auto"
        }
      >
        {children}
      </View>

      {renderDialog}
    </DialogContext.Provider>
  );
};

/**
 * Internal Dialog host API.
 *
 * Missing provider ownership is an architectural error and must not
 * silently degrade to no-op behavior.
 */
export const useDialogContext = (): TDialogContext => {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error(
      "[react-native-arc-ui] Dialog must be rendered inside DialogProvider.",
    );
  }

  return context;
};

const styles = StyleSheet.create({
  application: {
    flex: 1,
  },
});
