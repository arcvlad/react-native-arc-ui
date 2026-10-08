import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  interpolateColor,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import {
  useARCUIAnimatedTheme,
  useARCUIStrings,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { resolveSafeArea } from "../../utils/resolveSafeArea";
import { Icon } from "../Icon/Icon";
import { useModalHost, useModalStack } from "./ModalProvider";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { IModal, IModalOwner, TModalCloseReason } from "./types";
import {
  isNonNegativeFiniteNumber,
  parsePercentage,
} from "../../utils/numberUtils";
import { errors } from "../../utils/errors";

const ModalComponent = ({
  visible,
  onClose,
  children,
  title,
  subtitle,
  rightAction,
  height,
  stackOffset,
  scrollable = true,
  dismissDistance,
  dismissVelocity,
  style,
  testID,
}: IModal) => {
  const { height: screenHeight } = useWindowDimensions();

  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale, safeAreaInsets } = useARCUISystem();

  const strings = useARCUIStrings();

  const { mount, update, remove } = useModalHost();

  const { activeEntries, topId } = useModalStack();

  // ─── Stable Modal identity ────────────────────────────────────────────────

  /**
   * React-owned stable identity of this Modal declaration.
   *
   * Host IDs are created asynchronously by ModalProvider, so render semantics
   * must not depend on reading a Host ID ref.
   */
  const [owner] = useState<IModalOwner>(() => ({
    kind: "modal",
  }));

  // ─── Public API invariants ────────────────────────────────────────────────

  if (typeof height === "number" && !isNonNegativeFiniteNumber(height)) {
    throw new Error(
      errors.prop(
        "Modal",
        "height",
        "Expected a finite number greater than or equal to 0.",
      ),
    );
  }

  const percentageHeight =
    typeof height === "string" ? parsePercentage(height) : undefined;

  if (percentageHeight === null) {
    throw new Error(
      errors.prop(
        "Modal",
        "height",
        'Percentage height must be between "0%" and "100%".',
      ),
    );
  }

  if (
    stackOffset !== undefined &&
    stackOffset !== false &&
    !isNonNegativeFiniteNumber(stackOffset)
  ) {
    throw new Error(
      errors.prop(
        "Modal",
        "stackOffset",
        "Expected a finite number greater than or equal to 0.",
      ),
    );
  }

  if (
    dismissDistance !== undefined &&
    !isNonNegativeFiniteNumber(dismissDistance)
  ) {
    throw new Error(
      errors.prop(
        "Modal",
        "dismissDistance",
        "Expected a finite number greater than or equal to 0.",
      ),
    );
  }

  if (
    dismissVelocity !== undefined &&
    !isNonNegativeFiniteNumber(dismissVelocity)
  ) {
    throw new Error(
      errors.prop(
        "Modal",
        "dismissVelocity",
        "Expected a finite number greater than or equal to 0.",
      ),
    );
  }

  const dismissThreshold = tokens.modalAnimations.dismissThreshold;

  if (
    !Number.isFinite(dismissThreshold) ||
    dismissThreshold < 0 ||
    dismissThreshold > 1
  ) {
    throw new Error(
      "[react-native-arc-ui] tokens.modalAnimations.dismissThreshold must be a finite number between 0 and 1.",
    );
  }

  const tokenDismissVelocity = tokens.modalAnimations.dismissVelocity;

  if (!isNonNegativeFiniteNumber(tokenDismissVelocity)) {
    throw new Error(
      "[react-native-arc-ui] tokens.modalAnimations.dismissVelocity must be a finite number greater than or equal to 0.",
    );
  }

  const backdropTapMovementThreshold =
    tokens.modalAnimations.backdropTapMovementThreshold;

  const panActivationOffsetY = tokens.modalAnimations.panActivationOffsetY;

  if (!isNonNegativeFiniteNumber(backdropTapMovementThreshold)) {
    throw new Error(
      "[react-native-arc-ui] tokens.modalAnimations.backdropTapMovementThreshold must be a finite number greater than or equal to 0.",
    );
  }

  if (!isNonNegativeFiniteNumber(panActivationOffsetY)) {
    throw new Error(
      "[react-native-arc-ui] tokens.modalAnimations.panActivationOffsetY must be a finite number greater than or equal to 0.",
    );
  }

  const resolvedDismissVelocity = dismissVelocity ?? tokenDismissVelocity;

  const resolvedStackOffset =
    stackOffset === false
      ? 0
      : (stackOffset ?? tokens.sizings.modal.stackOffset);

  if (!isNonNegativeFiniteNumber(resolvedStackOffset)) {
    throw new Error(
      "[react-native-arc-ui] Modal stackOffset must resolve to a finite number greater than or equal to 0.",
    );
  }

  // ─── React-visible Host semantics ─────────────────────────────────────────

  /**
   * ModalProvider owns semantic stack state.
   *
   * The current Host ID, stack depth and top-most status are therefore derived
   * entirely from React state/context rather than refs.
   */
  const stackIndex = useMemo(
    () => activeEntries.findIndex((entry) => entry.owner === owner),
    [activeEntries, owner],
  );

  const hostId = stackIndex >= 0 ? activeEntries[stackIndex].id : null;

  const isTopMost = hostId !== null && hostId === topId;

  /**
   * Before mounting, activeEntries.length is the depth this Modal will receive.
   *
   * Once mounted, its real stack position is authoritative.
   */
  const stackDepth = stackIndex >= 0 ? stackIndex : activeEntries.length;

  // ─── Async lifecycle refs ─────────────────────────────────────────────────

  /**
   * Async Host lifecycle identity only.
   *
   * Never read during render.
   */
  const activeHostIdRef = useRef<number | null>(null);

  /**
   * Invalidates stale animation completions.
   *
   * Important for:
   *
   * close
   * → reopen before exit completion
   * → old completion arrives later
   */
  const transitionVersionRef = useRef(0);

  /**
   * Immediate duplicate-close guard.
   *
   * This does not determine render output.
   */
  const isClosingRef = useRef(false);

  const animationFrameRef = useRef<number | null>(null);

  /**
   * Backdrop gesture bookkeeping only.
   */
  const backdropPressY = useRef(0);

  // ─── Swipe UI → JS semantic bridge ────────────────────────────────────────

  /**
   * Gesture worklets must not receive requestClose directly because
   * requestClose legitimately reads lifecycle refs.
   *
   * The worklet therefore emits only a React semantic signal.
   */
  const [swipeCloseRequestVersion, setSwipeCloseRequestVersion] = useState(0);

  /**
   * Guards the effect from replaying an already handled swipe when
   * requestClose changes identity.
   */
  const processedSwipeCloseRequestRef = useRef(0);

  const queueSwipeClose = useCallback(() => {
    setSwipeCloseRequestVersion((current) => current + 1);
  }, []);

  // ─── Safe Area / stack geometry ───────────────────────────────────────────

  /**
   * Fullscreen backdrop covers the physical screen.
   *
   * Modal surface remains attached to the physical bottom while:
   *
   * - top Safe Area constrains maximum sheet height
   * - bottom Safe Area becomes content padding
   */
  const modalTopBoundary = resolveSafeArea(
    safeAreaInsets.top,
    tokens.safeArea.modal.top,
  );

  const modalRightPadding = resolveSafeArea(
    safeAreaInsets.right,
    tokens.safeArea.modal.right,
  );

  const modalBottomPadding = resolveSafeArea(
    safeAreaInsets.bottom,
    tokens.safeArea.modal.bottom,
  );

  const modalLeftPadding = resolveSafeArea(
    safeAreaInsets.left,
    tokens.safeArea.modal.left,
  );

  const stackTopOffset = stackDepth * resolvedStackOffset;

  const availableHeight = Math.max(
    0,
    screenHeight - modalTopBoundary - stackTopOffset,
  );

  const resolvedHeight = useMemo(() => {
    if (height === undefined) {
      return undefined;
    }

    if (typeof height === "number") {
      return Math.min(height, availableHeight);
    }

    return availableHeight * ((percentageHeight ?? 0) / 100);
  }, [height, percentageHeight, availableHeight]);

  // ─── Token extraction ─────────────────────────────────────────────────────

  const lightBackground = tokens.colors.light.modal.background;

  const darkBackground = tokens.colors.dark.modal.background;

  const lightBackdrop = tokens.colors.light.modal.backdrop;

  const darkBackdrop = tokens.colors.dark.modal.backdrop;

  const lightHandle = tokens.colors.light.modal.handle;

  const darkHandle = tokens.colors.dark.modal.handle;

  const lightBorder = tokens.colors.light.modal.border;

  const darkBorder = tokens.colors.dark.modal.border;

  const lightTitle = tokens.colors.light.modal.title;

  const darkTitle = tokens.colors.dark.modal.title;

  const lightSubtitle = tokens.colors.light.modal.subtitle;

  const darkSubtitle = tokens.colors.dark.modal.subtitle;

  const lightIcon = tokens.colors.light.modal.icon;

  const darkIcon = tokens.colors.dark.modal.icon;

  const titleFontSize = tokens.typography.modal.title.fontSize;

  const subtitleFontSize = tokens.typography.modal.subtitle.fontSize;

  const borderRadius = tokens.radius.modal;

  const borderWidth = tokens.border.modal;

  const titleNumberOfLines = tokens.sizings.modal.titleNumberOfLines;

  const subtitleNumberOfLines = tokens.sizings.modal.subtitleNumberOfLines;

  const iconSize = tokens.sizings.icon.m;

  const closeHitSlop = tokens.spacing.s;

  const closeAccessibilityLabel = strings.modalCloseAccessibilityLabel;

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.modalAnimations, tokens.animations),
    [tokens.modalAnimations, tokens.animations],
  );

  /**
   * ReduceMotion.System is explicit so ARCUI's custom Modal motion obeys
   * platform accessibility preference without JS-side frame decisions.
   */
  const timingConfig = useMemo(
    () => ({
      ...animationConfig,

      reduceMotion: ReduceMotion.System,
    }),
    [animationConfig],
  );

  const springConfig = useMemo(
    () => ({
      damping: tokens.springConfig.damping,

      stiffness: tokens.springConfig.stiffness,

      mass: tokens.springConfig.mass,

      overshootClamping: true,

      reduceMotion: ReduceMotion.System,
    }),
    [
      tokens.springConfig.damping,

      tokens.springConfig.stiffness,

      tokens.springConfig.mass,
    ],
  );

  // ─── Static token-driven styles ───────────────────────────────────────────

  const sheetGeometryStyle = useMemo<ViewStyle>(
    () => ({
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,

      borderTopWidth: borderWidth,
      borderLeftWidth: borderWidth,
      borderRightWidth: borderWidth,

      overflow: "hidden",

      /**
       * Safety invariant.
       *
       * Consumer style appears before this style in JSX and cannot bypass
       * current Safe Area / stack maximum height or surface clipping.
       */
      maxHeight: availableHeight,
    }),
    [borderRadius, borderWidth, availableHeight],
  );

  const resolvedHeightStyle = useMemo<ViewStyle | undefined>(
    () =>
      resolvedHeight === undefined
        ? undefined
        : {
            height: resolvedHeight,
          },
    [resolvedHeight],
  );

  const handleContainerStyle = useMemo<ViewStyle>(
    () => ({
      paddingTop: tokens.spacing.xs,

      paddingBottom: tokens.spacing.xxs,
    }),
    [tokens.spacing.xs, tokens.spacing.xxs],
  );

  const handleGeometryStyle = useMemo<ViewStyle>(
    () => ({
      width: tokens.sizings.modal.handleWidth,

      height: tokens.sizings.modal.handleHeight,

      borderRadius: tokens.sizings.modal.handleHeight / 2,
    }),
    [tokens.sizings.modal.handleWidth, tokens.sizings.modal.handleHeight],
  );

  const handleHitSlop = useMemo(
    () => ({
      top: tokens.spacing.xs,

      bottom: tokens.spacing.xs,

      left: 0,

      right: 0,
    }),
    [tokens.spacing.xs],
  );

  const headerStyle = useMemo<ViewStyle>(
    () => ({
      paddingLeft: tokens.spacing.m + modalLeftPadding,

      paddingRight: tokens.spacing.m + modalRightPadding,

      paddingTop: tokens.spacing.xs,

      paddingBottom: tokens.spacing.xs,

      gap: tokens.spacing.s,
    }),
    [
      tokens.spacing.m,
      tokens.spacing.xs,
      tokens.spacing.s,
      modalLeftPadding,
      modalRightPadding,
    ],
  );

  const headerTextsStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xxs,
    }),
    [tokens.spacing.xxs],
  );

  const contentStyle = useMemo<ViewStyle>(
    () => ({
      paddingLeft: tokens.spacing.m + modalLeftPadding,

      paddingRight: tokens.spacing.m + modalRightPadding,

      paddingBottom: modalBottomPadding,
    }),
    [tokens.spacing.m, modalLeftPadding, modalRightPadding, modalBottomPadding],
  );

  const titleTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.modal.title).style,
    [tokens.typography.modal.title],
  );

  const subtitleTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.modal.subtitle).style,
    [tokens.typography.modal.subtitle],
  );

  // ─── UI-thread state ──────────────────────────────────────────────────────

  const translateY = useSharedValue(screenHeight);

  const backdropProgress = useSharedValue(0);

  /**
   * Current measured sheet height.
   *
   * Gesture worklet uses it to resolve token dismissThreshold against the
   * actual sheet rather than the full screen.
   */
  const sheetHeight = useSharedValue(0);

  /**
   * Prevents onFinalize from starting a snap-back after onEnd already accepted
   * swipe dismissal.
   */
  const gestureHandled = useSharedValue(0);

  // ─── Animated theme ───────────────────────────────────────────────────────

  /**
   * Modal colors share one meaningful dependency lifecycle:
   * themeProgress.
   */
  const animatedColors = useDerivedValue(() => {
    const progress = themeProgress.value;

    return {
      background: interpolateColor(
        progress,
        [0, 1],
        [darkBackground, lightBackground],
      ),

      backdrop: interpolateColor(
        progress,
        [0, 1],
        [darkBackdrop, lightBackdrop],
      ),

      handle: interpolateColor(progress, [0, 1], [darkHandle, lightHandle]),

      border: interpolateColor(progress, [0, 1], [darkBorder, lightBorder]),

      title: interpolateColor(progress, [0, 1], [darkTitle, lightTitle]),

      subtitle: interpolateColor(
        progress,
        [0, 1],
        [darkSubtitle, lightSubtitle],
      ),
    };
  });

  // ─── Animated styles ──────────────────────────────────────────────────────

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const colors = animatedColors.value;

    return {
      backgroundColor: colors.backdrop,
      opacity: backdropProgress.value,
    };
  });

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    const colors = animatedColors.value;

    return {
      transform: [
        {
          translateY: Math.max(0, translateY.value),
        },
      ],

      backgroundColor: colors.background,
      borderColor: colors.border,
    };
  });

  const handleAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: animatedColors.value.handle,
  }));

  const titleLineHeight = tokens.typography.modal.title.lineHeight;

  const titleSizeStyle = useAnimatedStyle(() => ({
    fontSize: titleFontSize * fontScale.value,

    lineHeight:
      titleLineHeight != null ? titleLineHeight * fontScale.value : undefined,
  }));

  const titleColorStyle = useAnimatedStyle(() => ({
    color: animatedColors.value.title,
  }));

  const subtitleLineHeight = tokens.typography.modal.subtitle.lineHeight;

  const subtitleSizeStyle = useAnimatedStyle(() => ({
    fontSize: subtitleFontSize * fontScale.value,

    lineHeight:
      subtitleLineHeight != null
        ? subtitleLineHeight * fontScale.value
        : undefined,
  }));

  const subtitleColorStyle = useAnimatedStyle(() => ({
    color: animatedColors.value.subtitle,
  }));

  // ─── Animation lifecycle ──────────────────────────────────────────────────

  const cancelPendingAnimationFrame = useCallback(() => {
    if (animationFrameRef.current === null) {
      return;
    }

    cancelAnimationFrame(animationFrameRef.current);

    animationFrameRef.current = null;
  }, []);

  /**
   * Opens or reverses the currently mounted sheet.
   *
   * transitionVersion invalidates a stale close completion for the same Host
   * entry.
   */
  const animateIn = useCallback(() => {
    cancelPendingAnimationFrame();

    transitionVersionRef.current += 1;

    isClosingRef.current = false;

    cancelAnimation(translateY);
    cancelAnimation(backdropProgress);

    backdropProgress.value = withTiming(1, timingConfig);

    translateY.value = withTiming(0, timingConfig);
  }, [translateY, backdropProgress, timingConfig, cancelPendingAnimationFrame]);

  /**
   * Finalizes only the exact Host + transition pair that started this exit.
   */
  const finalizeClose = useCallback(
    (id: number, transitionVersion: number) => {
      const activeId = activeHostIdRef.current;

      /**
       * A newer Host lifecycle owns this declaration.
       *
       * The stale entry can be removed without touching the newer lifecycle.
       */
      if (activeId !== id) {
        remove(id);

        return;
      }

      /**
       * Same Host entry was reopened after this close started.
       */
      if (transitionVersionRef.current !== transitionVersion) {
        return;
      }

      activeHostIdRef.current = null;

      isClosingRef.current = false;

      remove(id);
    },
    [remove],
  );

  const runCloseAnimation = useCallback(
    (id: number) => {
      cancelPendingAnimationFrame();

      transitionVersionRef.current += 1;

      const transitionVersion = transitionVersionRef.current;

      cancelAnimation(translateY);
      cancelAnimation(backdropProgress);

      backdropProgress.value = withTiming(0, timingConfig);

      translateY.value = withTiming(screenHeight, timingConfig, (finished) => {
        "worklet";

        if (finished) {
          runOnJS(finalizeClose)(id, transitionVersion);
        }
      });
    },
    [
      translateY,
      backdropProgress,
      screenHeight,
      timingConfig,
      finalizeClose,
      cancelPendingAnimationFrame,
    ],
  );

  /**
   * Unified semantic close boundary.
   *
   * User dismissal calls onClose.
   * Controlled visible=false does not call it again.
   */
  const requestClose = useCallback(
    (reason: TModalCloseReason) => {
      const id = activeHostIdRef.current;

      if (id === null || isClosingRef.current) {
        return;
      }

      const isControlled = reason === "controlled";

      if (!isControlled && !isTopMost) {
        return;
      }

      isClosingRef.current = true;

      if (!isControlled) {
        onClose();
      }

      runCloseAnimation(id);
    },
    [isTopMost, onClose, runCloseAnimation],
  );

  /**
   * Process one UI-thread swipe dismissal signal.
   *
   * requestClose may legitimately read lifecycle refs because this code executes
   * inside an effect, not while Gesture.Pan() is being constructed during
   * render.
   */
  useEffect(() => {
    if (swipeCloseRequestVersion === processedSwipeCloseRequestRef.current) {
      return;
    }

    processedSwipeCloseRequestRef.current = swipeCloseRequestVersion;

    requestClose("swipe");
  }, [swipeCloseRequestVersion, requestClose]);

  // ─── Android Back ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isTopMost || hostId === null) {
      return;
    }

    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      requestClose("back");

      return true;
    });

    return () => {
      handler.remove();
    };
  }, [isTopMost, hostId, requestClose]);

  // ─── Interaction callbacks ────────────────────────────────────────────────

  const handleBackdropPressIn = useCallback((event: GestureResponderEvent) => {
    backdropPressY.current = event.nativeEvent.pageY;
  }, []);

  const handleBackdropPress = useCallback(
    (event: GestureResponderEvent) => {
      const movement = Math.abs(
        event.nativeEvent.pageY - backdropPressY.current,
      );

      if (movement < backdropTapMovementThreshold) {
        requestClose("backdrop");
      }
    },
    [backdropTapMovementThreshold, requestClose],
  );

  const handleClosePress = useCallback(() => {
    requestClose("close-button");
  }, [requestClose]);

  const handleAccessibilityEscape = useCallback(() => {
    requestClose("accessibility");
  }, [requestClose]);

  const handleSheetLayout = useCallback(
    (event: LayoutChangeEvent) => {
      sheetHeight.value = Math.max(0, event.nativeEvent.layout.height);
    },
    [sheetHeight],
  );

  // ─── Gesture ───────────────────────────────────────────────────────────────

  /**
   * All frame-level drag/snap behavior remains on UI thread.
   *
   * When dismissal is accepted, UI thread emits exactly one JS-side semantic
   * signal through queueSwipeClose.
   *
   * queueSwipeClose itself reads no refs, keeping Gesture construction clean for
   * React Compiler.
   */
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isTopMost)
        .activeOffsetY(panActivationOffsetY)
        .onChange((event) => {
          "worklet";

          const next = translateY.value + event.changeY;

          translateY.value = Math.max(0, next);
        })
        .onEnd((event) => {
          "worklet";

          const measuredHeight = sheetHeight.value;

          const thresholdDistance =
            dismissDistance ??
            (measuredHeight > 0 ? measuredHeight : availableHeight) *
              dismissThreshold;

          const distanceReached = translateY.value >= thresholdDistance;

          const velocityReached = event.velocityY >= resolvedDismissVelocity;

          if (distanceReached || velocityReached) {
            gestureHandled.value = 1;

            runOnJS(queueSwipeClose)();

            return;
          }

          cancelAnimation(translateY);

          translateY.value = withSpring(0, springConfig);
        })
        .onFinalize(() => {
          "worklet";

          if (gestureHandled.value === 1) {
            gestureHandled.value = 0;

            return;
          }

          if (translateY.value <= 0) {
            return;
          }

          cancelAnimation(translateY);

          translateY.value = withSpring(0, springConfig);
        }),
    [
      isTopMost,
      panActivationOffsetY,
      translateY,
      sheetHeight,
      dismissDistance,
      availableHeight,
      dismissThreshold,
      resolvedDismissVelocity,
      springConfig,
      gestureHandled,
      queueSwipeClose,
    ],
  );

  // ─── Rehosted render node ─────────────────────────────────────────────────

  const hasHeader = Boolean(title || subtitle || rightAction);

  /**
   * When ARCUI renders its visible close button, the backdrop remains
   * touch-dismissable but is removed as a duplicate screen-reader control.
   *
   * Without a default close button, the backdrop remains an accessible
   * dismissal action in addition to platform accessibility escape support.
   */
  const hasDefaultCloseAction = hasHeader && rightAction == null;

  const modalContent = useMemo(
    () => (
      <View
        testID={testID}
        style={styles.fullScreen}
        pointerEvents={isTopMost ? "box-none" : "none"}
        accessibilityElementsHidden={!isTopMost}
        importantForAccessibility={isTopMost ? "auto" : "no-hide-descendants"}
        accessibilityViewIsModal={isTopMost}
        onAccessibilityEscape={handleAccessibilityEscape}
      >
        {/* Backdrop */}
        <Animated.View
          style={[styles.backdrop, backdropAnimatedStyle]}
          testID={testID ? `${testID}-backdrop` : undefined}
        >
          <Pressable
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
            onPressIn={handleBackdropPressIn}
            onPress={handleBackdropPress}
            accessible={!hasDefaultCloseAction}
            role={hasDefaultCloseAction ? undefined : "button"}
            accessibilityRole={hasDefaultCloseAction ? undefined : "button"}
            accessibilityLabel={
              hasDefaultCloseAction ? undefined : closeAccessibilityLabel
            }
          />
        </Animated.View>

        {/* Bottom sheet positioning */}
        <View style={styles.sheetPositioner} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.sheet,

              /**
               * Consumer presentation style.
               */
              style,

              /**
               * ARCUI safety geometry intentionally wins over unsafe consumer
               * max-height/border overrides.
               */
              sheetGeometryStyle,

              resolvedHeightStyle,

              /**
               * Motion/theme ownership remains internal.
               */
              sheetAnimatedStyle,
            ]}
            testID={testID ? `${testID}-sheet` : undefined}
            onLayout={handleSheetLayout}
          >
            {/* Drag handle */}
            <GestureDetector gesture={panGesture}>
              <View
                style={[styles.handleContainer, handleContainerStyle]}
                hitSlop={handleHitSlop}
                testID={testID ? `${testID}-handle` : undefined}
              >
                <Animated.View
                  style={[handleGeometryStyle, handleAnimatedStyle]}
                />
              </View>
            </GestureDetector>

            {/* Header */}
            {hasHeader && (
              <View
                style={[styles.header, headerStyle]}
                testID={testID ? `${testID}-header` : undefined}
              >
                <View style={[styles.headerTexts, headerTextsStyle]}>
                  {title ? (
                    <Animated.Text
                      allowFontScaling={false}
                      maxFontSizeMultiplier={
                        tokens.typography.maxFontSizeMultiplier
                      }
                      style={[
                        titleTypographyStyle,
                        titleSizeStyle,
                        titleColorStyle,
                      ]}
                      accessibilityRole="header"
                      numberOfLines={titleNumberOfLines}
                      testID={testID ? `${testID}-title` : undefined}
                    >
                      {title}
                    </Animated.Text>
                  ) : null}

                  {subtitle ? (
                    <Animated.Text
                      allowFontScaling={false}
                      maxFontSizeMultiplier={
                        tokens.typography.maxFontSizeMultiplier
                      }
                      style={[
                        subtitleTypographyStyle,
                        subtitleSizeStyle,
                        subtitleColorStyle,
                      ]}
                      numberOfLines={subtitleNumberOfLines}
                      testID={testID ? `${testID}-subtitle` : undefined}
                    >
                      {subtitle}
                    </Animated.Text>
                  ) : null}
                </View>

                {rightAction ?? (
                  <Pressable
                    onPress={handleClosePress}
                    role="button"
                    accessibilityRole="button"
                    accessibilityLabel={closeAccessibilityLabel}
                    testID={testID ? `${testID}-close` : undefined}
                    hitSlop={closeHitSlop}
                  >
                    <Icon
                      type="xCircle"
                      size={iconSize}
                      lightColor={lightIcon}
                      darkColor={darkIcon}
                    />
                  </Pressable>
                )}
              </View>
            )}

            {/* Content */}
            {scrollable ? (
              <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.scrollContent}
                contentContainerStyle={contentStyle}
                testID={testID ? `${testID}-scroll` : undefined}
              >
                {children}
              </ScrollView>
            ) : (
              <View
                style={contentStyle}
                testID={testID ? `${testID}-content` : undefined}
              >
                {children}
              </View>
            )}
          </Animated.View>
        </View>
      </View>
    ),
    [
      testID,
      isTopMost,
      handleAccessibilityEscape,
      backdropAnimatedStyle,
      handleBackdropPressIn,
      handleBackdropPress,
      hasDefaultCloseAction,
      closeAccessibilityLabel,
      style,
      sheetGeometryStyle,
      resolvedHeightStyle,
      sheetAnimatedStyle,
      handleSheetLayout,
      panGesture,
      handleContainerStyle,
      handleHitSlop,
      handleGeometryStyle,
      handleAnimatedStyle,
      hasHeader,
      headerStyle,
      headerTextsStyle,
      title,
      tokens.typography.maxFontSizeMultiplier,
      titleTypographyStyle,
      titleSizeStyle,
      titleColorStyle,
      titleNumberOfLines,
      subtitle,
      subtitleTypographyStyle,
      subtitleSizeStyle,
      subtitleColorStyle,
      subtitleNumberOfLines,
      rightAction,
      handleClosePress,
      closeHitSlop,
      iconSize,
      lightIcon,
      darkIcon,
      scrollable,
      contentStyle,
      children,
    ],
  );

  // ─── Controlled visibility lifecycle ──────────────────────────────────────

  /**
   * OPEN
   *
   * - create one Host entry
   * - initialize motion off-screen
   * - animate into place on next frame
   *
   * CLOSE
   *
   * - keep Host entry mounted
   * - animate out
   * - remove only when that exact transition completes
   *
   * REOPEN DURING CLOSE
   *
   * - keep the same Host entry
   * - invalidate old completion
   * - cancel close motion
   * - animate back in
   */
  useEffect(() => {
    const activeId = activeHostIdRef.current;

    if (visible) {
      if (activeId === null) {
        cancelPendingAnimationFrame();

        transitionVersionRef.current += 1;

        isClosingRef.current = false;

        cancelAnimation(translateY);

        cancelAnimation(backdropProgress);

        translateY.value = screenHeight;

        backdropProgress.value = 0;

        const id = mount(owner, modalContent);

        activeHostIdRef.current = id;

        animationFrameRef.current = requestAnimationFrame(() => {
          animationFrameRef.current = null;

          if (activeHostIdRef.current !== id || isClosingRef.current) {
            return;
          }

          animateIn();
        });

        return;
      }

      /**
       * visible changed back to true while exit was still running.
       */
      if (isClosingRef.current) {
        animateIn();
      }

      return;
    }

    /**
     * Parent-controlled close.
     *
     * Parent already owns the visible transition, so onClose is not called.
     */
    if (activeId !== null && !isClosingRef.current) {
      requestClose("controlled");
    }
  }, [
    visible,
    screenHeight,
    owner,
    mount,
    modalContent,
    animateIn,
    requestClose,
    translateY,
    backdropProgress,
    cancelPendingAnimationFrame,
  ]);

  /**
   * Keep mounted Host content synchronized with current React props while
   * preserving the semantic stack position.
   */
  useEffect(() => {
    const id = activeHostIdRef.current;

    if (id === null) {
      return;
    }

    update(id, modalContent);
  }, [modalContent, update]);

  /**
   * Rotation / resize during an active exit.
   *
   * Restart the exit target against the new physical window height. The
   * transition version automatically invalidates the old completion.
   */
  useEffect(() => {
    const id = activeHostIdRef.current;

    if (id === null || !isClosingRef.current) {
      return;
    }

    runCloseAnimation(id);
  }, [screenHeight, runCloseAnimation]);

  /**
   * Declaration unmount cleanup.
   *
   * Prevents orphaned Host entries and invalidates queued close completions.
   */
  useEffect(() => {
    return () => {
      cancelPendingAnimationFrame();

      transitionVersionRef.current += 1;

      cancelAnimation(translateY);

      cancelAnimation(backdropProgress);

      const id = activeHostIdRef.current;

      activeHostIdRef.current = null;

      isClosingRef.current = false;

      if (id !== null) {
        remove(id);
      }
    };
  }, [remove, translateY, backdropProgress, cancelPendingAnimationFrame]);

  /**
   * Modal declaration owns no local visual tree.
   *
   * ModalProvider renders this node in ARCUI's root Modal Host.
   */
  return null;
};

export const Modal = memo(ModalComponent);

Modal.displayName = "Modal";

const styles = StyleSheet.create({
  fullScreen: {
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

  sheetPositioner: {
    flex: 1,

    justifyContent: "flex-end",
  },

  sheet: {
    width: "100%",
  },

  handleContainer: {
    alignItems: "center",
  },

  header: {
    flexDirection: "row",

    alignItems: "center",
  },

  headerTexts: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 0,
  },
});
