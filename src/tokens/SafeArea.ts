export type TSafeAreaOffset = number | false;

export type TSafeAreaComponentTokens = {
  top: TSafeAreaOffset;
  right: TSafeAreaOffset;
  bottom: TSafeAreaOffset;
  left: TSafeAreaOffset;
};

export type TSafeAreaTokens = {
  modal: TSafeAreaComponentTokens;
  toast: TSafeAreaComponentTokens;
  dropdown: TSafeAreaComponentTokens;
  dialog: TSafeAreaComponentTokens;
  screen: TSafeAreaComponentTokens;
  header: TSafeAreaComponentTokens;
};

/**
 * Safe-area token semantics:
 *
 * false -> ignore the device inset for this edge
 * 0     -> use only the device inset
 * N     -> use device inset + N
 */
export const SafeArea: TSafeAreaTokens = {
  modal: {
    top: 0,
    right: false,
    bottom: 16,
    left: false,
  },
  toast: {
    top: 16,
    right: 16,
    bottom: 24,
    left: 16,
  },
  dropdown: {
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
  },
  dialog: {
    top: 16,
    right: 16,
    bottom: 16,
    left: 16,
  },
  screen: {
    top: 0,
    right: false,
    bottom: false,
    left: false,
  },
  header: {
    top: false,
    right: false,
    bottom: false,
    left: false,
  },
};
