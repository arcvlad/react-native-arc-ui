import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { StyleSheet, View } from "react-native";

import { useARCUITheme } from "../../contexts/hooks";
import { platformElevation } from "../../utils/platformUtils";
import type {
  IModalEntry,
  IModalHostContext,
  IModalOwner,
  IModalStackContext,
  IModalStackEntry,
} from "./types";

export const ModalHostContext = createContext<IModalHostContext | null>(null);

export const ModalStackContext = createContext<IModalStackContext>({
  activeCount: 0,
  activeEntries: [],
  topId: null,
});

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const { tokens } = useARCUITheme();

  /**
   * Internal Host IDs.
   *
   * Numeric ID is lifecycle identity only and is never exposed publicly.
   */
  const nextIdRef = useRef(1);

  /**
   * Rendered Host nodes.
   *
   * These may update whenever mounted Modal props / children update.
   */
  const [entries, setEntries] = useState<IModalEntry[]>([]);

  /**
   * Semantic Modal stack.
   *
   * Kept separately from rendered Host nodes so content updates do not
   * create fake stack transitions or invalidate stack consumers.
   */
  const [stackEntries, setStackEntries] = useState<IModalStackEntry[]>([]);

  const mount = useCallback((owner: IModalOwner, node: ReactNode): number => {
    const id = nextIdRef.current++;

    setEntries((current) => [
      ...current,
      {
        id,
        node,
      },
    ]);

    setStackEntries((current) => [
      ...current,
      {
        id,
        owner,
      },
    ]);

    return id;
  }, []);

  const update = useCallback((id: number, node: ReactNode): void => {
    setEntries((current) => {
      let changed = false;

      const next = current.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        if (entry.node === node) {
          return entry;
        }

        changed = true;

        return {
          ...entry,
          node,
        };
      });

      return changed ? next : current;
    });
  }, []);

  const remove = useCallback((id: number): void => {
    setEntries((current) => {
      if (!current.some((entry) => entry.id === id)) {
        return current;
      }

      return current.filter((entry) => entry.id !== id);
    });

    setStackEntries((current) => {
      if (!current.some((entry) => entry.id === id)) {
        return current;
      }

      return current.filter((entry) => entry.id !== id);
    });
  }, []);

  const hostValue = useMemo<IModalHostContext>(
    () => ({
      mount,
      update,
      remove,
    }),
    [mount, update, remove],
  );

  const stackValue = useMemo<IModalStackContext>(() => {
    const topId =
      stackEntries.length > 0 ? stackEntries[stackEntries.length - 1].id : null;

    return {
      activeCount: stackEntries.length,

      activeEntries: stackEntries,

      topId,
    };
  }, [stackEntries]);

  const hasActiveModal = stackEntries.length > 0;

  return (
    <ModalStackContext.Provider value={stackValue}>
      <ModalHostContext.Provider value={hostValue}>
        {/*
         * Application accessibility boundary.
         *
         * When at least one Modal is mounted, the underlying application is
         * removed from VoiceOver / TalkBack traversal.
         *
         * This wrapper intentionally contains ONLY application content.
         * Modal Host and higher ARCUI overlay layers remain outside it.
         */}
        <View
          style={styles.applicationLayer}
          collapsable={false}
          accessibilityElementsHidden={hasActiveModal}
          importantForAccessibility={
            hasActiveModal ? "no-hide-descendants" : "auto"
          }
        >
          {children}
        </View>

        {entries.length > 0 && (
          <View
            style={[
              {
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              },
              {
                zIndex: tokens.zIndex.modal,
              },
              platformElevation(tokens.zIndex.modal),
            ]}
            pointerEvents="box-none"
          >
            {entries.map((entry) => (
              <View
                key={entry.id}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
                pointerEvents="box-none"
              >
                {entry.node}
              </View>
            ))}
          </View>
        )}
      </ModalHostContext.Provider>
    </ModalStackContext.Provider>
  );
};

export const useModalHost = (): IModalHostContext => {
  const context = useContext(ModalHostContext);

  if (!context) {
    throw new Error(
      "[react-native-arc-ui] Modal must be rendered inside ModalProvider.",
    );
  }

  return context;
};

export const useModalStack = (): IModalStackContext => {
  return useContext(ModalStackContext);
};

/**
 * Public semantic Modal state.
 *
 * Internal Host IDs and stack ownership remain implementation details.
 */
export const useModal = (): Pick<IModalStackContext, "activeCount"> => {
  const { activeCount } = useContext(ModalStackContext);

  return {
    activeCount,
  };
};

const styles = StyleSheet.create({
  applicationLayer: {
    flex: 1,
  },
});
