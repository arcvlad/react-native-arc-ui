# ARCUI Component Reference

Use this reference to choose the ARCUI primitive that best matches a UI or
interaction requirement.

This is a semantic component map, not a complete API reference.

For exact props, callback signatures, accepted values, inherited React Native
props, and exported types, inspect the public TypeScript declarations for the
installed ARCUI version.

Do not guess an API from this document.

## Selection principle

Before building a custom control from React Native primitives, check whether an
ARCUI component already owns the required semantic behavior.

Prefer ARCUI when it provides the requested control.

Use React Native primitives and application-specific components for layout or
behavior ARCUI does not own.

Do not force an ARCUI component into a role whose semantics do not match the
requested interface.

## Application foundation

### `ARCUI`

Root provider for ARCUI applications.

Owns application-wide ARCUI infrastructure including theme, tokens, font scale,
strings, icon registry, system values, Gesture Handler root behavior, and
overlay providers.

Read `installation.md` for setup.

## Layout and presentation

### `Screen`

Screen-level ARCUI surface.

Use for top-level screen composition when ARCUI screen background and safe-area
behavior are desired.

It is not a scrolling primitive.

### `ThemedView`

Theme-aware view surface.

Use when a container background should follow ARCUI theme behavior.

Use a normal `View` when the container does not need ARCUI theme ownership.

### `FluidView`

Opt-in Reanimated layout-transition wrapper.

Use for dynamic content whose size or position should move fluidly as layout
changes.

It also supports explicit opt-in entering/exiting presence transitions.

Do not use it as a themed container or replace every `View` with it.

### `Text`

Preferred application text primitive when content should participate in ARCUI
theme and centralized font scaling.

Read `typography.md`.

### `Divider`

Semantic visual separator.

Supports horizontal and vertical presentation; horizontal dividers may also
carry label content according to the public contract.

Prefer it over repeated ad-hoc one-pixel separator views.

### `ReverseTheme`

Inverts ARCUI animated theme context for a subtree.

Use when a complete region intentionally needs the opposite ARCUI theme.

### `Icon`

ARCUI SVG icon abstraction.

Use configured ARCUI icon names rather than assuming arbitrary glyphs exist.

`defaultIcons` is public, and applications may provide an ARCUI-compatible
`iconSet` at the provider.

Standalone Icons are decorative by default. Supplying an accessibility label
makes a standalone Icon meaningful unless the consumer explicitly overrides its
accessible state.

### `Badge`

Compact dot or label badge.

Use for supplementary status/count information, not as a generic container or
action.

### `Infobox`

Semantic informational container with `default`, `warning`, and `danger`
presentations.

Use built-in icons when ARCUI should own semantic icon styling, or `customIcon`
when the consumer intentionally owns the custom content.

## Actions

### `Button`

Semantic press action.

Use instead of rebuilding normal application actions from `Pressable`, `View`,
and `Text` when the Button contract fits.

Supports ARCUI visual types, loading, active/disabled behavior, press motion,
icons, and native pressable escape hatches.

## Selection and disclosure

### `Checkbox`

Boolean or independently selectable choice.

Standalone mode is controlled through `checked`.

Inside `SelectionGroup`, identity comes from `value` and the group owns selected
state.

### `Radio`

Mutually exclusive choice.

Standalone mode is controlled through `checked`.

Grouped Radio is intended for single-selection `SelectionGroup`.

### `Toggle`

On/off switch-style semantic control.

Standalone mode is controlled through `checked`.

It may also participate in `SelectionGroup` through `value`.

### `Chip`

Compact action or selectable control.

A Chip may be:

- action-only;
- standalone selectable;
- group-selectable.

Do not assume every Chip is selectable.

### `SelectionGroup`

Controlled selection owner.

Single mode uses `value` and `onValueChange`.

Multiple mode uses `values` and `onValuesChange`.

Use it when ARCUI child controls should share one semantic selection model.

### `Accordion`

Expandable/collapsible disclosure control.

Standalone mode uses controlled `expanded`.

Grouped mode uses `value` and receives expansion state from the group.

### `AccordionGroup`

Coordinates direct `Accordion` children through ARCUI selection semantics.

Single mode is deselectable so the currently expanded accordion can collapse.

Multiple mode supports multiple expanded values.

Read `selection.md` for ownership rules.

## Inputs

### `Input`

General single-line text input.

Preserves React Native controlled and uncontrolled text ownership.

Supports ARCUI field state, label/error presentation, native input props,
built-in icons, clear behavior, loading, and an accessible trailing action.

### `InputPassword`

Password-specific input built on ARCUI input semantics.

Use instead of rebuilding password visibility behavior around `Input`.

### `InputArea`

Multiline text input.

Supports label/error presentation, character count, min/max field height, and
native text-input escape hatches.

### `InputNumber`

Controlled numeric input.

Use for numeric entry with ARCUI increment/decrement semantics, bounds, step,
decimal normalization, and numeric accessibility behavior.

### `InputOTP`

Controlled segmented verification-code input.

Use for OTP/code entry instead of manually coordinating independent text
inputs.

### `Select`

Controlled single- or multiple-selection field.

Supports option metadata, optional local search, consumer-owned async search,
loading, errors, and selection limits.

### `Slider`

Controlled single-value or range slider.

Visual gesture movement stays UI-thread-driven.

Use live change callbacks only for semantic snapped-value changes and commit
callbacks for work that should happen after interaction completes.

Read `forms-and-inputs.md`.

## Navigation

### `Header`

ARCUI screen header with title, back behavior, actions, custom end content,
safe-area integration, and accessible icon-only controls.

### `Tab`

Declarative tab control used with `TabBar`.

### `TabBar`

Controlled tab-selection bar.

Uses `activeTab` as the semantic source of truth.

### `TabNavigation`

Controlled tab navigation with declarative `TabScreen` children and optional
swipe navigation.

### `TabScreen`

Declarative page metadata/content marker consumed by `TabNavigation`.

Read `navigation.md`.

## Feedback and loading

### `ProgressBar`

Determinate progress from 0 to 100.

Use when the application can represent measurable completion.

### `SpinnerLoader`

Indeterminate visual loading indicator.

Geometry is fixed by default; font-scale coupling is opt-in.

Do not rely on the spinner alone to communicate semantic loading state to
assistive technology.

### `SkeletonLoader`

Placeholder loading surface.

Supports rectangle, square, and circle variants.

SkeletonLoader is intentionally hidden from the accessibility tree. The
surrounding application must communicate meaningful loading/busy state when
needed.

Use when preserving approximate content geometry improves the loading
experience.

## Overlays

### `Dropdown`

Anchored menu/selection overlay.

ARCUI owns measurement, positioning, collision handling, open state, and
dismissal.

The consumer owns the trigger's visual presentation through a render prop.

### `Modal`

Controlled bottom-sheet-style modal overlay.

Use `visible` as application-owned semantic state and `onClose` for user
dismissal requests.

Content is rehosted into ARCUI's root overlay layer.

### Dialog API

Dialog is imperative public API, not a public `Dialog` component import.

```ts
import {
  showDialog,
  hideDialog,
} from "react-native-arc-ui";
```

### Toast API

Toast is imperative public API.

```ts
import {
  showToast,
  hideToast,
} from "react-native-arc-ui";
```

`showToast` returns an id that may be passed to `hideToast`.

Read `overlays.md`.

## Public hooks

### `useARCUITheme`

Resolved static theme, theme mode, tokens, icon set, and ARCUI back callback.

Use for normal render-time theme/token consumption.

### `useARCUIAnimatedTheme`

Animated `themeProgress` SharedValue.

Use only when a custom visual component genuinely needs frame-level theme
animation.

### `useARCUISystem`

ARCUI system values including central `fontScale` SharedValue and safe-area
insets.

### `useARCUIStrings`

Resolved runtime ARCUI-owned strings.

### `useInputState`

Public extension hook for genuinely custom input-like components that should
reuse ARCUI focus/modifier semantics.

Do not use it to rebuild an existing ARCUI input component.

### `useModal`

Public semantic Modal-state hook.

Currently exposes application-relevant active modal count while internal Host
identity remains private.

## Public values and types

ARCUI also publicly exports:

- `defaultTokens`;
- token groups such as `Colors`, `Spacing`, `Typography`, and `Sizings`;
- `defaultStrings`;
- `defaultIcons`;
- component contracts and associated discriminated-union/helper types.

For exact names, inspect the installed root declaration file.

## Component-selection checklist

1. Identify the semantic interaction.
2. Check whether ARCUI already provides that semantic component.
3. Prefer ARCUI when it fits.
4. Inspect declarations when exact API details matter.
5. Compose app-specific layout around ARCUI instead of rebuilding ARCUI
   behavior.
6. Use React Native primitives where ARCUI does not own the behavior.
7. Keep semantic state in React/application state.
8. Keep custom frame-level motion in Reanimated.
9. Preserve accessibility, theme behavior, font scaling, and Reduced Motion.
10. Never rely on undocumented deep imports.
