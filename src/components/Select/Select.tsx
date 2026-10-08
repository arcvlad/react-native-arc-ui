import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  interpolateColor,
  LinearTransition,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  useARCUIAnimatedTheme,
  useARCUIStrings,
  useARCUISystem,
  useARCUITheme,
} from "../../contexts/hooks";
import { useEnteringExiting } from "../../hooks/useEnteringExiting";
import {
  isNonNegativeFiniteNumber,
  resolveNonNegativeInteger,
  resolveNonNegativeMetric,
  resolvePositiveInteger,
} from "../../utils/numberUtils";
import { resolveAnimation } from "../../utils/resolveAnimation";
import { Chip } from "../Chip/Chip";
import { Icon } from "../Icon/Icon";
import { SpinnerLoader } from "../SpinnerLoader/SpinnerLoader";
import { SelectItem } from "./SelectItem";
import { resolveTypographyStyle } from "../../utils/resolveTypography";
import type { ISelect, TSelectOption, TSelectValue } from "./types";
import { errors } from "../../utils/errors";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const areSelectOptionsEqual = (first: TSelectOption, second: TSelectOption) =>
  first.value === second.value &&
  first.label === second.label &&
  first.disabled === second.disabled &&
  first.icon === second.icon &&
  first.group === second.group;

const SelectComponent = ({
  value,
  values,
  onValueChange,
  onValuesChange,
  multiple = false,
  maxSelect,

  options = [],

  searchable = false,
  onSearchAsync,
  searchDebounce = 300,
  searchPlaceholder,
  searchLoading = false,

  label,
  placeholder,
  error,
  disabled = false,
  active = true,
  emptyLabel,

  itemHeight,
  maxVisibleItems,
  maxChipsVisible,

  accessibilityLabel,
  accessibilityHint,
  searchAccessibilityLabel,

  style,
  testID,
}: ISelect) => {
  const { tokens } = useARCUITheme();

  const { themeProgress } = useARCUIAnimatedTheme();

  const { fontScale } = useARCUISystem();

  const strings = useARCUIStrings();

  const { entering, exiting } = useEnteringExiting();

  const prefersReducedMotion = useReducedMotion();

  // ─── React state / lifecycle ─────────────────────────────────────────────

  const [isOpen, setIsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchInputRef = useRef<TextInput>(null);

  const lastAsyncQueryRef = useRef("");

  /**
   * Selection callbacks intentionally use refs.
   *
   * This keeps the SelectItem onPress callback stable while ensuring
   * it always reads the latest controlled selection supplied by the
   * consumer.
   */
  const valuesRef = useRef(values);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  /**
   * Keeps display metadata for currently selected values even when external
   * async search temporarily removes those options from the supplied list.
   *
   * This is React state rather than a ref because selected labels/chips are
   * part of render semantics and must remain React-visible.
   */
  const [selectedOptionCache, setSelectedOptionCache] = useState(
    () => new Map<TSelectValue, TSelectOption>(),
  );

  // ─── Availability ────────────────────────────────────────────────────────

  const resolvedDisabled = disabled === true;

  const isInteractionDisabled = resolvedDisabled || !active;

  const hasError = error != null && error.length > 0;

  const [previousInteractionDisabled, setPreviousInteractionDisabled] =
    useState(isInteractionDisabled);

  if (previousInteractionDisabled !== isInteractionDisabled) {
    setPreviousInteractionDisabled(isInteractionDisabled);

    if (isInteractionDisabled) {
      setIsOpen(false);
      setSearchQuery("");
    }
  }

  // ─── Resolved tokens / props ─────────────────────────────────────────────

  const resolvedItemHeight = resolveNonNegativeMetric(
    itemHeight,
    tokens.sizings.select.itemHeight,
  );

  const minimumVisibleItems = searchable || onSearchAsync ? 2 : 1;

  const resolvedMaxVisibleItems = Math.max(
    minimumVisibleItems,
    resolvePositiveInteger(
      maxVisibleItems,
      tokens.sizings.select.maxVisibleItems,
    ),
  );

  const resolvedMaxChipsVisible = resolveNonNegativeInteger(
    maxChipsVisible,
    tokens.sizings.select.maxChipsVisible,
  );

  const resolvedMaxSelect =
    maxSelect === undefined || !isNonNegativeFiniteNumber(maxSelect)
      ? undefined
      : Math.floor(maxSelect);

  const resolvedSearchDebounce = resolveNonNegativeMetric(searchDebounce, 300);

  const resolvedEmptyLabel = emptyLabel ?? strings.selectEmptyLabel;

  const resolvedSearchPlaceholder =
    searchPlaceholder ?? strings.selectSearchPlaceholder;

  if (
    __DEV__ &&
    itemHeight !== undefined &&
    !isNonNegativeFiniteNumber(itemHeight)
  ) {
    console.error(
      errors.prop(
        "Select",
        "itemHeight",
        "Expected a finite non-negative number. Falling back to tokens.sizings.select.itemHeight.",
      ),
    );
  }

  if (
    __DEV__ &&
    maxVisibleItems !== undefined &&
    (!Number.isFinite(maxVisibleItems) || maxVisibleItems < minimumVisibleItems)
  ) {
    console.error(
      `[react-native-arc-ui] Select: maxVisibleItems must be a finite number >= ${minimumVisibleItems} for the current search configuration. Falling back to a safe value.`,
    );
  }

  if (
    __DEV__ &&
    maxChipsVisible !== undefined &&
    (!Number.isFinite(maxChipsVisible) || maxChipsVisible < 0)
  ) {
    console.error(
      "[react-native-arc-ui] Select: maxChipsVisible must be a non-negative finite number. Falling back to tokens.sizings.select.maxChipsVisible.",
    );
  }

  if (
    __DEV__ &&
    maxSelect !== undefined &&
    (!Number.isFinite(maxSelect) || maxSelect < 0)
  ) {
    console.error(
      "[react-native-arc-ui] Select: maxSelect must be a non-negative finite number. The invalid limit was ignored.",
    );
  }

  if (__DEV__ && (!Number.isFinite(searchDebounce) || searchDebounce < 0)) {
    console.error(
      "[react-native-arc-ui] Select: searchDebounce must be a non-negative finite number. Falling back to 300ms.",
    );
  }

  const animationConfig = useMemo(
    () => resolveAnimation(tokens.selectAnimations, tokens.animations),
    [tokens.selectAnimations, tokens.animations],
  );

  const chipLayoutTransition = useMemo(
    () =>
      prefersReducedMotion
        ? undefined
        : LinearTransition.duration(animationConfig.duration).easing(
            animationConfig.easing,
          ),
    [prefersReducedMotion, animationConfig.duration, animationConfig.easing],
  );

  // ─── Static geometry token extraction ────────────────────────────────────

  const selectBorderWidth = tokens.border.select;

  const selectRadius = tokens.radius.select;

  const contentGap = tokens.sizings.select.contentGap;

  const triggerMinHeight = tokens.sizings.select.triggerMinHeight;

  const triggerPaddingHorizontal =
    tokens.sizings.select.triggerPaddingHorizontal;

  const triggerPaddingVertical = tokens.sizings.select.triggerPaddingVertical;

  const triggerGap = tokens.sizings.select.triggerGap;

  const listPaddingVertical = tokens.sizings.select.listPaddingVertical;

  const searchPaddingHorizontal = tokens.sizings.select.searchPaddingHorizontal;

  const searchGap = tokens.sizings.select.searchGap;

  const groupHeaderPaddingHorizontal =
    tokens.sizings.select.groupHeaderPaddingHorizontal;

  /**
   * Track the non-particle vertical geometry separately.
   *
   * Particle heights intentionally follow ARCUI fontScale.
   * Border/padding remain physical Select chrome.
   */
  const listChromeHeight = selectBorderWidth * 2 + listPaddingVertical * 2;

  // ─── Derived option data ─────────────────────────────────────────────────

  const filteredOptions = useMemo(() => {
    if (!searchQuery || onSearchAsync) {
      return options;
    }

    const normalizedQuery = searchQuery.toLowerCase();

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [options, searchQuery, onSearchAsync]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, TSelectOption[]>();

    const ungrouped: TSelectOption[] = [];

    filteredOptions.forEach((option) => {
      if (!option.group) {
        ungrouped.push(option);

        return;
      }

      const groupOptions = groups.get(option.group);

      if (groupOptions) {
        groupOptions.push(option);

        return;
      }

      groups.set(option.group, [option]);
    });

    return {
      groups,
      ungrouped,
    };
  }, [filteredOptions]);

  /**
   * Every visible structural row occupies exactly one
   * resolvedItemHeight particle before font scaling.
   *
   * Search:
   * +1
   *
   * Option:
   * +1
   *
   * Group:
   * +1 header
   * +N options
   *
   * Empty:
   * +1
   */
  const totalParticles = useMemo(() => {
    let count = searchable || onSearchAsync ? 1 : 0;

    count += groupedItems.ungrouped.length;

    groupedItems.groups.forEach((groupOptions) => {
      count += 1 + groupOptions.length;
    });

    if (filteredOptions.length === 0) {
      const minimumCount = searchable || onSearchAsync ? 2 : 1;

      count = Math.max(count, minimumCount);
    }

    return count;
  }, [searchable, onSearchAsync, groupedItems, filteredOptions.length]);

  const visibleParticleCount = Math.min(
    totalParticles,
    resolvedMaxVisibleItems,
  );

  const selectedValues = multiple
    ? (values ?? [])
    : value != null
      ? [value]
      : [];

  /**
   * Controlled async Selects may replace `options` with the current remote
   * result set. Preserve metadata only for values that are still selected.
   *
   * Selection handlers cache newly requested selections before invoking the
   * consumer callback, so metadata survives an options replacement occurring
   * in the same interaction lifecycle.
   *
   * Conditional render-time adjustment avoids ref reads during render and
   * avoids effect-driven state synchronization under React 19.
   */
  const nextSelectedOptionCache = new Map<TSelectValue, TSelectOption>();

  selectedValues.forEach((selectedValue) => {
    const currentOption = options.find(
      (option) => option.value === selectedValue,
    );

    const cachedOption = selectedOptionCache.get(selectedValue);

    const resolvedOption = currentOption ?? cachedOption;

    if (resolvedOption) {
      nextSelectedOptionCache.set(selectedValue, resolvedOption);
    }
  });

  const selectedOptionCacheChanged =
    nextSelectedOptionCache.size !== selectedOptionCache.size ||
    Array.from(nextSelectedOptionCache.entries()).some(
      ([selectedValue, option]) => {
        const cachedOption = selectedOptionCache.get(selectedValue);

        return !cachedOption || !areSelectOptionsEqual(cachedOption, option);
      },
    );

  if (selectedOptionCacheChanged) {
    setSelectedOptionCache(nextSelectedOptionCache);
  }

  const selectedOptions = useMemo(() => {
    if (!multiple) {
      return [];
    }

    return (values ?? [])
      .map(
        (selectedValue) =>
          options.find((option) => option.value === selectedValue) ??
          selectedOptionCache.get(selectedValue),
      )
      .filter((option): option is TSelectOption => option !== undefined);
  }, [multiple, values, options, selectedOptionCache]);

  const selectedLabel = useMemo(() => {
    if (multiple || value == null) {
      return "";
    }

    const selectedOption =
      options.find((option) => option.value === value) ??
      selectedOptionCache.get(value);

    return selectedOption?.label ?? "";
  }, [multiple, value, options, selectedOptionCache]);

  const visibleChips = selectedOptions.slice(0, resolvedMaxChipsVisible);

  const hiddenCount = selectedOptions.length - visibleChips.length;

  const hasValue = multiple ? (values ?? []).length > 0 : value != null;

  const isSelectionLimitReached =
    multiple &&
    resolvedMaxSelect != null &&
    (values ?? []).length >= resolvedMaxSelect;

  const selectedAccessibilityText = useMemo(() => {
    if (multiple) {
      return selectedOptions.map((option) => option.label).join(", ");
    }

    return selectedLabel;
  }, [multiple, selectedOptions, selectedLabel]);

  const resolvedTriggerAccessibilityValue = hasValue
    ? {
        text: selectedAccessibilityText,
      }
    : placeholder && (accessibilityLabel != null || label != null)
      ? {
          text: placeholder,
        }
      : undefined;

  const resolvedTriggerAccessibilityLabel =
    accessibilityLabel ?? label ?? placeholder;

  // ─── Debounce lifecycle ──────────────────────────────────────────────────

  const clearSearchDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);

      debounceRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearSearchDebounce();
    };
  }, [clearSearchDebounce, onSearchAsync, resolvedSearchDebounce]);

  // ─── Open / close ────────────────────────────────────────────────────────

  const resetAsyncSearch = useCallback(() => {
    if (!onSearchAsync || lastAsyncQueryRef.current === "") {
      return;
    }

    lastAsyncQueryRef.current = "";

    onSearchAsync("");
  }, [onSearchAsync]);

  const handleClose = useCallback(() => {
    clearSearchDebounce();
    resetAsyncSearch();

    searchInputRef.current?.blur();

    setIsOpen(false);

    setSearchQuery("");
  }, [clearSearchDebounce, resetAsyncSearch]);

  const handleToggle = useCallback(() => {
    if (isInteractionDisabled) {
      return;
    }

    if (isOpen) {
      handleClose();

      return;
    }

    setIsOpen(true);
  }, [isInteractionDisabled, isOpen, handleClose]);

  /**
   * Android Back belongs to an open Select before navigation underneath it.
   *
   * Search keyboard dismissal remains native behavior; once the back event
   * reaches ARCUI, Select closes and consumes it.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();

      return true;
    });

    return () => {
      handler.remove();
    };
  }, [isOpen, handleClose]);

  /**
   * A Select that becomes unavailable while open must close
   * immediately from the semantic/interaction perspective.
   *
   * Its visual close transition is still handled by openProgress.
   */
  useEffect(() => {
    if (!isInteractionDisabled) {
      return;
    }

    clearSearchDebounce();
    resetAsyncSearch();

    searchInputRef.current?.blur();
  }, [isInteractionDisabled, clearSearchDebounce, resetAsyncSearch]);

  // ─── Selection handlers ──────────────────────────────────────────────────

  const handleSelectOption = useCallback(
    (option: TSelectOption) => {
      if (isInteractionDisabled) {
        return;
      }

      const optionValue = option.value;

      if (multiple) {
        const current = valuesRef.current ?? [];

        const isSelected = current.includes(optionValue);

        if (isSelected) {
          if (!onValuesChange) {
            return;
          }

          onValuesChange(
            current.filter((currentValue) => currentValue !== optionValue),
          );

          return;
        }

        if (resolvedMaxSelect != null && current.length >= resolvedMaxSelect) {
          return;
        }

        if (!onValuesChange) {
          return;
        }

        setSelectedOptionCache((currentCache) => {
          const nextCache = new Map(currentCache);

          nextCache.set(optionValue, option);

          return nextCache;
        });

        onValuesChange([...current, optionValue]);

        return;
      }

      if (onValueChange) {
        const nextValue = valueRef.current === optionValue ? null : optionValue;

        if (nextValue != null) {
          setSelectedOptionCache((currentCache) => {
            const nextCache = new Map(currentCache);

            nextCache.set(optionValue, option);

            return nextCache;
          });
        }

        onValueChange(nextValue);
      }

      handleClose();
    },
    [
      multiple,
      resolvedMaxSelect,
      onValueChange,
      onValuesChange,
      handleClose,
      isInteractionDisabled,
    ],
  );

  const handleChipRemove = useCallback(
    (optionValue: TSelectValue) => {
      if (isInteractionDisabled) {
        return;
      }

      const option =
        options.find((candidate) => candidate.value === optionValue) ??
        selectedOptionCache.get(optionValue);

      if (option?.disabled === true) {
        return;
      }

      if (!onValuesChange) {
        return;
      }

      onValuesChange(
        (valuesRef.current ?? []).filter(
          (currentValue) => currentValue !== optionValue,
        ),
      );
    },
    [isInteractionDisabled, onValuesChange, options, selectedOptionCache],
  );

  // ─── Search ──────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      if (!onSearchAsync) {
        return;
      }

      clearSearchDebounce();

      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;

        lastAsyncQueryRef.current = text;

        onSearchAsync(text);
      }, resolvedSearchDebounce);
    },
    [onSearchAsync, resolvedSearchDebounce, clearSearchDebounce],
  );

  // ─── Shared visual progress ───────────────────────────────────────────────

  const openProgress = useSharedValue(isOpen ? 1 : 0);

  const disabledProgress = useSharedValue(resolvedDisabled ? 1 : 0);

  const inactiveProgress = useSharedValue(active ? 0 : 1);

  const errorProgress = useSharedValue(hasError ? 1 : 0);

  const listParticleCount = useSharedValue(visibleParticleCount);

  // ─── Open motion ─────────────────────────────────────────────────────────

  useEffect(() => {
    cancelAnimation(openProgress);

    const target = isOpen ? 1 : 0;

    if (prefersReducedMotion) {
      openProgress.value = target;

      return;
    }

    openProgress.value = withTiming(target, animationConfig);
  }, [isOpen, prefersReducedMotion, animationConfig, openProgress]);

  // ─── Modifier motion ─────────────────────────────────────────────────────

  /**
   * Independent dimensions prevent transitions from travelling through
   * unrelated semantic states.
   *
   * Visual priority is resolved later as:
   *
   * disabled
   * ↓
   * inactive
   * ↓
   * error
   * ↓
   * open
   * ↓
   * normal
   */
  useEffect(() => {
    const disabledTarget = resolvedDisabled ? 1 : 0;

    const inactiveTarget = active ? 0 : 1;

    const errorTarget = hasError ? 1 : 0;

    cancelAnimation(disabledProgress);

    cancelAnimation(inactiveProgress);

    cancelAnimation(errorProgress);

    if (prefersReducedMotion) {
      disabledProgress.value = disabledTarget;

      inactiveProgress.value = inactiveTarget;

      errorProgress.value = errorTarget;

      return;
    }

    disabledProgress.value = withTiming(disabledTarget, animationConfig);

    inactiveProgress.value = withTiming(inactiveTarget, animationConfig);

    errorProgress.value = withTiming(errorTarget, animationConfig);
  }, [
    resolvedDisabled,
    active,
    hasError,
    prefersReducedMotion,
    animationConfig,
    disabledProgress,
    inactiveProgress,
    errorProgress,
  ]);

  // ─── Particle-count motion ────────────────────────────────────────────────

  /**
   * While closed, keep the particle count synchronized immediately.
   *
   * While open, option/search-result count changes animate smoothly.
   */
  useEffect(() => {
    cancelAnimation(listParticleCount);

    if (!isOpen || prefersReducedMotion) {
      listParticleCount.value = visibleParticleCount;

      return;
    }

    listParticleCount.value = withTiming(visibleParticleCount, animationConfig);
  }, [
    visibleParticleCount,
    isOpen,
    prefersReducedMotion,
    animationConfig,
    listParticleCount,
  ]);

  // ─── Theme token extraction ──────────────────────────────────────────────

  const lightBorderNormal = tokens.colors.light.select.border.primary;

  const darkBorderNormal = tokens.colors.dark.select.border.primary;

  const lightBorderOpen = tokens.colors.light.select.border.focused;

  const darkBorderOpen = tokens.colors.dark.select.border.focused;

  const lightBorderDisabled = tokens.colors.light.select.border.disabled;

  const darkBorderDisabled = tokens.colors.dark.select.border.disabled;

  const lightBorderError = tokens.colors.light.select.border.error;

  const darkBorderError = tokens.colors.dark.select.border.error;

  const lightBorderInactive = tokens.colors.light.select.border.inactive;

  const darkBorderInactive = tokens.colors.dark.select.border.inactive;

  const lightBackground = tokens.colors.light.select.background.primary;

  const darkBackground = tokens.colors.dark.select.background.primary;

  const lightBackgroundDisabled =
    tokens.colors.light.select.background.disabled;

  const darkBackgroundDisabled = tokens.colors.dark.select.background.disabled;

  const lightLabel = tokens.colors.light.select.label.primary;

  const darkLabel = tokens.colors.dark.select.label.primary;

  const lightLabelDisabled = tokens.colors.light.select.label.disabled;

  const darkLabelDisabled = tokens.colors.dark.select.label.disabled;

  const lightText = tokens.colors.light.select.text.primary;

  const darkText = tokens.colors.dark.select.text.primary;

  const lightPlaceholder = tokens.colors.light.select.text.placeholder;

  const darkPlaceholder = tokens.colors.dark.select.text.placeholder;

  const lightTextDisabled = tokens.colors.light.select.text.disabled;

  const darkTextDisabled = tokens.colors.dark.select.text.disabled;

  const lightIcon = tokens.colors.light.select.icon.primary;

  const darkIcon = tokens.colors.dark.select.icon.primary;

  const lightIconDisabled = tokens.colors.light.select.icon.disabled;

  const darkIconDisabled = tokens.colors.dark.select.icon.disabled;

  const lightError = tokens.colors.light.select.error;

  const darkError = tokens.colors.dark.select.error;

  const lightListBackground = tokens.colors.light.select.background.primary;

  const darkListBackground = tokens.colors.dark.select.background.primary;

  const lightListBorder = tokens.colors.light.select.border.primary;

  const darkListBorder = tokens.colors.dark.select.border.primary;

  const lightSearchText = tokens.colors.light.select.search.text;

  const darkSearchText = tokens.colors.dark.select.search.text;

  const lightSearchPlaceholder = tokens.colors.light.select.search.placeholder;

  const darkSearchPlaceholder = tokens.colors.dark.select.search.placeholder;

  const lightEmptyState = tokens.colors.light.select.emptyState;

  const darkEmptyState = tokens.colors.dark.select.emptyState;

  const lightGroupHeader = tokens.colors.light.select.text.placeholder;

  const darkGroupHeader = tokens.colors.dark.select.text.placeholder;

  const lightSearchIcon = tokens.colors.light.select.search.icon;

  const darkSearchIcon = tokens.colors.dark.select.search.icon;

  const lightLoading = tokens.colors.light.select.loading;

  const darkLoading = tokens.colors.dark.select.loading;

  const resolvedLightIcon = resolvedDisabled ? lightIconDisabled : lightIcon;

  const resolvedDarkIcon = resolvedDisabled ? darkIconDisabled : darkIcon;

  // ─── Trigger colors ──────────────────────────────────────────────────────

  const triggerColors = useDerivedValue(() => {
    const lightOpenBorder = interpolateColor(
      openProgress.value,
      [0, 1],
      [lightBorderNormal, lightBorderOpen],
    );

    const lightErrorResolved = interpolateColor(
      errorProgress.value,
      [0, 1],
      [lightOpenBorder, lightBorderError],
    );

    const lightInactiveResolved = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [lightErrorResolved, lightBorderInactive],
    );

    const lightBorder = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightInactiveResolved, lightBorderDisabled],
    );

    const darkOpenBorder = interpolateColor(
      openProgress.value,
      [0, 1],
      [darkBorderNormal, darkBorderOpen],
    );

    const darkErrorResolved = interpolateColor(
      errorProgress.value,
      [0, 1],
      [darkOpenBorder, darkBorderError],
    );

    const darkInactiveResolved = interpolateColor(
      inactiveProgress.value,
      [0, 1],
      [darkErrorResolved, darkBorderInactive],
    );

    const darkBorder = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkInactiveResolved, darkBorderDisabled],
    );

    const lightResolvedBackground = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightBackground, lightBackgroundDisabled],
    );

    const darkResolvedBackground = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkBackground, darkBackgroundDisabled],
    );

    return {
      border: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkBorder, lightBorder],
      ),

      background: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkResolvedBackground, lightResolvedBackground],
      ),
    };
  });

  // ─── Text / icon colors ──────────────────────────────────────────────────

  const textColors = useDerivedValue(() => {
    const lightResolvedLabel = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightLabel, lightLabelDisabled],
    );

    const darkResolvedLabel = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkLabel, darkLabelDisabled],
    );

    const lightResolvedText = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightText, lightTextDisabled],
    );

    const darkResolvedText = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkText, darkTextDisabled],
    );

    const lightResolvedPlaceholder = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [lightPlaceholder, lightTextDisabled],
    );

    const darkResolvedPlaceholder = interpolateColor(
      disabledProgress.value,
      [0, 1],
      [darkPlaceholder, darkTextDisabled],
    );

    return {
      label: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkResolvedLabel, lightResolvedLabel],
      ),

      value: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkResolvedText, lightResolvedText],
      ),

      placeholder: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkResolvedPlaceholder, lightResolvedPlaceholder],
      ),

      error: interpolateColor(
        themeProgress.value,
        [0, 1],
        [darkError, lightError],
      ),
    };
  });

  // ─── List colors ─────────────────────────────────────────────────────────

  const listColors = useDerivedValue(() => ({
    background: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkListBackground, lightListBackground],
    ),

    border: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkListBorder, lightListBorder],
    ),

    searchText: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkSearchText, lightSearchText],
    ),

    searchPlaceholder: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkSearchPlaceholder, lightSearchPlaceholder],
    ),

    emptyState: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkEmptyState, lightEmptyState],
    ),

    groupHeader: interpolateColor(
      themeProgress.value,
      [0, 1],
      [darkGroupHeader, lightGroupHeader],
    ),
  }));

  // ─── Typography extraction ───────────────────────────────────────────────

  const labelFontSize = tokens.typography.select.label.fontSize;

  const valueFontSize = tokens.typography.select.value.fontSize;

  const errorFontSize = tokens.typography.select.error.fontSize;

  const searchFontSize = tokens.typography.select.search.fontSize;

  const emptyFontSize = tokens.typography.select.empty.fontSize;

  const labelTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.select.label).style,
    [tokens.typography.select.label],
  );

  const valueTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.select.value).style,
    [tokens.typography.select.value],
  );

  const errorTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.select.error).style,
    [tokens.typography.select.error],
  );

  const searchTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.select.search).style,
    [tokens.typography.select.search],
  );

  const emptyTypographyStyle = useMemo(
    () => resolveTypographyStyle(tokens.typography.select.empty).style,
    [tokens.typography.select.empty],
  );

  // ─── Static token styles ─────────────────────────────────────────────────

  const containerTokenStyle = useMemo<ViewStyle>(
    () => ({
      gap: contentGap,
    }),
    [contentGap],
  );

  const triggerTokenStyle = useMemo<ViewStyle>(
    () => ({
      minHeight: triggerMinHeight,

      paddingHorizontal: triggerPaddingHorizontal,

      paddingVertical: triggerPaddingVertical,

      gap: triggerGap,

      borderWidth: selectBorderWidth,

      borderRadius: selectRadius,
    }),
    [
      triggerMinHeight,
      triggerPaddingHorizontal,
      triggerPaddingVertical,
      triggerGap,
      selectBorderWidth,
      selectRadius,
    ],
  );

  const chipsRowTokenStyle = useMemo<ViewStyle>(
    () => ({
      gap: contentGap,
    }),
    [contentGap],
  );

  const selectChipTokenStyle = useMemo<ViewStyle>(
    () => ({
      paddingVertical: tokens.sizings.select.chipPaddingVertical,

      paddingHorizontal: tokens.sizings.select.chipPaddingHorizontal,
    }),
    [
      tokens.sizings.select.chipPaddingVertical,
      tokens.sizings.select.chipPaddingHorizontal,
    ],
  );

  const listTokenStyle = useMemo<ViewStyle>(
    () => ({
      borderWidth: selectBorderWidth,

      borderRadius: selectRadius,

      paddingVertical: listPaddingVertical,
    }),
    [selectBorderWidth, selectRadius, listPaddingVertical],
  );

  const searchRowTokenStyle = useMemo<ViewStyle>(
    () => ({
      paddingHorizontal: searchPaddingHorizontal,

      gap: searchGap,
    }),
    [searchPaddingHorizontal, searchGap],
  );

  const groupHeaderTokenStyle = useMemo<ViewStyle>(
    () => ({
      paddingHorizontal: groupHeaderPaddingHorizontal,
    }),
    [groupHeaderPaddingHorizontal],
  );

  const errorRowTokenStyle = useMemo<ViewStyle>(
    () => ({
      gap: tokens.spacing.xxs,
    }),
    [tokens.spacing.xxs],
  );

  // ─── Animated trigger styles ─────────────────────────────────────────────

  const animatedTriggerStyle = useAnimatedStyle(() => ({
    borderColor: triggerColors.value.border,

    backgroundColor: triggerColors.value.background,
  }));

  // ─── Animated typography ─────────────────────────────────────────────────

  const labelLineHeight = tokens.typography.select.label.lineHeight;

  const animatedLabelSizeStyle = useAnimatedStyle(() => ({
    fontSize: labelFontSize * fontScale.value,

    lineHeight:
      labelLineHeight != null ? labelLineHeight * fontScale.value : undefined,
  }));

  const animatedLabelColorStyle = useAnimatedStyle(() => ({
    color: textColors.value.label,
  }));

  const valueLineHeight = tokens.typography.select.value.lineHeight;

  const animatedValueSizeStyle = useAnimatedStyle(() => ({
    fontSize: valueFontSize * fontScale.value,

    lineHeight:
      valueLineHeight != null ? valueLineHeight * fontScale.value : undefined,
  }));

  const animatedValueColorStyle = useAnimatedStyle(() => ({
    color: textColors.value.value,
  }));

  const animatedPlaceholderSizeStyle = useAnimatedStyle(() => ({
    fontSize: valueFontSize * fontScale.value,

    lineHeight:
      valueLineHeight != null ? valueLineHeight * fontScale.value : undefined,
  }));

  const animatedPlaceholderColorStyle = useAnimatedStyle(() => ({
    color: textColors.value.placeholder,
  }));

  const errorLineHeight = tokens.typography.select.error.lineHeight;

  const animatedErrorSizeStyle = useAnimatedStyle(() => ({
    fontSize: errorFontSize * fontScale.value,

    lineHeight:
      errorLineHeight != null ? errorLineHeight * fontScale.value : undefined,
  }));

  const animatedErrorColorStyle = useAnimatedStyle(() => ({
    color: textColors.value.error,
  }));

  const animatedGroupHeaderSizeStyle = useAnimatedStyle(() => ({
    fontSize: labelFontSize * fontScale.value,

    lineHeight:
      labelLineHeight != null ? labelLineHeight * fontScale.value : undefined,
  }));

  const animatedGroupHeaderColorStyle = useAnimatedStyle(() => ({
    color: listColors.value.groupHeader,
  }));

  const emptyLineHeight = tokens.typography.select.empty.lineHeight;

  const animatedEmptySizeStyle = useAnimatedStyle(() => ({
    fontSize: emptyFontSize * fontScale.value,

    lineHeight:
      emptyLineHeight != null ? emptyLineHeight * fontScale.value : undefined,
  }));

  const animatedEmptyColorStyle = useAnimatedStyle(() => ({
    color: listColors.value.emptyState,
  }));

  const searchLineHeight = tokens.typography.select.search.lineHeight;

  const animatedSearchSizeStyle = useAnimatedStyle(() => ({
    fontSize: searchFontSize * fontScale.value,

    lineHeight:
      searchLineHeight != null ? searchLineHeight * fontScale.value : undefined,
  }));

  const animatedSearchColorStyle = useAnimatedStyle(() => ({
    color: listColors.value.searchText,
  }));

  const animatedSearchProps = useAnimatedProps(() => ({
    placeholderTextColor: listColors.value.searchPlaceholder,
  }));

  // ─── Chevron ─────────────────────────────────────────────────────────────

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${openProgress.value * 180}deg`,
      },
    ],
  }));

  // ─── Particle / list geometry ────────────────────────────────────────────

  const animatedParticleHeightStyle = useAnimatedStyle(() => ({
    height: resolvedItemHeight * fontScale.value,
  }));

  /**
   * Important:
   *
   * listParticleCount and openProgress are UI-thread SharedValues,
   * while fontScale is the central ARCUI SharedValue.
   *
   * This keeps:
   *
   * - open / close animation;
   * - dynamic search-result height changes;
   * - runtime fontScale changes;
   *
   * on one coherent geometry path.
   */
  const animatedListContainerStyle = useAnimatedStyle(() => {
    const particleHeight = resolvedItemHeight * fontScale.value;

    const expandedHeight =
      listParticleCount.value * particleHeight + listChromeHeight;

    return {
      height: openProgress.value * expandedHeight,

      overflow: "hidden",
    };
  });

  const animatedListStyle = useAnimatedStyle(() => ({
    backgroundColor: listColors.value.background,

    borderColor: listColors.value.border,
  }));

  /**
   * TypeScript models Select ownership as a discriminated controlled union.
   *
   * Runtime validation keeps the same invariant explicit for JavaScript
   * consumers and malformed dynamic props.
   */
  if (multiple) {
    if (values === undefined) {
      throw new Error(
        '[react-native-arc-ui] Select multiple={true} requires "values".',
      );
    }

    if (value !== undefined) {
      throw new Error(
        '[react-native-arc-ui] Select multiple={true} must not receive "value".',
      );
    }
  } else {
    if (value === undefined) {
      throw new Error(
        '[react-native-arc-ui] Select single-selection mode requires "value". Use null when nothing is selected.',
      );
    }

    if (values !== undefined) {
      throw new Error(
        '[react-native-arc-ui] Select single-selection mode must not receive "values".',
      );
    }
  }

  return (
    <View style={[styles.container, containerTokenStyle, style]}>
      {/* Label */}

      {label && (
        <Animated.Text
          testID={testID ? `${testID}-label` : undefined}
          allowFontScaling={false}
          maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
          style={[
            styles.label,
            labelTypographyStyle,
            animatedLabelSizeStyle,
            animatedLabelColorStyle,
          ]}
          numberOfLines={1}
          accessible={false}
        >
          {label}
        </Animated.Text>
      )}

      {/* Trigger */}

      <Pressable
        testID={testID}
        onPress={handleToggle}
        disabled={isInteractionDisabled}
        role="combobox"
        accessibilityRole="combobox"
        accessibilityLabel={resolvedTriggerAccessibilityLabel}
        accessibilityHint={accessibilityHint}
        aria-expanded={isOpen}
        aria-disabled={isInteractionDisabled}
        accessibilityState={{
          expanded: isOpen,

          disabled: isInteractionDisabled,
        }}
        accessibilityValue={resolvedTriggerAccessibilityValue}
      >
        <Animated.View
          style={[styles.trigger, triggerTokenStyle, animatedTriggerStyle]}
        >
          {multiple && hasValue ? (
            <Animated.View
              style={[styles.chipsRow, chipsRowTokenStyle]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {visibleChips.map((option) => (
                <Animated.View
                  key={option.value}
                  entering={entering}
                  layout={chipLayoutTransition}
                >
                  <Chip
                    type="border"
                    selected
                    showCheckOnSelected={false}
                    containerStyle={selectChipTokenStyle}
                    disabled={isInteractionDisabled || option.disabled === true}
                    testID={
                      testID ? `${testID}-chip-${option.value}` : undefined
                    }
                    onPress={() => handleChipRemove(option.value)}
                  >
                    {option.label}
                  </Chip>
                </Animated.View>
              ))}

              {hiddenCount > 0 && (
                <Animated.View
                  key="select-hidden-count"
                  entering={entering}
                  layout={chipLayoutTransition}
                >
                  <Chip
                    type="border"
                    containerStyle={selectChipTokenStyle}
                    disabled={isInteractionDisabled}
                  >
                    {`+${hiddenCount}`}
                  </Chip>
                </Animated.View>
              )}
            </Animated.View>
          ) : (
            <Animated.Text
              testID={
                hasValue
                  ? testID
                    ? `${testID}-value`
                    : undefined
                  : testID
                    ? `${testID}-placeholder`
                    : undefined
              }
              allowFontScaling={false}
              maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
              style={[
                styles.valueText,
                valueTypographyStyle,

                ...(hasValue
                  ? [animatedValueSizeStyle, animatedValueColorStyle]
                  : [
                      animatedPlaceholderSizeStyle,
                      animatedPlaceholderColorStyle,
                    ]),
              ]}
              numberOfLines={1}
            >
              {hasValue ? selectedLabel : (placeholder ?? "")}
            </Animated.Text>
          )}

          <Animated.View
            testID={testID ? `${testID}-chevron` : undefined}
            style={animatedChevronStyle}
            accessible={false}
          >
            <Icon
              type="chevronDown"
              size={tokens.sizings.icon.s}
              lightColor={resolvedLightIcon}
              darkColor={resolvedDarkIcon}
            />
          </Animated.View>
        </Animated.View>
      </Pressable>

      {/* List */}

      <Animated.View
        style={animatedListContainerStyle}
        pointerEvents={isOpen ? "auto" : "none"}
        accessibilityElementsHidden={!isOpen}
        importantForAccessibility={isOpen ? "auto" : "no-hide-descendants"}
      >
        <Animated.View
          testID={testID ? `${testID}-list` : undefined}
          style={[styles.list, listTokenStyle, animatedListStyle]}
          role="list"
          aria-busy={searchLoading}
          accessibilityState={{
            busy: searchLoading,
          }}
          onAccessibilityEscape={handleClose}
        >
          {/* Search row — 1 particle */}

          {(searchable || onSearchAsync) && (
            <Animated.View
              style={[
                styles.searchRow,
                searchRowTokenStyle,
                animatedParticleHeightStyle,
              ]}
            >
              <Icon
                type="search"
                size={tokens.sizings.icon.s}
                lightColor={lightSearchIcon}
                darkColor={darkSearchIcon}
              />

              <AnimatedTextInput
                ref={searchInputRef}
                testID={testID ? `${testID}-search` : undefined}
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder={resolvedSearchPlaceholder}
                animatedProps={animatedSearchProps}
                allowFontScaling={false}
                maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
                style={[
                  styles.searchInput,
                  searchTypographyStyle,
                  animatedSearchSizeStyle,
                  animatedSearchColorStyle,
                ]}
                role="searchbox"
                accessibilityRole="search"
                accessibilityLabel={
                  searchAccessibilityLabel ?? resolvedSearchPlaceholder
                }
                autoCorrect={false}
                autoCapitalize="none"
              />

              {searchLoading && (
                <SpinnerLoader
                  size={tokens.sizings.icon.s}
                  darkColor={darkLoading}
                  lightColor={lightLoading}
                />
              )}
            </Animated.View>
          )}

          {/* Options */}

          <ScrollView
            nestedScrollEnabled
            style={styles.optionsScroll}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredOptions.length === 0 ? (
              /* Empty — 1 particle */

              <Animated.View
                style={[styles.particleRow, animatedParticleHeightStyle]}
              >
                <Animated.Text
                  testID={testID ? `${testID}-empty` : undefined}
                  allowFontScaling={false}
                  maxFontSizeMultiplier={
                    tokens.typography.maxFontSizeMultiplier
                  }
                  style={[
                    styles.emptyText,
                    emptyTypographyStyle,
                    animatedEmptySizeStyle,
                    animatedEmptyColorStyle,
                  ]}
                >
                  {resolvedEmptyLabel}
                </Animated.Text>
              </Animated.View>
            ) : (
              <>
                {/* Ungrouped */}

                {groupedItems.ungrouped.map((option) => {
                  const isSelected = multiple
                    ? (values ?? []).includes(option.value)
                    : value === option.value;

                  return (
                    <SelectItem
                      key={option.value}
                      option={option}
                      isSelected={isSelected}
                      multiple={multiple}
                      itemHeight={resolvedItemHeight}
                      interactionDisabled={
                        isInteractionDisabled ||
                        (isSelectionLimitReached && !isSelected)
                      }
                      onPress={handleSelectOption}
                      testID={
                        testID ? `${testID}-item-${option.value}` : undefined
                      }
                    />
                  );
                })}

                {/* Groups */}

                {Array.from(groupedItems.groups.entries()).map(
                  ([groupName, groupOptions]) => (
                    <View key={groupName}>
                      <Animated.View
                        style={[
                          styles.groupHeaderRow,
                          groupHeaderTokenStyle,
                          animatedParticleHeightStyle,
                        ]}
                      >
                        <Animated.Text
                          allowFontScaling={false}
                          maxFontSizeMultiplier={
                            tokens.typography.maxFontSizeMultiplier
                          }
                          style={[
                            styles.groupHeader,
                            labelTypographyStyle,
                            animatedGroupHeaderSizeStyle,
                            animatedGroupHeaderColorStyle,
                          ]}
                          numberOfLines={1}
                        >
                          {groupName}
                        </Animated.Text>
                      </Animated.View>

                      {groupOptions.map((option) => {
                        const isSelected = multiple
                          ? (values ?? []).includes(option.value)
                          : value === option.value;

                        return (
                          <SelectItem
                            key={option.value}
                            option={option}
                            isSelected={isSelected}
                            multiple={multiple}
                            itemHeight={resolvedItemHeight}
                            interactionDisabled={
                              isInteractionDisabled ||
                              (isSelectionLimitReached && !isSelected)
                            }
                            onPress={handleSelectOption}
                            testID={
                              testID
                                ? `${testID}-item-${option.value}`
                                : undefined
                            }
                          />
                        );
                      })}
                    </View>
                  ),
                )}
              </>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>

      {/* Error */}

      {hasError && (
        <Animated.View
          testID={testID ? `${testID}-error-row` : undefined}
          style={[styles.errorRow, errorRowTokenStyle]}
          entering={entering}
          exiting={exiting}
          accessible
          role="alert"
          accessibilityRole="alert"
          accessibilityLabel={error}
          accessibilityLiveRegion="polite"
        >
          <Icon
            type="alertCircle"
            size={tokens.sizings.icon.s}
            lightColor={lightError}
            darkColor={darkError}
          />

          <Animated.Text
            testID={testID ? `${testID}-error` : undefined}
            allowFontScaling={false}
            maxFontSizeMultiplier={tokens.typography.maxFontSizeMultiplier}
            style={[
              styles.errorText,
              errorTypographyStyle,
              animatedErrorSizeStyle,
              animatedErrorColorStyle,
            ]}
            accessible={false}
          >
            {error}
          </Animated.Text>
        </Animated.View>
      )}
    </View>
  );
};

export const Select = memo(SelectComponent);

Select.displayName = "Select";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  label: {
    flexShrink: 1,
  },

  trigger: {
    flexDirection: "row",

    alignItems: "center",
  },

  chipsRow: {
    flex: 1,

    flexDirection: "row",

    flexWrap: "wrap",
  },

  valueText: {
    flex: 1,
  },

  list: {
    flex: 1,

    overflow: "hidden",
  },

  searchRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  searchInput: {
    flex: 1,

    padding: 0,

    margin: 0,
  },

  particleRow: {
    justifyContent: "center",
  },

  groupHeaderRow: {
    justifyContent: "center",
  },

  groupHeader: {
    opacity: 0.6,
  },

  emptyText: {
    textAlign: "center",
  },

  errorRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  errorText: {
    flex: 1,
  },

  optionsScroll: {
    flex: 1,
  },
});
