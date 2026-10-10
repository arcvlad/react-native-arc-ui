# ARCUI Accessibility

Accessibility is part of ARCUI correctness, not optional polish.

Use this reference when building custom composition, reviewing an interface, or
adding behavior around ARCUI components.

## Prefer semantic ARCUI controls

Use the ARCUI component that matches the intended interaction.

Examples:

- `Button` for actions;
- `Checkbox` for independent boolean choices;
- `Radio` for mutually exclusive choices;
- `Toggle` for switch-style on/off settings;
- `Slider` for adjustable numeric values;
- `ProgressBar` for measurable progress.

Do not replace a semantic ARCUI control with a visually similar generic
`Pressable` unless the interaction genuinely requires a different control.

## Semantic state follows React state

Accessibility state must reflect actual application semantics.

Use React/application state for:

- checked;
- selected;
- expanded;
- disabled;
- busy/loading;
- active tab;
- progress/value state.

Do not derive semantic accessibility state from intermediate animation
progress.

A visual transition may still be moving after the semantic state has changed.

## Accessible names

Icon-only interactive controls require a meaningful accessible name.

ARCUI APIs enforce or provide this in several places, including Header actions,
input right actions, and icon-only tabs.

When creating a custom icon-only `Pressable`, provide an appropriate accessible
name.

Prefer a concise label that already explains the action.

Use an accessibility hint only when the resulting behavior is not obvious.

## Avoid generic gesture instructions

Do not add generic copy such as:

```text
Double tap to activate
```

when the native role and state already communicate the interaction.

Screen readers provide platform interaction instructions.

Hints should describe meaningful behavior, not teach generic screen-reader
gestures.

## Library-owned strings

Reusable ARCUI-owned accessibility labels belong to ARCUI's localization
system.

Examples include built-in labels for:

- modal close;
- Header back;
- input clear;
- password visibility;
- OTP;
- InputNumber increment/decrement;
- Select search/empty state;
- Slider and range thumbs.

Use provider `strings` overrides for localization instead of hardcoding a second
copy around ARCUI components.

Read `localization.md`.

## Consumer overrides

Consumer accessibility overrides should win where the component contract allows
them and no correctness invariant is violated.

Do not delete a valid native accessibility escape hatch merely because ARCUI
provides a default.

## Text scaling

ARCUI uses centralized manual font scaling.

Layouts must remain usable at larger accessibility text sizes.

Test:

- wrapping;
- control height;
- label/value coexistence;
- multiline content;
- modal/overlay viewport constraints;
- clipped or overlapping text.

Do not fix dynamic-text problems by disabling scaling or shrinking text below
the intended accessible size.

Read `typography.md`.

## Reduced Motion

Respect the user's Reduced Motion preference.

ARCUI components already account for Reduced Motion.

Any custom Reanimated motion added around ARCUI should do the same.

Reduced Motion must not change semantic behavior or make an interaction
unavailable.

Read `motion.md`.

## Custom content

When an ARCUI component accepts arbitrary custom ReactNode content, the consumer
owns the accessibility of that custom subtree unless the component contract says
otherwise.

Do not assume ARCUI can infer semantics from arbitrary visual content.

## Decorative content

Decorative icons or visual elements should not create duplicate screen-reader
content.

ARCUI `Icon` is decorative by default. A standalone Icon becomes meaningful
when given an accessibility label unless the consumer explicitly overrides its
accessible state.

`SkeletonLoader` is intentionally hidden from the accessibility tree.

`SpinnerLoader` is visual loading feedback and does not provide a meaningful
loading announcement by itself. If loading state matters semantically, expose
that state through the surrounding accessible content/container or appropriate
application messaging.

A dot-only `Badge` also has no spoken meaning by itself. If the dot represents a
meaningful status, expose that status elsewhere in the accessible interface.

`ProgressBar` is different: ARCUI exposes native progress semantics and value
information for determinate progress.

If a parent control already owns the accessible name and semantics, keep purely
decorative descendants out of the accessibility tree where appropriate.

Do not hide meaningful information just because it is visual.

## Selection

Selection controls must expose semantic selected/checked state matching the
consumer-owned state.

When `SelectionGroup` owns selection, child semantics should follow the group's
resolved controlled state.

Do not maintain a competing local selected state for accessibility.

Read `selection.md`.

## Inputs

Preserve native input semantics and appropriate keyboard/input behavior.

Validation should be visually and semantically understandable.

Do not represent an inactive/disabled state only through color.

When adding custom trailing input actions, icon-only actions require meaningful
labels.

Read `forms-and-inputs.md`.

## Overlays

ARCUI Modal infrastructure removes underlying application content from
screen-reader traversal while a modal is active.

Do not create competing fake overlays that leave inaccessible background
content exposed to traversal.

Custom Modal `rightAction` content is consumer-owned; provide its interaction
and accessibility behavior.

Dialog and Toast use ARCUI-owned overlay infrastructure and semantic content.

Read `overlays.md`.

## Logical reading order

Visual positioning should not create a nonsensical accessibility reading order.

Prefer normal React tree/layout order that matches the intended content flow.

Be especially careful with:

- absolute-positioned controls;
- floating actions;
- overlay content;
- visually reordered rows;
- repeated hidden content.

## Images and design recreation

Screenshots do not contain accessibility metadata.

When recreating a design, infer and add:

- semantic roles;
- accessible names;
- states;
- focusable interactions;
- scalable text behavior;
- logical reading order.

Pixel matching does not justify removing semantics.

## Validation checklist

For meaningful interactive work, verify:

1. every action has an accessible role/name;
2. icon-only actions are named;
3. selected/checked/expanded/disabled state is semantic;
4. no duplicate screen-reader content is introduced;
5. no generic gesture hints are added unnecessarily;
6. large text does not clip or overlap;
7. custom content owns its missing semantics;
8. Reduced Motion preserves behavior;
9. overlay background content is handled correctly;
10. localization does not break accessible names or layout.
