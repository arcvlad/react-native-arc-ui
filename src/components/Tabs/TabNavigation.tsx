import {
  Children,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ReactElement,
} from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
} from "react-native-reanimated";

import { useARCUIAnimatedTheme, useARCUITheme } from "../../contexts/hooks";
import { Tab } from "./Tab";
import { TabContext, type TTabLayout } from "./TabContext";
import type {
  ITabNavigation,
  ITabScreen,
  TTabBarOrientation,
  TTabScreenChild,
} from "./types";

const isTabScreenElement = (
  child: ReactElement,
): child is ReactElement<ITabScreen> => {
  const props = child.props as TTabScreenChild;

  return (
    typeof props.value === "string" &&
    (typeof props.label === "string" || typeof props.icon === "string")
  );
};

const TabNavigationComponent = ({
  activeTab: activeTabProp,
  onActiveTabChange,
  type = "underline",
  tabBarPosition = "top",
  tabBarLayout = "inline",
  tabBarRadius,
  tabBarBackgroundColor,
  tabBarDarkBackgroundColor,
  tabBarLightBackgroundColor,
  tabBarSizeMode = "fill",
  tabBarAlignment = "start",
  tabBarInset,
  segmentInset: segmentInsetProp,
  swipeEnabled = true,
  children,
  style,
  testID,
}: ITabNavigation) => {
  const { tokens } = useARCUITheme();
  const { themeProgress } = useARCUIAnimatedTheme();

  const prefersReducedMotion = useReducedMotion();

  const tabBarOrientation: TTabBarOrientation =
    tabBarPosition === "start" || tabBarPosition === "end"
      ? "vertical"
      : "horizontal";

  const isVerticalBar = tabBarOrientation === "vertical";
  const isOverlay = tabBarLayout === "overlay";
  const isSegment = type === "segment";

  const tokenOuterInset = tokens.sizings.tabs.outerInset;

  const hasValidTabBarInset =
    tabBarInset === undefined ||
    (Number.isFinite(tabBarInset) && tabBarInset >= 0);

  const resolvedTabBarInset = hasValidTabBarInset
    ? (tabBarInset ?? tokenOuterInset)
    : tokenOuterInset;

  if (__DEV__ && !hasValidTabBarInset) {
    console.error(
      "[react-native-arc-ui] TabNavigation: tabBarInset must be a finite number greater than or equal to zero. Falling back to tokens.sizings.tabs.outerInset.",
    );
  }

  const tokenSegmentInset = tokens.sizings.tabs.segmentInset;

  const hasValidSegmentInset =
    segmentInsetProp === undefined ||
    (Number.isFinite(segmentInsetProp) && segmentInsetProp >= 0);

  const segmentInset = hasValidSegmentInset
    ? (segmentInsetProp ?? tokenSegmentInset)
    : tokenSegmentInset;

  if (__DEV__ && !hasValidSegmentInset) {
    console.error(
      "[react-native-arc-ui] TabNavigation: segmentInset must be a finite number greater than or equal to zero. Falling back to tokens.sizings.tabs.segmentInset.",
    );
  }

  const resolvedTabBarAlignment =
    tabBarAlignment === "center"
      ? "center"
      : tabBarAlignment === "end"
        ? "flex-end"
        : "flex-start";

  const tabScreens = useMemo<ITabScreen[]>(() => {
    const screens: ITabScreen[] = [];

    Children.forEach(children, (child) => {
      if (isValidElement(child) && isTabScreenElement(child)) {
        screens.push(child.props);
      }
    });

    const values = screens.map((screen) => screen.value);
    const invalidValue = values.find((value) => value.trim().length === 0);

    if (invalidValue !== undefined) {
      throw new Error(
        "[react-native-arc-ui] TabNavigation requires every TabScreen value to be a non-empty string.",
      );
    }

    const seenValues = new Set<string>();
    const duplicateValues = new Set<string>();

    values.forEach((value) => {
      if (seenValues.has(value)) {
        duplicateValues.add(value);
      } else {
        seenValues.add(value);
      }
    });

    if (duplicateValues.size > 0) {
      throw new Error(
        `[react-native-arc-ui] TabNavigation requires unique TabScreen values. Duplicates: ${Array.from(duplicateValues).join(", ")}.`,
      );
    }

    return screens;
  }, [children]);

  const tabValues = useMemo(
    () => tabScreens.map((screen) => screen.value),
    [tabScreens],
  );

  const tabOrderKey = JSON.stringify(tabValues);
  const firstTabValue = tabValues[0] ?? "";

  /**
   * TabNavigation is explicitly controlled.
   *
   * During dynamic child changes, an invalid activeTab falls back visually to
   * the first available screen. ARCUI never mutates the consumer's semantic
   * state or replays a selection callback merely because structure changed.
   */
  const hasValidActiveTab =
    activeTabProp === ""
      ? tabValues.length === 0
      : tabValues.includes(activeTabProp);

  const activeTab = hasValidActiveTab ? activeTabProp : firstTabValue;

  const activeIndex = tabValues.indexOf(activeTab);

  if (__DEV__ && !hasValidActiveTab) {
    console.error(
      `[react-native-arc-ui] TabNavigation: activeTab "${activeTabProp}" not found. Falling back visually to the first available tab. Update activeTab to match the rendered TabScreen values.`,
    );
  }

  const contentScrollRef = useRef<ComponentRef<
    typeof Animated.ScrollView
  > | null>(null);
  const tabBarScrollRef = useRef<ComponentRef<typeof ScrollView> | null>(null);

  const [pageWidth, setPageWidth] = useState(0);
  const [swipeRevision, setSwipeRevision] = useState(0);

  const pendingRequestedTabRef = useRef<string | null>(null);
  const programmaticTargetRef = useRef<string | null>(null);
  const userSettledTabRef = useRef<string | null>(null);
  const [initialPagerOffset, setInitialPagerOffset] = useState(0);
  const previousPagerSyncRef = useRef({
    activeTab,
    pageWidth: 0,
    tabOrderKey,
  });

  const scrollX = useSharedValue(0);

  const scrollPagerToValue = useCallback(
    (value: string, animated: boolean) => {
      const index = tabValues.indexOf(value);
      const scrollView = contentScrollRef.current;

      if (index < 0 || pageWidth <= 0 || !scrollView) return;

      const targetX = index * pageWidth;

      programmaticTargetRef.current = value;

      if (!animated) {
        scrollX.value = targetX;
      }

      scrollView.scrollTo({
        x: targetX,
        y: 0,
        animated,
      });

      if (!animated) {
        requestAnimationFrame(() => {
          if (programmaticTargetRef.current === value) {
            programmaticTargetRef.current = null;
          }
        });
      }
    },
    [pageWidth, scrollX, tabValues],
  );

  const requestTabChange = useCallback(
    (value: string) => {
      if (!tabValues.includes(value)) {
        return;
      }

      /**
       * Semantic selection is consumer-owned.
       *
       * If activeTab is invalid, requesting the visual fallback is still a real
       * request because it allows the consumer to repair controlled state.
       */
      if (activeTabProp === value) {
        return;
      }

      onActiveTabChange?.(value);
    },
    [activeTabProp, onActiveTabChange, tabValues],
  );

  const handleContentLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nextPageWidth = event.nativeEvent.layout.width;

      if (nextPageWidth <= 0 || nextPageWidth === pageWidth) return;

      if (activeIndex >= 0) {
        const targetX = activeIndex * nextPageWidth;

        scrollX.value = targetX;

        if (pageWidth === 0) {
          setInitialPagerOffset(targetX);
        }
      }

      setPageWidth(nextPageWidth);
    },
    [activeIndex, pageWidth, scrollX],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleScrollBeginDrag = useCallback(() => {
    programmaticTargetRef.current = null;
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageWidth <= 0 || tabValues.length === 0) {
        return;
      }

      const settledIndex = Math.max(
        0,
        Math.min(
          tabValues.length - 1,
          Math.round(event.nativeEvent.contentOffset.x / pageWidth),
        ),
      );

      const settledValue = tabValues[settledIndex];

      if (!settledValue) {
        return;
      }

      const programmaticTarget = programmaticTargetRef.current;

      if (programmaticTarget !== null) {
        if (settledValue === programmaticTarget) {
          programmaticTargetRef.current = null;
        }

        return;
      }

      if (settledValue === activeTab) {
        return;
      }

      /**
       * The native pager may settle visually before React accepts the
       * controlled value.
       *
       * Record the request so the following lifecycle pass can either:
       *
       * - keep the page where it is when the consumer accepts activeTab; or
       * - reconcile back to activeTab when the consumer rejects the request.
       *
       * No frame-by-frame JS work is involved; scrollX remains UI-thread-owned.
       */
      userSettledTabRef.current = settledValue;
      pendingRequestedTabRef.current = settledValue;

      setSwipeRevision((revision) => revision + 1);

      onActiveTabChange?.(settledValue);
    },
    [activeTab, onActiveTabChange, pageWidth, tabValues],
  );

  useEffect(() => {
    if (swipeRevision === 0) {
      return;
    }

    const pendingRequestedTab = pendingRequestedTabRef.current;

    if (pendingRequestedTab === null) {
      return;
    }

    pendingRequestedTabRef.current = null;

    /**
     * Consumer accepted the swipe request.
     */
    if (activeTab === pendingRequestedTab) {
      return;
    }

    /**
     * Consumer rejected the swipe request.
     *
     * The native gesture is allowed to settle naturally first, then the pager
     * reconciles to the authoritative controlled activeTab without replaying
     * onActiveTabChange.
     */
    userSettledTabRef.current = null;

    scrollPagerToValue(activeTab, !prefersReducedMotion);
  }, [activeTab, prefersReducedMotion, scrollPagerToValue, swipeRevision]);

  /**
   * Content-size measurement is separate from tab geometry.
   *
   * Tab geometry stays valid across visual type changes. If a type/size-mode
   * change actually changes a tab's native layout, that Tab's existing
   * onLayout callback overwrites the cached offset/size.
   */
  const contentMeasurementKey = `${tabBarOrientation}|${tabBarSizeMode}|${tabOrderKey}`;

  const tabLayouts = useRef<Record<string, TTabLayout>>({});
  const tabBarViewportSizeRef = useRef(0);
  const tabBarContentSizeRef = useRef(0);

  const [tabBarContentMeasurement, setTabBarContentMeasurement] = useState(
    () => ({ key: contentMeasurementKey, size: 0 }),
  );
  const [tabBarViewportSize, setTabBarViewportSize] = useState(0);
  const [tabBarNativeContentSize, setTabBarNativeContentSize] = useState(0);
  const [navigationLayout, setNavigationLayout] = useState({
    width: 0,
    height: 0,
  });

  const tabBarContentSize =
    tabBarContentMeasurement.key === contentMeasurementKey
      ? tabBarContentMeasurement.size
      : 0;

  const measuredShared = useSharedValue(false);
  const tabBarCrossSize = useSharedValue(0);
  const tabOffsets = useSharedValue<number[]>([]);
  const tabSizes = useSharedValue<number[]>([]);

  const tabProgressShared = useDerivedValue(() => {
    if (pageWidth <= 0) {
      return Math.max(0, activeIndex);
    }

    return scrollX.value / pageWidth;
  });

  const scrollTabIntoView = useCallback(
    (value: string, animated: boolean) => {
      const layout = tabLayouts.current[value];
      const viewportSize = tabBarViewportSizeRef.current;
      const scrollView = tabBarScrollRef.current;

      if (!layout || viewportSize <= 0 || !scrollView) return;

      const contentSize = tabBarContentSizeRef.current;
      const maxScroll = Math.max(0, contentSize - viewportSize);
      const centeredTarget = layout.offset + layout.size / 2 - viewportSize / 2;
      const target =
        maxScroll <= 0.5 ? 0 : Math.max(0, Math.min(maxScroll, centeredTarget));

      scrollView.scrollTo({
        x: isVerticalBar ? 0 : target,
        y: isVerticalBar ? target : 0,
        animated,
      });
    },
    [isVerticalBar],
  );

  const handleNavigationLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setNavigationLayout((current) =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  }, []);

  const handleTabBarLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      const nextViewportSize = isVerticalBar ? height : width;
      const nextCrossSize = isVerticalBar ? width : height;

      tabBarCrossSize.value = nextCrossSize;

      if (tabBarViewportSizeRef.current === nextViewportSize) return;

      tabBarViewportSizeRef.current = nextViewportSize;
      setTabBarViewportSize(nextViewportSize);

      if (activeTab) {
        scrollTabIntoView(activeTab, false);
      }
    },
    [activeTab, isVerticalBar, scrollTabIntoView, tabBarCrossSize],
  );

  const handleTabBarContentSizeChange = useCallback(
    (width: number, height: number) => {
      const nextContentSize = isVerticalBar ? height : width;
      tabBarContentSizeRef.current = nextContentSize;
      setTabBarNativeContentSize((current) =>
        current === nextContentSize ? current : nextContentSize,
      );

      if (tabBarSizeMode !== "content") return;

      setTabBarContentMeasurement((current) => {
        if (
          current.key === contentMeasurementKey &&
          current.size === nextContentSize
        ) {
          return current;
        }

        return {
          key: contentMeasurementKey,
          size: nextContentSize,
        };
      });
    },
    [contentMeasurementKey, isVerticalBar, tabBarSizeMode],
  );

  const handleTabLayout = useCallback(
    (value: string, offset: number, size: number) => {
      const previous = tabLayouts.current[value];

      if (previous?.offset === offset && previous.size === size) return;

      const wasMeasured = measuredShared.value;

      tabLayouts.current[value] = { offset, size };

      tabOffsets.value = tabValues.map(
        (tabValue) => tabLayouts.current[tabValue]?.offset ?? 0,
      );
      tabSizes.value = tabValues.map(
        (tabValue) => tabLayouts.current[tabValue]?.size ?? 0,
      );

      const allMeasured = tabValues.every(
        (tabValue) => tabLayouts.current[tabValue] !== undefined,
      );

      measuredShared.value = allMeasured && tabValues.length > 0;

      if (allMeasured && activeTab && (!wasMeasured || value === activeTab)) {
        scrollTabIntoView(activeTab, false);
      }
    },
    [
      activeTab,
      measuredShared,
      scrollTabIntoView,
      tabOffsets,
      tabSizes,
      tabValues,
    ],
  );

  const previousOrientationRef = useRef(tabBarOrientation);

  /**
   * offset/size changes semantic axis when the bar switches between horizontal
   * and vertical, so only an orientation change invalidates the cache.
   *
   * Type and size-mode changes intentionally keep the previous measurements
   * alive until native onLayout reports any real geometry change. This avoids
   * a frame where active text has switched color but its indicator disappeared.
   */
  useLayoutEffect(() => {
    if (previousOrientationRef.current === tabBarOrientation) return;

    previousOrientationRef.current = tabBarOrientation;
    tabLayouts.current = {};
    tabBarViewportSizeRef.current = 0;
    tabBarCrossSize.value = 0;
    measuredShared.value = false;
    tabOffsets.value = [];
    tabSizes.value = [];
  }, [
    measuredShared,
    tabBarCrossSize,
    tabBarOrientation,
    tabOffsets,
    tabSizes,
  ]);

  /**
   * Rebuild the ordered SharedValue arrays when children are added, removed or
   * reordered. Existing same-axis measurements can be reused immediately;
   * subsequent native onLayout events overwrite anything whose geometry moved.
   */
  useLayoutEffect(() => {
    const offsets = tabValues.map(
      (tabValue) => tabLayouts.current[tabValue]?.offset ?? 0,
    );
    const sizes = tabValues.map(
      (tabValue) => tabLayouts.current[tabValue]?.size ?? 0,
    );
    const allMeasured =
      tabValues.length > 0 &&
      tabValues.every((tabValue) => tabLayouts.current[tabValue] !== undefined);

    tabOffsets.value = offsets;
    tabSizes.value = sizes;
    measuredShared.value = allMeasured;
  }, [measuredShared, tabOrderKey, tabOffsets, tabSizes, tabValues]);

  useEffect(() => {
    if (pageWidth <= 0 || activeIndex < 0) return;

    const previous = previousPagerSyncRef.current;
    const widthChanged = previous.pageWidth !== pageWidth;
    const orderChanged = previous.tabOrderKey !== tabOrderKey;
    const activeChanged = previous.activeTab !== activeTab;

    previousPagerSyncRef.current = {
      activeTab,
      pageWidth,
      tabOrderKey,
    };

    const settledByUser = userSettledTabRef.current === activeTab;

    if (!widthChanged && !orderChanged && !activeChanged && !settledByUser) {
      return;
    }

    if (settledByUser) {
      userSettledTabRef.current = null;
    } else if (widthChanged || orderChanged || activeChanged) {
      const animated = activeChanged && !widthChanged && !orderChanged;

      scrollPagerToValue(activeTab, animated && !prefersReducedMotion);
    }

    scrollTabIntoView(activeTab, !prefersReducedMotion && activeChanged);
  }, [
    activeIndex,
    activeTab,
    pageWidth,
    prefersReducedMotion,
    scrollPagerToValue,
    scrollTabIntoView,
    tabOrderKey,
  ]);

  const lightActiveText = tokens.colors.light.tabs[type].text.active;
  const darkActiveText = tokens.colors.dark.tabs[type].text.active;
  const lightInactiveText = tokens.colors.light.tabs[type].text.inactive;
  const darkInactiveText = tokens.colors.dark.tabs[type].text.inactive;
  const lightIndicator = tokens.colors.light.tabs[type].indicator;
  const darkIndicator = tokens.colors.dark.tabs[type].indicator;

  const lightContainer = isSegment
    ? tokens.colors.light.tabs.segment.containerBackground
    : tokens.colors.light.tabs.container.background;
  const darkContainer = isSegment
    ? tokens.colors.dark.tabs.segment.containerBackground
    : tokens.colors.dark.tabs.container.background;
  const lightContainerBorder = isSegment
    ? tokens.colors.light.tabs.segment.containerBorder
    : tokens.colors.light.tabs.container.border;
  const darkContainerBorder = isSegment
    ? tokens.colors.dark.tabs.segment.containerBorder
    : tokens.colors.dark.tabs.container.border;

  const tabsRadius = tokens.radius.tabs;
  const tabsBorderWidth = tokens.border.tabs;
  const indicatorThickness = tokens.sizings.tabs.indicatorHeight;

  const defaultTabBarRadius = isOverlay || isSegment ? tabsRadius : 0;

  const hasValidTabBarRadius =
    tabBarRadius === undefined ||
    (Number.isFinite(tabBarRadius) && tabBarRadius >= 0);

  const resolvedTabBarRadius = hasValidTabBarRadius
    ? (tabBarRadius ?? defaultTabBarRadius)
    : defaultTabBarRadius;

  if (__DEV__ && !hasValidTabBarRadius) {
    console.error(
      "[react-native-arc-ui] TabNavigation: tabBarRadius must be a finite number greater than or equal to zero. Falling back to the default TabBar radius.",
    );
  }

  const hasIncompleteTabBarThemeBackgroundPair =
    (tabBarDarkBackgroundColor != null) !==
    (tabBarLightBackgroundColor != null);

  if (__DEV__ && hasIncompleteTabBarThemeBackgroundPair) {
    console.error(
      "[react-native-arc-ui] TabNavigation: tabBarDarkBackgroundColor and tabBarLightBackgroundColor must be provided together. The incomplete theme color pair was ignored.",
    );
  }

  const activeTextColor = useDerivedValue(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkActiveText, lightActiveText],
    ),
  );

  const inactiveTextColor = useDerivedValue(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkInactiveText, lightInactiveText],
    ),
  );

  const indicatorColor = useDerivedValue(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkIndicator, lightIndicator],
    ),
  );

  const containerColor = useDerivedValue(() => {
    if (tabBarBackgroundColor != null) {
      return tabBarBackgroundColor;
    }

    if (
      tabBarDarkBackgroundColor != null &&
      tabBarLightBackgroundColor != null
    ) {
      return interpolateColor(
        themeProgress.value,
        [0, 1],
        [tabBarDarkBackgroundColor, tabBarLightBackgroundColor],
      );
    }

    return interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkContainer, lightContainer],
    );
  });

  const containerBorderColor = useDerivedValue(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkContainerBorder, lightContainerBorder],
    ),
  );

  const tabBarVariantStyle = useMemo<ViewStyle>(() => {
    if (type === "underline") {
      if (tabBarPosition === "bottom") {
        return { borderTopWidth: tabsBorderWidth };
      }

      if (tabBarPosition === "start") {
        return { borderEndWidth: tabsBorderWidth };
      }

      if (tabBarPosition === "end") {
        return { borderStartWidth: tabsBorderWidth };
      }

      return { borderBottomWidth: tabsBorderWidth };
    }

    if (type === "segment") {
      return {
        borderWidth: tabsBorderWidth,
      };
    }

    return {};
  }, [tabBarPosition, tabsBorderWidth, type]);

  const animatedTabBarStyle = useAnimatedStyle(() => ({
    backgroundColor: containerColor.value,
    borderColor: containerBorderColor.value,
  }));

  const animatedSolidIndicatorStyle = useAnimatedStyle(() => {
    if (
      !measuredShared.value ||
      pageWidth <= 0 ||
      tabBarCrossSize.value <= 0 ||
      tabOffsets.value.length === 0
    ) {
      return { opacity: 0 };
    }

    const lastIndex = tabOffsets.value.length - 1;
    const rawIndex = scrollX.value / pageWidth;
    const index = Math.max(0, Math.min(lastIndex, rawIndex));
    const leftIndex = Math.floor(index);
    const rightIndex = Math.min(Math.ceil(index), lastIndex);
    const fraction = index - leftIndex;

    const leftOffset = tabOffsets.value[leftIndex] ?? 0;
    const rightOffset = tabOffsets.value[rightIndex] ?? leftOffset;
    const leftSize = tabSizes.value[leftIndex] ?? 0;
    const rightSize = tabSizes.value[rightIndex] ?? leftSize;

    const offset = leftOffset + (rightOffset - leftOffset) * fraction;
    const size = leftSize + (rightSize - leftSize) * fraction;
    const crossSize = tabBarCrossSize.value;

    return isVerticalBar
      ? {
          width: crossSize,
          height: size,
          transform: [{ translateY: offset }],
          backgroundColor: indicatorColor.value,
          opacity: 1,
        }
      : {
          width: size,
          height: crossSize,
          transform: [{ translateX: offset }],
          backgroundColor: indicatorColor.value,
          opacity: 1,
        };
  });

  const animatedBorderIndicatorStyle = useAnimatedStyle(() => {
    if (
      !measuredShared.value ||
      pageWidth <= 0 ||
      tabBarCrossSize.value <= 0 ||
      tabOffsets.value.length === 0
    ) {
      return { opacity: 0 };
    }

    const lastIndex = tabOffsets.value.length - 1;
    const rawIndex = scrollX.value / pageWidth;
    const index = Math.max(0, Math.min(lastIndex, rawIndex));
    const leftIndex = Math.floor(index);
    const rightIndex = Math.min(Math.ceil(index), lastIndex);
    const fraction = index - leftIndex;

    const leftOffset = tabOffsets.value[leftIndex] ?? 0;
    const rightOffset = tabOffsets.value[rightIndex] ?? leftOffset;
    const leftSize = tabSizes.value[leftIndex] ?? 0;
    const rightSize = tabSizes.value[rightIndex] ?? leftSize;

    const offset = leftOffset + (rightOffset - leftOffset) * fraction;
    const size = leftSize + (rightSize - leftSize) * fraction;
    const crossSize = tabBarCrossSize.value;

    return isVerticalBar
      ? {
          width: crossSize,
          height: size,
          transform: [{ translateY: offset }],
          borderColor: indicatorColor.value,
          opacity: 1,
        }
      : {
          width: size,
          height: crossSize,
          transform: [{ translateX: offset }],
          borderColor: indicatorColor.value,
          opacity: 1,
        };
  });

  const animatedUnderlineIndicatorStyle = useAnimatedStyle(() => {
    if (
      !measuredShared.value ||
      pageWidth <= 0 ||
      tabOffsets.value.length === 0
    ) {
      return { opacity: 0 };
    }

    const lastIndex = tabOffsets.value.length - 1;
    const rawIndex = scrollX.value / pageWidth;
    const index = Math.max(0, Math.min(lastIndex, rawIndex));
    const leftIndex = Math.floor(index);
    const rightIndex = Math.min(Math.ceil(index), lastIndex);
    const fraction = index - leftIndex;

    const leftOffset = tabOffsets.value[leftIndex] ?? 0;
    const rightOffset = tabOffsets.value[rightIndex] ?? leftOffset;
    const leftSize = tabSizes.value[leftIndex] ?? 0;
    const rightSize = tabSizes.value[rightIndex] ?? leftSize;

    const offset = leftOffset + (rightOffset - leftOffset) * fraction;
    const size = leftSize + (rightSize - leftSize) * fraction;

    return isVerticalBar
      ? {
          width: indicatorThickness,
          height: size,
          transform: [{ translateY: offset }],
          backgroundColor: indicatorColor.value,
          opacity: 1,
        }
      : {
          width: size,
          height: indicatorThickness,
          transform: [{ translateX: offset }],
          backgroundColor: indicatorColor.value,
          opacity: 1,
        };
  });

  const animatedSegmentIndicatorStyle = useAnimatedStyle(() => {
    if (
      !measuredShared.value ||
      pageWidth <= 0 ||
      tabBarCrossSize.value <= 0 ||
      tabOffsets.value.length === 0
    ) {
      return { opacity: 0 };
    }

    const lastIndex = tabOffsets.value.length - 1;
    const rawIndex = scrollX.value / pageWidth;
    const index = Math.max(0, Math.min(lastIndex, rawIndex));
    const leftIndex = Math.floor(index);
    const rightIndex = Math.min(Math.ceil(index), lastIndex);
    const fraction = index - leftIndex;

    const leftOffset = tabOffsets.value[leftIndex] ?? 0;
    const rightOffset = tabOffsets.value[rightIndex] ?? leftOffset;
    const leftSize = tabSizes.value[leftIndex] ?? 0;
    const rightSize = tabSizes.value[rightIndex] ?? leftSize;

    const offset = leftOffset + (rightOffset - leftOffset) * fraction;
    const size = leftSize + (rightSize - leftSize) * fraction;
    const crossSize = tabBarCrossSize.value;

    const effectiveSegmentInset = Math.min(
      segmentInset,
      Math.max(0, Math.min(size, crossSize) / 2),
    );
    const segmentSize = Math.max(0, size - effectiveSegmentInset * 2);
    const segmentCrossSize = Math.max(0, crossSize - effectiveSegmentInset * 2);
    const segmentRadius = Math.max(
      0,
      Math.min(tabsRadius, segmentSize / 2, segmentCrossSize / 2),
    );

    return isVerticalBar
      ? {
          top: 0,
          start: effectiveSegmentInset,
          width: segmentCrossSize,
          height: segmentSize,
          transform: [{ translateY: offset + effectiveSegmentInset }],
          backgroundColor: indicatorColor.value,
          borderRadius: segmentRadius,
          opacity: 1,
        }
      : {
          top: effectiveSegmentInset,
          left: 0,
          width: segmentSize,
          height: segmentCrossSize,
          transform: [{ translateX: offset + effectiveSegmentInset }],
          backgroundColor: indicatorColor.value,
          borderRadius: segmentRadius,
          opacity: 1,
        };
  });

  const solidIndicatorStyle = useMemo<ViewStyle>(
    () =>
      isVerticalBar
        ? {
            position: "absolute",
            top: 0,
            start: 0,
            borderRadius: tabsRadius,
          }
        : {
            position: "absolute",
            top: 0,
            left: 0,
            borderRadius: tabsRadius,
          },
    [isVerticalBar, tabsRadius],
  );

  const borderIndicatorStyle = useMemo<ViewStyle>(
    () => ({
      ...(isVerticalBar
        ? {
            position: "absolute" as const,
            top: 0,
            start: 0,
          }
        : {
            position: "absolute" as const,
            top: 0,
            left: 0,
          }),
      backgroundColor: "rgba(0, 0, 0, 0)",
      borderWidth: tabsBorderWidth,
      borderRadius: tabsRadius,
    }),
    [isVerticalBar, tabsBorderWidth, tabsRadius],
  );

  const underlineIndicatorStyle = useMemo<ViewStyle>(() => {
    if (tabBarPosition === "bottom") {
      return {
        position: "absolute",
        top: 0,
        left: 0,
        height: indicatorThickness,
        borderRadius: indicatorThickness / 2,
      };
    }

    if (tabBarPosition === "start") {
      return {
        position: "absolute",
        top: 0,
        end: 0,
        width: indicatorThickness,
        borderRadius: indicatorThickness / 2,
      };
    }

    if (tabBarPosition === "end") {
      return {
        position: "absolute",
        top: 0,
        start: 0,
        width: indicatorThickness,
        borderRadius: indicatorThickness / 2,
      };
    }

    return {
      position: "absolute",
      bottom: 0,
      left: 0,
      height: indicatorThickness,
      borderRadius: indicatorThickness / 2,
    };
  }, [indicatorThickness, tabBarPosition]);

  const segmentIndicatorStyle = useMemo<ViewStyle>(
    () => ({
      position: "absolute",
    }),
    [],
  );

  const indicator =
    type === "solid" ? (
      <Animated.View
        key={`solid-indicator:${tabBarOrientation}`}
        style={[solidIndicatorStyle, animatedSolidIndicatorStyle]}
        pointerEvents="none"
        accessible={false}
      />
    ) : type === "border" ? (
      <Animated.View
        key={`border-indicator:${tabBarOrientation}`}
        style={[borderIndicatorStyle, animatedBorderIndicatorStyle]}
        pointerEvents="none"
        accessible={false}
      />
    ) : type === "underline" ? (
      <Animated.View
        key={`underline-indicator:${tabBarPosition}`}
        style={[underlineIndicatorStyle, animatedUnderlineIndicatorStyle]}
        pointerEvents="none"
        accessible={false}
      />
    ) : type === "segment" ? (
      <Animated.View
        key={`segment-indicator:${tabBarOrientation}`}
        style={[segmentIndicatorStyle, animatedSegmentIndicatorStyle]}
        pointerEvents="none"
        accessible={false}
      />
    ) : null;

  const tabBarSizingStyle = useMemo<ViewStyle>(() => {
    if (tabBarSizeMode === "content") {
      const frameAdjustment = isSegment ? tabsBorderWidth * 2 : 0;
      const naturalFrameSize =
        tabBarContentSize > 0 ? tabBarContentSize + frameAdjustment : undefined;

      const availableMainSize = isVerticalBar
        ? navigationLayout.height
        : navigationLayout.width;
      const maxFrameSize =
        availableMainSize > 0
          ? Math.max(0, availableMainSize - resolvedTabBarInset * 2)
          : undefined;

      const frameSize =
        naturalFrameSize !== undefined && maxFrameSize !== undefined
          ? Math.min(naturalFrameSize, maxFrameSize)
          : naturalFrameSize;

      return isVerticalBar
        ? {
            alignSelf: resolvedTabBarAlignment,
            height: frameSize,
            flexShrink: 1,
          }
        : {
            alignSelf: resolvedTabBarAlignment,
            width: frameSize,
            flexShrink: 1,
          };
    }

    return {
      alignSelf: "stretch",
    };
  }, [
    isSegment,
    isVerticalBar,
    navigationLayout.height,
    navigationLayout.width,
    resolvedTabBarAlignment,
    resolvedTabBarInset,
    tabBarContentSize,
    tabBarSizeMode,
    tabsBorderWidth,
  ]);

  const tabBarSurfaceStyle = useMemo<ViewStyle>(
    () => ({
      borderRadius: resolvedTabBarRadius,
      ...(isSegment || resolvedTabBarRadius > 0
        ? { overflow: "hidden" as const }
        : {}),
    }),
    [isSegment, resolvedTabBarRadius],
  );

  const tabBarOuterStyle = useMemo<ViewStyle>(
    () => ({
      margin: resolvedTabBarInset,
    }),
    [resolvedTabBarInset],
  );

  const tabBarScrollContentStyle = useMemo<ViewStyle>(
    () => ({
      flexDirection: isVerticalBar ? "column" : "row",
      alignItems: "stretch",
      ...(tabBarSizeMode === "fill" ? { flexGrow: 1 } : {}),
      ...(isVerticalBar && tabBarSizeMode === "fill" ? { width: "100%" } : {}),
    }),
    [isVerticalBar, tabBarSizeMode],
  );

  const tabBarScrollStyle = useMemo<ViewStyle | undefined>(
    () =>
      isVerticalBar && tabBarSizeMode === "fill"
        ? { flex: 1, alignSelf: "stretch" }
        : undefined,
    [isVerticalBar, tabBarSizeMode],
  );

  const tabBarScrollEnabled =
    tabBarViewportSize > 0 &&
    tabBarNativeContentSize > tabBarViewportSize + 0.5;

  const navigationLayoutStyle = useMemo<ViewStyle>(
    () => ({
      flexDirection: !isOverlay && isVerticalBar ? "row" : "column",
    }),
    [isOverlay, isVerticalBar],
  );

  const overlayLayoutStyle = useMemo<ViewStyle>(
    () => ({
      flexDirection: isVerticalBar ? "row" : "column",
      justifyContent:
        tabBarPosition === "bottom" || tabBarPosition === "end"
          ? "flex-end"
          : "flex-start",
    }),
    [isVerticalBar, tabBarPosition],
  );

  const contextValue = useMemo(
    () => ({
      activeTab,
      onActiveTabChange: requestTabChange,
      type,
      orientation: tabBarOrientation,
      sizeMode: tabBarSizeMode,
      tabValues,
      onTabLayout: handleTabLayout,
      activeTextColor,
      inactiveTextColor,
      tabProgressShared,
    }),
    [
      activeTab,
      activeTextColor,
      handleTabLayout,
      inactiveTextColor,
      requestTabChange,
      tabBarOrientation,
      tabBarSizeMode,
      tabProgressShared,
      tabValues,
      type,
    ],
  );

  const tabBarContent = (
    <TabContext.Provider value={contextValue}>
      <Animated.View
        style={[
          tabBarSizingStyle,
          tabBarVariantStyle,
          animatedTabBarStyle,
          tabBarSurfaceStyle,
          tabBarOuterStyle,
        ]}
        role="tablist"
        accessibilityRole="tablist"
      >
        <ScrollView
          key={tabBarOrientation}
          ref={tabBarScrollRef}
          horizontal={!isVerticalBar}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEnabled={tabBarScrollEnabled}
          onLayout={handleTabBarLayout}
          onContentSizeChange={handleTabBarContentSizeChange}
          style={tabBarScrollStyle}
          contentContainerStyle={tabBarScrollContentStyle}
        >
          {indicator}

          {tabScreens.map((screen) => {
            const tabTestID = screen.testID
              ? `${screen.testID}-tab`
              : undefined;

            if (screen.icon !== undefined && screen.label !== undefined) {
              return (
                <Tab
                  key={screen.value}
                  value={screen.value}
                  icon={screen.icon}
                  label={screen.label}
                  iconPosition={screen.iconPosition}
                  accessibilityLabel={screen.accessibilityLabel}
                  accessibilityHint={screen.accessibilityHint}
                  badge={screen.badge}
                  testID={tabTestID}
                />
              );
            }

            if (screen.icon !== undefined) {
              return (
                <Tab
                  key={screen.value}
                  value={screen.value}
                  icon={screen.icon}
                  accessibilityLabel={screen.accessibilityLabel}
                  accessibilityHint={screen.accessibilityHint}
                  badge={screen.badge}
                  testID={tabTestID}
                />
              );
            }

            return (
              <Tab
                key={screen.value}
                value={screen.value}
                label={screen.label}
                accessibilityLabel={screen.accessibilityLabel}
                accessibilityHint={screen.accessibilityHint}
                badge={screen.badge}
                testID={tabTestID}
              />
            );
          })}
        </ScrollView>
      </Animated.View>
    </TabContext.Provider>
  );

  const contentArea = (
    <View style={styles.content} onLayout={handleContentLayout}>
      {pageWidth > 0 ? (
        <Animated.ScrollView
          ref={contentScrollRef}
          horizontal
          pagingEnabled
          scrollEnabled={swipeEnabled}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          onScrollBeginDrag={handleScrollBeginDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          style={styles.pager}
          contentOffset={{
            x: initialPagerOffset,
            y: 0,
          }}
        >
          {tabScreens.map((screen) => {
            const isActive = screen.value === activeTab;

            return (
              <View
                key={screen.value}
                testID={screen.testID}
                style={[styles.page, { width: pageWidth }]}
                pointerEvents={isActive ? "auto" : "none"}
                accessibilityElementsHidden={!isActive}
                importantForAccessibility={
                  isActive ? "auto" : "no-hide-descendants"
                }
              >
                {screen.children}
              </View>
            );
          })}
        </Animated.ScrollView>
      ) : null}
    </View>
  );

  const tabBarComesFirst =
    tabBarPosition === "top" || tabBarPosition === "start";

  return (
    <View
      testID={testID}
      onLayout={handleNavigationLayout}
      style={[styles.container, navigationLayoutStyle, style]}
    >
      {isOverlay ? (
        <>
          {contentArea}
          <View
            pointerEvents="box-none"
            style={[styles.overlay, overlayLayoutStyle]}
          >
            {tabBarContent}
          </View>
        </>
      ) : tabBarComesFirst ? (
        <>
          {tabBarContent}
          {contentArea}
        </>
      ) : (
        <>
          {contentArea}
          {tabBarContent}
        </>
      )}
    </View>
  );
};

export const TabNavigation = memo(TabNavigationComponent);

TabNavigation.displayName = "TabNavigation";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  pager: {
    flex: 1,
  },
  page: {
    height: "100%",
    overflow: "hidden",
  },
});
