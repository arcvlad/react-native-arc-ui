import { memo, useCallback, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";

import { useARCUISystem, useARCUITheme } from "../../contexts/hooks";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import { Badge } from "../Badge/Badge";
import { Icon } from "../Icon/Icon";
import { useTabContext } from "./TabContext";
import type { ITab } from "./types";

const TabComponent = ({
  value,
  label,
  icon,
  iconPosition = "start",
  accessibilityLabel,
  accessibilityHint,
  badge,
  testID,
}: ITab) => {
  const { tokens } = useARCUITheme();
  const { fontScale } = useARCUISystem();

  const {
    activeTab,
    onActiveTabChange,
    activeTextColor,
    inactiveTextColor,
    onTabLayout,
    tabValues,
    tabProgressShared,
    type,
    orientation,
    sizeMode,
  } = useTabContext();

  const isActive = activeTab === value;
  const index = tabValues.indexOf(value);

  const hasIcon = icon !== undefined;
  const hasLabel = label !== undefined;
  const isIconTop = hasIcon && hasLabel && iconPosition === "top";

  const hasAccessibilityLabel =
    typeof accessibilityLabel === "string" &&
    accessibilityLabel.trim().length > 0;

  const resolvedAccessibilityLabel = hasAccessibilityLabel
    ? accessibilityLabel
    : label?.trim()
      ? label
      : value;

  const handlePress = useCallback(() => {
    onActiveTabChange(value);
  }, [onActiveTabChange, value]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;

      onTabLayout(
        value,
        orientation === "horizontal" ? x : y,
        orientation === "horizontal" ? width : height,
      );
    },
    [onTabLayout, orientation, value],
  );

  /**
   * One UI-thread color source drives every visual representation of the tab.
   *
   * TabNavigation supplies a finger-driven continuous progress value, while
   * standalone TabBar supplies a timing-driven progress value.
   */
  const contentColor = useDerivedValue(() =>
    interpolateColor(
      tabProgressShared.value,
      [index - 1, index, index + 1],
      [inactiveTextColor.value, activeTextColor.value, inactiveTextColor.value],
    ),
  );

  const animatedLabelColorStyle = useAnimatedStyle(() => ({
    color: contentColor.value,
  }));

  const labelTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.tabs.label).style,
    [tokens.typography.tabs.label],
  );

  const labelFontSize = tokens.typography.tabs.label.fontSize;

  const labelLineHeight = tokens.typography.tabs.label.lineHeight;

  const animatedLabelSizeStyle = useAnimatedStyle(() => ({
    fontSize: labelFontSize * fontScale.value,

    lineHeight:
      labelLineHeight != null
        ? labelLineHeight * fontScale.value
        : undefined,
  }));

  const contentGap = isIconTop
    ? tokens.sizings.tabs.iconGapVertical
    : tokens.sizings.tabs.iconGapHorizontal;

  if (!hasLabel && !hasAccessibilityLabel) {
    throw new Error(
      "[react-native-arc-ui] Icon-only Tab requires a non-empty accessibilityLabel.",
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      onLayout={handleLayout}
      role="tab"
      accessibilityRole="tab"
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      aria-selected={isActive}
      accessibilityState={{
        selected: isActive,
      }}
      style={[
        styles.tab,
        orientation === "horizontal"
          ? {
              minWidth: tokens.sizings.tabs.minTabWidth,
            }
          : {
              minHeight: tokens.sizings.tabs.minTabHeight,
            },
        {
          paddingHorizontal: tokens.sizings.tabs.horizontalPadding,
          paddingVertical: tokens.sizings.tabs.verticalPadding,
        },
        type === "segment" && sizeMode === "fill" && styles.segmentFillTab,
      ]}
    >
      <View
        style={[
          styles.content,
          {
            flexDirection: isIconTop ? "column" : "row",
            gap: hasIcon && hasLabel ? contentGap : 0,
          },
        ]}
      >
        {hasIcon ? (
          <Icon
            type={icon}
            size={tokens.sizings.tabs.iconSize}
            scaleWithFont
            animatedColor={contentColor}
            accessible={false}
            testID={testID ? `${testID}-icon` : undefined}
          />
        ) : null}

        {hasLabel ? (
          <Animated.Text
            testID={testID ? `${testID}-label` : undefined}
            accessible={false}
            allowFontScaling={false}
            maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
            style={[
              styles.label,
              labelTypographyStyle,
              animatedLabelSizeStyle,
              animatedLabelColorStyle,
            ]}
            numberOfLines={tokens.sizings.tabs.numberOfLines}
          >
            {label}
          </Animated.Text>
        ) : null}
      </View>

      {badge ? (
        <Badge
          dot
          color={badge.color}
          style={[
            styles.badge,
            {
              top: tokens.sizings.tabs.badgeInset,
              end: tokens.sizings.tabs.badgeInset,
            },
          ]}
          accessible={false}
          testID={testID ? `${testID}-badge` : undefined}
        />
      ) : null}
    </Pressable>
  );
};

export const Tab = memo(TabComponent);

Tab.displayName = "Tab";

const styles = StyleSheet.create({
  tab: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    textAlign: "center",
  },

  badge: {
    position: "absolute",
  },

  segmentFillTab: {
    flex: 1,
  },
});
