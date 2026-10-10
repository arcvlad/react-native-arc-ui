# ARCUI AI Reference

This directory contains version-matched guidance for AI coding agents and
developers working with `react-native-arc-ui`.

Start with:

`SKILL.md`

The skill contains the core ARCUI rules and routes each task to only the
references that are needed.

## Reference map

| Task | Read |
| --- | --- |
| Install or configure ARCUI | `references/installation.md` |
| Find the right ARCUI component | `references/components.md` |
| Compose a screen or custom layout | `references/composition.md` |
| Work with tokens or themes | `references/tokens-and-theming.md` |
| Style text or handle font scaling | `references/typography.md` |
| Review accessibility | `references/accessibility.md` |
| Add custom motion or gestures | `references/motion.md` |
| Build forms or use input components | `references/forms-and-inputs.md` |
| Build selection/disclosure UI | `references/selection.md` |
| Use Modal, Dropdown, Dialog, or Toast | `references/overlays.md` |
| Use Header or tabs | `references/navigation.md` |
| Configure ARCUI-owned strings | `references/localization.md` |
| Write tests around ARCUI | `references/testing.md` |
| Recreate a design or screenshot | `references/image-to-interface.md` |

## Pattern map

Patterns are intentionally small and general.

| Need | Read |
| --- | --- |
| Controlled semantic state | `patterns/state-and-controls.md` |
| Form composition | `patterns/forms.md` |
| Layout and content composition | `patterns/layout-and-content.md` |
| Overlay and feedback flows | `patterns/overlays-and-feedback.md` |
| Loading and transition states | `patterns/loading-and-transitions.md` |

## Exact API lookup

These files explain ARCUI semantics and recommended composition.

They are not a duplicate of the TypeScript API.

For exact current props and types in an installed package, inspect:

`node_modules/react-native-arc-ui/dist/index.d.ts`

and, when necessary, the declaration file for the relevant exported type.

When working in the ARCUI repository, current `src/index.ts` and the relevant
public component/type source files are authoritative.

Do not infer supported imports from arbitrary implementation files.

Public runtime imports come from:

```ts
"react-native-arc-ui"
```

Testing utilities come from:

```ts
"react-native-arc-ui/testing"
```
