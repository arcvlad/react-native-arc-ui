# ARCUI Typography

Use this reference when styling text, configuring typography tokens, or building
custom components containing text.

ARCUI uses centralized manual font scaling.

## Prefer ARCUI `Text`

Use ARCUI `Text` for normal application text that should participate in:

- ARCUI theme color behavior;
- centralized font scaling;
- configured maximum font-size multiplier;
- ARCUI typography defaults.

```tsx
import { Text } from "react-native-arc-ui";

<Text>Account details</Text>;
```

Use direct React Native/Animated text only when there is a concrete requirement
ARCUI `Text` does not satisfy.

## Central font scale

ARCUI exposes font scale as a SharedValue through:

```tsx
const { fontScale } = useARCUISystem();
```

ARCUI-managed text applies manual scaling.

Text managed this way disables duplicate native scaling internally.

Do not combine native automatic scaling with ARCUI's manual font scaling.

Do not read `fontScale.value` during normal React render.

Use it only in Reanimated worklets/animated hooks or appropriate lifecycle/event
code.

## `Text` font size

`Text` treats `style.fontSize` as an unscaled base metric.

ARCUI applies the central font scale at runtime.

Example:

```tsx
<Text style={{ fontSize: 20 }}>
  Heading
</Text>
```

The `20` is the base size, not a request to bypass ARCUI scaling.

## `lineHeight`

Do not add `lineHeight` by default.

React Native's natural line-height behavior is preferred unless the design
genuinely requires an explicit line height.

When a supported ARCUI text path receives an explicit `lineHeight`, it is also
treated as an unscaled base metric and participates in ARCUI font scaling.

Always validate explicit line height with larger accessibility text sizes.

## Typography tokens

ARCUI typography tokens are native `TextStyle`-first.

A typography slot may contain normal static text style properties such as:

- `fontWeight`;
- `fontFamily`;
- `letterSpacing`;
- other valid non-color `TextStyle` values.

`fontSize` is an unscaled base metric.

An explicit token `lineHeight` is also an unscaled base metric.

Typography tokens do not own semantic/theme color.

Color belongs to ARCUI's theme/state color system or a component's explicit
color API.

## `Text` color ownership

ARCUI `Text` resolves color in this order:

```text
color
↓
complete darkColor + lightColor pair
↓
style.color
↓
ARCUI text tokens
```

Use `color` for a fixed value across themes.

Use a complete dark/light pair for explicit theme-aware overrides.

Use `style.color` as the native consumer escape hatch when desired.

Do not provide only one side of a theme pair.

## Component-owned typography

Many ARCUI components render their own text and apply component-specific
typography tokens.

Examples include:

- Button;
- Checkbox/Radio/Toggle;
- Infobox;
- Accordion;
- Chip;
- ProgressBar;
- Modal/Dialog/Toast;
- Header;
- inputs;
- tabs;
- Badge;
- Select;
- Dropdown;
- Divider labels.

Do not wrap built-in component labels in extra text solely to force typography
unless the component's public API explicitly expects custom ReactNode content.

When a component accepts arbitrary custom ReactNode content, that custom content
usually owns its own typography unless the public contract says otherwise.

## Dynamic text layout

Production layouts must survive larger text.

Prefer:

- flexible width;
- `flexShrink` where appropriate;
- content-based height;
- native scrolling where needed;
- wrapping when semantics allow it.

Avoid:

- fixed-height text containers that clip scaled content;
- absolute positioning based on one font scale;
- assumptions that translated text has the same length;
- manually shrinking text to preserve a screenshot.

## Icons and font scale

ARCUI `Icon` is a geometric primitive by default.

Its size does not automatically follow font scale unless `scaleWithFont` is
enabled.

Use `scaleWithFont` when an icon is semantically coupled to adjacent text and
should grow with accessibility text size.

Do not scale decorative/geometric icons automatically without a reason.

`SpinnerLoader` similarly keeps geometry fixed by default and exposes
font-scaling behavior only when explicitly requested.

## Custom text animation

Do not use `Animated.Text` merely because ARCUI uses Reanimated elsewhere.

Use direct animated text only when a concrete property must animate and ARCUI
`Text` cannot express that requirement.

Keep semantic text content in React.

Keep only frame-level visual values in SharedValues.

## Typography token override

Because token replacement is shallow at the top level, replacing
`typography` requires a complete typography namespace.

When changing only one typography slot, compose from the existing namespace
explicitly.

Do not assume recursive merge behavior.

Read `tokens-and-theming.md`.

## Checklist

1. Prefer ARCUI `Text` for normal app text.
2. Do not combine native and ARCUI manual scaling.
3. Treat font size as an unscaled base metric.
4. Add line height only when genuinely required.
5. Validate explicit line height at larger font scales.
6. Keep semantic/theme colors outside typography tokens.
7. Preserve native `TextStyle` escape hatches where supported.
8. Allow layouts to grow with text.
9. Use direct `Animated.Text` only for a concrete animation reason.
10. Never read `fontScale.value` during normal React render.
