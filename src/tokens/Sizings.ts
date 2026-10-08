import { Spacing } from "./Spacing";

export const Sizings = {
  icon: {
    xs: 16,
    s: 20,
    m: 24,
    l: 28,
    xl: 32,
    xxl: 36,
    strokeWidth: 1,
  },
  progressBar: {
    height: 6,
  },
  checkbox: {
    size: 20,
  },
  radio: {
    size: 20,
    dotSize: 16,
  },
  skeleton: {
    height: 20,
    size: 48,
  },
  header: {
    minHeight: 56,
    controlSize: 44,
    numberOfLines: 1,
  },
  tabs: {
    minTabWidth: 40,
    minTabHeight: 40,
    indicatorHeight: 2,
    numberOfLines: 1,

    segmentInset: 0,
    outerInset: 0,

    horizontalPadding: Spacing.m,
    verticalPadding: Spacing.s,

    iconSize: 20,
    iconGapHorizontal: Spacing.xs,
    iconGapVertical: Spacing.xxs,
    badgeInset: Spacing.xs,
  },
  badge: {
    dotSize: 8,
    labelMinSize: 16,
  },
  select: {
    maxVisibleItems: 5,
    itemHeight: 48,
    maxChipsVisible: 5,
    triggerMinHeight: 48,
    contentGap: 6,
    triggerPaddingHorizontal: Spacing.s,
    triggerPaddingVertical: Spacing.xs,
    triggerGap: Spacing.xs,
    listPaddingVertical: 2,
    searchPaddingHorizontal: Spacing.s,
    searchGap: Spacing.xs,
    groupHeaderPaddingHorizontal: Spacing.m,
    itemMarginVertical: 3,
    itemMarginHorizontal: Spacing.xxs,
    itemPaddingHorizontal: Spacing.s,
    itemGap: Spacing.s,
    checkSlotWidth: 20,
    chipPaddingVertical: Spacing.xxs,
    chipPaddingHorizontal: Spacing.xs,
  },
  input: {
    minHeight: 48,
  },
  inputArea: {
    minHeight: 80,
    maxHeight: 200,
  },
  inputOTP: {
    boxSize: 48,
  },
  slider: {
    trackHeight: 4,

    thumbSize: 24,
    thumbTouchSize: 44,

    tooltipWidth: 52,
    tooltipHeight: 32,
    tooltipGap: Spacing.xs,

    headerValueMinWidth: 32,

    contentGap: Spacing.s,
    errorGap: Spacing.xxs,
  },
  accordion: {
    headerMinHeight: 44,
    titleNumberOfLines: 0,
    subtitleNumberOfLines: 0,
  },
  dropdown: {
    minWidth: 180,
    itemMinHeight: 44,
    maxVisibleItems: 8,
    placementGap: Spacing.xxs,
    viewportInset: Spacing.xs,
    itemPaddingHorizontal: Spacing.m,
    itemPaddingVertical: Spacing.xs,
    itemGap: Spacing.s,
    separatorInset: Spacing.m,
    separatorThickness: 1,
  },
  modal: {
    handleWidth: 36,
    handleHeight: 4,
    stackOffset: Spacing.xl,

    titleNumberOfLines: 2,
    subtitleNumberOfLines: 2,
  },
  button: {
    minHeight: 44,
  },
  chip: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.s,
  },
  dialog: {
    maxWidth: 440,
    horizontalInset: Spacing.xl,

    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.xxl,

    contentGap: Spacing.xxl,
    mainContentGap: Spacing.m,
    actionsGap: Spacing.s,

    iconSize: 28,
  },
  divider: {
    thickness: 1,
    labelGap: Spacing.s,
  },
  inputNumber: {
    minHeight: 48,
    controlSize: 48,
  },
  toast: {
    /**
     * Maximum number of mounted Toasts on each screen edge independently.
     *
     * Top and bottom placements have separate capacity.
     *
     * When the limit is exceeded, the oldest Toast on that same placement
     * is removed first.
     */
    maxVisibleItemsPerPlacement: 5,

    /**
     * Internal Toast content spacing.
     */
    paddingVertical: 10,
    paddingHorizontal: Spacing.s,
    contentGap: Spacing.xs,

    /**
     * Fraction of each older Toast covered by the Toast in front of it.
     *
     * This controls only vertical stack geometry.
     *
     * 0    = no overlap; Toasts form a normal vertical list
     * 0.5  = 50% overlap
     * 0.75 = 75% overlap / 25% visible step
     * 1    = complete overlap
     *
     * This is independent from stackScaleStep. Toasts may overlap while
     * remaining full-size.
     */
    stackOverlap: 0,

    /**
     * Additional spacing between Toast stack levels.
     *
     * This distance is added after stackOverlap is applied.
     *
     * With stackOverlap = 0, this becomes the visible gap between
     * separate Toasts in a normal vertical list.
     *
     * With stackOverlap > 0, it increases the visible step between
     * overlapping Toasts.
     *
     * 0 = no additional spacing
     */
    stackGap: Spacing.xxs,

    /**
     * Scale reduction applied for each visual level behind the newest Toast.
     *
     * 0    = every Toast remains full-size
     * 0.02 = each older level is 2% smaller than the previous level
     *
     * Example with 0.02:
     * newest       = 1.00
     * one behind   = 0.98
     * two behind   = 0.96
     *
     * Final scale is never allowed below stackMinScale.
     */
    stackScaleStep: 0,

    /**
     * Minimum scale allowed for older Toasts in the stack.
     *
     * 1    = Toasts never become smaller
     * 0.92 = older Toasts may shrink down to 92% of full size
     *
     * Set stackScaleStep to 0 and stackMinScale to 1 when every Toast
     * should always remain full-width / full-size.
     */
    stackMinScale: 0.92,

    /**
     * Visual separator for Toasts behind the newest stack item.
     *
     * Rendered as an absolute overlay, so it does not affect measured height.
     *
     * Set to 0 to disable the stacked separator.
     */
    stackBorderWidth: 1,
  },

  toggle: {
    /**
     * Default track width.
     *
     * ARCUI default uses a 2:1 width-to-height ratio.
     */
    width: 40,

    /**
     * Default track height.
     */
    height: 20,

    /**
     * Circular thumb diameter.
     */
    thumbSize: 16,
  },
  spinnerLoader: {
    size: 24,
  },
};
