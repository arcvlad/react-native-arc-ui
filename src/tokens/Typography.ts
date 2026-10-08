import type { TextStyle } from "react-native";

export type TTypographyStyle = Omit<TextStyle, "color" | "fontSize"> & {
  /**
   * Unscaled base font size.
   * ARCUI applies the central fontScale at runtime.
   */
  fontSize: NonNullable<TextStyle["fontSize"]>;
};

export const Typography: {
  maxFontSizeMultiplier: number;
  button: {
    text: TTypographyStyle;
    label: TTypographyStyle;
  };
  text: {
    text: TTypographyStyle;
  };
  checkbox: {
    text: TTypographyStyle;
    error: TTypographyStyle;
  };
  radio: {
    text: TTypographyStyle;
    error: TTypographyStyle;
  };
  infobox: {
    text: TTypographyStyle;
  };
  toast: {
    text: TTypographyStyle;
  };
  dialog: {
    title: TTypographyStyle;
    message: TTypographyStyle;
  };
  accordion: {
    title: TTypographyStyle;
    subtitle: TTypographyStyle;
  };
  chip: {
    text: TTypographyStyle;
  };
  progressBar: {
    label: TTypographyStyle;
    value: TTypographyStyle;
  };
  modal: {
    title: TTypographyStyle;
    subtitle: TTypographyStyle;
  };
  header: {
    title: TTypographyStyle;
  };
  slider: {
    value: TTypographyStyle;
    label: TTypographyStyle;
  };
  input: {
    text: TTypographyStyle;
    label: TTypographyStyle;
    error: TTypographyStyle;
  };
  inputNumber: {
    text: TTypographyStyle;
    label: TTypographyStyle;
    error: TTypographyStyle;
  };
  inputOTP: {
    text: TTypographyStyle;
    label: TTypographyStyle;
    error: TTypographyStyle;
  };
  inputArea: {
    text: TTypographyStyle;
    label: TTypographyStyle;
    error: TTypographyStyle;
  };
  tabs: {
    label: TTypographyStyle;
  };
  badge: {
    label: TTypographyStyle;
  };
  select: {
    label: TTypographyStyle;
    value: TTypographyStyle;
    error: TTypographyStyle;
    search: TTypographyStyle;
    empty: TTypographyStyle;
    item: TTypographyStyle;
  };
  dropdown: {
    item: TTypographyStyle;
  };
  divider: {
    label: TTypographyStyle;
  };
  toggle: {
    text: TTypographyStyle;
    error: TTypographyStyle;
  };
} = {
  maxFontSizeMultiplier: 2,
  button: {
    text: {
      fontSize: 16,
      flexShrink: 1,
    },
    label: {
      fontSize: 16,
      flexShrink: 1,
    },
  },
  text: {
    text: {
      fontSize: 16,
      flexShrink: 1,
    },
  },
  checkbox: {
    text: {
      fontSize: 16,
      flexShrink: 1,
    },
    error: {
      fontSize: 12,
      flexShrink: 1,
    },
  },
  radio: {
    text: {
      fontSize: 16,
      flexShrink: 1,
    },
    error: {
      fontSize: 12,
      flexShrink: 1,
    },
  },
  infobox: {
    text: {
      fontSize: 16,
      flexShrink: 1,
    },
  },
  toast: {
    text: {
      fontSize: 14,
      flexShrink: 1,
    },
  },
  dialog: {
    title: {
      fontSize: 16,
      fontWeight: "600",
      flexShrink: 1,
    },
    message: {
      fontSize: 14,
      flexShrink: 1,
    },
  },
  accordion: {
    title: {
      fontSize: 16,
      flexShrink: 1,
      letterSpacing: 0.1,
    },
    subtitle: {
      fontSize: 14,
      flexShrink: 1,
      letterSpacing: 0.1,
    },
  },
  chip: {
    text: {
      fontSize: 14,
      flexShrink: 1,
      letterSpacing: 0.1,
    },
  },
  progressBar: {
    label: {
      fontSize: 12,
      flexShrink: 1,
    },
    value: {
      fontSize: 14,
      fontWeight: "500",
    },
  },
  modal: {
    title: {
      fontSize: 16,
      fontWeight: "600",
      flexShrink: 1,
    },

    subtitle: {
      fontSize: 14,
      flexShrink: 1,
    },
  },
  header: {
    title: {
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: 0.15,
    },
  },
  slider: {
    value: {
      fontSize: 14,
      flexShrink: 1,
    },
    label: {
      fontSize: 12,
      flexShrink: 1,
    },
  },
  input: {
    text: {
      fontSize: 16,
      flexShrink: 1,
    },
    label: {
      fontSize: 14,
      flexShrink: 1,
      letterSpacing: 0.1,
    },
    error: {
      fontSize: 12,
      flexShrink: 1,
    },
  },
  inputNumber: {
    text: {
      fontSize: 16,
      flexShrink: 1,
    },
    label: {
      fontSize: 14,
      flexShrink: 1,
      letterSpacing: 0.1,
    },
    error: {
      fontSize: 12,
      flexShrink: 1,
    },
  },
  inputOTP: {
    text: {
      fontSize: 20,
      fontWeight: "600",
      flexShrink: 1,
    },

    label: {
      fontSize: 14,
      flexShrink: 1,
      letterSpacing: 0.1,
    },

    error: {
      fontSize: 12,
      flexShrink: 1,
    },
  },
  inputArea: {
    text: {
      fontSize: 16,
      flexShrink: 1,
    },
    label: {
      fontSize: 14,
      flexShrink: 1,
      letterSpacing: 0.1,
    },
    error: {
      fontSize: 12,
      flexShrink: 1,
    },
  },
  tabs: {
    label: {
      fontSize: 14,
    },
  },
  badge: {
    label: {
      fontSize: 10,
      fontWeight: "600",
    },
  },
  select: {
    label: {
      fontSize: 14,
      fontWeight: "500",
    },
    value: {
      fontSize: 16,
      fontWeight: "400",
    },
    error: {
      fontSize: 12,
      fontWeight: "400",
    },
    search: {
      fontSize: 14,
      fontWeight: "400",
    },
    empty: {
      fontSize: 14,
      fontWeight: "400",
    },
    item: {
      fontSize: 16,
      fontWeight: "400",
    },
  },
  dropdown: {
    item: {
      fontSize: 16,
      fontWeight: "400",
      flexShrink: 1,
    },
  },
  divider: {
    label: {
      fontSize: 12,
      fontWeight: "500",
      flexShrink: 1,
    },
  },
  toggle: {
    text: {
      fontSize: 16,
      flexShrink: 1,
    },

    error: {
      fontSize: 12,
      flexShrink: 1,
    },
  },
};
