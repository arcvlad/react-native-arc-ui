export type TAnimationDirection =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right";

export type TEasing =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic";

export type TPressAnimation = "scaleUp" | "scaleDown" | "highlight" | "none";

export const animationDefaultProps: {
  duration: number;
  easing: TEasing;
  enterDuration: number;
  exitDuration: number;
  enterEasing: TEasing;
  exitEasing: TEasing;
} = {
  duration: 300,
  easing: "easeInOut",
  enterDuration: 200,
  exitDuration: 150,
  enterEasing: "easeOutCubic",
  exitEasing: "easeInCubic",
};

export const pressAnimationDefaultProps: {
  type: TPressAnimation;
  duration: number;
  scaleUpValue: number;
  scaleDownValue: number;
} = {
  type: "highlight",
  duration: 100,
  scaleUpValue: 1.035,
  scaleDownValue: 0.965,
};

// Used only for gesture-based animations: Modal snap, Slider snap
export const springConfigDefaultProps: {
  damping: number;
  stiffness: number;
  mass: number;
} = {
  damping: 20,
  stiffness: 200,
  mass: 1,
};

// undefined values fall back to animationDefaultProps
export const enteringExitingDefaultProps: {
  enabled: boolean;
  enterDuration?: number;
  exitDuration?: number;
  enterEasing?: TEasing;
  exitEasing?: TEasing;
} = {
  enabled: true,
};

// undefined values fall back to animationDefaultProps
export const dialogAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;
  entering: TAnimationDirection;
  exiting?: TAnimationDirection;
  distance: number;
} = {
  entering: "center",
  distance: 80,
};

// undefined values fall back to animationDefaultProps
export const accordionAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;
} = {};

// undefined values fall back to animationDefaultProps
export const infoboxAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;
} = {};

// undefined values fall back to animationDefaultProps
export const headerAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;
} = {};

// undefined values fall back to animationDefaultProps
export const fluidViewAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;
} = {};

export const modalAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;

  dismissThreshold: number;
  dismissVelocity: number;

  backdropTapMovementThreshold: number;
  panActivationOffsetY: number;
} = {
  dismissThreshold: 0.2,
  dismissVelocity: 500,

  backdropTapMovementThreshold: 10,
  panActivationOffsetY: 5,
};

// undefined values fall back to animationDefaultProps
export const selectAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;
} = {};

// undefined values fall back to animationDefaultProps
export const tabsAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;
} = {};

export const dropdownAnimationDefaultProps: {
  enterDuration?: number;
  exitDuration?: number;
  enterEasing?: TEasing;
  exitEasing?: TEasing;

  /**
   * Initial surface scale during normal enter motion.
   *
   * Reduced Motion ignores this value and keeps scale at 1.
   */
  scaleFrom: number;
} = {
  scaleFrom: 0.95,
};

// undefined values fall back to animationDefaultProps
export const progressBarAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;
} = {};

// undefined values fall back to animationDefaultProps
export const checkboxAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;
} = {};

// undefined values fall back to animationDefaultProps
export const radioAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;
} = {};

// undefined values fall back to animationDefaultProps
export const toggleAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;
} = {};

export const toastAnimationDefaultProps: {
  enterDuration?: number;
  exitDuration?: number;
  enterEasing?: TEasing;
  exitEasing?: TEasing;

  /**
   * Stack reflow while Toast entries are added, removed or resized.
   */
  layoutDuration?: number;
  layoutEasing?: TEasing;

  /**
   * Default time a Toast remains presented before requesting dismissal.
   */
  displayDuration: number;

  /**
   * Vertical enter/exit travel distance.
   */
  distance: number;

  /**
   * Default Toast screen edge.
   *
   * Individual Toast requests may override this through showToast().
   */
  placement: "top" | "bottom";
} = {
  enterDuration: 200,
  exitDuration: 180,
  enterEasing: "easeOutCubic",
  exitEasing: "easeInCubic",

  layoutDuration: 180,
  layoutEasing: "easeInOut",

  displayDuration: 3000,
  distance: 14,

  placement: "bottom",
};

export const skeletonAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;
  angle: number;
  shimmerWidthRatio: number;
} = {
  duration: 2000,
  easing: "linear",

  angle: 45,

  /**
   * Complete shimmer envelope relative to Skeleton width.
   *
   * 0    = hidden
   * 0.25 = 1/4 of Skeleton width
   * 0.5  = 1/2 of Skeleton width
   * 1    = full Skeleton width
   */
  shimmerWidthRatio: 0.75,
};

// undefined duration/easing fall back to animationDefaultProps
export const sliderAnimationDefaultProps: {
  duration?: number;
  easing?: TEasing;

  /**
   * Visual thumb scale while actively dragging.
   */
  thumbScale: number;

  /**
   * Initial tooltip scale before it becomes fully visible.
   */
  tooltipScaleFrom: number;
} = {
  duration: 150,

  thumbScale: 1.25,
  tooltipScaleFrom: 0.8,
};

export const spinnerLoaderAnimationDefaultProps: {
  duration: number;
  easing: TEasing;
} = {
  duration: 800,
  easing: "linear",
};
