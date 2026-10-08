import { memo, useCallback, useEffect, useMemo } from "react";
import {
  I18nManager,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUIStrings,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { resolveSafeArea } from "../../utils/resolveSafeArea";
import { resolveTextContent } from "../../utils/reactNode";
import { Icon } from "../Icon/Icon";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { IHeader, IHeaderControl } from "./types";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { resolveNonNegativeMetric } from "../../utils/numberUtils";

/**
 * Internal icon-only Header control.
 *
 * Header owns the control geometry and semantic interaction states so
 * back/actions remain consistent without depending on Button internals.
 */
const HeaderControlComponent = ({
  icon,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  mirrorInRTL = false,
  radius,
  animation,
  testID,
}: IHeaderControl) => {
  const { tokens } = useARCUITheme();
  const { themeProgress } = useARCUIAnimatedTheme();

  const prefersReducedMotion = useReducedMotion();

  const pressProgress = useSharedValue(0);

  const scale = useSharedValue(1);

  const disabledProgress = useSharedValue(disabled ? 1 : 0);

  const controlSize = resolveNonNegativeMetric(
    tokens.sizings.header.controlSize,
    0,
  );

  const stateAnimationConfig = useMemo(
    () => resolveAnimation(tokens.headerAnimations, tokens.animations),
    [tokens.headerAnimations, tokens.animations],
  );

  const pressAnimationConfig = useMemo(
    () => ({
      duration: tokens.pressAnimation.duration,
    }),
    [tokens.pressAnimation.duration],
  );

  /**
   * Spatial press feedback is replaced by semantic highlight feedback
   * when the user prefers reduced motion.
   */
  const resolvedAnimation =
    prefersReducedMotion &&
    (animation === "scaleUp" || animation === "scaleDown")
      ? "highlight"
      : animation;

  const lightBackgroundDefault =
    tokens.colors.light.header.control.background.default;

  const darkBackgroundDefault =
    tokens.colors.dark.header.control.background.default;

  const lightBackgroundPressed =
    tokens.colors.light.header.control.background.pressed;

  const darkBackgroundPressed =
    tokens.colors.dark.header.control.background.pressed;

  const lightIconPrimary = tokens.colors.light.header.control.icon.primary;

  const lightIconDisabled = tokens.colors.light.header.control.icon.disabled;

  const darkIconPrimary = tokens.colors.dark.header.control.icon.primary;

  const darkIconDisabled = tokens.colors.dark.header.control.icon.disabled;

  const controlLayoutStyle = useMemo<ViewStyle>(
    () => ({
      width: controlSize,
      height: controlSize,
      borderRadius: radius,
    }),
    [controlSize, radius],
  );

  const handlePressIn = useCallback(() => {
    if (disabled || resolvedAnimation === "none") {
      return;
    }

    cancelAnimation(pressProgress);

    cancelAnimation(scale);

    if (resolvedAnimation === "highlight") {
      pressProgress.value = withTiming(1, pressAnimationConfig);

      return;
    }

    if (resolvedAnimation === "scaleUp") {
      scale.value = withTiming(
        tokens.pressAnimation.scaleUpValue,
        pressAnimationConfig,
      );

      return;
    }

    if (resolvedAnimation === "scaleDown") {
      scale.value = withTiming(
        tokens.pressAnimation.scaleDownValue,
        pressAnimationConfig,
      );
    }
  }, [
    disabled,
    resolvedAnimation,
    pressProgress,
    scale,
    pressAnimationConfig,
    tokens.pressAnimation.scaleUpValue,
    tokens.pressAnimation.scaleDownValue,
  ]);

  const handlePressOut = useCallback(() => {
    cancelAnimation(pressProgress);

    cancelAnimation(scale);

    if (resolvedAnimation === "none") {
      pressProgress.value = 0;
      scale.value = 1;

      return;
    }

    pressProgress.value = withTiming(0, pressAnimationConfig);

    scale.value = withTiming(1, pressAnimationConfig);
  }, [resolvedAnimation, pressProgress, scale, pressAnimationConfig]);

  /**
   * A control can become disabled while pressed.
   *
   * Clear both independent press dimensions so neither highlight nor
   * scale can remain visually stuck.
   */
  useEffect(() => {
    if (!disabled) {
      return;
    }

    cancelAnimation(pressProgress);

    cancelAnimation(scale);

    pressProgress.value = 0;
    scale.value = 1;
  }, [disabled, pressProgress, scale]);

  const animatedIconColor = useDerivedValue<string>(() => {
    const resolvedDarkIcon = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkIconPrimary, darkIconDisabled],
    );

    const resolvedLightIcon = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightIconPrimary, lightIconDisabled],
    );

    return interpolateColor(
      themeProgress.value,
      [0, 1],
      [resolvedDarkIcon, resolvedLightIcon],
    );
  });

  const animatedControlStyle = useAnimatedStyle(() => {
    const backgroundDefault = interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBackgroundDefault, lightBackgroundDefault],
    );

    const backgroundPressed = interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBackgroundPressed, lightBackgroundPressed],
    );

    return {
      backgroundColor: interpolateColor(
        pressProgress.value,
        [0, 1],
        [backgroundDefault, backgroundPressed],
      ),

      transform: [
        {
          scale: scale.value,
        },
      ],
    };
  });

  useEffect(() => {
    cancelAnimation(disabledProgress);

    const target = disabled ? 1 : 0;

    if (prefersReducedMotion) {
      disabledProgress.value = target;
      return;
    }

    disabledProgress.value = withTiming(target, stateAnimationConfig);
  }, [disabled, prefersReducedMotion, disabledProgress, stateAnimationConfig]);

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      role="button"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      aria-disabled={disabled}
      accessibilityState={{
        disabled,
      }}
    >
      <Animated.View
        style={[styles.control, controlLayoutStyle, animatedControlStyle]}
      >
        <View
          pointerEvents="none"
          accessible={false}
          style={
            mirrorInRTL && I18nManager.isRTL ? styles.mirroredIcon : undefined
          }
        >
          <Icon
            type={icon}
            size={tokens.sizings.icon.m}
            animatedColor={animatedIconColor}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
};

const HeaderControl = memo(HeaderControlComponent);

HeaderControl.displayName = "HeaderControl";

const HeaderComponent = ({
  ref,
  title,
  titleAlign = "start",
  minHeight,
  titleNumberOfLines,
  centerSideMinWidth,
  showBack,
  onBack,
  backAccessibilityLabel,
  backAccessibilityHint,
  actions,
  endContent,
  showBorder = true,
  controlRadius,
  controlAnimation,
  style,
  ...viewProps
}: IHeader) => {
  const { tokens, onBack: globalOnBack } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale, safeAreaInsets } = useARCUISystem();

  const strings = useARCUIStrings();

  // ─── Resolution ──────────────────────────────────

  const resolvedOnBack = onBack ?? globalOnBack;

  const resolvedShowBack = showBack ?? resolvedOnBack != null;

  const resolvedMinHeight = resolveNonNegativeMetric(
    minHeight,
    tokens.sizings.header.minHeight,
  );

  const controlSize = resolveNonNegativeMetric(
    tokens.sizings.header.controlSize,
    0,
  );

  const requestedControlRadius = resolveNonNegativeMetric(
    controlRadius,
    tokens.radius.headerControl,
  );

  const resolvedControlRadius = Math.min(
    controlSize / 2,
    requestedControlRadius,
  );

  const resolvedControlAnimation =
    controlAnimation ?? tokens.pressAnimation.type;

  const resolvedTitleNumberOfLines = resolveNonNegativeMetric(
    titleNumberOfLines,
    tokens.sizings.header.numberOfLines,
  );

  const resolvedCenterSideMinWidth = resolveNonNegativeMetric(
    centerSideMinWidth,
    0,
  );

  const actionGap = tokens.spacing.xxs;

  const contentPaddingHorizontal = tokens.spacing.xs;

  const titleStartPadding = tokens.spacing.xs;

  const titleCenterPadding = tokens.spacing.xxs;

  // ─── Safe area ───────────────────────────────────

  const safeTop = resolveSafeArea(
    safeAreaInsets.top,
    tokens.safeArea.header.top,
  );

  const safeRight = resolveSafeArea(
    safeAreaInsets.right,
    tokens.safeArea.header.right,
  );

  const safeBottom = resolveSafeArea(
    safeAreaInsets.bottom,
    tokens.safeArea.header.bottom,
  );

  const safeLeft = resolveSafeArea(
    safeAreaInsets.left,
    tokens.safeArea.header.left,
  );

  // ─── Theme colors ────────────────────────────────

  const lightBackground = tokens.colors.light.header.background;

  const darkBackground = tokens.colors.dark.header.background;

  const lightTitle = tokens.colors.light.header.title;

  const darkTitle = tokens.colors.dark.header.title;

  const lightBorder = tokens.colors.light.header.border;

  const darkBorder = tokens.colors.dark.header.border;

  // ─── Typography ──────────────────────────────────

  /**
   * fontSize is intentionally excluded here because ARCUI font scaling
   * is applied through animatedTitleStyle on the UI thread.
   *
   * Layout properties such as flexShrink also do not belong to the
   * typography token.
   */
  const titleTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.header.title).style,
    [tokens.typography.header.title],
  );

  // ─── Layout ──────────────────────────────────────

  const safeAreaStyle = useMemo<ViewStyle>(
    () => ({
      paddingTop: safeTop,
      paddingRight: safeRight,
      paddingBottom: safeBottom,
      paddingLeft: safeLeft,
    }),
    [safeTop, safeRight, safeBottom, safeLeft],
  );

  const contentStyle = useMemo<ViewStyle>(
    () => ({
      minHeight: resolvedMinHeight,

      paddingHorizontal: contentPaddingHorizontal,
    }),
    [resolvedMinHeight, contentPaddingHorizontal],
  );

  const startTitleContainerStyle = useMemo<ViewStyle>(
    () => ({
      paddingHorizontal: titleStartPadding,
    }),
    [titleStartPadding],
  );

  const centerTitleContainerStyle = useMemo<ViewStyle>(
    () => ({
      paddingHorizontal: titleCenterPadding,
    }),
    [titleCenterPadding],
  );

  const actionsStyle = useMemo<ViewStyle>(
    () => ({
      gap: actionGap,
    }),
    [actionGap],
  );

  /**
   * Built-in controls have deterministic geometry, so centered Header
   * layout does not require onLayout or React measurement state.
   */
  const builtInStartWidth =
    resolvedShowBack && resolvedOnBack != null ? controlSize : 0;

  const actionCount = actions?.length ?? 0;

  const builtInEndWidth =
    actionCount > 0
      ? actionCount * controlSize + Math.max(0, actionCount - 1) * actionGap
      : 0;

  /**
   * Both centered side containers receive exactly the same width.
   *
   * centerSideMinWidth is mainly an escape hatch for arbitrary
   * endContent whose intrinsic width cannot be known without measuring.
   */
  const resolvedCenterSideWidth = Math.max(
    resolvedCenterSideMinWidth,
    builtInStartWidth,
    builtInEndWidth,
  );

  const centerSideStyle = useMemo<ViewStyle>(
    () => ({
      width: resolvedCenterSideWidth,
    }),
    [resolvedCenterSideWidth],
  );

  const containerBorderStyle = useMemo<ViewStyle>(
    () => ({
      borderBottomWidth: showBorder ? tokens.border.header : 0,
    }),
    [showBorder, tokens.border.header],
  );

  // ─── Animated styles ─────────────────────────────

  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBackground, lightBackground],
    ),

    borderBottomColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkBorder, lightBorder],
    ),
  }));

  const titleFontSize = tokens.typography.header.title.fontSize;
  const titleLineHeight = tokens.typography.header.title.lineHeight;

  const animatedTitleSizeStyle = useAnimatedStyle(() => ({
    fontSize: titleFontSize * fontScale.value,

    lineHeight:
      titleLineHeight != null ? titleLineHeight * fontScale.value : undefined,
  }));

  const animatedTitleColorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkTitle, lightTitle],
    ),
  }));

  // ─── Built-in controls ───────────────────────────

  const backButton =
    resolvedShowBack && resolvedOnBack != null ? (
      <HeaderControl
        icon="chevronLeft"
        onPress={resolvedOnBack}
        mirrorInRTL
        radius={resolvedControlRadius}
        animation={resolvedControlAnimation}
        accessibilityLabel={
          backAccessibilityLabel ?? strings.headerBackAccessibilityLabel
        }
        accessibilityHint={backAccessibilityHint}
        testID={viewProps.testID ? `${viewProps.testID}-back` : undefined}
      />
    ) : null;

  const actionsNode =
    actions != null && actions.length > 0 ? (
      <View style={[styles.actions, actionsStyle]}>
        {actions.map((action, index) => (
          <HeaderControl
            key={`${action.icon}-${action.accessibilityLabel}-${index}`}
            icon={action.icon}
            onPress={action.onPress}
            disabled={action.disabled ?? false}
            radius={resolvedControlRadius}
            animation={resolvedControlAnimation}
            accessibilityLabel={action.accessibilityLabel}
            accessibilityHint={action.accessibilityHint}
            testID={
              action.testID ??
              (viewProps.testID
                ? `${viewProps.testID}-action-${index}`
                : undefined)
            }
          />
        ))}
      </View>
    ) : null;

  /**
   * The type system prevents actions and endContent from coexisting.
   *
   * Keep deterministic runtime behavior for JavaScript consumers as well.
   */
  const resolvedEndContent = endContent ?? actionsNode;

  // ─── Title ───────────────────────────────────────

  const resolvedTitleText = resolveTextContent(title);

  const titleNode =
    title == null || typeof title === "boolean" ? null : resolvedTitleText !==
      null ? (
      resolvedTitleText.length > 0 ? (
        <Animated.Text
          allowFontScaling={false}
          maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
          accessibilityRole="header"
          numberOfLines={resolvedTitleNumberOfLines}
          style={[
            titleTypographyStyle,
            animatedTitleSizeStyle,
            animatedTitleColorStyle,
            titleAlign === "center"
              ? styles.titleCenter
              : I18nManager.isRTL
                ? styles.titleStartRTL
                : styles.titleStartLTR,
          ]}
          testID={
            viewProps.testID ? `${viewProps.testID}-title-text` : undefined
          }
        >
          {resolvedTitleText}
        </Animated.Text>
      ) : null
    ) : (
      title
    );

  // ─── Architecture invariants ─────────────────────

  /**
   * Explicitly asking Header to render a back control without providing
   * any back behavior is a configuration error rather than a visual
   * fallback state.
   */
  if (showBack === true && resolvedOnBack == null) {
    throw new Error(
      "[react-native-arc-ui] Header with showBack=true requires onBack or ARCUI onBack.",
    );
  }

  if (actions !== undefined && endContent !== undefined) {
    throw new Error(
      "[react-native-arc-ui] Header accepts either actions or endContent, not both.",
    );
  }

  if (titleAlign !== "center" && centerSideMinWidth !== undefined) {
    throw new Error(
      '[react-native-arc-ui] Header centerSideMinWidth is only valid when titleAlign="center".',
    );
  }

  // ─── Render ──────────────────────────────────────

  return (
    <Animated.View
      ref={ref}
      {...viewProps}
      style={[
        styles.container,
        containerBorderStyle,
        animatedContainerStyle,
        style,
      ]}
    >
      {/*
       * Safe-area padding lives inside the public root.
       *
       * Consumer root styles therefore cannot accidentally remove the
       * notch / system-bar protection owned by Header.
       */}
      <View style={safeAreaStyle}>
        {titleAlign === "start" ? (
          <View style={[styles.content, contentStyle]}>
            <View style={styles.naturalSide}>{backButton}</View>

            <View
              testID={
                viewProps.testID ? `${viewProps.testID}-title` : undefined
              }
              style={[styles.titleContainerStart, startTitleContainerStyle]}
            >
              {titleNode}
            </View>

            <View style={styles.naturalSide}>{resolvedEndContent}</View>
          </View>
        ) : (
          <View style={[styles.content, contentStyle]}>
            {/*
             * Equal physical widths guarantee mathematical centering.
             *
             * flex-start/flex-end remain logical because Yoga resolves
             * them against the current layout direction.
             */}
            <View
              style={[
                styles.centerSide,
                styles.centerSideStart,
                centerSideStyle,
              ]}
            >
              {backButton}
            </View>

            <View
              testID={
                viewProps.testID ? `${viewProps.testID}-title` : undefined
              }
              style={[styles.titleContainerCenter, centerTitleContainerStyle]}
            >
              {titleNode}
            </View>

            <View
              style={[styles.centerSide, styles.centerSideEnd, centerSideStyle]}
            >
              {resolvedEndContent}
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export const Header = memo(HeaderComponent);

Header.displayName = "Header";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
  },

  naturalSide: {
    justifyContent: "center",
  },

  titleContainerStart: {
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
  },

  titleContainerCenter: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  titleStartLTR: {
    flexShrink: 1,
    textAlign: "left",
  },

  titleStartRTL: {
    flexShrink: 1,
    textAlign: "right",
  },

  titleCenter: {
    flexShrink: 1,
    textAlign: "center",
  },

  centerSide: {
    justifyContent: "center",
  },

  centerSideStart: {
    alignItems: "flex-start",
  },

  centerSideEnd: {
    alignItems: "flex-end",
  },

  control: {
    alignItems: "center",
    justifyContent: "center",
  },

  mirroredIcon: {
    transform: [
      {
        scaleX: -1,
      },
    ],
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
});
