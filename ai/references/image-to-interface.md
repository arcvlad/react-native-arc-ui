# ARCUI Design-to-Interface Workflow

Use this reference when recreating a UI from a screenshot, Figma export, mockup,
or other visual design.

A visual reference is evidence of appearance, not a complete specification of
behavior.

Do not invent unsupported product behavior merely because it seems plausible.

## 1. Identify semantic regions

Before writing code, identify:

- screen/root surface;
- header/navigation;
- content sections;
- forms and fields;
- actions;
- selection controls;
- disclosure;
- feedback/loading;
- overlays;
- repeated patterns.

Do not start from pixel coordinates.

## 2. Map semantics to ARCUI

Check `components.md`.

Examples of semantic mapping:

```text
screen surface          -> Screen
theme-aware container   -> ThemedView
text                    -> Text
separator               -> Divider
action                   -> Button
boolean choice           -> Checkbox / Toggle
exclusive choice         -> Radio + SelectionGroup
expandable content       -> Accordion / AccordionGroup
text input               -> Input / InputPassword / InputArea
numeric input            -> InputNumber
verification code        -> InputOTP
option picker            -> Select
numeric range/value      -> Slider
screen header            -> Header
tab navigation           -> TabBar / TabNavigation
anchored menu            -> Dropdown
modal sheet              -> Modal
confirmation             -> Dialog API
transient feedback       -> Toast API
determinate progress     -> ProgressBar
indeterminate loading    -> SpinnerLoader
placeholder loading      -> SkeletonLoader
```

Use React Native layout primitives for remaining application-specific structure.

## 3. Infer behavior conservatively

A screenshot cannot prove:

- whether a field is controlled/uncontrolled;
- what validation rules exist;
- whether a card is pressable;
- what an icon action does;
- network behavior;
- exact navigation behavior;
- hidden loading/error states.

Use requirements, surrounding code, product context, or existing app patterns.

If behavior is genuinely unknown, implement the smallest reasonable semantic
surface or make the assumption explicit.

Do not invent backend/business logic.

## 4. Reuse the existing application architecture

When modifying an existing project, inspect relevant existing:

- navigation;
- state management;
- form handling;
- localization;
- data loading;
- tokens/theme;
- reusable app components.

Integrate ARCUI without rewriting unrelated architecture.

Do not create a second design system alongside an existing ARCUI setup.

## 5. Extract design-system intent

Identify repeated visual decisions:

- colors;
- spacing scale;
- typography;
- radii;
- borders;
- component dimensions.

Use existing ARCUI/app tokens when they already represent those decisions.

Create/override tokens only when the value is genuinely reusable design-system
configuration.

Keep one-off layout values local.

Do not turn every measured pixel into a token.

## 6. Build responsive structure

Prefer:

- flexbox;
- content-driven height;
- max/min constraints;
- ScrollView/FlatList/SectionList where appropriate;
- logical start/end layout;
- dynamic text-friendly spacing.

Avoid reproducing a single screenshot through absolute coordinates.

Absolute positioning is appropriate only for genuinely layered design elements.

## 7. Typography

Use ARCUI `Text` for normal application text.

Treat screenshot font sizes as base design values and preserve ARCUI font
scaling.

Do not disable accessibility scaling to achieve a pixel match.

Do not add arbitrary line height unless the design requires it and it remains
correct at larger font scales.

## 8. Icons and assets

Use ARCUI `Icon` when the requested glyph exists in the configured icon set.

Inspect `TIconType` / configured icon registry instead of inventing icon names.

Do not introduce another icon/UI library merely to recreate controls or glyphs
that the configured ARCUI system already provides.

For design-specific artwork, use the application's actual asset strategy.

Do not substitute arbitrary emoji or unrelated glyphs for production UI unless
the user explicitly accepts that approximation.

## 9. Accessibility that is not visible

Add semantics a screenshot cannot show:

- roles;
- accessible names;
- checked/selected/expanded state;
- disabled state;
- meaningful labels for icon-only actions;
- logical reading order;
- scalable text;
- Reduced Motion.

A screenshot-perfect but inaccessible result is not production-ready.

## 10. Motion

Do not invent decorative motion just because ARCUI supports animation.

Use ARCUI built-in motion where provided.

Add custom motion only when behavior/design calls for it.

Keep semantic state in React and frame-level motion in Reanimated.

## 11. Overlays

Map modal/menu/confirmation/transient feedback to ARCUI's provider-owned overlay
APIs.

Do not fake overlays inside the screen with extreme z-index or absolute
positioning.

## 12. Validate against the reference

After implementation, compare:

- hierarchy;
- spacing;
- alignment;
- typography;
- component sizing;
- color intent;
- responsive behavior;
- visible states.

Then validate what the image cannot reveal:

- semantics;
- accessibility;
- dynamic text;
- dark/light behavior if supported;
- loading/error state ownership;
- gestures;
- Reduced Motion.

## Production-readiness checklist

Before calling the result complete:

1. ARCUI components are used where their semantics fit.
2. No ARCUI control was unnecessarily rebuilt.
3. App-specific layout uses normal React Native composition.
4. Controlled semantic state has one owner.
5. Repeated design-system values use tokens appropriately.
6. Text scales correctly.
7. The layout is responsive beyond the reference device.
8. Accessible names/state are present.
9. Overlay architecture is correct.
10. Custom motion is UI-thread-first and Reduced-Motion-aware.
11. Exact APIs were checked rather than guessed.
12. Available typecheck/lint/tests were run.
