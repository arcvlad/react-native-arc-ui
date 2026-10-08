import { useEffect, useState } from "react";
import { AppState, Dimensions, type ScaledSize } from "react-native";

/**
 * Tracks the current system font scale.
 *
 * Dimensions handles normal runtime changes. AppState is kept as a fallback
 * because a platform may not emit a Dimensions change while the app is in the
 * background; the current value is therefore re-read whenever the app becomes
 * active again.
 */
export const useFontScale = (): number => {
  const [fontScale, setFontScale] = useState<number>(
    Dimensions.get("window").fontScale ?? 1,
  );

  useEffect(() => {
    const updateFontScale = () => {
      const next = Dimensions.get("window").fontScale ?? 1;
      setFontScale((current) => (current === next ? current : next));
    };

    const dimensionsListener = Dimensions.addEventListener(
      "change",
      ({ window }: { window: ScaledSize }) => {
        const next = window.fontScale ?? 1;
        setFontScale((current) => (current === next ? current : next));
      },
    );

    const appStateListener = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState === "active") {
          updateFontScale();
        }
      },
    );

    return () => {
      dimensionsListener.remove();
      appStateListener.remove();
    };
  }, []);

  return fontScale;
};
