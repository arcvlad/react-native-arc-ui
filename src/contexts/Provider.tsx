import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState, StyleSheet, type AppStateStatus } from "react-native";
import {
  cancelAnimation,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useSystemTheme } from "../hooks/useSystemTheme";
import { useFontScale } from "../hooks/useFontScale";
import { defaultTokens } from "../tokens";
import type { TThemeWithCustomTokens, TTokensOverride } from "../types/tokens";
import { resolveStrings, type TARCUIStringsOverride } from "../strings/Strings";

import { resolveAnimation } from "../utils/resolveAnimation";
import { errors } from "../utils/errors";

import { ToastProvider } from "../components/Toast/ToastProvider";
import { DialogProvider } from "../components/Dialog/DialogContext";
import { Dialog } from "../components/Dialog/Dialog";
import { ModalProvider } from "../components/Modal/ModalProvider";
import { DropdownProvider } from "../components/Dropdown/DropdownProvider";
import { defaultIcons } from "../components/Icon/defaultIcons";
import type { TIconSet } from "../components/Icon/types";

import {
  StaticThemeContext,
  AnimatedThemeContext,
  SystemContext,
  StringsContext,
} from "./contexts";

import type { TSafeAreaInsets, TStaticTheme } from "./types";

export type {
  TStaticTheme,
  TAnimatedTheme,
  TSystemContext,
  TSafeAreaInsets,
} from "./types";

export type TARCUIProps<TCustom extends object = Record<never, never>> = {
  children: ReactNode;

  theme?: "system" | "light" | "dark";

  tokens?: TTokensOverride<TCustom>;

  strings?: TARCUIStringsOverride;

  /**
   * Global icon registry used by Icon and ARCUI-owned icon consumers.
   *
   * The registry is resolved once per ARCUI provider mount.
   *
   * @default defaultIcons
   */
  iconSet?: TIconSet;

  onBack?: () => void;

  gestureHandlerRootView?: boolean;

  safeAreaInsets?: Partial<TSafeAreaInsets>;
};

const resolveTokens = <TCustom extends object = Record<never, never>>(
  override?: TTokensOverride<TCustom>,
): TThemeWithCustomTokens<TCustom> => {
  /**
   * TypeScript cannot prove that an arbitrary generic TCustom survives object
   * spread. Runtime ownership is nevertheless exact here:
   * defaultTokens supplies every built-in namespace, while override replaces
   * only explicitly supplied top-level namespaces and appends custom ones.
   */
  return {
    ...defaultTokens,
    ...override,
  } as TThemeWithCustomTokens<TCustom>;
};

const resolveIconSet = (iconSet?: TIconSet): TIconSet => {
  const resolvedIconSet: TIconSet = iconSet ?? defaultIcons;

  const missingRequiredIcons = Object.keys(defaultIcons).filter(
    (type) => resolvedIconSet[type] == null,
  );

  if (missingRequiredIcons.length > 0) {
    throw new Error(
      errors.prop(
        "ARCUI",
        "iconSet",
        `Missing required icons: ${missingRequiredIcons.join(", ")}.`,
      ),
    );
  }

  return resolvedIconSet;
};

function ARCUIProvider<TCustom extends object = Record<never, never>>({
  children,
  theme = "system",
  tokens,
  strings,
  iconSet,
  onBack,
  gestureHandlerRootView = true,
  safeAreaInsets,
}: TARCUIProps<TCustom>) {
  const systemTheme = useSystemTheme();
  const systemFontScale = useFontScale();
  const prefersReducedMotion = useReducedMotion();

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? systemTheme : theme;

  const resolvedStrings = useMemo(() => resolveStrings(strings), [strings]);

  const resolvedSafeAreaInsets = useMemo<TSafeAreaInsets>(
    () => ({
      top: Math.max(0, safeAreaInsets?.top ?? 0),
      right: Math.max(0, safeAreaInsets?.right ?? 0),
      bottom: Math.max(0, safeAreaInsets?.bottom ?? 0),
      left: Math.max(0, safeAreaInsets?.left ?? 0),
    }),
    [
      safeAreaInsets?.top,
      safeAreaInsets?.right,
      safeAreaInsets?.bottom,
      safeAreaInsets?.left,
    ],
  );

  /**
   * Token configuration is application-level design-system configuration.
   * It is intentionally resolved once per ARCUI mount rather than treated as
   * frequently changing runtime state.
   */
  const [resolvedTokens] = useState<TThemeWithCustomTokens<TCustom>>(() =>
    resolveTokens(tokens),
  );

  /**
   * Icon-set configuration is an application-level design-system decision.
   * Like tokens, it is resolved once per ARCUI provider mount.
   */
  const [resolvedIconSet] = useState<TIconSet>(() => resolveIconSet(iconSet));

  const themeProgress = useSharedValue(resolvedTheme === "light" ? 1 : 0);

  const initialFontScale = Math.min(
    systemFontScale ?? 1,
    resolvedTokens.typography.maxFontSizeMultiplier,
  );

  const fontScale = useSharedValue(initialFontScale);

  const animationConfig = useMemo(
    () => resolveAnimation(resolvedTokens.animations),
    [resolvedTokens.animations],
  );

  const animateTheme = useCallback(
    (targetValue: number, instant: boolean) => {
      cancelAnimation(themeProgress);

      if (instant || prefersReducedMotion) {
        themeProgress.value = targetValue;
        return;
      }

      themeProgress.value = withTiming(targetValue, animationConfig);
    },
    [prefersReducedMotion, themeProgress, animationConfig],
  );

  useEffect(() => {
    animateTheme(resolvedTheme === "light" ? 1 : 0, false);
  }, [resolvedTheme, animateTheme]);

  useEffect(() => {
    const limited = Math.min(
      systemFontScale ?? 1,
      resolvedTokens.typography.maxFontSizeMultiplier,
    );

    cancelAnimation(fontScale);

    if (prefersReducedMotion) {
      fontScale.value = limited;
      return;
    }

    fontScale.value = withTiming(limited, animationConfig);
  }, [
    systemFontScale,
    fontScale,
    prefersReducedMotion,
    resolvedTokens.typography.maxFontSizeMultiplier,
    animationConfig,
  ]);

  const appStateRef = useRef<AppStateStatus>(AppState.currentState ?? "active");

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        cancelAnimation(themeProgress);
        cancelAnimation(fontScale);

        themeProgress.value = resolvedTheme === "light" ? 1 : 0;
        fontScale.value = Math.min(
          systemFontScale ?? 1,
          resolvedTokens.typography.maxFontSizeMultiplier,
        );
      }

      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [
    resolvedTheme,
    systemFontScale,
    themeProgress,
    fontScale,
    resolvedTokens.typography.maxFontSizeMultiplier,
  ]);

  const staticValue = useMemo<TStaticTheme<TCustom>>(
    () => ({
      theme: resolvedTheme,
      themeMode: theme,
      tokens: resolvedTokens,
      iconSet: resolvedIconSet,
      onBack,
    }),
    [resolvedTheme, theme, resolvedTokens, resolvedIconSet, onBack],
  );

  const animatedValue = useMemo(
    () => ({
      themeProgress,
    }),
    [themeProgress],
  );

  const systemValue = useMemo(
    () => ({
      fontScale,
      safeAreaInsets: resolvedSafeAreaInsets,
    }),
    [fontScale, resolvedSafeAreaInsets],
  );

  /**
   * ARCUI owns one global overlay hierarchy. Provider nesting mirrors the
   * intended visual order so component-level overlays do not create competing
   * roots or platform-specific stacking rules.
   *
   * Application → Modal → Dropdown → Toast → Dialog backdrop → Dialog
   */
  const content = (
    <StringsContext.Provider value={resolvedStrings}>
      <StaticThemeContext.Provider value={staticValue}>
        <AnimatedThemeContext.Provider value={animatedValue}>
          <SystemContext.Provider value={systemValue}>
            <DialogProvider renderDialog={<Dialog />}>
              <ToastProvider>
                <DropdownProvider>
                  <ModalProvider>{children}</ModalProvider>
                </DropdownProvider>
              </ToastProvider>
            </DialogProvider>
          </SystemContext.Provider>
        </AnimatedThemeContext.Provider>
      </StaticThemeContext.Provider>
    </StringsContext.Provider>
  );

  if (gestureHandlerRootView) {
    return (
      <GestureHandlerRootView style={styles.root}>
        {content}
      </GestureHandlerRootView>
    );
  }

  return content;
}

export function ARCUI<TCustom extends object = Record<never, never>>(
  props: TARCUIProps<TCustom>,
): React.JSX.Element {
  return <ARCUIProvider {...props} />;
}

ARCUI.displayName = "ARCUI";

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
