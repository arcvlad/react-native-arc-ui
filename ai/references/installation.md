# ARCUI Installation and Setup

Use this reference when adding `react-native-arc-ui` to an application or
repairing an ARCUI setup.

Always prefer dependency versions compatible with the consumer's React Native
or Expo version.

## ARCUI 1.x compatibility

ARCUI 1.x expects:

```text
React                        >= 19.0.0
React Native                 >= 0.78.0
React Native Gesture Handler >= 2.28.0
React Native Reanimated      >= 3.19.0 < 5.0.0
React Native SVG             >= 15.0.0
```

ARCUI 1.x intentionally stays on the API surface shared by supported
Reanimated 3.19+ and Reanimated 4 releases.

`react-native-worklets` is not an ARCUI 1.x peer dependency.

If the consumer uses Reanimated 4, satisfy the Worklets requirements of that
Reanimated/React Native/Expo combination.

Do not force Worklets into a Reanimated 3 consumer.

## Expo

Install ARCUI:

```bash
npm install react-native-arc-ui
```

Install native peers with Expo-compatible versions:

```bash
npx expo install react-native-reanimated react-native-gesture-handler react-native-svg
```

If the installed Expo/Reanimated version requires `react-native-worklets`,
install the Expo-compatible Worklets version as part of the Reanimated setup:

```bash
npx expo install react-native-worklets
```

Do not hardcode another Expo SDK's dependency versions.

Use `expo install` to resolve versions appropriate for the current Expo SDK.

## Bare React Native

Install ARCUI and its peer dependencies with the application's package manager:

```bash
npm install react-native-arc-ui react-native-reanimated react-native-gesture-handler react-native-svg
```

Then complete the official setup required by the installed versions of
Reanimated and React Native Gesture Handler.

If Reanimated 4 is used, also satisfy that version's Worklets requirements.

## Provider

Wrap the ARCUI application tree with `ARCUI`:

```tsx
import { ARCUI } from "react-native-arc-ui";

export default function App() {
  return <ARCUI>{/* application */}</ARCUI>;
}
```

The provider establishes ARCUI-wide:

- static theme and tokens;
- animated theme progress;
- font-scale system state;
- safe-area values supplied to ARCUI;
- localized ARCUI strings;
- icon registry;
- Modal, Dropdown, Toast, and Dialog infrastructure.

Do not manually mount ARCUI's internal overlay providers.

## Gesture Handler root

`ARCUI` enables its `GestureHandlerRootView` wrapper by default.

Most ARCUI consumers do not need to add another root only for ARCUI.

If the application already owns the Gesture Handler root architecture and needs
to keep that ownership, inspect the current `TARCUIProps` contract and use the
provider's `gestureHandlerRootView` option intentionally.

Do not change an existing app's root architecture without a concrete reason.

## Theme mode

ARCUI supports:

```tsx
<ARCUI theme="system">{children}</ARCUI>
<ARCUI theme="light">{children}</ARCUI>
<ARCUI theme="dark">{children}</ARCUI>
```

`system` is the normal choice when the app should follow platform appearance.

Theme mode is runtime-reactive.

## Tokens

Pass design-system token configuration through the provider:

```tsx
import {
  ARCUI,
  defaultTokens,
  type TTokensOverride,
} from "react-native-arc-ui";

const tokens = {
  spacing: {
    ...defaultTokens.spacing,
    l: 24,
  },
} satisfies TTokensOverride;

export default function App() {
  return <ARCUI tokens={tokens}>{/* application */}</ARCUI>;
}
```

Token configuration is resolved for the provider mount and is not intended as
frequently changing runtime state.

Read:

`tokens-and-theming.md`

before creating non-trivial overrides.

## Custom icon registry

ARCUI exports `defaultIcons` and supports a provider-level `iconSet`.

A configured icon set must contain ARCUI's required built-in icon names.
Additional application-specific icons are allowed.

Use the exported `TIconSet` type and inspect the installed declarations for the
exact contract.

Icon-set configuration is application-level configuration and is resolved for
the provider mount.

## Safe-area values

ARCUI exposes safe-area information through its system context and uses it in
components such as `Screen` and overlays.

The provider accepts `safeAreaInsets`.

ARCUI does not discover device insets from a separate safe-area package on its
own. Omitted provider edges resolve to `0`, so applications that require real
device insets should pass values from their established navigation/safe-area
source into `ARCUI`.

Preserve the consumer application's established safe-area source and pass the
resolved values into ARCUI where needed.

Do not introduce a second safe-area architecture solely for ARCUI if the app
already has one.

## Localization

Provider-level `strings` overrides ARCUI-owned reusable strings.

Strings are separate from design tokens and are runtime-reactive.

Read:

`localization.md`

for localization-specific setup.

## Minimal screen

```tsx
import {
  ARCUI,
  Screen,
  Text,
} from "react-native-arc-ui";

export default function App() {
  return (
    <ARCUI>
      <Screen>
        <Text>Welcome</Text>
      </Screen>
    </ARCUI>
  );
}
```

## Imports

Use:

```ts
import { Button } from "react-native-arc-ui";
```

Testing utilities use:

```ts
import { ARCUIMock } from "react-native-arc-ui/testing";
```

Do not use deep imports from `src`, `dist/components`, or other implementation
paths.

## Setup verification

After setup, verify:

1. the application renders beneath `ARCUI`;
2. peer dependencies resolve without incompatible-version warnings;
3. Reanimated is configured for the installed environment;
4. Gesture Handler is configured for the installed environment;
5. ARCUI components render in both light and dark mode when relevant;
6. gestures used by Modal/Slider and other interactive components work;
7. TypeScript resolves the root package declarations;
8. real device safe-area insets are supplied when the application requires
them;
9. no internal ARCUI providers or deep imports were added unnecessarily.
