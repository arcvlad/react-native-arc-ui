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

type TDropdownHostEntry = {
  id: number;
  node: ReactNode;
};

type TDropdownHostContext = {
  /**
   * Mounts Dropdown visual content into the centralized overlay host.
   *
   * Returns a monotonically increasing ID used by the Dropdown instance
   * to own and update only its own host entry.
   */
  mount: (node: ReactNode) => number;

  /**
   * Replaces the rendered node for an existing host entry without
   * changing its ordering.
   */
  update: (id: number, node: ReactNode) => void;

  /**
   * Removes an entry after its exit lifecycle has completed.
   */
  remove: (id: number) => void;
};

const DropdownHostContext = createContext<TDropdownHostContext | null>(null);

export const DropdownProvider = ({ children }: { children: ReactNode }) => {
  const { tokens } = useARCUITheme();

  /**
   * IDs are monotonic rather than time-based so multiple mount requests
   * cannot collide even when they occur within the same millisecond.
   */
  const nextIdRef = useRef(1);

  const [entries, setEntries] = useState<TDropdownHostEntry[]>([]);

  const mount = useCallback((node: ReactNode): number => {
    const id = nextIdRef.current++;

    setEntries((current) => [
      ...current,
      {
        id,
        node,
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
  }, []);

  /**
   * Host operations are stable for the lifetime of the Provider.
   *
   * Entry state intentionally does not belong to the context value,
   * preventing every Dropdown declaration from re-rendering whenever
   * another Dropdown mounts or updates its visual host.
   */
  const hostValue = useMemo<TDropdownHostContext>(
    () => ({
      mount,
      update,
      remove,
    }),
    [mount, update, remove],
  );

  const hasEntries = entries.length > 0;

  /**
   * Normal interaction allows only one Dropdown to be reached because
   * its fullscreen dismissal layer covers the application.
   *
   * Keeping top-most ownership here still makes the host deterministic
   * if overlapping mount requests occur through an unusual race.
   */
  const topId = hasEntries ? entries[entries.length - 1].id : null;

  return (
    <DropdownHostContext.Provider value={hostValue}>
      {/*
       * While a Dropdown is presented, the application underneath must
       * neither receive touch interaction nor remain reachable by
       * VoiceOver / TalkBack.
       *
       * The host is rendered as a sibling below, so hiding this subtree
       * does not hide the active Dropdown itself.
       */}
      <View
        style={styles.application}
        pointerEvents={hasEntries ? "none" : "auto"}
        accessibilityElementsHidden={hasEntries}
        importantForAccessibility={hasEntries ? "no-hide-descendants" : "auto"}
      >
        {children}
      </View>

      {hasEntries && (
        <View
          style={[
            styles.host,
            {
              zIndex: tokens.zIndex.dropdown,
            },

            /**
             * Android needs elevation for reliable native overlay ordering.
             * platformElevation keeps its visual shadow permanently transparent.
             */
            platformElevation(tokens.zIndex.dropdown),
          ]}
          pointerEvents="box-none"
        >
          {entries.map((entry) => {
            const isTopMost = entry.id === topId;

            return (
              <View
                key={entry.id}
                style={styles.entry}
                pointerEvents={isTopMost ? "box-none" : "none"}
                accessibilityElementsHidden={!isTopMost}
                importantForAccessibility={
                  isTopMost ? "auto" : "no-hide-descendants"
                }
              >
                {entry.node}
              </View>
            );
          })}
        </View>
      )}
    </DropdownHostContext.Provider>
  );
};

export const useDropdownHost = (): TDropdownHostContext => {
  const context = useContext(DropdownHostContext);

  if (!context) {
    throw new Error(
      "[react-native-arc-ui] Dropdown must be rendered inside DropdownProvider.",
    );
  }

  return context;
};

const styles = StyleSheet.create({
  application: {
    flex: 1,
  },

  host: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  entry: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
