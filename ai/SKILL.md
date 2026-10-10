---
name: react-native-arc-ui
description: >
  Build, modify, review, test, or set up production React Native interfaces
  with react-native-arc-ui. Use when a project depends on ARCUI or the user
  asks to use ARCUI, including implementation from requirements, screenshots
  or designs, component composition, forms, selection, navigation, overlays,
  theming, tokens, accessibility, localization, testing, or motion.
---

# ARCUI

Use this skill when working with `react-native-arc-ui`.

The goal is not only to produce code that compiles. Produce React Native code
that uses ARCUI as intended, preserves the consumer application's architecture,
and is suitable for production use.

This skill uses progressive disclosure. Do not load every ARCUI reference up
front. Read only the files relevant to the current task.

## Source of truth

When determining how ARCUI works, prefer information in this order:

1. The user's explicit requirements.
2. The existing consumer project's architecture, conventions, and constraints.
3. The installed ARCUI version's package metadata, root exports, and public
   TypeScript declarations.
4. The version-matched guidance in this `ai/` directory.
5. Current official ARCUI documentation or repository source when available.
6. General model knowledge.

Do not assume an ARCUI API remembered from another version still exists.

When exact props, callback signatures, unions, inherited native props, or
generic types matter, inspect the installed public declarations instead of
guessing.

In an installed npm package, start with:

`node_modules/react-native-arc-ui/dist/index.d.ts`

When working in the ARCUI repository itself, current source files are the
implementation source of truth.

Do not broadly inspect all of `node_modules` when the needed information can be
obtained from ARCUI guidance and the declarations for the APIs being used.

When ARCUI reports semantic API misuse or an architecture invariant violation,
fix the consumer usage instead of suppressing, catching, or working around the
error. Cosmetic configuration that ARCUI safely degrades is a different class
of issue; follow the documented fallback contract rather than inventing a
parallel validation layer.

## Public package boundary

Use documented public imports only.

Runtime APIs:

```ts
import { ... } from "react-native-arc-ui";
```

Testing utilities:

```ts
import { ... } from "react-native-arc-ui/testing";
```

Do not deep-import `src/*`, `dist/components/*`, internal hooks, internal
contexts, internal providers, or other undocumented paths.

The existence of a file inside the package does not make it public API.

## Core ARCUI model

Use React or application state for semantic and structural state.

Examples include:

- form values;
- selected values;
- checked state;
- expanded state;
- active tabs;
- loading and error state;
- visibility that changes semantic structure;
- accessibility state.

Use Reanimated SharedValues for frame-level visual state and continuous motion.

Never use React state as an animation frame driver.

ARCUI uses SharedValue `.value`. Do not read or write `.value` during normal
React render.

ARCUI is tokens/config-first, accessibility-first, and UI-thread-first for
frame-critical motion.

## Building and modifying interfaces

Start from semantics and structure, not styling details.

Identify interface regions, interactions, state, and accessibility semantics.
Then map supported controls to ARCUI primitives before creating custom controls.

Prefer an ARCUI component when it already owns the requested semantic behavior.

Do not rebuild ARCUI controls from combinations of `View`, `Pressable`,
`TextInput`, or other primitives merely to reproduce behavior ARCUI already
provides.

Do not introduce another UI/component library merely to replace behavior ARCUI
already provides. Add dependencies only when the requirement is genuinely
outside ARCUI and the existing consumer stack.

Use React Native primitives for application-specific layout and behavior ARCUI
does not own.

When modifying an existing screen:

- understand current state ownership and structure first;
- preserve established application architecture where valid;
- reuse existing app abstractions where they remain appropriate;
- avoid unrelated refactors;
- preserve legitimate consumer styles and native escape hatches.

For component discovery, read:

`references/components.md`

For screen composition, read:

`references/composition.md`

## Task routing

Load only the guidance needed for the current task.

Setup, dependencies, provider configuration:

`references/installation.md`

Tokens, theme, custom tokens, `ThemedView`, `ReverseTheme`:

`references/tokens-and-theming.md`

Typography and font scaling:

`references/typography.md`

Accessibility review or accessible custom composition:

`references/accessibility.md`

Custom animation, gestures, SharedValues, Reduced Motion:

`references/motion.md`

Inputs, validation, forms, Select, Slider:

`references/forms-and-inputs.md`

Checkbox, Radio, Toggle, Chip, SelectionGroup, Accordion:

`references/selection.md`

Modal, Dropdown, Dialog, Toast:

`references/overlays.md`

Header and tabs:

`references/navigation.md`

ARCUI-owned strings or localization:

`references/localization.md`

Tests or ARCUI test setup:

`references/testing.md`

Recreating a UI from a screenshot, mockup, or design:

`references/image-to-interface.md`

If it is unclear which file applies, read `INDEX.md`.

## Patterns

Patterns are small composition examples, not templates that must be copied.

Use them only when implementation examples would help:

`patterns/state-and-controls.md`
`patterns/forms.md`
`patterns/layout-and-content.md`
`patterns/overlays-and-feedback.md`
`patterns/loading-and-transitions.md`

Adapt patterns to the consumer application's requirements.

Do not mechanically reproduce an example when the requested semantics differ.

## TypeScript and public contracts

Use ARCUI's exported types and the installed React Native types when creating
wrappers or application abstractions around ARCUI.

Prefer APIs that model valid states directly.

Do not use `any`, unsafe casts, or manually redeclare large native prop surfaces
when the existing exported contract can express the requirement.

For exact component contracts, follow the installed declaration files rather
than examples remembered from another ARCUI version.

ARCUI targets React 19. When an application wrapper genuinely needs to expose a
ref, prefer React 19 ref-as-prop patterns where appropriate instead of adding
`forwardRef` by habit.

## Tokens and styling

Prefer ARCUI tokens for reusable design-system decisions such as colors,
spacing, sizing, typography, radii, borders, safe-area policy, and animation
configuration.

Application-specific one-off layout values may remain local.

Do not invent token names.

Do not assume recursive token merging.

Respect the surrounding ARCUI theme instead of recreating light/dark behavior
manually.

## Typography

Prefer ARCUI `Text` for normal application text that should participate in
ARCUI theme and centralized font scaling.

Do not combine ARCUI manual font scaling with native automatic scaling.

Do not add `lineHeight` as a default styling habit.

## Accessibility

Accessibility is part of correctness.

Prefer the semantic ARCUI control matching the interaction.

Preserve labels, roles, accessibility state, dynamic text sizing, logical
reading order, touch behavior, and Reduced Motion.

Accessibility state follows real semantic application state, never intermediate
animation progress.

Do not add redundant screen-reader content or generic gesture instructions when
native semantics already communicate the interaction.

## Motion

Prefer ARCUI's existing component motion over recreating it externally.

For custom animation:

- keep frame-critical work on the UI thread where practical;
- use SharedValues for frame-level visual state;
- keep semantic state in React;
- cancel or reverse stale motion where relevant;
- respect Reduced Motion;
- avoid JS-thread animation loops.

Do not optimize animation architecture speculatively when runtime behavior is
already correct.

## Design-to-code work

A screenshot or mockup describes visual output, not complete application
semantics.

Infer semantic controls carefully and map them to ARCUI components first.

Use tokens for repeated design-system decisions and local styles for genuinely
screen-specific values.

Preserve responsive behavior and accessibility that may not be visible in the
design.

Do not reproduce a screenshot with brittle absolute positioning when normal
React Native layout can express the interface.

## Validation

Before considering ARCUI-oriented work complete:

- verify imports use supported public entrypoints;
- verify exact APIs when uncertain;
- ensure semantic state ownership is correct;
- check accessibility behavior;
- check light/dark theme behavior where relevant;
- check font scaling and dynamic content;
- ensure custom motion respects Reduced Motion;
- preserve the existing application architecture unless change was required;
- run available typecheck, lint, and relevant tests when tools and scripts are
  available.

Do not claim validation that was not actually performed.

## Scope

This skill primarily describes how consumers build applications with ARCUI.

It does not replace ARCUI's internal engineering standards.

When modifying the ARCUI library itself, repository-level instructions,
current source, and ARCUI internal standards take precedence.
