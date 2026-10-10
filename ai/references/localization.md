# ARCUI Localization

Use this reference when localizing ARCUI-owned reusable strings or integrating
ARCUI into an application's localization system.

Design tokens and localized strings are separate systems.

## Provider strings

ARCUI accepts partial string overrides through the provider:

```tsx
<ARCUI
  strings={{
    modalCloseAccessibilityLabel: "Close",
    headerBackAccessibilityLabel: "Back",
  }}
>
  {children}
</ARCUI>
```

Unspecified values fall back to ARCUI defaults.

String configuration is runtime-reactive.

Unlike design tokens, changing `strings` does not require treating the provider
as mount-time-only configuration.

## Public string APIs

ARCUI exports:

```tsx
import {
  defaultStrings,
  useARCUIStrings,
  type TARCUIStrings,
  type TARCUIStringsOverride,
} from "react-native-arc-ui";
```

Use `useARCUIStrings()` when a custom application component needs the currently
resolved ARCUI-owned strings.

## What belongs in ARCUI strings

ARCUI-owned reusable language may include:

- built-in accessibility labels;
- component-owned placeholders;
- empty-state labels;
- built-in action labels;
- other library-owned fallback copy.

Application-specific business copy does not belong in ARCUI's global string
configuration merely because an ARCUI component renders nearby.

Keep product content in the application's normal localization system.

## Current exact keys

Do not duplicate a hardcoded list of string keys in application logic.

Inspect the installed `TARCUIStrings` declaration for the exact version-matched
surface.

This prevents an AI agent from inventing keys or using keys from another ARCUI
version.

## Consumer overrides

Where an ARCUI component exposes a direct consumer accessibility label or text
override, use that component-level API for instance-specific content.

Use provider strings for reusable ARCUI-owned defaults across the application.

## Accessibility

Localized accessible names must remain concise and meaningful.

Do not translate built-in labels into generic gesture instructions.

Do not create duplicate accessible text by adding hidden copies of a string ARCUI
already announces.

## Layout

Localized text may be longer than the default English text.

Validate:

- Header actions/titles;
- input labels/errors;
- Select placeholders/empty states;
- Modal/Dialog content;
- Toast messages;
- tab labels;
- Button labels.

Do not fix localization overflow by disabling font scaling.

## Tokens

Do not store strings in design-token namespaces.

Tokens represent design-system configuration.

Strings represent language/content configuration.

Keep those concerns separate.

## Checklist

1. Provider `strings` handles reusable ARCUI-owned defaults.
2. Application business copy stays in the app localization system.
3. Exact ARCUI string keys come from installed public declarations.
4. Component-level copy overrides are used for instance-specific wording.
5. Accessibility labels remain meaningful after translation.
6. Larger/translated text is validated in layout.
7. Strings are not placed into design tokens.
