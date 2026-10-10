# ARCUI Tokens and Theming

Use this reference when configuring ARCUI design tokens, consuming theme
information, or creating theme-aware application components.

ARCUI is tokens/config-first, but not every application value should become a
token.

## Theme modes

`ARCUI` supports:

```tsx
<ARCUI theme="system">{children}</ARCUI>
<ARCUI theme="light">{children}</ARCUI>
<ARCUI theme="dark">{children}</ARCUI>
```

`system` follows the resolved platform theme.

Theme switching is runtime-reactive.

## Static theme access

Use:

```tsx
import { useARCUITheme } from "react-native-arc-ui";

const {
  theme,
  themeMode,
  tokens,
  iconSet,
} = useARCUITheme();
```

for normal render-time theme and token access.

Do not use animated theme state when a component only needs static values.

## Animated theme access

Use:

```tsx
const { themeProgress } = useARCUIAnimatedTheme();
```

only when a custom visual component needs frame-level theme interpolation.

ARCUI uses:

```text
themeProgress = 0 -> dark
themeProgress = 1 -> light
```

Therefore Reanimated color interpolation order is:

```text
[darkColor, lightColor]
```

Never read `themeProgress.value` during normal React render.

## Public token values

ARCUI publicly exports:

```tsx
import {
  defaultTokens,
  Colors,
  ColorsLight,
  ColorsDark,
  Sizings,
  Spacing,
  SafeArea,
  Radius,
  Border,
  Typography,
  ZIndex,
} from "react-native-arc-ui";
```

The exact token surface is defined by the installed `TTokens` declaration.

## Built-in token namespaces

Current ARCUI built-in namespaces include:

```text
colors
radius
border
typography
spacing
safeArea
sizings
zIndex
animations
pressAnimation
springConfig
enteringExiting
dialogAnimations
accordionAnimations
infoboxAnimations
fluidViewAnimations
headerAnimations
modalAnimations
selectAnimations
tabsAnimations
dropdownAnimations
progressBarAnimations
checkboxAnimations
radioAnimations
toggleAnimations
toastAnimations
skeletonAnimations
sliderAnimations
spinnerLoaderAnimations
```

Do not invent token namespaces.

Check the installed version's declarations when exact names matter.

## Top-level replacement

ARCUI token overrides are shallow at the top level.

A namespace may be omitted.

When a built-in namespace is supplied, it is a complete replacement for that
top-level namespace.

ARCUI does not recursively deep-merge nested token objects.

Incorrect partial replacement:

```tsx
const tokens = {
  spacing: {
    l: 24,
  },
};
```

Correct explicit composition when defaults should be preserved:

```tsx
import {
  defaultTokens,
  type TTokensOverride,
} from "react-native-arc-ui";

const tokens = {
  spacing: {
    ...defaultTokens.spacing,
    l: 24,
  },
} satisfies TTokensOverride;
```

Then:

```tsx
<ARCUI tokens={tokens}>
  {children}
</ARCUI>
```

Do not build hidden recursive merge logic around ARCUI token configuration.

## Token lifecycle

Design-token configuration is resolved for the ARCUI provider mount.

It is application-level design-system configuration, not frequently changing
runtime state.

If design configuration fundamentally changes, remounting the relevant ARCUI
provider is the supported model.

This rule does not apply to runtime-reactive concerns such as:

- theme mode;
- font scale;
- safe-area values;
- localization strings.

## Custom tokens

Applications may add custom top-level token namespaces.

Use a reusable custom-token type:

```tsx
type TAppTokens = {
  brand: {
    contentMaxWidth: number;
  };
};
```

Then:

```tsx
const tokens: TTokensOverride<TAppTokens> = {
  brand: {
    contentMaxWidth: 640,
  },
};

<ARCUI<TAppTokens> tokens={tokens}>
  {children}
</ARCUI>;
```

Consume with the same type:

```tsx
const { tokens } = useARCUITheme<TAppTokens>();

const maxWidth = tokens.brand.contentMaxWidth;
```

Do not collide with built-in ARCUI token namespace names.

Do not use `any` or unsafe assertions when the generic public contract can type
the custom namespace.

## What should be a token

Good token candidates:

- reusable semantic colors;
- typography styles;
- spacing scale;
- standard radii;
- borders;
- reusable component dimensions;
- safe-area policy;
- animation configuration;
- press behavior;
- z-index policy.

Keep local values local when they are:

- one-screen layout details;
- content-specific offsets;
- pure mathematical constants;
- internal calculations;
- temporary implementation details.

Avoid both extremes: widespread hardcoding and tokenizing every literal.

## Colors

Prefer semantic ARCUI color tokens for shared design-system intent.

ARCUI maintains light and dark token surfaces.

When a custom component should adapt to both themes, use the appropriate
resolved tokens or an ARCUI theme-aware primitive.

Use fixed colors only when they are intentionally fixed across themes.

For component-specific color precedence, inspect that component's public API.

Do not assume every component resolves color overrides identically.

## `ThemedView`

Use `ThemedView` for theme-aware background surfaces.

Its background ownership is:

```text
color
↓
complete darkColor + lightColor pair
↓
style.backgroundColor
↓
ARCUI ThemedView tokens
```

An incomplete dark/light pair is not a complete theme override.

Use a normal `View` when theme-aware background behavior is not needed.

## `Text`

ARCUI `Text` uses ARCUI theme colors by default and preserves a native
`style.color` escape hatch.

Read `typography.md` for its exact font-scaling and style ownership model.

## `ReverseTheme`

Use `ReverseTheme` when a whole subtree should consume the opposite animated
ARCUI theme.

```tsx
<ReverseTheme>
  <Text>Opposite theme content</Text>
</ReverseTheme>
```

It inverts ARCUI `themeProgress` for descendants.

`ReverseTheme` does not rewrite the static `theme` or `themeMode` returned by
`useARCUITheme()`. Custom visuals that must participate in subtree inversion
should use ARCUI's animated theme context for the visual property rather than
branching only on the static theme value.

Nested `ReverseTheme` regions restore the original animated theme relationship.

Do not manually reverse every child color when subtree inversion is the real
requirement.

## Animation tokens

Use component-specific animation tokens before global animation fallback when
creating ARCUI-consistent custom behavior.

Do not assume every component uses identical duration/easing.

Read `motion.md`.

## Safe-area tokens

ARCUI safe-area policy is tokenized and resolved together with provider system
insets.

For each component edge, ARCUI safe-area token semantics are:

```text
false -> ignore the device inset for that edge
0     -> use the device inset only
N     -> use the device inset + N
```

Provider `safeAreaInsets` values are runtime-reactive. Omitted edges resolve to
`0`.

Use `useARCUISystem()` when custom application code needs current ARCUI
safe-area values.

Do not create a parallel ARCUI-specific safe-area system.

## Strings are not tokens

Localized ARCUI-owned strings belong to the strings system, not design tokens.

Do not place accessibility copy, placeholders, or reusable behavior strings in
token namespaces.

Read `localization.md`.

## Checklist

1. Use `useARCUITheme` for normal token access.
2. Use animated theme state only for genuine frame-level interpolation.
3. Never read SharedValue `.value` during normal render.
4. Treat supplied built-in token namespaces as complete replacements.
5. Compose partial changes explicitly from existing defaults.
6. Keep custom tokens at new top-level namespaces.
7. Reuse the same custom-token type at provider and hook boundaries.
8. Use tokens for design-system intent, not every literal.
9. Verify both light and dark appearance when applicable.
10. Keep localization strings separate from tokens.
