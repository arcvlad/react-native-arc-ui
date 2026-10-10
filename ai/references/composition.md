# ARCUI Composition

Use this reference when building or modifying complete application interfaces.

ARCUI provides semantic UI components and selected layout primitives. It does
not replace the React Native layout system.

## Composition order

Build in this order:

1. identify semantic screen regions;
2. identify interactions and application state;
3. map supported controls to ARCUI components;
4. use React Native layout primitives for app-specific structure;
5. apply ARCUI tokens where values represent reusable design-system decisions;
6. preserve accessibility, theme, font scaling, and Reduced Motion;
7. add custom animation only when existing ARCUI behavior does not satisfy the
   requirement.

Do not reproduce every visible rectangle with custom controls.

Do not replace every `View` with an ARCUI component.

## Screen root

Use `Screen` as the normal ARCUI screen-level surface when ARCUI screen
background and safe-area behavior are desired.

```tsx
import {
  Screen,
  Text,
} from "react-native-arc-ui";

export function ExampleScreen() {
  return (
    <Screen>
      <Text>Content</Text>
    </Screen>
  );
}
```

`Screen` is not a scrolling primitive.

## Scrolling and lists

Compose native scrolling primitives inside `Screen`:

```tsx
import { ScrollView } from "react-native";
import {
  Screen,
  Text,
} from "react-native-arc-ui";

export function ExampleScreen() {
  return (
    <Screen>
      <ScrollView>
        <Text>Scrollable content</Text>
      </ScrollView>
    </Screen>
  );
}
```

Use `FlatList`, `SectionList`, or another appropriate native primitive for data
sets that need list virtualization.

Do not replace efficient list primitives with manually rendered scrolling
content just to keep every element ARCUI-specific.

## Application layout

Use React Native layout primitives for normal app-specific structure:

- rows;
- columns;
- sections;
- flex layouts;
- application-specific cards;
- positioning;
- content grouping.

Example:

```tsx
import { View } from "react-native";
import {
  Button,
  Text,
} from "react-native-arc-ui";

<View>
  <Text>Title</Text>
  <Text>Supporting content</Text>
  <Button onPress={handleContinue}>Continue</Button>
</View>;
```

The surrounding layout may be app-specific while the semantic action remains an
ARCUI `Button`.

## `ThemedView`

Use `ThemedView` when a container background should participate in ARCUI
light/dark theme behavior.

```tsx
import {
  Text,
  ThemedView,
} from "react-native-arc-ui";

<ThemedView>
  <Text>Themed content</Text>
</ThemedView>;
```

Use a normal `View` when theme-aware background behavior is not needed.

Do not use `ThemedView` merely to avoid importing `View`.

## `FluidView`

`FluidView` is an opt-in layout-animation wrapper.

Use it when an element's position or dimensions should transition smoothly as
normal React Native layout changes.

Typical uses:

- validation messages appearing or disappearing;
- conditional fields;
- dynamic content;
- expandable regions;
- sibling repositioning.

It also supports explicit entering/exiting presence transitions.

```tsx
import {
  FluidView,
  Text,
} from "react-native-arc-ui";

<FluidView entering exiting>
  <Text>Dynamic content</Text>
</FluidView>;
```

Do not wrap the whole app in `FluidView` by default.

Use it when fluid layout or presence motion is intentional.

Reduced Motion disables its non-essential layout/presence motion.

## Text

Use ARCUI `Text` for normal application text that should participate in ARCUI
theme and centralized font scaling.

Use normal React composition for hierarchy:

```tsx
<>
  <Text style={styles.title}>Profile</Text>
  <Text style={styles.description}>
    Manage your personal information.
  </Text>
</>
```

Read `typography.md` before manually managing text scaling.

## Dividers and borders

Use `Divider` when the visual element is semantically a separator between
content regions.

A border that belongs to a card or field is not automatically a `Divider`.

Do not replace every border with a Divider component.

## Semantic controls inside custom layout

Keep layout and interaction responsibilities separate.

```tsx
import { View } from "react-native";
import {
  Button,
  Text,
} from "react-native-arc-ui";

<View style={styles.row}>
  <Text>Current plan</Text>
  <Button onPress={handleChangePlan}>Change</Button>
</View>;
```

Do not recreate the action from `Pressable` just because the row itself is
custom.

## Custom pressable regions

Use ARCUI `Button`, `Checkbox`, `Radio`, `Toggle`, `Chip`, or other semantic
controls when they match the requested interaction.

Use React Native `Pressable` when the application genuinely needs a custom
interactive surface not represented by ARCUI, such as an application-specific
card or media region.

For custom pressables, preserve:

- accessible role;
- accessible name;
- disabled/selected/checked state where applicable;
- appropriate touch behavior;
- clear press feedback.

## Conditional structure

Conditional semantic structure belongs to React:

```tsx
{error ? <Text>{error}</Text> : null}
```

Use `FluidView` when that structural change should also produce fluid layout
motion.

Do not derive whether semantic content exists from animation progress.

## Styling

Native styles are legitimate consumer escape hatches.

Keep local values local when they are specific to one composition.

Prefer ARCUI tokens for reusable design-system decisions.

Do not create a token for every isolated numeric value.

Do not repeatedly hardcode a value that is already an application/ARCUI
design-system decision.

Read `tokens-and-theming.md`.

## Theme-aware custom components

Use:

```tsx
const { tokens } = useARCUITheme();
```

for normal resolved token consumption.

Use:

```tsx
const { themeProgress } = useARCUIAnimatedTheme();
```

only when custom frame-level theme interpolation is genuinely needed.

Do not access internal ARCUI contexts.

## Safe area

ARCUI owns its safe-area values through the public system context.

`Screen` applies its configured screen safe-area behavior.

If app-specific code needs ARCUI system information:

```tsx
const { safeAreaInsets } = useARCUISystem();
```

Preserve the consumer application's existing safe-area architecture.

## Overlays

Do not simulate application overlays with extreme absolute positioning inside a
screen.

Use `Modal`, `Dropdown`, Dialog, or Toast when their semantics match.

Read `overlays.md`.

## Accessibility during composition

Accessibility is not limited to individual controls.

Preserve:

- logical reading order;
- dynamic text growth;
- meaningful grouping;
- custom pressable semantics;
- accessible labels;
- real semantic accessibility state;
- sufficient layout flexibility for translated/dynamic content.

A pixel-accurate layout that breaks accessibility is not a correct
implementation.

## Responsive design

Prefer flex layout, content-based sizing, native scrolling, and sensible
min/max constraints.

Do not hardcode an entire screen to one screenshot size.

Use absolute positioning only when the design genuinely requires layered
positioning.

## Avoid unnecessary abstraction

Extract an app component when it improves:

- reuse;
- semantic clarity;
- lifecycle ownership;
- testability;
- meaningful separation of responsibility.

Keep simple one-off layout local when extraction would only add indirection.

Do not wrap ARCUI components merely to rename their props without adding
application meaning.

## Composition checklist

Before completing a screen:

1. Is the screen root appropriate?
2. Are ARCUI semantic controls used where they fit?
3. Are native primitives still used where they are the better layout primitive?
4. Is semantic state owned by React/application state?
5. Are SharedValues limited to visual/frame-level state?
6. Are reusable design-system values token-driven?
7. Does text scale correctly?
8. Is scrolling/list virtualization appropriate?
9. Are safe-area and overlay behaviors using the established architecture?
10. Does the layout survive larger text and variable content?
11. Is accessibility preserved?
12. Was unnecessary abstraction avoided?
