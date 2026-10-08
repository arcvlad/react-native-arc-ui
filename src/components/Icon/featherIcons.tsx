import { defaultIcons } from "./defaultIcons";

/**
 * Feather icon set.
 *
 * Currently contains ARCUI's required Feather subset.
 * Additional Feather glyphs can be added here without changing Icon.
 */
export const featherIcons = {
  ...defaultIcons,
} as const;

export type TFeatherIconType = keyof typeof featherIcons;

export default featherIcons;
