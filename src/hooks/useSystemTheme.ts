import { useEffect, useState } from "react";
import { Appearance } from "react-native";

/**
 * Tracks the system color scheme reactively.
 * Appearance may report `null`, in which case ARCUI uses light mode.
 */
export const useSystemTheme = (): "light" | "dark" => {
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
    Appearance.getColorScheme() === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === "dark" ? "dark" : "light");
    });

    return () => listener.remove();
  }, []);

  return systemTheme;
};
