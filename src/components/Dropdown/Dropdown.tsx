import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
} from "react";
import {
  BackHandler,
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { resolveNonNegativeMetric } from "../../utils/numberUtils";
import { resolveEasing } from "../../utils/resolveEasing";
import { resolveSafeArea } from "../../utils/resolveSafeArea";
import { DropdownItem } from "./DropdownItem";
import { useDropdownHost } from "./DropdownProvider";
import type {
  IDropdown,
  TDropdownItem,
  TDropdownPlacement,
  TDropdownTriggerProps,
} from "./types";

type TResolvedDropdownSide = "top" | "bottom";

type TDropdownPosition = {
  /**
   * Final physical side after collision resolution.
   */
  side: TResolvedDropdownSide;

  /**
   * Absolute horizontal position inside the Dropdown host.
   */
  left: number;

  /**
   * Surface width after trigger sizing and viewport clamping.
   */
  width: number;

  /**
   * Physical top offset when side === "bottom",
   * or physical bottom offset when side === "top".
   */
  offset: number;

  /**
   * Maximum usable viewport space on the resolved side.
   *
   * Font scaling is intentionally excluded because it remains
   * on the UI thread.
   */
  availableHeight: number;
};

interface IDropdownTriggerRenderer {
  trigger: IDropdown["trigger"];
  triggerProps: TDropdownTriggerProps;
}

/**
 * Keeps the consumer-provided render function behind a React component
 * boundary.
 *
 * Dropdown interaction callbacks access lifecycle refs, but those refs
 * must only be touched after user interaction — never while Dropdown
 * itself is rendering.
 *
 * This boundary also keeps React 19's refs lint from treating the
 * consumer render function as an immediate invocation of those callbacks.
 */
const DropdownTriggerRenderer = memo(
  ({ trigger, triggerProps }: IDropdownTriggerRenderer) => {
    return trigger(triggerProps);
  },
);

DropdownTriggerRenderer.displayName = "DropdownTriggerRenderer";

const resolvePositiveInteger = (
  value: number | undefined,
  fallback: number,
): number => {
  const resolvedFallback = Number.isFinite(fallback)
    ? Math.max(1, Math.floor(fallback))
    : 1;

  if (value === undefined || !Number.isFinite(value)) {
    return resolvedFallback;
  }

  return Math.max(1, Math.floor(value));
};

const resolveDropdownPlacement = (value: string): TDropdownPlacement => {
  switch (value) {
    case "bottom-start":
    case "bottom-end":
    case "top-start":
    case "top-end":
      return value;

    default:
      if (__DEV__) {
        console.error(
          `[react-native-arc-ui] Dropdown placement "${String(
            value,
          )}" is invalid. Falling back to "bottom-end".`,
        );
      }

      return "bottom-end";
  }
};

const assertUniqueDropdownItemValues = (
  items: readonly TDropdownItem[],
): void => {
  const values = new Set<string>();

  for (const item of items) {
    if (values.has(item.value)) {
      throw new Error(
        `[react-native-arc-ui] Dropdown requires unique item values. Duplicate value "${item.value}".`,
      );
    }

    values.add(item.value);
  }
};

const DropdownComponent = ({
  items,
  onSelect,
  trigger,
  placement = "bottom-end",
  maxVisibleItems,
  disabled = false,
  style,
  testID,
}: IDropdown) => {
  assertUniqueDropdownItemValues(items);

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const { tokens } = useARCUITheme();
  const { themeProgress } = useARCUIAnimatedTheme();
  const { fontScale, safeAreaInsets } = useARCUISystem();

  const { mount, update, remove } = useDropdownHost();

  const prefersReducedMotion = useReducedMotion();

  const resolvedPlacement = resolveDropdownPlacement(placement);

  const [isOpen, setIsOpen] = useState(false);

  const [dropdownPosition, setDropdownPosition] =
    useState<TDropdownPosition | null>(null);

  const triggerRef = useRef<ComponentRef<typeof View>>(null);

  /**
   * Current entry owned by this Dropdown inside DropdownProvider's host.
   */
  const hostIdRef = useRef<number | null>(null);

  /**
   * Enter animation starts one committed frame after the initially
   * invisible host node has mounted.
   */
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Native trigger measurement is asynchronous.
   *
   * This synchronous flag owns the pending-open interval before React state
   * can report the Dropdown as open. It also lets a second trigger press
   * cancel that pending open instead of starting another measurement.
   */
  const isOpeningRef = useRef(false);

  /**
   * The host stays mounted during its exit animation.
   *
   * This synchronous flag prevents a second close/select/open lifecycle
   * from starting before React has committed another render.
   */
  const isClosingRef = useRef(false);

  /**
   * measureInWindow callbacks are asynchronous.
   *
   * Incrementing this request ID invalidates older callbacks so stale
   * measurements cannot reopen or reposition a newer Dropdown state.
   */
  const measurementRequestRef = useRef(0);

  const mountedRef = useRef(true);

  const fadeProgress = useSharedValue(0);

  const resolvedMaxVisibleItems = resolvePositiveInteger(
    maxVisibleItems,
    tokens.sizings.dropdown.maxVisibleItems,
  );

  const itemMinHeight = tokens.sizings.dropdown.itemMinHeight;
  const borderWidth = tokens.border.dropdown;

  const placementGap = tokens.sizings.dropdown.placementGap;
  const viewportInset = tokens.sizings.dropdown.viewportInset;

  const safeTop = resolveSafeArea(
    safeAreaInsets.top,
    tokens.safeArea.dropdown.top,
  );

  const safeRight = resolveSafeArea(
    safeAreaInsets.right,
    tokens.safeArea.dropdown.right,
  );

  const safeBottom = resolveSafeArea(
    safeAreaInsets.bottom,
    tokens.safeArea.dropdown.bottom,
  );

  const safeLeft = resolveSafeArea(
    safeAreaInsets.left,
    tokens.safeArea.dropdown.left,
  );

  // ─── Animation config ──────────────────────────────────────────────────────

  const enterAnimationConfig = useMemo(
    () => ({
      duration:
        tokens.dropdownAnimations.enterDuration ??
        tokens.animations.enterDuration,

      easing: resolveEasing(
        tokens.dropdownAnimations.enterEasing ?? tokens.animations.enterEasing,
      ),
    }),
    [
      tokens.dropdownAnimations.enterDuration,
      tokens.dropdownAnimations.enterEasing,
      tokens.animations.enterDuration,
      tokens.animations.enterEasing,
    ],
  );

  const exitAnimationConfig = useMemo(
    () => ({
      duration:
        tokens.dropdownAnimations.exitDuration ??
        tokens.animations.exitDuration,

      easing: resolveEasing(
        tokens.dropdownAnimations.exitEasing ?? tokens.animations.exitEasing,
      ),
    }),
    [
      tokens.dropdownAnimations.exitDuration,
      tokens.dropdownAnimations.exitEasing,
      tokens.animations.exitDuration,
      tokens.animations.exitEasing,
    ],
  );

  const scaleFrom = resolveNonNegativeMetric(
    tokens.dropdownAnimations.scaleFrom,
    1,
  );

  // ─── Host lifecycle ────────────────────────────────────────────────────────

  const invalidatePendingMeasurement = useCallback(() => {
    measurementRequestRef.current += 1;
    isOpeningRef.current = false;
  }, []);

  const cancelPendingAnimationFrame = useCallback(() => {
    if (animationFrameRef.current === null) {
      return;
    }

    cancelAnimationFrame(animationFrameRef.current);

    animationFrameRef.current = null;
  }, []);

  const finalizeClose = useCallback(
    (id: number) => {
      /**
       * A stale animation completion must never mutate a newer entry.
       */
      if (hostIdRef.current !== id) {
        remove(id);

        return;
      }

      hostIdRef.current = null;
      isClosingRef.current = false;

      setIsOpen(false);
      setDropdownPosition(null);

      remove(id);
    },
    [remove],
  );

  const close = useCallback(() => {
    /**
     * Invalidate any native measurement that has not returned yet.
     */
    invalidatePendingMeasurement();

    cancelPendingAnimationFrame();

    if (isClosingRef.current) {
      return;
    }

    const id = hostIdRef.current;

    if (id === null) {
      isClosingRef.current = false;

      setIsOpen(false);
      setDropdownPosition(null);

      return;
    }

    isClosingRef.current = true;

    cancelAnimation(fadeProgress);

    fadeProgress.value = withTiming(0, exitAnimationConfig, (finished) => {
      "worklet";

      if (finished) {
        runOnJS(finalizeClose)(id);
      }
    });
  }, [
    cancelPendingAnimationFrame,
    invalidatePendingMeasurement,
    exitAnimationConfig,
    fadeProgress,
    finalizeClose,
  ]);

  // ─── Positioning ───────────────────────────────────────────────────────────

  const measureAndPosition = useCallback(
    (openAfterMeasurement: boolean) => {
      const triggerNode = triggerRef.current;

      if (triggerNode === null) {
        if (openAfterMeasurement) {
          isOpeningRef.current = false;
        }

        return;
      }

      const requestId = ++measurementRequestRef.current;

      triggerNode.measureInWindow((x, y, triggerWidth, triggerHeight) => {
        if (
          !mountedRef.current ||
          measurementRequestRef.current !== requestId
        ) {
          return;
        }

        /**
         * An open request may become invalid while native measurement
         * is in flight.
         */
        if (openAfterMeasurement && (disabled || items.length === 0)) {
          isOpeningRef.current = false;

          return;
        }

        const horizontalStart = safeLeft + viewportInset;

        const horizontalEnd = screenWidth - safeRight - viewportInset;

        const verticalStart = safeTop + viewportInset;

        const verticalEnd = screenHeight - safeBottom - viewportInset;

        const availableWidth = Math.max(0, horizontalEnd - horizontalStart);

        /**
         * Do not mount an invisible full-screen dismiss layer when
         * the viewport cannot provide usable horizontal space.
         */
        if (availableWidth <= 0) {
          if (openAfterMeasurement) {
            isOpeningRef.current = false;
          }

          return;
        }

        /**
         * A trigger wider than minWidth defines the surface width.
         *
         * The available viewport remains the absolute upper bound.
         */
        const dropdownWidth = Math.min(
          Math.max(triggerWidth, tokens.sizings.dropdown.minWidth),
          availableWidth,
        );

        // ─── Logical horizontal alignment ────────────────────────────────

        const wantsStart = resolvedPlacement.endsWith("start");

        /**
         * Absolute window coordinates are physical coordinates, so
         * logical start/end must be resolved explicitly.
         *
         * LTR:
         * start -> align left edges
         * end   -> align right edges
         *
         * RTL:
         * start -> align right edges
         * end   -> align left edges
         */
        const alignLeftEdges = I18nManager.isRTL ? !wantsStart : wantsStart;

        let left = alignLeftEdges ? x : x + triggerWidth - dropdownWidth;

        const maxLeft = Math.max(
          horizontalStart,
          horizontalEnd - dropdownWidth,
        );

        left = Math.max(horizontalStart, Math.min(left, maxLeft));

        // ─── Vertical collision resolution ───────────────────────────────

        const belowAnchorTop = y + triggerHeight + placementGap;

        const aboveAnchorBottom = y - placementGap;

        const availableBelow = Math.max(0, verticalEnd - belowAnchorTop);

        const availableAbove = Math.max(0, aboveAnchorBottom - verticalStart);

        if (availableBelow <= 0 && availableAbove <= 0) {
          if (openAfterMeasurement) {
            isOpeningRef.current = false;
          }

          return;
        }

        const preferredSide: TResolvedDropdownSide =
          resolvedPlacement.startsWith("bottom") ? "bottom" : "top";

        const preferredSpace =
          preferredSide === "bottom" ? availableBelow : availableAbove;

        const oppositeSpace =
          preferredSide === "bottom" ? availableAbove : availableBelow;

        /**
         * Collision testing uses the semantic base item height.
         *
         * Actual ARCUI font scaling remains on the UI thread and can
         * constrain the ScrollView further after presentation.
         */
        const desiredBaseHeight =
          Math.min(items.length, resolvedMaxVisibleItems) * itemMinHeight +
          borderWidth * 2;

        const shouldFlip =
          preferredSpace < desiredBaseHeight && oppositeSpace > preferredSpace;

        const resolvedSide: TResolvedDropdownSide = shouldFlip
          ? preferredSide === "bottom"
            ? "top"
            : "bottom"
          : preferredSide;

        if (resolvedSide === "bottom") {
          const top = Math.max(
            verticalStart,
            Math.min(belowAnchorTop, verticalEnd),
          );

          /**
           * Recalculate usable space from the final clamped anchor.
           *
           * The trigger can theoretically be partially outside the viewport
           * because of parent animations or programmatic layout changes.
           */
          const resolvedAvailableHeight = Math.max(0, verticalEnd - top);

          setDropdownPosition({
            side: "bottom",
            left,
            width: dropdownWidth,
            offset: top,
            availableHeight: resolvedAvailableHeight,
          });
        } else {
          const physicalBottom = Math.max(
            verticalStart,
            Math.min(aboveAnchorBottom, verticalEnd),
          );

          /**
           * Same invariant as bottom placement: maxHeight must be derived
           * from the final physical anchor, not the pre-clamped coordinate.
           */
          const resolvedAvailableHeight = Math.max(
            0,
            physicalBottom - verticalStart,
          );

          setDropdownPosition({
            side: "top",
            left,
            width: dropdownWidth,
            offset: screenHeight - physicalBottom,
            availableHeight: resolvedAvailableHeight,
          });
        }

        if (openAfterMeasurement) {
          isClosingRef.current = false;

          setIsOpen(true);
        }
      });
    },
    [
      disabled,
      items.length,
      resolvedPlacement,
      resolvedMaxVisibleItems,
      itemMinHeight,
      borderWidth,
      placementGap,
      viewportInset,
      safeTop,
      safeRight,
      safeBottom,
      safeLeft,
      screenWidth,
      screenHeight,
      tokens.sizings.dropdown.minWidth,
    ],
  );

  const open = useCallback(() => {
    if (
      disabled ||
      items.length === 0 ||
      isOpeningRef.current ||
      isClosingRef.current
    ) {
      return;
    }

    isOpeningRef.current = true;

    measureAndPosition(true);
  }, [disabled, items.length, measureAndPosition]);

  /**
   * If positioning inputs change while native trigger measurement is still
   * pending, the old callback no longer owns a valid open request.
   *
   * useLayoutEffect keeps that invalidation tied to the committed layout/config
   * revision rather than waiting for a passive effect. A successful open keeps
   * synchronous ownership until the Host entry has actually been mounted.
   */
  useLayoutEffect(() => {
    if (!isOpen && isOpeningRef.current) {
      invalidatePendingMeasurement();
    }
  }, [isOpen, measureAndPosition, invalidatePendingMeasurement]);

  // ─── Interaction ───────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (value: string, item: TDropdownItem) => {
      /**
       * The visual host remains mounted while exiting.
       *
       * Prevent another item activation during that interval.
       */
      if (isClosingRef.current) {
        return;
      }

      close();

      onSelect(value, item);
    },
    [close, onSelect],
  );

  const handleTriggerPress = useCallback(() => {
    if (disabled) {
      return;
    }

    if (isOpeningRef.current) {
      invalidatePendingMeasurement();

      setIsOpen(false);
      setDropdownPosition(null);

      return;
    }

    if (isOpen) {
      close();

      return;
    }

    open();
  }, [disabled, isOpen, close, open, invalidatePendingMeasurement]);

  // ─── Runtime state changes ─────────────────────────────────────────────────

  /**
   * Interaction can become unavailable while the Dropdown is already
   * presented.
   */
  useEffect(() => {
    if (isOpen && (disabled || items.length === 0)) {
      close();
    }
  }, [isOpen, disabled, items.length, close]);

  /**
   * Re-measure while open when viewport, placement, item count,
   * safe area, or positioning tokens change.
   *
   * fontScale is intentionally not synchronized into React.
   */
  useEffect(() => {
    if (!isOpen || isClosingRef.current) {
      return;
    }

    measureAndPosition(false);
  }, [isOpen, measureAndPosition]);

  /**
   * Android hardware back belongs to the open Dropdown.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      close();

      return true;
    });

    return () => {
      handler.remove();
    };
  }, [isOpen, close]);

  // ─── Theme colors ──────────────────────────────────────────────────────────

  const lightBackground = tokens.colors.light.dropdown.background;

  const darkBackground = tokens.colors.dark.dropdown.background;

  const lightBorder = tokens.colors.light.dropdown.border;

  const darkBorder = tokens.colors.dark.dropdown.border;

  // ─── Static layout styles ──────────────────────────────────────────────────

  const positionStyle = useMemo<ViewStyle | null>(() => {
    if (!dropdownPosition) {
      return null;
    }

    const common: ViewStyle = {
      left: dropdownPosition.left,
      width: dropdownPosition.width,
    };

    if (dropdownPosition.side === "bottom") {
      return {
        ...common,
        top: dropdownPosition.offset,
      };
    }

    return {
      ...common,
      bottom: dropdownPosition.offset,
    };
  }, [dropdownPosition]);

  const surfaceStyle = useMemo<ViewStyle>(
    () => ({
      borderRadius: tokens.radius.dropdown,
      borderWidth: tokens.border.dropdown,
    }),
    [tokens.radius.dropdown, tokens.border.dropdown],
  );

  // ─── Animated styles ───────────────────────────────────────────────────────

  /**
   * Opacity is the visibility transition.
   *
   * Reduced Motion removes the spatial scale transition. Reanimated's
   * timing policy remains responsible for whether opacity animates or
   * resolves immediately under the current system preference.
   */
  const animatedMotionStyle = useAnimatedStyle(() => {
    const scale = prefersReducedMotion
      ? 1
      : scaleFrom + (1 - scaleFrom) * fadeProgress.value;

    return {
      opacity: fadeProgress.value,

      transform: [
        {
          scale,
        },
      ],
    };
  });

  const animatedSurfaceStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBackground, lightBackground],
    ),

    borderColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBorder, lightBorder],
    ),
  }));

  const availableMenuHeight = dropdownPosition?.availableHeight ?? 0;

  const visibleItemCount = Math.min(items.length, resolvedMaxVisibleItems);

  /**
   * No SharedValue crosses back to React.
   *
   * Dropdown max height and item minimum heights both respond directly
   * to ARCUI's clamped fontScale on the UI thread.
   */
  const animatedMaxHeightStyle = useAnimatedStyle(() => {
    const desiredHeight =
      visibleItemCount * itemMinHeight * fontScale.value + borderWidth * 2;

    return {
      maxHeight: Math.max(0, Math.min(availableMenuHeight, desiredHeight)),
    };
  });

  // ─── Hosted visual content ─────────────────────────────────────────────────

  const hostContent = useMemo(() => {
    if (!dropdownPosition || !positionStyle) {
      return null;
    }

    return (
      <View
        style={styles.hostContent}
        pointerEvents="box-none"
        accessibilityViewIsModal
        onAccessibilityEscape={close}
        testID={testID ? `${testID}-host` : undefined}
      >
        {/*
         * Full-screen passive dismissal layer.
         *
         * It responds to touch but is excluded from the accessibility tree.
         */}
        <Pressable
          style={styles.backdrop}
          onPress={close}
          accessible={false}
          testID={testID ? `${testID}-backdrop` : undefined}
        />

        {/*
         * Positioner owns absolute placement and lifecycle motion.
         *
         * No shadow and no elevation belong here.
         *
         * Android overlay elevation is owned centrally by
         * DropdownProvider's host and uses ARCUI's transparent
         * elevation shadow color.
         */}
        <Animated.View
          style={[styles.positioner, positionStyle, animatedMotionStyle]}
          pointerEvents="auto"
        >
          {/*
           * Surface owns radius, border, theme colors, clipping,
           * and the UI-thread height constraint.
           */}
          <Animated.View
            style={[
              styles.surface,
              surfaceStyle,
              animatedSurfaceStyle,
              animatedMaxHeightStyle,
            ]}
            role="menu"
            accessibilityRole="menu"
            testID={testID ? `${testID}-list` : undefined}
          >
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {items.map((item) => (
                <DropdownItem
                  key={item.value}
                  item={item}
                  onPress={handleSelect}
                  testID={testID ? `${testID}-item-${item.value}` : undefined}
                />
              ))}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }, [
    dropdownPosition,
    positionStyle,
    close,
    testID,
    animatedMotionStyle,
    surfaceStyle,
    animatedSurfaceStyle,
    animatedMaxHeightStyle,
    items,
    handleSelect,
  ]);

  // ─── Host mount / update ───────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || hostContent === null) {
      return;
    }

    const currentId = hostIdRef.current;

    if (currentId === null) {
      /**
       * isOpen may already have committed while the passive Host-mount effect
       * is still pending. If a rapid second trigger press cancelled that open
       * synchronously, do not resurrect the stale request here.
       */
      if (!isOpeningRef.current) {
        return;
      }

      cancelPendingAnimationFrame();

      cancelAnimation(fadeProgress);

      fadeProgress.value = 0;

      const id = mount(hostContent);

      hostIdRef.current = id;
      isOpeningRef.current = false;

      animationFrameRef.current = requestAnimationFrame(() => {
        animationFrameRef.current = null;

        if (hostIdRef.current !== id || isClosingRef.current) {
          return;
        }

        fadeProgress.value = withTiming(1, enterAnimationConfig);
      });

      return;
    }

    update(currentId, hostContent);
  }, [
    isOpen,
    hostContent,
    mount,
    update,
    fadeProgress,
    enterAnimationConfig,
    cancelPendingAnimationFrame,
  ]);

  // ─── Component unmount cleanup ─────────────────────────────────────────────

  useEffect(() => {
    return () => {
      mountedRef.current = false;

      invalidatePendingMeasurement();

      cancelPendingAnimationFrame();

      cancelAnimation(fadeProgress);

      const id = hostIdRef.current;

      hostIdRef.current = null;

      if (id !== null) {
        remove(id);
      }
    };
  }, [
    remove,
    fadeProgress,
    cancelPendingAnimationFrame,
    invalidatePendingMeasurement,
  ]);

  // ─── Trigger ────────────────────────────────────────────────────────────────

  const triggerProps = useMemo<TDropdownTriggerProps>(
    () => ({
      onPress: handleTriggerPress,
      isOpen,
      disabled,
    }),
    [handleTriggerPress, isOpen, disabled],
  );

  return (
    <View ref={triggerRef} collapsable={false} style={style} testID={testID}>
      <DropdownTriggerRenderer trigger={trigger} triggerProps={triggerProps} />
    </View>
  );
};

export const Dropdown = memo(DropdownComponent);

Dropdown.displayName = "Dropdown";

const styles = StyleSheet.create({
  hostContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  positioner: {
    position: "absolute",
  },

  surface: {
    overflow: "hidden",
  },
});
