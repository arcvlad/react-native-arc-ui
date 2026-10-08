import {
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import type { TAnimationDirection } from "../../tokens/Animations";
import { resolveNonNegativeMetric } from "../../utils/numberUtils";
import { platformElevation } from "../../utils/platformUtils";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { resolveSafeArea } from "../../utils/resolveSafeArea";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { useDialogContext } from "./DialogContext";
import type { TDialogAction, TDialogActionType } from "./types";

type TLoadingAction = {
  dialogId: number;
  actionIndex: number;
};

const resolveCustomIcon = (value: unknown) => {
  if (value == null) {
    return null;
  }

  if (isValidElement(value)) {
    return value;
  }

  if (__DEV__) {
    console.error(
      "[react-native-arc-ui] Dialog customIcon must be a valid React element. Falling back to no custom icon.",
    );
  }

  return null;
};

const resolveDialogDirection = (
  value: string | undefined,
  fallback: TAnimationDirection,
  tokenName: "entering" | "exiting",
): TAnimationDirection => {
  switch (value) {
    case "center":
    case "top":
    case "bottom":
    case "left":
    case "right":
      return value;

    case undefined:
      return fallback;

    default:
      if (__DEV__) {
        console.error(
          `[react-native-arc-ui] Dialog ${tokenName} animation direction "${String(
            value,
          )}" is invalid. Falling back to "${fallback}".`,
        );
      }

      return fallback;
  }
};

const getTranslateOffset = (
  direction: TAnimationDirection,
  distance: number,
): { x: number; y: number } => {
  switch (direction) {
    case "top":
      return {
        x: 0,
        y: -distance,
      };

    case "bottom":
      return {
        x: 0,
        y: distance,
      };

    case "left":
      return {
        x: -distance,
        y: 0,
      };

    case "right":
      return {
        x: distance,
        y: 0,
      };

    case "center":
      return {
        x: 0,
        y: 0,
      };
  }
};

const resolveDefaultActionType = (index: number): TDialogActionType => {
  if (index === 0) {
    return "solid";
  }

  if (index === 1) {
    return "border";
  }

  return "transparent";
};

const resolveActionType = (
  action: TDialogAction,
  index: number,
): TDialogActionType => {
  const value: string | undefined = action.type;

  switch (value) {
    case "solid":
    case "border":
    case "transparent":
      return value;

    case undefined:
      return resolveDefaultActionType(index);

    default: {
      const fallback = resolveDefaultActionType(index);

      if (__DEV__) {
        console.error(
          `[react-native-arc-ui] Dialog action type "${String(
            value,
          )}" is invalid. Falling back to "${fallback}".`,
        );
      }

      return fallback;
    }
  }
};

const isPromiseLike = (value: unknown): value is PromiseLike<void> => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value !== "object" && typeof value !== "function") {
    return false;
  }

  return "then" in value && typeof value.then === "function";
};

const DialogComponent = () => {
  const { activeDialog, requestClose, completeClose } = useDialogContext();

  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale, safeAreaInsets } = useARCUISystem();

  const prefersReducedMotion = useReducedMotion();

  const [loadingAction, setLoadingAction] = useState<TLoadingAction | null>(
    null,
  );

  /**
   * Synchronous ownership lock for async Dialog actions.
   *
   * React state drives rendering, while this ref prevents a second press from
   * entering before the loading-state update has committed.
   */
  const loadingActionRef = useRef<TLoadingAction | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  const backdropProgress = useSharedValue(0);

  const contentOpacity = useSharedValue(0);

  const contentTranslateX = useSharedValue(0);

  const contentTranslateY = useSharedValue(0);

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.dialogAnimations, tokens.animations),
    [tokens.dialogAnimations, tokens.animations],
  );

  const enteringDirection = resolveDialogDirection(
    tokens.dialogAnimations.entering,
    "center",
    "entering",
  );

  const exitingDirection = resolveDialogDirection(
    tokens.dialogAnimations.exiting,
    enteringDirection,
    "exiting",
  );

  const animationDistance = resolveNonNegativeMetric(
    tokens.dialogAnimations.distance,
    0,
  );

  /**
   * Directional movement is removed under Reduced Motion while the
   * enter/exit opacity transition remains available.
   */
  const enterOffset = useMemo(
    () =>
      getTranslateOffset(
        enteringDirection,
        prefersReducedMotion ? 0 : animationDistance,
      ),
    [enteringDirection, animationDistance, prefersReducedMotion],
  );

  const exitOffset = useMemo(
    () =>
      getTranslateOffset(
        exitingDirection,
        prefersReducedMotion ? 0 : animationDistance,
      ),
    [exitingDirection, animationDistance, prefersReducedMotion],
  );

  const safeTop = resolveSafeArea(
    safeAreaInsets.top,
    tokens.safeArea.dialog.top,
  );

  const safeRight = resolveSafeArea(
    safeAreaInsets.right,
    tokens.safeArea.dialog.right,
  );

  const safeBottom = resolveSafeArea(
    safeAreaInsets.bottom,
    tokens.safeArea.dialog.bottom,
  );

  const safeLeft = resolveSafeArea(
    safeAreaInsets.left,
    tokens.safeArea.dialog.left,
  );

  // ─── Semantic theme colors ────────────────────────────────────────────────

  const lightBackdrop = tokens.colors.light.dialog.backdrop;

  const darkBackdrop = tokens.colors.dark.dialog.backdrop;

  const lightBackground = tokens.colors.light.dialog.background;

  const darkBackground = tokens.colors.dark.dialog.background;

  const lightTitle = tokens.colors.light.dialog.title;

  const darkTitle = tokens.colors.dark.dialog.title;

  const lightMessage = tokens.colors.light.dialog.message;

  const darkMessage = tokens.colors.dark.dialog.message;

  const lightIcon = tokens.colors.light.dialog.icon;

  const darkIcon = tokens.colors.dark.dialog.icon;

  const themeColors = useDerivedValue(() => ({
    backdrop: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBackdrop, lightBackdrop],
    ),

    background: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBackground, lightBackground],
    ),

    title: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkTitle, lightTitle],
    ),

    message: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkMessage, lightMessage],
    ),
  }));

  // ─── Typography ───────────────────────────────────────────────────────────

  const titleTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.dialog.title).style,
    [tokens.typography.dialog.title],
  );

  const messageTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.dialog.message).style,
    [tokens.typography.dialog.message],
  );

  const titleLineHeight = tokens.typography.dialog.title.lineHeight;

  const messageLineHeight = tokens.typography.dialog.message.lineHeight;

  // ─── Layout tokens ────────────────────────────────────────────────────────

  const positionerStyle = useMemo(
    () => ({
      paddingTop: safeTop,
      paddingRight: safeRight + tokens.sizings.dialog.horizontalInset,
      paddingBottom: safeBottom,
      paddingLeft: safeLeft + tokens.sizings.dialog.horizontalInset,
    }),
    [
      safeTop,
      safeRight,
      safeBottom,
      safeLeft,
      tokens.sizings.dialog.horizontalInset,
    ],
  );

  const surfaceStyle = useMemo(
    () => ({
      maxWidth: tokens.sizings.dialog.maxWidth,

      borderRadius: tokens.radius.dialog,
    }),
    [tokens.sizings.dialog.maxWidth, tokens.radius.dialog],
  );

  const contentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: tokens.sizings.dialog.paddingHorizontal,

      paddingVertical: tokens.sizings.dialog.paddingVertical,

      gap: tokens.sizings.dialog.contentGap,
    }),
    [
      tokens.sizings.dialog.paddingHorizontal,
      tokens.sizings.dialog.paddingVertical,
      tokens.sizings.dialog.contentGap,
    ],
  );

  const mainContentStyle = useMemo(
    () => ({
      gap: tokens.sizings.dialog.mainContentGap,
    }),
    [tokens.sizings.dialog.mainContentGap],
  );

  const actionsStyle = useMemo(
    () => ({
      gap: tokens.sizings.dialog.actionsGap,
    }),
    [tokens.sizings.dialog.actionsGap],
  );

  // ─── Animated styles ──────────────────────────────────────────────────────

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropProgress.value,

    backgroundColor: themeColors.value.backdrop,
  }));

  const animatedSurfaceStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,

    transform: [
      {
        translateX: contentTranslateX.value,
      },
      {
        translateY: contentTranslateY.value,
      },
    ],

    backgroundColor: themeColors.value.background,
  }));

  const titleFontSize = tokens.typography.dialog.title.fontSize;

  const animatedTitleSizeStyle = useAnimatedStyle(() => ({
    fontSize: titleFontSize * fontScale.value,

    lineHeight:
      titleLineHeight != null ? titleLineHeight * fontScale.value : undefined,
  }));

  const animatedTitleColorStyle = useAnimatedStyle(() => ({
    color: themeColors.value.title,
  }));

  const messageFontSize = tokens.typography.dialog.message.fontSize;

  const animatedMessageSizeStyle = useAnimatedStyle(() => ({
    fontSize: messageFontSize * fontScale.value,

    lineHeight:
      messageLineHeight != null
        ? messageLineHeight * fontScale.value
        : undefined,
  }));

  const animatedMessageColorStyle = useAnimatedStyle(() => ({
    color: themeColors.value.message,
  }));

  // ─── Animation lifecycle ──────────────────────────────────────────────────

  const cancelPendingAnimationFrame = useCallback(() => {
    if (animationFrameRef.current === null) {
      return;
    }

    cancelAnimationFrame(animationFrameRef.current);

    animationFrameRef.current = null;
  }, []);

  const cancelDialogAnimations = useCallback(() => {
    cancelAnimation(backdropProgress);

    cancelAnimation(contentOpacity);

    cancelAnimation(contentTranslateX);

    cancelAnimation(contentTranslateY);
  }, [backdropProgress, contentOpacity, contentTranslateX, contentTranslateY]);

  const animateIn = useCallback(() => {
    cancelDialogAnimations();

    backdropProgress.value = withTiming(1, animationConfig);

    contentOpacity.value = withTiming(1, animationConfig);

    contentTranslateX.value = withTiming(0, animationConfig);

    contentTranslateY.value = withTiming(0, animationConfig);
  }, [
    cancelDialogAnimations,
    backdropProgress,
    contentOpacity,
    contentTranslateX,
    contentTranslateY,
    animationConfig,
  ]);

  const animateOut = useCallback(
    (dialogId: number) => {
      cancelDialogAnimations();

      backdropProgress.value = withTiming(0, animationConfig);

      contentTranslateX.value = withTiming(exitOffset.x, animationConfig);

      contentTranslateY.value = withTiming(exitOffset.y, animationConfig);

      /**
       * Content opacity is the lifecycle completion owner.
       *
       * Unlike translateX/translateY it always has a meaningful 1 -> 0
       * transition regardless of the configured exit direction.
       */
      contentOpacity.value = withTiming(0, animationConfig, (finished) => {
        if (finished) {
          runOnJS(completeClose)(dialogId);
        }
      });
    },
    [
      cancelDialogAnimations,
      backdropProgress,
      contentOpacity,
      contentTranslateX,
      contentTranslateY,
      exitOffset.x,
      exitOffset.y,
      animationConfig,
      completeClose,
    ],
  );

  /**
   * The Provider owns open/close intent.
   *
   * Dialog only translates that lifecycle state into UI-thread motion.
   */
  useEffect(() => {
    if (!activeDialog) {
      cancelPendingAnimationFrame();

      cancelDialogAnimations();

      backdropProgress.value = 0;
      contentOpacity.value = 0;

      return;
    }

    cancelPendingAnimationFrame();

    if (activeDialog.isOpen) {
      cancelDialogAnimations();

      backdropProgress.value = 0;
      contentOpacity.value = 0;

      contentTranslateX.value = enterOffset.x;

      contentTranslateY.value = enterOffset.y;

      /**
       * Wait until the initial hidden frame has been committed before
       * starting the enter transition.
       */
      animationFrameRef.current = requestAnimationFrame(() => {
        animationFrameRef.current = null;

        animateIn();
      });

      return () => {
        cancelPendingAnimationFrame();
      };
    }

    animateOut(activeDialog.id);
  }, [
    activeDialog,
    enterOffset.x,
    enterOffset.y,
    animateIn,
    animateOut,
    cancelPendingAnimationFrame,
    cancelDialogAnimations,
    backdropProgress,
    contentOpacity,
    contentTranslateX,
    contentTranslateY,
  ]);

  useEffect(() => {
    return () => {
      cancelPendingAnimationFrame();
      cancelDialogAnimations();
    };
  }, [cancelPendingAnimationFrame, cancelDialogAnimations]);

  // ─── Dismissal ─────────────────────────────────────────────────────────────

  const dismissible = activeDialog?.dialog.dismissible ?? false;

  const handlePassiveDismiss = useCallback(() => {
    if (!activeDialog || !activeDialog.isOpen || !dismissible) {
      return;
    }

    requestClose(activeDialog.id);
  }, [activeDialog, dismissible, requestClose]);

  /**
   * Android Back is always consumed while Dialog owns the screen.
   *
   * A non-dismissible Dialog must not accidentally navigate the
   * application underneath it.
   */
  useEffect(() => {
    if (!activeDialog) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (activeDialog.isOpen && dismissible) {
          requestClose(activeDialog.id);
        }

        return true;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [activeDialog, dismissible, requestClose]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleActionPress = useCallback(
    async (action: TDialogAction, actionIndex: number) => {
      if (!activeDialog || !activeDialog.isOpen || action.disabled) {
        return;
      }

      const dialogId = activeDialog.id;

      /**
       * Ignore additional actions while another action from this Dialog
       * is already awaiting an async result.
       *
       * The ref is intentionally authoritative here because React state may
       * not have committed yet when a second rapid press arrives.
       */
      if (loadingActionRef.current?.dialogId === dialogId) {
        return;
      }

      let result: void | Promise<void>;

      try {
        result = action.onPress?.();

        if (isPromiseLike(result)) {
          const nextLoadingAction = {
            dialogId,
            actionIndex,
          };

          loadingActionRef.current = nextLoadingAction;
          setLoadingAction(nextLoadingAction);

          await result;
        }

        if (action.autoDismiss ?? true) {
          requestClose(dialogId);
        }
      } catch (error) {
        /**
         * A failed action must not be interpreted as a successful dismissal.
         *
         * Keep the Dialog open, stop loading in finally, and surface the
         * failure through the development/runtime console.
         */
        console.error("[react-native-arc-ui] Dialog action failed:", error);
      } finally {
        const currentLoadingAction = loadingActionRef.current;

        if (
          currentLoadingAction?.dialogId === dialogId &&
          currentLoadingAction.actionIndex === actionIndex
        ) {
          loadingActionRef.current = null;
        }

        setLoadingAction((current) => {
          if (
            current?.dialogId !== dialogId ||
            current.actionIndex !== actionIndex
          ) {
            return current;
          }

          return null;
        });
      }
    },
    [activeDialog, requestClose],
  );

  if (!activeDialog) {
    return null;
  }

  const { id: dialogId, dialog, isOpen } = activeDialog;

  const actions = dialog.actions ?? [];

  const activeLoadingActionIndex =
    loadingAction?.dialogId === dialogId ? loadingAction.actionIndex : null;

  const testIDPrefix = dialog.testID ?? "Dialog";

  const resolvedCustomIcon = resolveCustomIcon(dialog.customIcon);

  const hasIcon = dialog.icon !== undefined || resolvedCustomIcon !== null;

  return (
    <>
      <Animated.View
        style={[
          styles.backdrop,
          {
            zIndex: tokens.zIndex.dialogBackdrop,
          },
          platformElevation(tokens.zIndex.dialogBackdrop),
          animatedBackdropStyle,
        ]}
      >
        <Pressable
          style={styles.backdropPressable}
          accessible={false}
          onPress={dismissible && isOpen ? handlePassiveDismiss : undefined}
          testID={`${testIDPrefix}-dialog-backdrop`}
        />
      </Animated.View>

      <View
        style={[
          styles.positioner,
          positionerStyle,
          {
            zIndex: tokens.zIndex.dialog,
          },
          platformElevation(tokens.zIndex.dialog),
        ]}
        pointerEvents="box-none"
        accessibilityViewIsModal
        onAccessibilityEscape={handlePassiveDismiss}
        testID={`${testIDPrefix}-dialog`}
      >
        <Animated.View
          style={[styles.surface, surfaceStyle, animatedSurfaceStyle]}
        >
          <ScrollView
            contentContainerStyle={[
              styles.contentContainer,
              contentContainerStyle,
            ]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={[styles.mainContent, mainContentStyle]}>
              {hasIcon && (
                <View
                  style={styles.iconContainer}
                  testID={`${testIDPrefix}-dialog-icon`}
                >
                  {resolvedCustomIcon ??
                    (dialog.icon ? (
                      <Icon
                        type={dialog.icon}
                        size={tokens.sizings.dialog.iconSize}
                        darkColor={darkIcon}
                        lightColor={lightIcon}
                      />
                    ) : null)}
                </View>
              )}

              {dialog.title && (
                <Animated.Text
                  allowFontScaling={false}
                  maxFontSizeMultiplier={
                    tokens.typography.maxFontSizeMultiplier
                  }
                  accessibilityRole="header"
                  style={[
                    styles.title,
                    titleTypographyStyle,
                    animatedTitleSizeStyle,
                    animatedTitleColorStyle,
                  ]}
                  testID={`${testIDPrefix}-dialog-title-text`}
                >
                  {dialog.title}
                </Animated.Text>
              )}

              {dialog.message && (
                <Animated.Text
                  allowFontScaling={false}
                  maxFontSizeMultiplier={
                    tokens.typography.maxFontSizeMultiplier
                  }
                  style={[
                    styles.message,
                    messageTypographyStyle,
                    animatedMessageSizeStyle,
                    animatedMessageColorStyle,
                  ]}
                  testID={`${testIDPrefix}-dialog-content-text`}
                >
                  {dialog.message}
                </Animated.Text>
              )}
            </View>

            {actions.length > 0 && (
              <View style={actionsStyle}>
                {actions.map((action, actionIndex) => {
                  const isLoading = activeLoadingActionIndex === actionIndex;

                  const isAnotherActionLoading =
                    activeLoadingActionIndex !== null && !isLoading;

                  return (
                    <Button
                      key={`${dialogId}-${actionIndex}`}
                      type={resolveActionType(action, actionIndex)}
                      loading={isLoading}
                      disabled={
                        !isOpen || action.disabled || isAnotherActionLoading
                      }
                      onPress={() => {
                        void handleActionPress(action, actionIndex);
                      }}
                      testID={
                        action.testID ??
                        `${testIDPrefix}-dialog-action-${actionIndex}`
                      }
                    >
                      {action.label}
                    </Button>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </>
  );
};

export const Dialog = memo(DialogComponent);

Dialog.displayName = "Dialog";

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  backdropPressable: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  positioner: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    justifyContent: "center",
    alignItems: "center",
  },

  surface: {
    width: "100%",
    maxHeight: "100%",
    overflow: "hidden",
  },

  contentContainer: {
    flexGrow: 0,
  },

  mainContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    textAlign: "center",
  },

  message: {
    textAlign: "center",
  },
});
