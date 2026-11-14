// ARCUI-owned colors use rgba(...) consistently for predictable Reanimated interpolation.

/**
 * Shared semantic primitives used by ARCUI's default component palettes.
 *
 * Components still expose explicit component-level color tokens. These
 * primitives keep the default info/success/warning/danger language aligned
 * without forcing consumers to style components through a global semantic
 * lookup at runtime.
 */
const SemanticLight = {
  info: {
    accent: "rgba(0,122,255,1)",
    surface: "rgba(232,242,255,1)",
    content: "rgba(0,64,135,1)",
    border: "rgba(0,122,255,0.45)",
  },
  success: {
    accent: "rgba(52,199,89,1)",
    surface: "rgba(232,247,236,1)",
    content: "rgba(23,92,41,1)",
    border: "rgba(52,199,89,0.45)",
  },
  warning: {
    accent: "rgba(255,204,0,1)",
    surface: "rgba(255,247,204,1)",
    content: "rgba(92,69,0,1)",
    border: "rgba(140,105,0,0.62)",
  },
  danger: {
    accent: "rgba(211, 47, 47, 1)",
    surface: "rgba(255,235,233,1)",
    content: "rgba(128,28,23,1)",
    border: "rgba(197,48,42,0.58)",
  },
} as const;

const SemanticDark = {
  info: {
    accent: "rgba(10,132,255,1)",
    surface: "rgba(18,42,66,1)",
    content: "rgba(151,204,255,1)",
    border: "rgba(10,132,255,0.65)",
  },
  success: {
    accent: "rgba(48,209,88,1)",
    surface: "rgba(20,55,30,1)",
    content: "rgba(166,238,183,1)",
    border: "rgba(48,209,88,0.65)",
  },
  warning: {
    accent: "rgba(255,214,10,1)",
    surface: "rgba(61,52,12,1)",
    content: "rgba(255,229,92,1)",
    border: "rgba(255,214,10,0.65)",
  },
  danger: {
    accent: "rgba(255,69,58,1)",
    surface: "rgba(64,25,22,1)",
    content: "rgba(255,180,175,1)",
    border: "rgba(255,69,58,0.65)",
  },
} as const;

export const ColorsLight = {
  background: {
    screen: "rgba(250,250,250,1)",
  },
  themedView: {
    background: "rgba(250,250,250,1)",
  },
  text: {
    primary: "rgba(17,17,17,1)",
  },
  button: {
    primary: {
      solid: {
        background: {
          primary: "rgba(17,17,17,1)",
          pressed: "rgba(51,51,51,1)",
          disabled: "rgba(207,207,207,1)",
          inactive: "rgba(136,136,136,1)",
        },
        border: {
          primary: "rgba(17,17,17,1)",
          pressed: "rgba(51,51,51,1)",
          disabled: "rgba(207,207,207,1)",
          inactive: "rgba(136,136,136,1)",
        },
        text: {
          primary: "rgba(250,250,250,1)",
          pressed: "rgba(250,250,250,1)",
          disabled: "rgba(250,250,250,1)",
          inactive: "rgba(250,250,250,1)",
        },
        loading: "rgba(250,250,250,1)",
      },
      border: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: "rgba(17,17,17,1)",
          pressed: "rgba(51,51,51,1)",
          disabled: "rgba(207,207,207,1)",
          inactive: "rgba(136,136,136,1)",
        },
        text: {
          primary: "rgba(17,17,17,1)",
          pressed: "rgba(51,51,51,1)",
          disabled: "rgba(207,207,207,1)",
          inactive: "rgba(136,136,136,1)",
        },
        loading: "rgba(17,17,17,1)",
      },
      transparent: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        text: {
          primary: "rgba(17,17,17,1)",
          pressed: "rgba(51,51,51,1)",
          disabled: "rgba(207,207,207,1)",
          inactive: "rgba(136,136,136,1)",
        },
        loading: "rgba(17,17,17,1)",
      },
    },

    secondary: {
      solid: {
        background: {
          primary: "rgba(214,231,252,1)",
          pressed: "rgba(196,220,247,1)",
          disabled: "rgba(238,238,238,1)",
          inactive: "rgba(224,230,236,1)",
        },
        border: {
          primary: "rgba(214,231,252,1)",
          pressed: "rgba(196,220,247,1)",
          disabled: "rgba(238,238,238,1)",
          inactive: "rgba(224,230,236,1)",
        },
        text: {
          primary: SemanticLight.info.content,
          pressed: SemanticLight.info.content,
          disabled: "rgba(153,153,153,1)",
          inactive: "rgba(107,123,140,1)",
        },
        loading: SemanticLight.info.content,
      },
      border: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: SemanticLight.info.accent,
          pressed: "rgba(0,95,204,1)",
          disabled: "rgba(207,207,207,1)",
          inactive: "rgba(112,151,194,1)",
        },
        text: {
          primary: SemanticLight.info.content,
          pressed: "rgba(0,77,163,1)",
          disabled: "rgba(153,153,153,1)",
          inactive: "rgba(107,123,140,1)",
        },
        loading: SemanticLight.info.content,
      },
      transparent: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        text: {
          primary: SemanticLight.info.content,
          pressed: "rgba(0,95,204,1)",
          disabled: "rgba(153,153,153,1)",
          inactive: "rgba(112,151,194,1)",
        },
        loading: SemanticLight.info.content,
      },
    },

    neutral: {
      solid: {
        background: {
          primary: "rgba(216,216,221,1)",
          pressed: "rgba(196,196,201,1)",
          disabled: "rgba(242,242,247,1)",
          inactive: "rgba(229,229,234,1)",
        },
        border: {
          primary: "rgba(216,216,221,1)",
          pressed: "rgba(196,196,201,1)",
          disabled: "rgba(242,242,247,1)",
          inactive: "rgba(229,229,234,1)",
        },
        text: {
          primary: "rgba(44,44,46,1)",
          pressed: "rgba(28,28,30,1)",
          disabled: "rgba(174,174,178,1)",
          inactive: "rgba(99,99,102,1)",
        },
        loading: "rgba(44,44,46,1)",
      },
      border: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: "rgba(85,85,90,1)",
          pressed: "rgba(58,58,60,1)",
          disabled: "rgba(174,174,178,1)",
          inactive: "rgba(136,136,136,1)",
        },
        text: {
          primary: "rgba(85,85,90,1)",
          pressed: "rgba(58,58,60,1)",
          disabled: "rgba(174,174,178,1)",
          inactive: "rgba(136,136,136,1)",
        },
        loading: "rgba(85,85,90,1)",
      },
      transparent: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        text: {
          primary: "rgba(85,85,90,1)",
          pressed: "rgba(58,58,60,1)",
          disabled: "rgba(174,174,178,1)",
          inactive: "rgba(136,136,136,1)",
        },
        loading: "rgba(85,85,90,1)",
      },
    },

    danger: {
      solid: {
        background: {
          primary: "rgba(197,48,42,1)",
          pressed: "rgba(166,40,35,1)",
          disabled: "rgba(232,207,205,1)",
          inactive: "rgba(185,112,108,1)",
        },
        border: {
          primary: "rgba(197,48,42,1)",
          pressed: "rgba(166,40,35,1)",
          disabled: "rgba(232,207,205,1)",
          inactive: "rgba(185,112,108,1)",
        },
        text: {
          primary: "rgba(255,255,255,1)",
          pressed: "rgba(255,255,255,1)",
          disabled: "rgba(255,255,255,1)",
          inactive: "rgba(255,255,255,1)",
        },
        loading: "rgba(255,255,255,1)",
      },
      border: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: "rgba(197,48,42,1)",
          pressed: "rgba(166,40,35,1)",
          disabled: "rgba(207,207,207,1)",
          inactive: "rgba(185,112,108,1)",
        },
        text: {
          primary: "rgba(197,48,42,1)",
          pressed: "rgba(166,40,35,1)",
          disabled: "rgba(153,153,153,1)",
          inactive: "rgba(185,112,108,1)",
        },
        loading: "rgba(197,48,42,1)",
      },
      transparent: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        text: {
          primary: "rgba(197,48,42,1)",
          pressed: "rgba(166,40,35,1)",
          disabled: "rgba(153,153,153,1)",
          inactive: "rgba(185,112,108,1)",
        },
        loading: "rgba(197,48,42,1)",
      },
    },
  },
  icon: {
    primary: "rgba(17,17,17,1)",
  },
  checkbox: {
    border: {
      primary: "rgba(17,17,17,1)",
      pressed: "rgba(51,51,51,1)",
      disabled: "rgba(136,136,136,1)",
      inactive: "rgba(185,185,185,1)",
    },
    background: {
      primary: "rgba(17,17,17,1)",
      pressed: "rgba(51,51,51,1)",
      disabled: "rgba(136,136,136,1)",
      inactive: "rgba(185,185,185,1)",
      transparent: "rgba(0,0,0,0)",
    },
    text: {
      primary: "rgba(17,17,17,1)",
      disabled: "rgba(136,136,136,1)",
      inactive: "rgba(185,185,185,1)",
    },
    icon: "rgba(250,250,250,1)",
    error: SemanticLight.danger.accent,
  },
  radio: {
    border: {
      primary: "rgba(17,17,17,1)",
      pressed: "rgba(51,51,51,1)",
      disabled: "rgba(136,136,136,1)",
      inactive: "rgba(185,185,185,1)",
    },
    background: {
      primary: "rgba(17,17,17,1)",
      pressed: "rgba(51,51,51,1)",
      disabled: "rgba(136,136,136,1)",
      inactive: "rgba(185,185,185,1)",
      transparent: "rgba(0,0,0,0)",
    },
    text: {
      primary: "rgba(17,17,17,1)",
      disabled: "rgba(136,136,136,1)",
      inactive: "rgba(185,185,185,1)",
    },
    error: SemanticLight.danger.accent,
  },
  infobox: {
    info: {
      background: SemanticLight.info.surface,
      border: "rgba(17,17,17,1)",
      text: "rgba(17,17,17,1)",
      icon: "rgba(17,17,17,1)",
    },
    success: {
      background: SemanticLight.success.surface,
      border: "rgba(36,138,61,1)",
      text: "rgba(17,17,17,1)",
      icon: "rgba(36,138,61,1)",
    },
    warning: {
      background: SemanticLight.warning.surface,
      border: "rgba(140,105,0,1)",
      text: "rgba(17,17,17,1)",
      icon: "rgba(140,105,0,1)",
    },
    danger: {
      background: SemanticLight.danger.surface,
      border: "rgba(197,48,42,1)",
      text: "rgba(17,17,17,1)",
      icon: "rgba(197,48,42,1)",
    },
  },
  toast: {
    neutral: {
      background: "rgba(17,17,17,1)",
      text: "rgba(250,250,250,1)",
      border: {
        stacked: "rgba(255,255,255,0.28)",
      },
    },
    info: {
      background: SemanticLight.info.surface,
      text: SemanticLight.info.content,
      border: {
        stacked: SemanticLight.info.border,
      },
    },
    success: {
      background: SemanticLight.success.surface,
      text: SemanticLight.success.content,
      border: {
        stacked: SemanticLight.success.border,
      },
    },
    warning: {
      background: SemanticLight.warning.surface,
      text: SemanticLight.warning.content,
      border: {
        stacked: SemanticLight.warning.border,
      },
    },
    danger: {
      background: SemanticLight.danger.surface,
      text: SemanticLight.danger.content,
      border: {
        stacked: SemanticLight.danger.border,
      },
    },
  },
  input: {
    border: {
      withoutValue: "rgba(136,136,136,1)", // no value + no focus
      focused: "rgba(0,122,255,1)", // in focus
      withValue: "rgba(17,17,17,1)", // value + no focus
      error: SemanticLight.danger.accent, // error
      disabled: "rgba(232,232,232,1)", // disabled
      inactive: "rgba(204,204,204,1)", // inactive
    },
    text: {
      placeholder: "rgba(112,112,112,1)",
      withValue: "rgba(17,17,17,1)",
      disabled: "rgba(204,204,204,1)",
    },
    label: {
      primary: "rgba(85,85,85,1)",
      disabled: "rgba(187,187,187,1)",
    },
    background: {
      primary: "rgba(250,250,250,1)",
      disabled: "rgba(248,248,248,1)",
    },
    icon: {
      primary: "rgba(136,136,136,1)",
      disabled: "rgba(204,204,204,1)",
    },
    error: SemanticLight.danger.accent,
    clearButton: "rgba(136,136,136,1)",
  },
  dialog: {
    backdrop: "rgba(0,0,0,0.6)",
    background: "rgba(250,250,250,1)",
    title: "rgba(17,17,17,1)",
    message: "rgba(17,17,17,1)",
    icon: "rgba(17,17,17,1)",
  },
  accordion: {
    solid: {
      background: {
        primary: "rgba(17,17,17,1)",
        disabled: "rgba(207,207,207,1)",
      },
      border: {
        primary: "rgba(17,17,17,1)",
        disabled: "rgba(207,207,207,1)",
      },
      text: {
        primary: "rgba(250,250,250,1)",
        subtitle: "rgba(207,207,207,1)",
        disabled: "rgba(85,85,85,1)",
      },
      icon: {
        primary: "rgba(250,250,250,1)",
        disabled: "rgba(85,85,85,1)",
      },
    },
    border: {
      background: {
        primary: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(17,17,17,1)",
        disabled: "rgba(207,207,207,1)",
      },
      text: {
        primary: "rgba(17,17,17,1)",
        subtitle: "rgba(112,112,112,1)",
        disabled: "rgba(136,136,136,1)",
      },
      icon: {
        primary: "rgba(17,17,17,1)",
        disabled: "rgba(136,136,136,1)",
      },
    },
    transparent: {
      background: {
        primary: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
      },
      text: {
        primary: "rgba(17,17,17,1)",
        subtitle: "rgba(112,112,112,1)",
        disabled: "rgba(136,136,136,1)",
      },
      icon: {
        primary: "rgba(17,17,17,1)",
        disabled: "rgba(136,136,136,1)",
      },
    },
  },
  spinnerLoader: {
    color: "rgba(17,17,17,1)",
  },
  chip: {
    solid: {
      background: {
        primary: "rgba(17,17,17,1)",
        pressed: "rgba(51,51,51,1)",
        selected: "rgba(17,17,17,1)",
        disabled: "rgba(207,207,207,1)",
      },
      border: {
        primary: "rgba(17,17,17,1)",
        pressed: "rgba(51,51,51,1)",
        selected: "rgba(17,17,17,1)",
        disabled: "rgba(207,207,207,1)",
      },
      text: {
        primary: "rgba(250,250,250,1)",
        pressed: "rgba(208,208,208,1)",
        selected: "rgba(250,250,250,1)",
        disabled: "rgba(136,136,136,1)",
      },
      icon: {
        primary: "rgba(250,250,250,1)",
        selected: "rgba(250,250,250,1)",
        pressed: "rgba(208,208,208,1)",
        disabled: "rgba(136,136,136,1)",
      },
    },

    border: {
      background: {
        primary: "rgba(0,0,0,0)",
        pressed: "rgba(0,0,0,0)",
        selected: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(17,17,17,1)",
        pressed: "rgba(51,51,51,1)",
        selected: "rgba(17,17,17,1)",
        disabled: "rgba(207,207,207,1)",
      },
      text: {
        primary: "rgba(17,17,17,1)",
        pressed: "rgba(85,85,85,1)",
        selected: "rgba(17,17,17,1)",
        disabled: "rgba(136,136,136,1)",
      },
      icon: {
        primary: "rgba(17,17,17,1)",
        selected: "rgba(17,17,17,1)",
        pressed: "rgba(85,85,85,1)",
        disabled: "rgba(136,136,136,1)",
      },
    },

    transparent: {
      background: {
        primary: "rgba(0,0,0,0)",
        pressed: "rgba(0,0,0,0)",
        selected: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(0,0,0,0)",
        pressed: "rgba(0,0,0,0)",
        selected: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
      },
      text: {
        primary: "rgba(17,17,17,1)",
        pressed: "rgba(112,112,112,1)",
        selected: "rgba(17,17,17,1)",
        disabled: "rgba(136,136,136,1)",
      },
      icon: {
        primary: "rgba(17,17,17,1)",
        selected: "rgba(17,17,17,1)",
        pressed: "rgba(136,136,136,1)",
        disabled: "rgba(136,136,136,1)",
      },
    },
  },
  progressBar: {
    track: "rgba(142,142,142,1)",
    fill: "rgba(17,17,17,1)",
    disabled: "rgba(207,207,207,1)",
    label: "rgba(17,17,17,1)",
    value: "rgba(17,17,17,1)",
  },
  select: {
    border: {
      primary: "rgba(17,17,17,1)",
      disabled: "rgba(207,207,207,1)",
      inactive: "rgba(136,136,136,1)",
      error: SemanticLight.danger.accent,
      focused: "rgba(17,17,17,1)",
    },
    background: {
      primary: "rgba(250,250,250,1)",
      disabled: "rgba(245,245,245,1)",
    },
    text: {
      primary: "rgba(17,17,17,1)",
      disabled: "rgba(207,207,207,1)",
      placeholder: "rgba(112,112,112,1)",
    },
    label: {
      primary: "rgba(17,17,17,1)",
      disabled: "rgba(207,207,207,1)",
    },
    icon: {
      primary: "rgba(17,17,17,1)",
      disabled: "rgba(207,207,207,1)",
    },
    loading: "rgba(17,17,17,1)",
    error: SemanticLight.danger.accent,
    item: {
      background: {
        default: "rgba(0,0,0,0)",
        selected: "rgba(17,17,17,1)",
        pressed: "rgba(0,0,0,0.06)",
      },
      text: {
        default: "rgba(17,17,17,1)",
        selected: "rgba(250,250,250,1)",
        disabled: "rgba(207,207,207,1)",
      },
      icon: {
        default: "rgba(17,17,17,1)",
        selected: "rgba(250,250,250,1)",
        disabled: "rgba(207,207,207,1)",
      },
    },
    search: {
      text: "rgba(17,17,17,1)",
      placeholder: "rgba(112,112,112,1)",
      icon: "rgba(136,136,136,1)",
    },
    emptyState: "rgba(112,112,112,1)",
    groupHeader: "rgba(112,112,112,1)",
  },
  dropdown: {
    background: "rgba(255,255,255,1)",
    border: "rgba(142,142,142,1)",
    separator: "rgba(240,240,240,1)",
    item: {
      background: {
        default: "rgba(0,0,0,0)",
        pressed: "rgba(0,0,0,0.06)",
        disabled: "rgba(0,0,0,0)",
      },

      text: {
        primary: "rgba(17,17,17,1)",
        disabled: "rgba(170,170,170,1)",
        danger: "rgba(197,48,42,1)",
      },

      icon: {
        primary: "rgba(17,17,17,1)",
        disabled: "rgba(170,170,170,1)",
        danger: "rgba(197,48,42,1)",
      },
    },
  },
  modal: {
    background: "rgba(250,250,250,1)",
    backdrop: "rgba(0,0,0,0.6)",
    handle: "rgba(142,142,142,1)",
    border: "rgba(224,224,224,1)",

    title: "rgba(17,17,17,1)",
    subtitle: "rgba(112,112,112,1)",
    icon: "rgba(17,17,17,1)",
  },
  header: {
    background: "rgba(250,250,250,1)",
    title: "rgba(17,17,17,1)",
    border: "rgba(224,224,224,1)",

    control: {
      background: {
        default: "rgba(0,0,0,0)",
        pressed: "rgba(0,0,0,0.06)",
      },

      icon: {
        primary: "rgba(17,17,17,1)",
        disabled: "rgba(207,207,207,1)",
      },
    },
  },
  skeleton: {
    base: "rgba(224,224,224,1)",
    highlight: "rgba(245,245,245,1)",
  },
  tabs: {
    container: {
      background: "rgba(250,250,250,1)",
      border: "rgba(224,224,224,1)",
    },
    solid: {
      indicator: "rgba(17,17,17,1)", // indicator background
      text: {
        active: "rgba(250,250,250,1)", // text on the dark indicator
        inactive: "rgba(112,112,112,1)",
      },
    },
    border: {
      indicator: "rgba(17,17,17,1)", // indicator border
      text: {
        active: "rgba(17,17,17,1)",
        inactive: "rgba(112,112,112,1)",
      },
    },
    text: {
      indicator: "rgba(0,0,0,0)", // no visible indicator
      text: {
        active: "rgba(17,17,17,1)",
        inactive: "rgba(112,112,112,1)",
      },
    },
    underline: {
      indicator: "rgba(17,17,17,1)", // underline indicator
      text: {
        active: "rgba(17,17,17,1)",
        inactive: "rgba(112,112,112,1)",
      },
    },
    segment: {
      indicator: "rgba(17,17,17,1)",
      containerBackground: "rgba(0,0,0,0)",
      containerBorder: "rgba(17,17,17,1)",
      text: {
        active: "rgba(250,250,250,1)",
        inactive: "rgba(85,85,85,1)",
      },
    },
  },
  badge: {
    neutral: {
      background: "rgba(85,85,90,1)",
      text: "rgba(255,255,255,1)",
    },
    info: {
      background: "rgba(0,95,204,1)",
      text: "rgba(255,255,255,1)",
    },
    success: {
      background: "rgba(34,132,58,1)",
      text: "rgba(255,255,255,1)",
    },
    warning: {
      background: SemanticLight.warning.accent,
      text: "rgba(58,45,0,1)",
    },
    danger: {
      background: SemanticLight.danger.accent,
      text: "rgba(255,255,255,1)",
    },
  },
  slider: {
    track: {
      active: "rgba(17,17,17,1)",
      inactive: "rgba(142,142,142,1)",
      disabled: "rgba(204,204,204,1)",
    },
    thumb: {
      primary: "rgba(17,17,17,1)",
      disabled: "rgba(204,204,204,1)",
    },
    tooltip: {
      background: "rgba(17,17,17,1)",
      text: "rgba(255,255,255,1)",
    },
    label: {
      primary: "rgba(85,85,85,1)",
      disabled: "rgba(187,187,187,1)",
    },
    error: SemanticLight.danger.accent,
  },
  divider: {
    line: "rgba(224,224,224,1)",
    label: "rgba(112,112,112,1)",
  },
  toggle: {
    track: {
      border: {
        primary: "rgba(17,17,17,1)",
        pressed: "rgba(51,51,51,1)",
        disabled: "rgba(136,136,136,1)",
        inactive: "rgba(185,185,185,1)",
      },

      background: {
        primary: "rgba(0,0,0,0)",
        pressed: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
        inactive: "rgba(0,0,0,0)",
      },
    },
    thumb: {
      unchecked: "rgba(136,136,136,1)",
      checked: "rgba(17,17,17,1)",
      pressedUnchecked: "rgba(85,85,85,1)",
      pressedChecked: "rgba(51,51,51,1)",
      disabledUnchecked: "rgba(207,207,207,1)",
      disabledChecked: "rgba(136,136,136,1)",
      inactiveUnchecked: "rgba(185,185,185,1)",
      inactiveChecked: "rgba(136,136,136,1)",
    },
    text: {
      primary: "rgba(17,17,17,1)",
      disabled: "rgba(136,136,136,1)",
      inactive: "rgba(185,185,185,1)",
    },
    error: SemanticLight.danger.accent,
  },
};

export const ColorsDark = {
  background: {
    screen: "rgba(17,17,17,1)",
  },
  themedView: {
    background: "rgba(17,17,17,1)",
  },
  text: {
    primary: "rgba(250,250,250,1)",
  },
  button: {
    primary: {
      solid: {
        background: {
          primary: "rgba(250,250,250,1)",
          pressed: "rgba(208,208,208,1)",
          disabled: "rgba(136,136,136,1)",
          inactive: "rgba(185,185,185,1)",
        },
        border: {
          primary: "rgba(250,250,250,1)",
          pressed: "rgba(208,208,208,1)",
          disabled: "rgba(136,136,136,1)",
          inactive: "rgba(185,185,185,1)",
        },
        text: {
          primary: "rgba(17,17,17,1)",
          pressed: "rgba(17,17,17,1)",
          disabled: "rgba(17,17,17,1)",
          inactive: "rgba(17,17,17,1)",
        },
        loading: "rgba(17,17,17,1)",
      },
      border: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: "rgba(250,250,250,1)",
          pressed: "rgba(208,208,208,1)",
          disabled: "rgba(136,136,136,1)",
          inactive: "rgba(185,185,185,1)",
        },
        text: {
          primary: "rgba(250,250,250,1)",
          pressed: "rgba(208,208,208,1)",
          disabled: "rgba(136,136,136,1)",
          inactive: "rgba(185,185,185,1)",
        },
        loading: "rgba(250,250,250,1)",
      },
      transparent: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        text: {
          primary: "rgba(250,250,250,1)",
          pressed: "rgba(136,136,136,1)",
          disabled: "rgba(85,85,85,1)",
          inactive: "rgba(185,185,185,1)",
        },
        loading: "rgba(250,250,250,1)",
      },
    },

    secondary: {
      solid: {
        background: {
          primary: SemanticDark.info.surface,
          pressed: "rgba(25,55,85,1)",
          disabled: "rgba(40,40,42,1)",
          inactive: "rgba(47,55,63,1)",
        },
        border: {
          primary: SemanticDark.info.surface,
          pressed: "rgba(25,55,85,1)",
          disabled: "rgba(40,40,42,1)",
          inactive: "rgba(47,55,63,1)",
        },
        text: {
          primary: SemanticDark.info.content,
          pressed: "rgba(180,218,255,1)",
          disabled: "rgba(102,102,102,1)",
          inactive: "rgba(103,127,151,1)",
        },
        loading: SemanticDark.info.content,
      },
      border: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: SemanticDark.info.accent,
          pressed: "rgba(64,156,255,1)",
          disabled: "rgba(85,85,85,1)",
          inactive: "rgba(73,120,168,1)",
        },
        text: {
          primary: SemanticDark.info.content,
          pressed: "rgba(180,218,255,1)",
          disabled: "rgba(102,102,102,1)",
          inactive: "rgba(103,127,151,1)",
        },
        loading: SemanticDark.info.content,
      },
      transparent: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        text: {
          primary: SemanticDark.info.accent,
          pressed: "rgba(64,156,255,1)",
          disabled: "rgba(102,102,102,1)",
          inactive: "rgba(73,120,168,1)",
        },
        loading: SemanticDark.info.accent,
      },
    },

    neutral: {
      solid: {
        background: {
          primary: "rgba(58,58,60,1)",
          pressed: "rgba(72,72,74,1)",
          disabled: "rgba(40,40,42,1)",
          inactive: "rgba(48,48,50,1)",
        },
        border: {
          primary: "rgba(58,58,60,1)",
          pressed: "rgba(72,72,74,1)",
          disabled: "rgba(40,40,42,1)",
          inactive: "rgba(48,48,50,1)",
        },
        text: {
          primary: "rgba(250,250,250,1)",
          pressed: "rgba(250,250,250,1)",
          disabled: "rgba(102,102,102,1)",
          inactive: "rgba(174,174,178,1)",
        },
        loading: "rgba(250,250,250,1)",
      },
      border: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: "rgba(174,174,178,1)",
          pressed: "rgba(208,208,208,1)",
          disabled: "rgba(85,85,85,1)",
          inactive: "rgba(142,142,147,1)",
        },
        text: {
          primary: "rgba(174,174,178,1)",
          pressed: "rgba(208,208,208,1)",
          disabled: "rgba(85,85,85,1)",
          inactive: "rgba(142,142,147,1)",
        },
        loading: "rgba(174,174,178,1)",
      },
      transparent: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        text: {
          primary: "rgba(174,174,178,1)",
          pressed: "rgba(208,208,208,1)",
          disabled: "rgba(85,85,85,1)",
          inactive: "rgba(142,142,147,1)",
        },
        loading: "rgba(174,174,178,1)",
      },
    },

    danger: {
      solid: {
        background: {
          primary: SemanticDark.danger.accent,
          pressed: "rgba(230,65,56,1)",
          disabled: "rgba(81,52,50,1)",
          inactive: "rgba(128,73,69,1)",
        },
        border: {
          primary: SemanticDark.danger.accent,
          pressed: "rgba(230,65,56,1)",
          disabled: "rgba(81,52,50,1)",
          inactive: "rgba(128,73,69,1)",
        },
        text: {
          primary: "rgba(17,17,17,1)",
          pressed: "rgba(17,17,17,1)",
          disabled: "rgba(170,150,148,1)",
          inactive: "rgba(17,17,17,1)",
        },
        loading: "rgba(17,17,17,1)",
      },
      border: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: SemanticDark.danger.accent,
          pressed: "rgba(255,105,97,1)",
          disabled: "rgba(85,85,85,1)",
          inactive: "rgba(161,91,86,1)",
        },
        text: {
          primary: SemanticDark.danger.accent,
          pressed: "rgba(255,105,97,1)",
          disabled: "rgba(102,102,102,1)",
          inactive: "rgba(161,91,86,1)",
        },
        loading: SemanticDark.danger.accent,
      },
      transparent: {
        background: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        border: {
          primary: "rgba(0,0,0,0)",
          pressed: "rgba(0,0,0,0)",
          disabled: "rgba(0,0,0,0)",
          inactive: "rgba(0,0,0,0)",
        },
        text: {
          primary: SemanticDark.danger.accent,
          pressed: "rgba(255,105,97,1)",
          disabled: "rgba(102,102,102,1)",
          inactive: "rgba(161,91,86,1)",
        },
        loading: SemanticDark.danger.accent,
      },
    },
  },
  icon: {
    primary: "rgba(250,250,250,1)",
  },
  checkbox: {
    border: {
      primary: "rgba(250,250,250,1)",
      pressed: "rgba(208,208,208,1)",
      disabled: "rgba(85,85,85,1)",
      inactive: "rgba(136,136,136,1)",
    },
    background: {
      primary: "rgba(250,250,250,1)",
      pressed: "rgba(208,208,208,1)",
      disabled: "rgba(85,85,85,1)",
      inactive: "rgba(136,136,136,1)",
      transparent: "rgba(0,0,0,0)",
    },
    text: {
      primary: "rgba(250,250,250,1)",
      disabled: "rgba(85,85,85,1)",
      inactive: "rgba(136,136,136,1)",
    },
    icon: "rgba(17,17,17,1)",
    error: SemanticDark.danger.accent,
  },
  radio: {
    border: {
      primary: "rgba(250,250,250,1)",
      pressed: "rgba(208,208,208,1)",
      disabled: "rgba(85,85,85,1)",
      inactive: "rgba(136,136,136,1)",
    },
    background: {
      primary: "rgba(250,250,250,1)",
      pressed: "rgba(208,208,208,1)",
      disabled: "rgba(85,85,85,1)",
      inactive: "rgba(136,136,136,1)",
      transparent: "rgba(0,0,0,0)",
    },
    text: {
      primary: "rgba(250,250,250,1)",
      disabled: "rgba(85,85,85,1)",
      inactive: "rgba(136,136,136,1)",
    },
    error: SemanticDark.danger.accent,
  },
  infobox: {
    info: {
      background: SemanticDark.info.surface,
      border: "rgba(250,250,250,1)",
      text: "rgba(250,250,250,1)",
      icon: "rgba(250,250,250,1)",
    },
    success: {
      background: SemanticDark.success.surface,
      border: SemanticDark.success.accent,
      text: "rgba(250,250,250,1)",
      icon: SemanticDark.success.accent,
    },
    warning: {
      background: SemanticDark.warning.surface,
      border: SemanticDark.warning.accent,
      text: "rgba(250,250,250,1)",
      icon: SemanticDark.warning.accent,
    },
    danger: {
      background: SemanticDark.danger.surface,
      border: SemanticDark.danger.accent,
      text: "rgba(250,250,250,1)",
      icon: SemanticDark.danger.accent,
    },
  },
  toast: {
    neutral: {
      background: "rgba(250,250,250,1)",
      text: "rgba(17,17,17,1)",
      border: {
        stacked: "rgba(0,0,0,0.18)",
      },
    },
    info: {
      background: SemanticDark.info.surface,
      text: SemanticDark.info.content,
      border: {
        stacked: SemanticDark.info.border,
      },
    },
    success: {
      background: SemanticDark.success.surface,
      text: SemanticDark.success.content,
      border: {
        stacked: SemanticDark.success.border,
      },
    },
    warning: {
      background: SemanticDark.warning.surface,
      text: SemanticDark.warning.content,
      border: {
        stacked: SemanticDark.warning.border,
      },
    },
    danger: {
      background: SemanticDark.danger.surface,
      text: SemanticDark.danger.content,
      border: {
        stacked: SemanticDark.danger.border,
      },
    },
  },
  input: {
    border: {
      withoutValue: "rgba(102,102,102,1)",
      focused: "rgba(10,132,255,1)",
      withValue: "rgba(250,250,250,1)",
      error: "rgba(255,69,58,1)",
      disabled: "rgba(34,34,34,1)",
      inactive: "rgba(51,51,51,1)",
    },
    text: {
      placeholder: "rgba(136,136,136,1)",
      withValue: "rgba(250,250,250,1)",
      disabled: "rgba(68,68,68,1)",
    },
    label: {
      primary: "rgba(170,170,170,1)",
      disabled: "rgba(85,85,85,1)",
    },
    background: {
      primary: "rgba(17,17,17,1)",
      disabled: "rgba(20,20,20,1)",
    },
    icon: {
      primary: "rgba(119,119,119,1)",
      disabled: "rgba(68,68,68,1)",
    },
    error: "rgba(255,69,58,1)",
    clearButton: "rgba(102,102,102,1)",
  },
  dialog: {
    backdrop: "rgba(0,0,0,0.6)",
    background: "rgba(17,17,17,1)",
    title: "rgba(250,250,250,1)",
    message: "rgba(250,250,250,1)",
    icon: "rgba(250,250,250,1)",
  },
  accordion: {
    solid: {
      background: {
        primary: "rgba(250,250,250,1)",
        disabled: "rgba(136,136,136,1)",
      },
      border: {
        primary: "rgba(250,250,250,1)",
        disabled: "rgba(136,136,136,1)",
      },
      text: {
        primary: "rgba(17,17,17,1)",
        subtitle: "rgba(112,112,112,1)",
        disabled: "rgba(85,85,85,1)",
      },
      icon: {
        primary: "rgba(17,17,17,1)",
        disabled: "rgba(85,85,85,1)",
      },
    },
    border: {
      background: {
        primary: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(250,250,250,1)",
        disabled: "rgba(85,85,85,1)",
      },
      text: {
        primary: "rgba(250,250,250,1)",
        subtitle: "rgba(136,136,136,1)",
        disabled: "rgba(136,136,136,1)",
      },
      icon: {
        primary: "rgba(250,250,250,1)",
        disabled: "rgba(136,136,136,1)",
      },
    },
    transparent: {
      background: {
        primary: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
      },
      text: {
        primary: "rgba(250,250,250,1)",
        subtitle: "rgba(136,136,136,1)",
        disabled: "rgba(136,136,136,1)",
      },
      icon: {
        primary: "rgba(250,250,250,1)",
        disabled: "rgba(136,136,136,1)",
      },
    },
  },
  spinnerLoader: {
    color: "rgba(250,250,250,1)",
  },
  chip: {
    solid: {
      background: {
        primary: "rgba(250,250,250,1)",
        pressed: "rgba(208,208,208,1)",
        selected: "rgba(250,250,250,1)",
        disabled: "rgba(136,136,136,1)",
      },
      border: {
        primary: "rgba(250,250,250,1)",
        pressed: "rgba(208,208,208,1)",
        selected: "rgba(250,250,250,1)",
        disabled: "rgba(136,136,136,1)",
      },
      text: {
        primary: "rgba(17,17,17,1)",
        pressed: "rgba(51,51,51,1)",
        selected: "rgba(17,17,17,1)",
        disabled: "rgba(85,85,85,1)",
      },
      icon: {
        primary: "rgba(17,17,17,1)",
        selected: "rgba(17,17,17,1)",
        pressed: "rgba(51,51,51,1)",
        disabled: "rgba(85,85,85,1)",
      },
    },

    border: {
      background: {
        primary: "rgba(0,0,0,0)",
        pressed: "rgba(0,0,0,0)",
        selected: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(250,250,250,1)",
        pressed: "rgba(208,208,208,1)",
        selected: "rgba(250,250,250,1)",
        disabled: "rgba(85,85,85,1)",
      },
      text: {
        primary: "rgba(250,250,250,1)",
        pressed: "rgba(170,170,170,1)",
        selected: "rgba(250,250,250,1)",
        disabled: "rgba(119,119,119,1)",
      },
      icon: {
        primary: "rgba(250,250,250,1)",
        selected: "rgba(250,250,250,1)",
        pressed: "rgba(170,170,170,1)",
        disabled: "rgba(119,119,119,1)",
      },
    },

    transparent: {
      background: {
        primary: "rgba(0,0,0,0)",
        pressed: "rgba(0,0,0,0)",
        selected: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(0,0,0,0)",
        pressed: "rgba(0,0,0,0)",
        selected: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
      },
      text: {
        primary: "rgba(250,250,250,1)",
        pressed: "rgba(136,136,136,1)",
        selected: "rgba(250,250,250,1)",
        disabled: "rgba(119,119,119,1)",
      },
      icon: {
        primary: "rgba(250,250,250,1)",
        selected: "rgba(250,250,250,1)",
        pressed: "rgba(136,136,136,1)",
        disabled: "rgba(119,119,119,1)",
      },
    },
  },
  progressBar: {
    track: "rgba(112,112,112,1)",
    fill: "rgba(250,250,250,1)",
    disabled: "rgba(136,136,136,1)",
    label: "rgba(250,250,250,1)",
    value: "rgba(250,250,250,1)",
  },
  select: {
    border: {
      primary: "rgba(250,250,250,1)",
      disabled: "rgba(136,136,136,1)",
      inactive: "rgba(185,185,185,1)",
      error: "rgba(255,69,58,1)",
      focused: "rgba(250,250,250,1)",
    },
    background: {
      primary: "rgba(17,17,17,1)",
      disabled: "rgba(34,34,34,1)",
    },
    text: {
      primary: "rgba(250,250,250,1)",
      disabled: "rgba(136,136,136,1)",
      placeholder: "rgba(136,136,136,1)",
    },
    label: {
      primary: "rgba(250,250,250,1)",
      disabled: "rgba(136,136,136,1)",
    },
    icon: {
      primary: "rgba(250,250,250,1)",
      disabled: "rgba(136,136,136,1)",
    },
    loading: "rgba(250,250,250,1)",
    error: "rgba(255,69,58,1)",
    item: {
      background: {
        default: "rgba(0,0,0,0)",
        selected: "rgba(250,250,250,1)",
        pressed: "rgba(255,255,255,0.08)",
      },
      text: {
        default: "rgba(250,250,250,1)",
        selected: "rgba(17,17,17,1)",
        disabled: "rgba(136,136,136,1)",
      },
      icon: {
        default: "rgba(250,250,250,1)",
        selected: "rgba(17,17,17,1)",
        disabled: "rgba(136,136,136,1)",
      },
    },
    search: {
      text: "rgba(250,250,250,1)",
      placeholder: "rgba(136,136,136,1)",
      icon: "rgba(136,136,136,1)",
    },
    emptyState: "rgba(136,136,136,1)",
    groupHeader: "rgba(136,136,136,1)",
  },
  modal: {
    background: "rgba(34,34,34,1)",
    backdrop: "rgba(0,0,0,0.6)",
    handle: "rgba(136,136,136,1)",
    border: "rgba(51,51,51,1)",

    title: "rgba(250,250,250,1)",
    subtitle: "rgba(142,142,142,1)",
    icon: "rgba(250,250,250,1)",
  },
  header: {
    background: "rgba(17,17,17,1)",
    title: "rgba(250,250,250,1)",
    border: "rgba(51,51,51,1)",

    control: {
      background: {
        default: "rgba(0,0,0,0)",
        pressed: "rgba(255,255,255,0.08)",
      },

      icon: {
        primary: "rgba(250,250,250,1)",
        disabled: "rgba(85,85,85,1)",
      },
    },
  },
  skeleton: {
    base: "rgba(51,51,51,1)",
    highlight: "rgba(102,102,102,1)",
  },
  tabs: {
    container: {
      background: "rgba(17,17,17,1)",
      border: "rgba(51,51,51,1)",
    },
    solid: {
      indicator: "rgba(250,250,250,1)",
      text: {
        active: "rgba(17,17,17,1)",
        inactive: "rgba(136,136,136,1)",
      },
    },
    border: {
      indicator: "rgba(250,250,250,1)",
      text: {
        active: "rgba(250,250,250,1)",
        inactive: "rgba(136,136,136,1)",
      },
    },
    text: {
      indicator: "rgba(0,0,0,0)",
      text: {
        active: "rgba(250,250,250,1)",
        inactive: "rgba(136,136,136,1)",
      },
    },
    underline: {
      indicator: "rgba(250,250,250,1)",
      text: {
        active: "rgba(250,250,250,1)",
        inactive: "rgba(136,136,136,1)",
      },
    },
    segment: {
      indicator: "rgba(250,250,250,1)",
      containerBackground: "rgba(0,0,0,0)",
      containerBorder: "rgba(250,250,250,1)",
      text: { active: "rgba(17,17,17,1)", inactive: "rgba(153,153,153,1)" },
    },
  },
  badge: {
    neutral: {
      background: "rgba(174,174,178,1)",
      text: "rgba(17,17,17,1)",
    },
    info: {
      background: "rgba(64,156,255,1)",
      text: "rgba(17,17,17,1)",
    },
    success: {
      background: SemanticDark.success.accent,
      text: "rgba(17,17,17,1)",
    },
    warning: {
      background: SemanticDark.warning.accent,
      text: "rgba(17,17,17,1)",
    },
    danger: {
      background: SemanticDark.danger.accent,
      text: "rgba(17,17,17,1)",
    },
  },
  slider: {
    track: {
      active: "rgba(250,250,250,1)",
      inactive: "rgba(112,112,112,1)",
      disabled: "rgba(68,68,68,1)",
    },
    thumb: {
      primary: "rgba(250,250,250,1)",
      disabled: "rgba(68,68,68,1)",
    },
    tooltip: {
      background: "rgba(250,250,250,1)",
      text: "rgba(17,17,17,1)",
    },
    label: {
      primary: "rgba(170,170,170,1)",
      disabled: "rgba(85,85,85,1)",
    },
    error: SemanticDark.danger.accent,
  },
  dropdown: {
    background: "rgba(28,28,30,1)",
    border: "rgba(112,112,112,1)",
    separator: "rgba(44,44,46,1)",
    item: {
      background: {
        default: "rgba(0,0,0,0)",
        pressed: "rgba(255,255,255,0.08)",
        disabled: "rgba(0,0,0,0)",
      },

      text: {
        primary: "rgba(250,250,250,1)",
        disabled: "rgba(85,85,85,1)",
        danger: "rgba(255,105,97,1)",
      },

      icon: {
        primary: "rgba(250,250,250,1)",
        disabled: "rgba(85,85,85,1)",
        danger: "rgba(255,105,97,1)",
      },
    },
  },
  divider: {
    line: "rgba(51,51,51,1)",
    label: "rgba(136,136,136,1)",
  },
  toggle: {
    track: {
      border: {
        primary: "rgba(250,250,250,1)",
        pressed: "rgba(208,208,208,1)",
        disabled: "rgba(85,85,85,1)",
        inactive: "rgba(136,136,136,1)",
      },
      background: {
        primary: "rgba(0,0,0,0)",
        pressed: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
        inactive: "rgba(0,0,0,0)",
      },
    },
    thumb: {
      unchecked: "rgba(185,185,185,1)",
      checked: "rgba(250,250,250,1)",
      pressedUnchecked: "rgba(208,208,208,1)",
      pressedChecked: "rgba(208,208,208,1)",
      disabledUnchecked: "rgba(85,85,85,1)",
      disabledChecked: "rgba(136,136,136,1)",
      inactiveUnchecked: "rgba(136,136,136,1)",
      inactiveChecked: "rgba(185,185,185,1)",
    },
    text: {
      primary: "rgba(250,250,250,1)",
      disabled: "rgba(85,85,85,1)",
      inactive: "rgba(136,136,136,1)",
    },
    error: SemanticDark.danger.accent,
  },
};

export const Colors = {
  light: ColorsLight,
  dark: ColorsDark,
};
