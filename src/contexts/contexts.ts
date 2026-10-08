import { createContext } from "react";

import type { TARCUIStrings } from "../strings/Strings";
import type { TStaticTheme, TAnimatedTheme, TSystemContext } from "./types";

export const StaticThemeContext = createContext<TStaticTheme | null>(null);

export const AnimatedThemeContext = createContext<TAnimatedTheme | null>(null);

export const SystemContext = createContext<TSystemContext | null>(null);

export const StringsContext = createContext<TARCUIStrings | null>(null);
