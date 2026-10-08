import { Platform } from "react-native";

/**
 * Keeps Android native overlay ordering aligned with ARCUI's zIndex hierarchy.
 *
 * Elevation is used here exclusively for native ordering, never as a visual
 * Material shadow. The transparent shadow color suppresses that visual side
 * effect where Android supports it.
 *
 * If a platform-specific workaround is ever required, it should be implemented
 * here rather than patched into individual overlay components.
 */
export const platformElevation = (zIndex: number) =>
  Platform.select({
    android: {
      elevation: zIndex,
      shadowColor: "rgba(0,0,0,0)",
    },
    default: {},
  });

/**
 * Enables GPU rasterization for animation-heavy surfaces.
 * Use selectively: it can improve animation smoothness while increasing
 * memory usage.
 */
export const hardwareAcceleration = Platform.select({
  ios: { shouldRasterizeIOS: true },
  android: { renderToHardwareTextureAndroid: true },
  default: {},
});
