# Changelog

All notable changes to `react-native-arc-ui` will be documented in this file.

ARCUI follows semantic versioning.

## 2.0.0 - 2026-11-04

### Added

- Added the public `TThemeColor` primitive. Color overrides accept either a fixed string or a complete `{ light, dark }` pair that participates in ARCUI's animated theme transition.
- Added strongly typed, component-specific `colors` contracts across ARCUI-owned visual components.
- Added semantic `tone` presets where they represent real component semantics: Button (`primary`, `secondary`, `neutral`, `danger`), Badge and Toast (`neutral`, `info`, `success`, `warning`, `danger`), Infobox (`info`, `success`, `warning`, `danger`), and Dropdown items (`neutral`, `danger`).
- Added a shared field color contract used by Input, InputPassword, InputArea, InputNumber, and InputOTP.
- Added root `AGENTS.md` guidance so repository-aware coding agents are routed to ARCUI's version-matched `ai/` documentation before implementing equivalent controls from primitives.

### Changed

- Fixed Reanimated/native style color ownership so static `style` color escape hatches correctly take over when the corresponding `colors` slot is not provided.
- Adjusted active Button/Badge semantic color endpoints to maintain WCAG AA text contrast in the affected states.
- Improved default color contrast across affected field, selection, navigation, overlay, and feedback states, including input boundaries/placeholders, Select, Tabs, Dropdown danger actions, Modal, Accordion, Divider, Slider, and ProgressBar.
- Aligned component color-token ownership so Select group headers, Slider label/error colors, and ProgressBar values resolve from their own component token namespaces.
- Hardened runtime fallbacks for malformed Button/Tabs/InputNumber presentation-type values so invalid cosmetic input degrades to deterministic defaults instead of reaching undefined token paths.

- Standardized color resolution as per-instance `colors` override -> semantic tone/component state -> ARCUI tokens. Partial overrides fall back to the matching state rather than a generic default.
- Theme-aware custom colors now resolve to primitive light/dark endpoints before Reanimated worklets; frame-level interpolation remains UI-thread driven.
- Expanded Button tokens into `primary`, `secondary`, `neutral`, and `danger` palettes while preserving `solid`, `border`, and `transparent` presentations.
- Expanded Badge, Toast, and Infobox tokens into semantic tone palettes.
- Renamed Dropdown destructive token state to `danger` to match the public semantic API.
- Infobox now uses `tone` instead of semantic `type` and renders a complete semantic surface (`background`, `border`, `text`, and built-in icon).
- Dialog actions reuse Button `tone`/`colors` instead of defining a separate action color system.
- InputNumber increment/decrement controls reuse Button `tone`/`colors`.
- Preserved native style escape hatches where appropriate; an explicit ARCUI `colors` slot wins only for the visual property it owns.

### Removed

- Removed legacy theme-color prop families from Badge, Divider, Icon, SpinnerLoader, Text, and ThemedView in favor of `colors`.
- Removed `Icon.reverseThemeColor`; use `ReverseTheme` for subtree theme inversion.
- Removed Tabs `tabBarBackgroundColor`, `tabBarDarkBackgroundColor`, and `tabBarLightBackgroundColor`; use `colors.container`.
- Removed legacy Dropdown item `color` / `darkColor` / `lightColor` and `destructive`; use item `colors` and `tone="danger"`.
- Removed Infobox semantic `type`; use `tone`.
- Removed the legacy top-level color `states` token namespace; semantic defaults now feed explicit component-owned tokens such as Checkbox, Radio, and Toggle `error`.

### Migration from 1.x

- Replace legacy component color props such as `color`, `darkColor`, and `lightColor` with the component's typed `colors` object. Use a fixed string for one color across themes or a complete `{ light, dark }` pair for animated theme-aware overrides.
- Replace `Icon.reverseThemeColor` with `ReverseTheme` when a subtree should consume the opposite ARCUI theme.
- Replace Infobox semantic `type` with `tone`.
- Replace Dropdown item `destructive` with `tone="danger"`; move item-specific color overrides into the item `colors` object.
- Replace Tabs `tabBarBackgroundColor`, `tabBarDarkBackgroundColor`, and `tabBarLightBackgroundColor` with `colors.container`.
- If application tokens referenced the removed top-level `colors.states` namespace, move those semantic defaults into the relevant component-owned token namespaces.
- Review custom color overrides after migration: `colors` overrides only the visual slots supplied by the consumer, while omitted slots continue to resolve through the matching tone/component tokens.

## 1.1.1 - 2026-11-04

### Fixed

- Fixed stale Badge layout styles when switching between badge modes.

## 1.1.0 - 2026-10-10

### Added

- Added a version-matched `ai/` guidance layer for AI-assisted ARCUI development.
- Added structured references and implementation patterns covering components, composition, state ownership, forms, selection, navigation, overlays, theming, tokens, typography, accessibility, localization, motion, testing, and design-to-interface workflows.
- Included the `ai/` guidance directory in the published npm package.

### Changed

- Normalized ARCUI-owned color tokens to explicit `rgba(...)` values for predictable Reanimated color interpolation.
- Redesigned the project README with a concise product overview, light/dark ARCUI showcase, and updated onboarding guidance.

## 1.0.0 - 2026-10-08

### Added

- Initial public release of `react-native-arc-ui`.
