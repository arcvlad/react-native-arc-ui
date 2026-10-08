// ARCUI-owned colors use rgba(...) consistently for predictable Reanimated interpolation.

export const ColorsLight = {
  background: {
    screen: "rgba(250,250,250,1)",
  },
  themedView: {
    background: "#FAFAFA",
  },
  text: {
    primary: "rgba(17,17,17,1)",
    disabled: "rgba(207,207,207,1)",
    inactive: "rgba(136,136,136,1)",
  },
  button: {
    solid: {
      background: {
        primary: "rgba(17,17,17,1)",
        pressed: "rgba(51,51,51,1)",
        disabled: "rgba(207,207,207,1)",
        inactive: "rgba(136,136,136,1)",
        transparent: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(17,17,17,1)",
        pressed: "rgba(51,51,51,1)",
        disabled: "rgba(207,207,207,1)",
        inactive: "rgba(136,136,136,1)",
        transparent: "rgba(0,0,0,0)",
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
        transparent: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(17,17,17,1)",
        pressed: "rgba(51,51,51,1)",
        disabled: "rgba(207,207,207,1)",
        inactive: "rgba(136,136,136,1)",
        transparent: "rgba(0,0,0,0)",
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
        transparent: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(0,0,0,0)",
        pressed: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
        inactive: "rgba(0,0,0,0)",
        transparent: "rgba(0,0,0,0)",
      },
      text: {
        primary: "rgba(17,17,17,1)",
        pressed: "rgba(136,136,136,1)",
        disabled: "rgba(207,207,207,1)",
        inactive: "rgba(136,136,136,1)",
      },
      loading: "rgba(17,17,17,1)",
    },
  },
  icon: {
    primary: "rgba(17,17,17,1)",
    disabled: "rgba(207,207,207,1)",
    inactive: "rgba(136,136,136,1)",
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
  },
  radio: {
    border: {
      primary: "rgba(17,17,17,1)",
      pressed: "rgba(51,51,51,1)",
      disabled: "rgba(136,136,136,1)",
      inactive: "rgba(185,185,185,1)",
      transparent: "rgba(0,0,0,0)",
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
  },
  infobox: {
    default: {
      border: "rgba(17,17,17,1)",
      text: "rgba(17,17,17,1)",
      icon: "rgba(17,17,17,1)",
    },

    warning: {
      border: "rgba(140,105,0,1)",
      text: "rgba(17,17,17,1)",
      icon: "rgba(140,105,0,1)",
    },

    danger: {
      border: "rgba(197,48,42,1)",
      text: "rgba(17,17,17,1)",
      icon: "rgba(197,48,42,1)",
    },
  },
  toast: {
    background: {
      primary: "rgba(17,17,17,1)",
    },
    text: {
      primary: "rgba(250,250,250,1)",
    },
    border: {
      stacked: "rgba(255,255,255,0.28)",
    },
  },
  input: {
    border: {
      withoutValue: "rgba(192,192,192,1)", // no value + no focus
      focused: "rgba(0,122,255,1)", // in focus
      withValue: "rgba(17,17,17,1)", // value + no focus
      error: "rgba(255,69,58,1)", // error
      disabled: "rgba(232,232,232,1)", // disabled
      inactive: "rgba(204,204,204,1)", // inactive
    },
    text: {
      placeholder: "rgba(170,170,170,1)",
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
    error: "rgba(255,69,58,1)",
    clearButton: "rgba(170,170,170,1)",
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
        subtitle: "rgba(136,136,136,1)",
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
        subtitle: "rgba(136,136,136,1)",
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
        pressed: "rgba(136,136,136,1)",
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
    track: "rgba(224,224,224,1)",
    fill: "rgba(17,17,17,1)",
    disabled: "rgba(207,207,207,1)",
    label: "rgba(17,17,17,1)",
  },
  select: {
    border: {
      primary: "rgba(17,17,17,1)",
      disabled: "rgba(207,207,207,1)",
      inactive: "rgba(136,136,136,1)",
      error: "rgba(255,69,58,1)",
      focused: "rgba(17,17,17,1)",
    },
    background: {
      primary: "rgba(250,250,250,1)",
      disabled: "rgba(245,245,245,1)",
    },
    text: {
      primary: "rgba(17,17,17,1)",
      disabled: "rgba(207,207,207,1)",
      placeholder: "rgba(136,136,136,1)",
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
    error: "rgba(255,69,58,1)",
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
      border: "rgba(136,136,136,1)",
      text: "rgba(17,17,17,1)",
      placeholder: "rgba(136,136,136,1)",
      icon: "rgba(136,136,136,1)",
      clearIcon: "rgba(136,136,136,1)",
    },
    divider: "rgba(224,224,224,1)",
    emptyState: "rgba(136,136,136,1)",
  },
  dropdown: {
    background: "rgba(255,255,255,1)",
    border: "rgba(224,224,224,1)",
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
        destructive: "rgba(255,69,58,1)",
      },

      icon: {
        primary: "rgba(17,17,17,1)",
        disabled: "rgba(170,170,170,1)",
        destructive: "rgba(255,69,58,1)",
      },
    },
  },
  modal: {
    background: "rgba(250,250,250,1)",
    backdrop: "rgba(0,0,0,0.6)",
    handle: "rgba(207,207,207,1)",
    border: "rgba(224,224,224,1)",

    title: "rgba(17,17,17,1)",
    subtitle: "rgba(136,136,136,1)",
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
      indicator: "rgba(17,17,17,1)", // background indikatora
      text: {
        active: "rgba(250,250,250,1)", // tekst na tamnom indikatoru
        inactive: "rgba(136,136,136,1)",
        disabled: "rgba(207,207,207,1)",
      },
    },
    border: {
      indicator: "rgba(17,17,17,1)", // border indikatora
      text: {
        active: "rgba(17,17,17,1)",
        inactive: "rgba(136,136,136,1)",
        disabled: "rgba(207,207,207,1)",
      },
    },
    text: {
      indicator: "rgba(0,0,0,0)", // nema indikatora
      text: {
        active: "rgba(17,17,17,1)",
        inactive: "rgba(136,136,136,1)",
        disabled: "rgba(207,207,207,1)",
      },
    },
    underline: {
      indicator: "rgba(17,17,17,1)", // linija ispod
      text: {
        active: "rgba(17,17,17,1)",
        inactive: "rgba(136,136,136,1)",
        disabled: "rgba(207,207,207,1)",
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
    background: "rgba(255,69,58,1)", // danger red — default
    text: "rgba(255,255,255,1)",
  },
  slider: {
    track: {
      active: "rgba(17,17,17,1)",
      inactive: "rgba(224,224,224,1)",
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
  },
  divider: {
    line: "rgba(224,224,224,1)",
    label: "rgba(136,136,136,1)",
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
  },
  states: {
    success: "rgba(48,209,88,1)",
    warning: "rgba(255,214,10,1)",
    danger: "rgba(255,69,58,1)",
    info: "rgba(10,132,255,1)",
  },
};

export const ColorsDark = {
  background: {
    screen: "rgba(17,17,17,1)",
  },
  themedView: {
    background: "#111111",
  },
  text: {
    primary: "rgba(250,250,250,1)",
    disabled: "rgba(85,85,85,1)",
    inactive: "rgba(136,136,136,1)",
  },
  button: {
    solid: {
      background: {
        primary: "rgba(250,250,250,1)",
        pressed: "rgba(208,208,208,1)",
        disabled: "rgba(136,136,136,1)",
        inactive: "rgba(185,185,185,1)",
        transparent: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(250,250,250,1)",
        pressed: "rgba(208,208,208,1)",
        disabled: "rgba(136,136,136,1)",
        inactive: "rgba(185,185,185,1)",
        transparent: "rgba(0,0,0,0)",
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
        transparent: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(250,250,250,1)",
        pressed: "rgba(208,208,208,1)",
        disabled: "rgba(136,136,136,1)",
        inactive: "rgba(185,185,185,1)",
        transparent: "rgba(0,0,0,0)",
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
        transparent: "rgba(0,0,0,0)",
      },
      border: {
        primary: "rgba(0,0,0,0)",
        pressed: "rgba(0,0,0,0)",
        disabled: "rgba(0,0,0,0)",
        inactive: "rgba(0,0,0,0)",
        transparent: "rgba(0,0,0,0)",
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
  icon: {
    primary: "rgba(250,250,250,1)",
    disabled: "rgba(85,85,85,1)",
    inactive: "rgba(136,136,136,1)",
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
  },
  radio: {
    border: {
      primary: "rgba(250,250,250,1)",
      pressed: "rgba(208,208,208,1)",
      disabled: "rgba(85,85,85,1)",
      inactive: "rgba(136,136,136,1)",
      transparent: "rgba(0,0,0,0)",
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
  },
  infobox: {
    default: {
      border: "rgba(250,250,250,1)",
      text: "rgba(250,250,250,1)",
      icon: "rgba(250,250,250,1)",
    },

    warning: {
      border: "rgba(255,214,10,1)",
      text: "rgba(250,250,250,1)",
      icon: "rgba(255,214,10,1)",
    },

    danger: {
      border: "rgba(255,69,58,1)",
      text: "rgba(250,250,250,1)",
      icon: "rgba(255,69,58,1)",
    },
  },
  toast: {
    background: {
      primary: "rgba(250,250,250,1)",
    },
    text: {
      primary: "rgba(17,17,17,1)",
    },
    border: {
      stacked: "rgba(0,0,0,0.18)",
    },
  },
  input: {
    border: {
      withoutValue: "rgba(68,68,68,1)",
      focused: "rgba(10,132,255,1)",
      withValue: "rgba(250,250,250,1)",
      error: "rgba(255,69,58,1)",
      disabled: "rgba(34,34,34,1)",
      inactive: "rgba(51,51,51,1)",
    },
    text: {
      placeholder: "rgba(102,102,102,1)",
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
        subtitle: "rgba(136,136,136,1)",
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
    track: "rgba(51,51,51,1)",
    fill: "rgba(250,250,250,1)",
    disabled: "rgba(136,136,136,1)",
    label: "rgba(250,250,250,1)",
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
      border: "rgba(136,136,136,1)",
      text: "rgba(250,250,250,1)",
      placeholder: "rgba(136,136,136,1)",
      icon: "rgba(136,136,136,1)",
      clearIcon: "rgba(136,136,136,1)",
    },
    divider: "rgba(51,51,51,1)",
    emptyState: "rgba(136,136,136,1)",
  },
  modal: {
    background: "rgba(34,34,34,1)",
    backdrop: "rgba(0,0,0,0.6)",
    handle: "rgba(136,136,136,1)",
    border: "rgba(51,51,51,1)",

    title: "rgba(250,250,250,1)",
    subtitle: "rgba(136,136,136,1)",
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
        disabled: "rgba(85,85,85,1)",
      },
    },
    border: {
      indicator: "rgba(250,250,250,1)",
      text: {
        active: "rgba(250,250,250,1)",
        inactive: "rgba(136,136,136,1)",
        disabled: "rgba(85,85,85,1)",
      },
    },
    text: {
      indicator: "rgba(0,0,0,0)",
      text: {
        active: "rgba(250,250,250,1)",
        inactive: "rgba(136,136,136,1)",
        disabled: "rgba(85,85,85,1)",
      },
    },
    underline: {
      indicator: "rgba(250,250,250,1)",
      text: {
        active: "rgba(250,250,250,1)",
        inactive: "rgba(136,136,136,1)",
        disabled: "rgba(85,85,85,1)",
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
    background: "rgba(255,69,58,1)",
    text: "rgba(255,255,255,1)",
  },
  slider: {
    track: {
      active: "rgba(250,250,250,1)",
      inactive: "rgba(51,51,51,1)",
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
  },
  dropdown: {
    background: "rgba(28,28,30,1)",
    border: "rgba(51,51,51,1)",
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
        destructive: "rgba(255,105,97,1)",
      },

      icon: {
        primary: "rgba(250,250,250,1)",
        disabled: "rgba(85,85,85,1)",
        destructive: "rgba(255,105,97,1)",
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
  },
  states: {
    success: "rgba(48,209,88,1)",
    warning: "rgba(255,214,10,1)",
    danger: "rgba(255,69,58,1)",
    info: "rgba(10,132,255,1)",
  },
};

export const Colors = {
  light: ColorsLight,
  dark: ColorsDark,
};
