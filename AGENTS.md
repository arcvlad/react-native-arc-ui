# ARCUI Agent Guidance

ARCUI is a public React Native UI library with version-matched guidance for AI-assisted development.

## Using ARCUI in an application

- Read `ai/SKILL.md` before implementing ARCUI-based interfaces.
- Load only the relevant files under `ai/references/` and `ai/patterns/` when the task needs them.
- Prefer existing ARCUI components and public APIs over recreating equivalent controls with React Native primitives.
- A different visual design is not, by itself, a reason to replace an ARCUI semantic component with a custom implementation. Use the component's supported props, tones, colors, tokens, and native style escape hatches first.
- Do not guess ARCUI APIs. Verify exact props, types, and exports against the current source or generated public declarations.
- Use documented package entrypoints only. Do not deep-import implementation files.

## Modifying ARCUI itself

The `ai/` directory primarily documents consumer usage. When changing the library, current source and repository engineering rules are authoritative. Update AI guidance only when the public API, behavior, or recommended consumer usage changes.
