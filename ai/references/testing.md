# ARCUI Testing

Use this reference when writing consumer tests for UI that depends on ARCUI.

ARCUI testing helpers intentionally live outside the normal runtime entrypoint.

## `ARCUIMock`

Import:

```tsx
import { ARCUIMock } from "react-native-arc-ui/testing";
```

Use it to provide ARCUI context in tests without importing ARCUI internal
providers.

```tsx
render(
  <ARCUIMock>
    <ComponentUnderTest />
  </ARCUIMock>,
);
```

`ARCUIMock` may also receive supported token and string overrides.

Do not import internal ARCUI contexts/providers to construct a test harness.

## What to test

Prefer semantic behavior over implementation detail.

Useful assertions include:

- visible content;
- accessible role/name/state;
- controlled callback requests;
- disabled behavior;
- selection ownership;
- validation/error content;
- overlay lifecycle visible to the user;
- final committed Slider values;
- application behavior after Button/Input actions.

Do not write brittle tests around ARCUI internal component structure.

## Controlled state

When testing controlled ARCUI components, remember callbacks request state
changes.

The test harness must update the controlled prop if the test expects the visual
semantic state to change.

Example:

```tsx
function Harness() {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={setChecked}
    >
      Option
    </Checkbox>
  );
}
```

Do not expect a controlled component to mutate its own semantic prop.

## Animation

Avoid asserting intermediate Reanimated frame values unless the application
specifically owns that animation contract.

Prefer testing:

- semantic state before/after interaction;
- final visible state;
- callback behavior;
- presence/removal after supported lifecycle completion.

Do not make consumer tests depend on ARCUI's private SharedValue layout.

## Reduced Motion

When application code adds custom motion around ARCUI, include a test strategy
for behavior when non-essential motion is disabled where practical.

Semantic behavior should remain the same.

## Overlays

Use the public ARCUI APIs in tests.

For Modal, drive controlled `visible`.

For Dialog and Toast, call their public imperative functions inside an ARCUI
test provider.

Do not mount private Host components directly.

Remember that overlay content may be rehosted, so tests should query by semantic
content/test id rather than assuming local wrapper ancestry.

## `testID`

ARCUI components expose stable public `testID` surfaces where documented.

Use `testID` when automation genuinely needs deterministic identity.

Prefer semantic queries when they are sufficient.

Do not infer undocumented internal test-id suffixes unless the public contract
documents them.

## Token/string variants

`ARCUIMock` can receive token/string configuration for targeted consumer tests.

Use this when a custom component depends on consumer ARCUI configuration.

Do not duplicate ARCUI's own internal component test suite in the application.

## Public boundary

Testing imports:

```ts
"react-native-arc-ui/testing"
```

Runtime imports:

```ts
"react-native-arc-ui"
```

Do not deep-import testing or implementation files from `dist` or `src`.

## Validation

When the project exposes them, run:

- TypeScript/typecheck;
- lint;
- relevant unit/component tests;
- platform/runtime checks for gesture-heavy or overlay-heavy behavior.

Do not claim a test passed unless it was actually executed.
