import { useContext } from "react";

import {
  StaticThemeContext,
  AnimatedThemeContext,
  SystemContext,
  StringsContext,
} from "./contexts";
import type { TStaticTheme, TAnimatedTheme, TSystemContext } from "./types";
import type { TARCUIStrings } from "../strings/Strings";
import { errors } from "../utils/errors";

export const useARCUITheme = <
  TCustom extends object = Record<never, never>,
>(): TStaticTheme<TCustom> => {
  const context = useContext(StaticThemeContext);

  if (!context) {
    throw new Error(errors.hook("useARCUITheme", "ARCUI"));
  }

  /**
   * React Context cannot carry a provider-specific generic through useContext.
   * The assertion is intentionally isolated at this public generic boundary so
   * consumers can recover the custom-token type they supplied to ARCUI without
   * weakening the runtime context or introducing any/unknown casts elsewhere.
   */
  return context as TStaticTheme<TCustom>;
};

export const useARCUIAnimatedTheme = (): TAnimatedTheme => {
  const context = useContext(AnimatedThemeContext);

  if (!context) {
    throw new Error(errors.hook("useARCUIAnimatedTheme", "ARCUI"));
  }

  return context;
};

export const useARCUISystem = (): TSystemContext => {
  const context = useContext(SystemContext);

  if (!context) {
    throw new Error(errors.hook("useARCUISystem", "ARCUI"));
  }

  return context;
};

export const useARCUIStrings = (): TARCUIStrings => {
  const context = useContext(StringsContext);

  if (!context) {
    throw new Error(errors.hook("useARCUIStrings", "ARCUI"));
  }

  return context;
};
