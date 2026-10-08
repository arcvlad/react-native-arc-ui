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
  type LayoutChangeEvent,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useARCUIAnimatedTheme, useARCUITheme } from "../../contexts/hooks";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { TabContext, type TTabLayout } from "./TabContext";
import type { ITabBar, TTabChild } from "./types";

const isTabElement = (child: ReactElement): child is ReactElement<TTabChild> =>
  typeof (child.props as TTabChild).value === "string";

const TabBarComponent = ({
  activeTab: activeTabProp,
  onActiveTabChange,
  type = "underline",
  orientation = "horizontal",
  sizeMode = "fill",
  segmentInset: segmentInsetProp,
  children,
  style,
  testID,
}: ITabBar) => {
  const { tokens } = useARCUITheme();
  const { themeProgress } = useARCUIAnimatedTheme();

  const prefersReducedMotion = useReducedMotion();

  const isVertical = orientation === "vertical";
  const isSegment = type === "segment";

  const tokenSegmentInset = tokens.sizings.tabs.segmentInset;

  const hasValidSegmentInset =
    segmentInsetProp === undefined ||
    (Number.isFinite(segmentInsetProp) && segmentInsetProp >= 0);

  const segmentInset = hasValidSegmentInset
    ? (segmentInsetProp ?? tokenSegmentInset)
    : tokenSegmentInset;

  if (__DEV__ && !hasValidSegmentInset) {
    console.error(
      "[react-native-arc-ui] TabBar: segmentInset must be a finite number greater than or equal to zero. Falling back to tokens.sizings.tabs.segmentInset.",
    );
  }

  const tabValues = useMemo(() => {
    const values: string[] = [];

    Children.forEach(children, (child) => {
      if (isValidElement(child) && isTabElement(child)) {
        values.push(child.props.value);
      }
    });

    const invalidValue = values.find((value) => value.trim().length === 0);

    if (invalidValue !== undefined) {
      throw new Error(
        "[react-native-arc-ui] TabBar requires every Tab value to be a non-empty string.",
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
        `[react-native-arc-ui] TabBar requires unique Tab values. Duplicates: ${Array.from(duplicateValues).join(", ")}.`,
      );
    }

    return values;
  }, [children]);

  const tabOrderKey = JSON.stringify(tabValues);
  const firstTabValue = tabValues[0] ?? "";

  /**
   * Tabs are explicitly controlled.
   *
   * Invalid controlled input degrades visually to the first available tab so
   * the component remains render-safe during dynamic child changes. ARCUI does
   * not mutate or silently correct the consumer's semantic state.
   */
  const hasValidActiveTab =
    activeTabProp === ""
      ? tabValues.length === 0
      : tabValues.includes(activeTabProp);

  const activeTab = hasValidActiveTab ? activeTabProp : firstTabValue;

  if (__DEV__ && !hasValidActiveTab) {
    console.error(
      `[react-native-arc-ui] TabBar: activeTab "${activeTabProp}" not found. Falling back visually to the first available tab. Update activeTab to match the rendered Tab values.`,
    );
  }

  const handleActiveTabChange = useCallback(
    (value: string) => {
      if (!tabValues.includes(value)) {
        return;
      }

      /**
       * activeTab remains consumer-owned.
       *
       * Pressing the already-controlled active value is a semantic no-op.
       * If the supplied activeTab is currently invalid, pressing the visual
       * fallback still emits the requested valid value so the consumer can
       * repair its state.
       */
      if (activeTabProp === value) {
        return;
      }

      onActiveTabChange?.(value);
    },
    [activeTabProp, onActiveTabChange, tabValues],
  );

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.tabsAnimations, tokens.animations),
    [tokens.tabsAnimations, tokens.animations],
  );

  /**
   * Content-size measurement is separate from tab geometry.
   *
   * Tab geometry stays valid across visual type changes. If a type/size-mode
   * change actually changes a tab's native layout, that Tab's existing
   * onLayout callback overwrites the cached offset/size.
   */
  const contentMeasurementKey = `${orientation}|${sizeMode}|${tabOrderKey}`;

  const tabLayouts = useRef<Record<string, TTabLayout>>({});
  const tabBarScrollRef = useRef<ComponentRef<typeof ScrollView> | null>(null);
  const tabBarViewportSizeRef = useRef(0);
  const tabBarContentSizeRef = useRef(0);

  const [tabBarContentMeasurement, setTabBarContentMeasurement] = useState(
    () => ({ key: contentMeasurementKey, size: 0 }),
  );
  const [tabBarViewportSize, setTabBarViewportSize] = useState(0);
  const [tabBarNativeContentSize, setTabBarNativeContentSize] = useState(0);

  const tabBarContentSize =
    tabBarContentMeasurement.key === contentMeasurementKey
      ? tabBarContentMeasurement.size
      : 0;

  const measuredShared = useSharedValue(false);
  const tabBarCrossSize = useSharedValue(0);
  const tabOffsets = useSharedValue<number[]>([]);
  const tabSizes = useSharedValue<number[]>([]);
  const indicatorOffset = useSharedValue(0);
  const indicatorSize = useSharedValue(0);
  const tabProgressShared = useSharedValue(
    Math.max(0, tabValues.indexOf(activeTab)),
  );

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
        x: isVertical ? 0 : target,
        y: isVertical ? target : 0,
        animated,
      });
    },
    [isVertical],
  );

  const handleTabBarLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      const nextViewportSize = isVertical ? height : width;
      const nextCrossSize = isVertical ? width : height;

      tabBarCrossSize.value = nextCrossSize;

      if (tabBarViewportSizeRef.current === nextViewportSize) return;

      tabBarViewportSizeRef.current = nextViewportSize;
      setTabBarViewportSize(nextViewportSize);

      if (activeTab) {
        scrollTabIntoView(activeTab, false);
      }
    },
    [activeTab, isVertical, scrollTabIntoView, tabBarCrossSize],
  );

  const handleTabBarContentSizeChange = useCallback(
    (width: number, height: number) => {
      const nextContentSize = isVertical ? height : width;
      tabBarContentSizeRef.current = nextContentSize;
      setTabBarNativeContentSize((current) =>
        current === nextContentSize ? current : nextContentSize,
      );

      if (sizeMode !== "content") return;

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
    [contentMeasurementKey, isVertical, sizeMode],
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

      if (!allMeasured) {
        measuredShared.value = false;
        return;
      }

      const activeLayout = tabLayouts.current[activeTab];

      if (activeLayout && (!wasMeasured || value === activeTab)) {
        cancelAnimation(indicatorOffset);
        cancelAnimation(indicatorSize);
        indicatorOffset.value = activeLayout.offset;
        indicatorSize.value = activeLayout.size;
      }

      measuredShared.value = tabValues.length > 0;

      if (activeTab && (!wasMeasured || value === activeTab)) {
        scrollTabIntoView(activeTab, false);
      }
    },
    [
      activeTab,
      indicatorOffset,
      indicatorSize,
      measuredShared,
      scrollTabIntoView,
      tabOffsets,
      tabSizes,
      tabValues,
    ],
  );

  const previousOrientationRef = useRef(orientation);
  const activeIndex = tabValues.indexOf(activeTab);

  /**
   * offset/size changes semantic axis when orientation changes, so only an
   * orientation change invalidates the geometry cache.
   *
   * Visual type and size-mode changes keep the previous indicator geometry
   * until native onLayout reports any real change. This prevents the active
   * label from switching color before its indicator/background is available.
   */
  useLayoutEffect(() => {
    if (previousOrientationRef.current === orientation) return;

    previousOrientationRef.current = orientation;
    cancelAnimation(indicatorOffset);
    cancelAnimation(indicatorSize);
    cancelAnimation(tabProgressShared);

    tabLayouts.current = {};
    tabBarViewportSizeRef.current = 0;
    tabBarCrossSize.value = 0;
    measuredShared.value = false;
    tabOffsets.value = [];
    tabSizes.value = [];
    indicatorOffset.value = 0;
    indicatorSize.value = 0;
    tabProgressShared.value = Math.max(0, activeIndex);
  }, [
    activeIndex,
    indicatorOffset,
    indicatorSize,
    measuredShared,
    orientation,
    tabBarCrossSize,
    tabOffsets,
    tabProgressShared,
    tabSizes,
  ]);

  const previousTabOrderKeyRef = useRef(tabOrderKey);

  /**
   * Keep the ordered SharedValue arrays aligned with current children. Cached
   * same-axis geometry is reusable for removals/reorders and native onLayout
   * will overwrite entries whose real geometry changed.
   *
   * A normal activeTab change must not synchronously move the indicator here.
   * The effect below owns that transition so indicator position/size can animate
   * from the previous tab instead of being snapped to the destination first.
   */
  useLayoutEffect(() => {
    const orderChanged = previousTabOrderKeyRef.current !== tabOrderKey;
    previousTabOrderKeyRef.current = tabOrderKey;

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

    const activeLayout = tabLayouts.current[activeTab];

    if (orderChanged && allMeasured && activeLayout) {
      cancelAnimation(indicatorOffset);
      cancelAnimation(indicatorSize);
      indicatorOffset.value = activeLayout.offset;
      indicatorSize.value = activeLayout.size;
    }
  }, [
    activeTab,
    indicatorOffset,
    indicatorSize,
    measuredShared,
    tabOrderKey,
    tabOffsets,
    tabSizes,
    tabValues,
  ]);

  useEffect(() => {
    const layout = tabLayouts.current[activeTab];

    if (activeIndex < 0) return;

    cancelAnimation(tabProgressShared);

    if (prefersReducedMotion) {
      tabProgressShared.value = activeIndex;
    } else {
      tabProgressShared.value = withTiming(activeIndex, animationConfig);
    }

    if (layout && measuredShared.value) {
      cancelAnimation(indicatorOffset);
      cancelAnimation(indicatorSize);

      if (prefersReducedMotion) {
        indicatorOffset.value = layout.offset;
        indicatorSize.value = layout.size;
      } else {
        indicatorOffset.value = withTiming(layout.offset, animationConfig);
        indicatorSize.value = withTiming(layout.size, animationConfig);
      }
    }

    scrollTabIntoView(activeTab, !prefersReducedMotion);
  }, [
    activeIndex,
    activeTab,
    animationConfig,
    indicatorOffset,
    indicatorSize,
    measuredShared,
    prefersReducedMotion,
    scrollTabIntoView,
    tabProgressShared,
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

  const containerColor = useDerivedValue(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkContainer, lightContainer],
    ),
  );

  const containerBorderColor = useDerivedValue(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkContainerBorder, lightContainerBorder],
    ),
  );

  const containerVariantStyle = useMemo<ViewStyle>(() => {
    if (type === "underline") {
      return isVertical
        ? { borderEndWidth: tabsBorderWidth }
        : { borderBottomWidth: tabsBorderWidth };
    }

    if (type === "segment") {
      return {
        borderWidth: tabsBorderWidth,
        borderRadius: tabsRadius,
      };
    }

    return {};
  }, [isVertical, tabsBorderWidth, tabsRadius, type]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: containerColor.value,
    borderColor: containerBorderColor.value,
  }));

  const animatedSolidIndicatorStyle = useAnimatedStyle(() => {
    if (!measuredShared.value || tabBarCrossSize.value <= 0) {
      return { opacity: 0 };
    }

    return isVertical
      ? {
          width: tabBarCrossSize.value,
          height: indicatorSize.value,
          transform: [{ translateY: indicatorOffset.value }],
          backgroundColor: indicatorColor.value,
          opacity: 1,
        }
      : {
          width: indicatorSize.value,
          height: tabBarCrossSize.value,
          transform: [{ translateX: indicatorOffset.value }],
          backgroundColor: indicatorColor.value,
          opacity: 1,
        };
  });

  const animatedBorderIndicatorStyle = useAnimatedStyle(() => {
    if (!measuredShared.value || tabBarCrossSize.value <= 0) {
      return { opacity: 0 };
    }

    return isVertical
      ? {
          width: tabBarCrossSize.value,
          height: indicatorSize.value,
          transform: [{ translateY: indicatorOffset.value }],
          borderColor: indicatorColor.value,
          opacity: 1,
        }
      : {
          width: indicatorSize.value,
          height: tabBarCrossSize.value,
          transform: [{ translateX: indicatorOffset.value }],
          borderColor: indicatorColor.value,
          opacity: 1,
        };
  });

  const animatedUnderlineIndicatorStyle = useAnimatedStyle(() => {
    if (!measuredShared.value) {
      return { opacity: 0 };
    }

    return isVertical
      ? {
          width: indicatorThickness,
          height: indicatorSize.value,
          transform: [{ translateY: indicatorOffset.value }],
          backgroundColor: indicatorColor.value,
          opacity: 1,
        }
      : {
          width: indicatorSize.value,
          height: indicatorThickness,
          transform: [{ translateX: indicatorOffset.value }],
          backgroundColor: indicatorColor.value,
          opacity: 1,
        };
  });

  const animatedSegmentIndicatorStyle = useAnimatedStyle(() => {
    if (!measuredShared.value || tabBarCrossSize.value <= 0) {
      return { opacity: 0 };
    }

    const size = indicatorSize.value;
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

    return isVertical
      ? {
          top: 0,
          start: effectiveSegmentInset,
          width: segmentCrossSize,
          height: segmentSize,
          transform: [
            {
              translateY: indicatorOffset.value + effectiveSegmentInset,
            },
          ],
          backgroundColor: indicatorColor.value,
          borderRadius: segmentRadius,
          opacity: 1,
        }
      : {
          top: effectiveSegmentInset,
          left: 0,
          width: segmentSize,
          height: segmentCrossSize,
          transform: [
            {
              translateX: indicatorOffset.value + effectiveSegmentInset,
            },
          ],
          backgroundColor: indicatorColor.value,
          borderRadius: segmentRadius,
          opacity: 1,
        };
  });

  const solidIndicatorStyle = useMemo<ViewStyle>(
    () =>
      isVertical
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
    [isVertical, tabsRadius],
  );

  const borderIndicatorStyle = useMemo<ViewStyle>(
    () => ({
      ...(isVertical
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
    [isVertical, tabsBorderWidth, tabsRadius],
  );

  const underlineIndicatorStyle = useMemo<ViewStyle>(
    () =>
      isVertical
        ? {
            position: "absolute",
            top: 0,
            end: 0,
            width: indicatorThickness,
            borderRadius: indicatorThickness / 2,
          }
        : {
            position: "absolute",
            bottom: 0,
            left: 0,
            height: indicatorThickness,
            borderRadius: indicatorThickness / 2,
          },
    [indicatorThickness, isVertical],
  );

  const segmentIndicatorStyle = useMemo<ViewStyle>(
    () => ({
      position: "absolute",
    }),
    [],
  );

  const indicator =
    type === "solid" ? (
      <Animated.View
        key={`solid-indicator:${orientation}`}
        style={[solidIndicatorStyle, animatedSolidIndicatorStyle]}
        pointerEvents="none"
        accessible={false}
      />
    ) : type === "border" ? (
      <Animated.View
        key={`border-indicator:${orientation}`}
        style={[borderIndicatorStyle, animatedBorderIndicatorStyle]}
        pointerEvents="none"
        accessible={false}
      />
    ) : type === "underline" ? (
      <Animated.View
        key={`underline-indicator:${orientation}`}
        style={[underlineIndicatorStyle, animatedUnderlineIndicatorStyle]}
        pointerEvents="none"
        accessible={false}
      />
    ) : type === "segment" ? (
      <Animated.View
        key={`segment-indicator:${orientation}`}
        style={[segmentIndicatorStyle, animatedSegmentIndicatorStyle]}
        pointerEvents="none"
        accessible={false}
      />
    ) : null;

  const containerSizeStyle = useMemo<ViewStyle>(() => {
    if (sizeMode === "content") {
      const frameAdjustment = isSegment ? tabsBorderWidth * 2 : 0;
      const frameSize =
        tabBarContentSize > 0 ? tabBarContentSize + frameAdjustment : undefined;

      return isVertical
        ? {
            alignSelf: "flex-start",
            height: frameSize,
            maxHeight: "100%",
            flexShrink: 1,
          }
        : {
            alignSelf: "flex-start",
            width: frameSize,
            maxWidth: "100%",
            flexShrink: 1,
          };
    }

    return isVertical
      ? {
          height: "100%",
        }
      : {
          alignSelf: "stretch",
        };
  }, [isSegment, isVertical, sizeMode, tabBarContentSize, tabsBorderWidth]);

  const segmentContainerStyle = useMemo<ViewStyle | undefined>(
    () => (isSegment ? { overflow: "hidden" } : undefined),
    [isSegment],
  );

  const scrollContentStyle = useMemo<ViewStyle>(
    () => ({
      flexDirection: isVertical ? "column" : "row",
      alignItems: "stretch",
      ...(sizeMode === "fill" ? { flexGrow: 1 } : {}),
      ...(isVertical && sizeMode === "fill" ? { width: "100%" } : {}),
    }),
    [isVertical, sizeMode],
  );

  const tabBarScrollEnabled =
    tabBarViewportSize > 0 &&
    tabBarNativeContentSize > tabBarViewportSize + 0.5;

  const scrollViewStyle = useMemo<ViewStyle | undefined>(
    () =>
      isVertical && sizeMode === "fill"
        ? { flex: 1, alignSelf: "stretch" }
        : undefined,
    [isVertical, sizeMode],
  );

  const contextValue = useMemo(
    () => ({
      activeTab,
      onActiveTabChange: handleActiveTabChange,
      type,
      orientation,
      sizeMode,
      tabValues,
      onTabLayout: handleTabLayout,
      activeTextColor,
      inactiveTextColor,
      tabProgressShared,
    }),
    [
      activeTab,
      activeTextColor,
      handleActiveTabChange,
      handleTabLayout,
      inactiveTextColor,
      orientation,
      sizeMode,
      tabProgressShared,
      tabValues,
      type,
    ],
  );

  return (
    <TabContext.Provider value={contextValue}>
      <Animated.View
        testID={testID}
        style={[
          containerSizeStyle,
          containerVariantStyle,
          animatedContainerStyle,
          segmentContainerStyle,
          style,
        ]}
        role="tablist"
        accessibilityRole="tablist"
      >
        <ScrollView
          key={orientation}
          ref={tabBarScrollRef}
          horizontal={!isVertical}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEnabled={tabBarScrollEnabled}
          onLayout={handleTabBarLayout}
          onContentSizeChange={handleTabBarContentSizeChange}
          style={scrollViewStyle}
          contentContainerStyle={scrollContentStyle}
        >
          {indicator}

          {children}
        </ScrollView>
      </Animated.View>
    </TabContext.Provider>
  );
};

export const TabBar = memo(TabBarComponent);

TabBar.displayName = "TabBar";
