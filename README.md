# react-native-arc-ui

**ARCUI** is a modern React Native UI library focused on accessible components, predictable APIs, design tokens, and UI-thread-first motion.

Built for React 19, modern React Native, Reanimated, and both Expo and bare React Native applications.

Current version: **1.0.0**.

## Highlights

- Accessible React Native components with native roles and semantic state
- UI-thread-first motion powered by Reanimated
- Light, dark, system, and reversed theme composition
- Token-driven colors, typography, spacing, sizing, radii, borders, animation, and safe-area behavior
- Centralized ARCUI font scaling with Dynamic Type support
- Reduced Motion support
- Predictable controlled state ownership for semantic application state
- SelectionGroup coordination for selection-aware controls
- Runtime-localizable ARCUI-owned strings
- Provider-owned Toast and Dialog lifecycle
- TypeScript-first public APIs
- Expo and bare React Native support
- React Native New Architecture support

## Installation

Install ARCUI and its peer dependencies:

```bash
npm install react-native-arc-ui react-native-reanimated react-native-gesture-handler react-native-svg
```

For Expo projects:

```bash
npm install react-native-arc-ui
npx expo install react-native-reanimated react-native-gesture-handler react-native-svg
```

Follow the official setup instructions for Reanimated and React Native Gesture Handler for the versions used by your application.

ARCUI 1.x does not require `react-native-worklets` directly. If the Reanimated version used by your application requires additional setup or dependencies, follow the installation requirements for that Reanimated and React Native combination.

## Compatibility

ARCUI 1.x supports:

| Dependency                   | Version           |
| ---------------------------- | ----------------- |
| React                        | `>=19.0.0`        |
| React Native                 | `>=0.78.0`        |
| React Native Reanimated      | `>=3.19.0 <5.0.0` |
| React Native Gesture Handler | `>=2.28.0`        |
| React Native SVG             | `>=15.0.0`        |

ARCUI primarily targets modern React Native and the New Architecture.

The 1.x line intentionally uses Reanimated APIs shared by supported Reanimated 3.19+ and 4.x releases.

## Quick start

Wrap your application with the `ARCUI` provider and keep semantic application state in React:

```tsx
import { useState } from "react";
import { ARCUI, Button, Screen, Text, Toggle } from "react-native-arc-ui";

export default function App() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <ARCUI theme="system">
      <Screen>
        <Text>Account settings</Text>

        <Toggle
          checked={notificationsEnabled}
          onCheckedChange={setNotificationsEnabled}
        >
          Notifications
        </Toggle>

        <Button onPress={() => setNotificationsEnabled(true)}>
          Enable notifications
        </Button>
      </Screen>
    </ARCUI>
  );
}
```

The provider owns ARCUI-wide infrastructure including theme state, animated theme progress, font scale, safe-area information, localization strings, and provider-managed overlay infrastructure.

## Components

### Layout and presentation

`Screen` · `ThemedView` · `Text` · `Divider` · `FluidView` · `ReverseTheme` · `Infobox` · `Badge` · `Icon`

### Actions and selection

`Button` · `Checkbox` · `Radio` · `Toggle` · `Chip` · `SelectionGroup` · `Accordion` · `AccordionGroup`

### Inputs

`Input` · `InputPassword` · `InputArea` · `InputNumber` · `InputOTP` · `Select` · `Slider`

### Navigation

`Header` · `Tab` · `TabBar` · `TabNavigation` · `TabScreen`

### Feedback and loading

`ProgressBar` · `SpinnerLoader` · `SkeletonLoader`

### Overlays

`Dropdown` · `Modal`

Toast and Dialog are exposed through provider-owned imperative APIs rather than public visual components.

## State ownership

ARCUI keeps semantic application state explicit.

Components whose public API represents application state use controlled ownership instead of maintaining a hidden second source of truth.

```tsx
import { useState } from "react";
import { Checkbox } from "react-native-arc-ui";

export function Example() {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox checked={checked} onCheckedChange={setChecked}>
      Remember this device
    </Checkbox>
  );
}
```

The consumer remains the source of truth. ARCUI requests state changes through callbacks and renders from the value supplied by the owner.

The same principle is used across selection controls, tabs, sliders, accordions, chips, and selects where semantic state belongs to the application.

### SelectionGroup

Selection-aware controls can delegate ownership to a controlled `SelectionGroup`.

```tsx
import { useState } from "react";
import { SelectionGroup, Toggle } from "react-native-arc-ui";

export function NotificationPreferences() {
  const [values, setValues] = useState<string[]>(["product"]);

  return (
    <SelectionGroup multiple values={values} onValuesChange={setValues}>
      <Toggle value="product">Product updates</Toggle>
      <Toggle value="marketing">Marketing</Toggle>
    </SelectionGroup>
  );
}
```

### Text inputs

`Input` and `InputArea` intentionally preserve React Native's native controlled and uncontrolled `TextInput` ownership.

Controlled:

```tsx
<Input value={value} onChangeText={setValue} />
```

Uncontrolled:

```tsx
<Input defaultValue="Initial value" />
```

A mounted input should not switch between controlled and uncontrolled ownership.

## Themes

ARCUI supports system, light, and dark themes.

```tsx
<ARCUI theme="system">{children}</ARCUI>
```

```tsx
<ARCUI theme="light">{children}</ARCUI>
```

```tsx
<ARCUI theme="dark">{children}</ARCUI>
```

Theme transitions are animated with Reanimated where appropriate.

`ReverseTheme` can be used to render a subtree against the opposite resolved theme while preserving ARCUI theme behavior.

ARCUI also exposes public theme/system hooks:

```ts
import {
  useARCUITheme,
  useARCUIAnimatedTheme,
  useARCUISystem,
} from "react-native-arc-ui";
```

`useARCUITheme()` provides resolved theme information and design tokens.

`useARCUIAnimatedTheme()` exposes animated theme state for custom ARCUI-compatible visual components.

`useARCUISystem()` exposes ARCUI-managed runtime system values such as font scale and safe-area information.

## Design tokens

ARCUI is tokens-first.

Default token values are available from the package root:

```ts
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

ARCUI token configuration is resolved when the provider mounts.

Top-level token overrides are intentionally shallow. When overriding a nested token group, compose it from the existing group instead of relying on recursive deep merging.

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
  return <ARCUI tokens={tokens}>{children}</ARCUI>;
}
```

Public token types include:

```ts
import type {
  TTokens,
  TTokensOverride,
  TThemeWithCustomTokens,
  TTypographyStyle,
  TSafeAreaOffset,
  TSafeAreaComponentTokens,
  TSafeAreaTokens,
} from "react-native-arc-ui";
```

ARCUI also supports application-specific custom token extensions through its generic token types.

## Localization

Reusable ARCUI-owned strings are separate from design tokens and can be overridden through the provider.

```tsx
<ARCUI
  strings={{
    modalCloseAccessibilityLabel: "Close",
    headerBackAccessibilityLabel: "Back",
    selectSearchPlaceholder: "Search",
    selectEmptyLabel: "No results",
  }}
>
  {children}
</ARCUI>
```

Strings are runtime-reactive.

The resolved strings and public string types are available through:

```ts
import {
  defaultStrings,
  useARCUIStrings,
  type TARCUIStrings,
  type TARCUIStringsOverride,
} from "react-native-arc-ui";
```

## Accessibility

Accessibility is a first-class ARCUI requirement.

ARCUI components use native roles, semantic accessibility state, accessible labels and actions, centralized font scaling, accessible validation states, Reduced Motion support, and real React semantic state rather than intermediate animation progress.

ARCUI avoids generic gesture instructions such as `"Double tap to activate"` when native accessibility roles and states already describe the interaction.

Library-owned reusable accessibility strings are localizable through the ARCUI strings system.

Consumer accessibility overrides remain available where they do not conflict with component correctness or semantic invariants.

## Typography and font scaling

ARCUI uses a central font-scale value for library-managed typography.

Text that ARCUI scales manually disables duplicate native font scaling and respects the configured maximum font-size multiplier where applicable.

Typography token slots are native-style-first. In addition to ARCUI defaults such as `fontWeight`, `fontFamily`, and `letterSpacing`, consumers can use applicable React Native `TextStyle` properties such as `fontStyle`, `fontVariant`, and `textTransform`.

`fontSize` and explicitly configured `lineHeight` values are treated as unscaled base metrics and are applied through ARCUI's central font scale.

Semantic and theme text colors remain owned by ARCUI color/state tokens or explicit component color APIs rather than typography tokens.

For example, a design system can make built-in Button labels uppercase through typography tokens:

```tsx
import {
  ARCUI,
  defaultTokens,
  type TTokensOverride,
} from "react-native-arc-ui";

const tokens = {
  typography: {
    ...defaultTokens.typography,
    button: {
      ...defaultTokens.typography.button,
      label: {
        ...defaultTokens.typography.button.label,
        textTransform: "uppercase",
      },
    },
  },
} satisfies TTokensOverride;

export default function App() {
  return <ARCUI tokens={tokens}>{children}</ARCUI>;
}
```

Components that accept custom `ReactNode` content leave that custom content's typography under consumer ownership unless the component contract explicitly states otherwise.

## Motion

ARCUI uses Reanimated for visual motion.

React state owns semantic and structural state, while SharedValues own frame-level visual state.

ARCUI favors UI-thread execution for gesture movement, transforms, theme interpolation, progress, visibility transitions, and other continuous visual feedback.

Animated components respect Reduced Motion preferences.

## Imperative APIs

### Toast

Toast is exposed through a provider-owned imperative API:

```ts
import {
  showToast,
  hideToast,
  type TToastId,
  type TToastInput,
  type TToastPlacement,
} from "react-native-arc-ui";
```

Example:

```tsx
const toastId = showToast({
  message: "Changes saved",
  placement: "bottom",
});

hideToast(toastId);
```

### Dialog

Dialog is also provider-owned and imperative:

```ts
import {
  showDialog,
  hideDialog,
  type TDialog,
  type TDialogAction,
  type TDialogActionType,
} from "react-native-arc-ui";
```

Dialog rendering and lifecycle are managed by ARCUI rather than through a public `Dialog` component.

### Modal

`Modal` uses explicit controlled visibility and is available from the root package:

```ts
import {
  Modal,
  useModal,
  type IModal,
  type TModalHeight,
} from "react-native-arc-ui";
```

## Extension APIs

ARCUI exposes selected hooks for building application-specific components that follow the same state model as built-in components.

```ts
import {
  useInputState,
  type TInputModifier,
  type IUseInputState,
  type TUseInputStateResult,
} from "react-native-arc-ui";
```

`useInputState` is intentionally public so custom input-like components can reuse ARCUI focus and modifier semantics.

Internal provider registries, component internals, and lifecycle utilities are not part of the public API contract.

## Public types

ARCUI exports component contracts and associated public unions directly from the package root.

Examples:

```ts
import type {
  IButton,
  ICheckbox,
  IRadio,
  IToggle,
  IInput,
  ISelect,
  ISlider,
  IModal,
  TIconType,
  TSelectOption,
  TDropdownPlacement,
  TToastInput,
  TToastPlacement,
} from "react-native-arc-ui";
```

Animation configuration types are also public:

```ts
import type {
  TAnimationDirection,
  TEasing,
  TPressAnimation,
} from "react-native-arc-ui";
```

## Testing

Testing utilities intentionally live under a separate package entry point.

```tsx
import { ARCUIMock } from "react-native-arc-ui/testing";
```

Example:

```tsx
render(<ARCUIMock>{children}</ARCUIMock>);
```

`ARCUIMock` is not exported from the main `react-native-arc-ui` entry point. This keeps testing infrastructure outside the production runtime surface.

## Package boundaries

ARCUI exposes these supported consumer entry points:

```ts
import { Button } from "react-native-arc-ui";
```

and:

```ts
import { ARCUIMock } from "react-native-arc-ui/testing";
```

Internal implementation paths are not part of the public API contract.

Avoid deep imports such as:

```text
react-native-arc-ui/src/...
react-native-arc-ui/dist/...
```

## TypeScript

ARCUI is written in TypeScript and ships declaration files.

Public APIs prefer exact React Native and dependency-exported types over structural substitutes.

Type-only imports are enforced throughout the source.

The public surface is intentionally explicit rather than exposing internal implementation modules through deep imports.

## Architecture principles

ARCUI 1.x follows this priority:

```text
Correctness
↓
Accessibility
↓
Predictable API
↓
Tokens and configuration
↓
UI-thread motion
↓
Performance
↓
Testability
↓
Simplicity
```

In practice:

- React state owns semantic and structural state.
- SharedValues own frame-level visual state.
- SharedValue `.value` is not read or written during normal React render.
- UI-thread motion is preferred where practical.
- Reduced Motion is supported.
- Semantic accessibility state follows real React state.
- Reusable design-system values are token-driven.
- Reusable library-owned strings are localizable.
- Cosmetic invalid input degrades safely where practical.
- Fundamental architecture invariant violations fail clearly.
- Consumer native escape hatches are preserved when they do not violate correctness or accessibility invariants.

## Project

Source code, releases, and issue tracking are hosted on GitHub.

- Repository: https://github.com/arcvlad/react-native-arc-ui
- Issues: https://github.com/arcvlad/react-native-arc-ui/issues

ARCUI follows semantic versioning. The public API starts with `1.0.0`.

## License

ARCUI is released under the MIT License.

See [`LICENSE`](./LICENSE) for the full license text.
