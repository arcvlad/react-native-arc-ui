# ARCUI Forms and Inputs

Use this reference for form fields, validation, Select, Slider, and input state
ownership.

## General form ownership

Form values, validation state, loading state, and submit state belong to React
or the application's state-management layer.

Do not put semantic form values into SharedValues.

Use ARCUI components for field behavior and presentation while keeping business
logic in application code.

## `Input`

`Input` preserves React Native `TextInput` value ownership.

Controlled:

```tsx
const [value, setValue] = useState("");

<Input
  value={value}
  onChangeText={setValue}
/>;
```

Uncontrolled native ownership is also available through inherited native
`defaultValue`:

```tsx
<Input defaultValue="Initial value" />;
```

Do not switch a mounted input between controlled and uncontrolled ownership.

Use the `type` convenience preset when appropriate, while remembering explicit
native `TextInput` props can override the preset.

## `InputPassword`

Use `InputPassword` for password/secret entry.

It owns password-specific visibility behavior and intentionally removes public
props that would conflict with that ownership.

Do not rebuild password visibility around a normal `Input` unless requirements
cannot be represented by `InputPassword`.

Value ownership follows the underlying text-input model.

## `InputArea`

Use for multiline text.

It preserves native text-input ownership while ARCUI owns multiline field
structure, optional character-count presentation, and min/max surface height.

Like `Input`, a mounted `InputArea` must not switch between controlled and
uncontrolled value ownership. Remount with a new `key` if the ownership model
must genuinely change.

Use native `maxLength` when a character limit is part of the input contract.

## `InputNumber`

`InputNumber` is controlled:

```tsx
const [quantity, setQuantity] = useState(1);

<InputNumber
  value={quantity}
  onValueChange={setQuantity}
/>;
```

Use `min`, `max`, `step`, and `decimals` through the public contract rather than
reimplementing numeric normalization around a generic input.

Its increment/decrement controls are icon-only actions with ARCUI-localizable
accessible labels.

## `InputOTP`

`InputOTP` is controlled:

```tsx
const [code, setCode] = useState("");

<InputOTP
  value={code}
  onValueChange={setCode}
  onComplete={handleComplete}
/>;
```

Use it for segmented code entry instead of manually coordinating multiple
independent text inputs.

Use the public ref contract when imperative focus/blur is genuinely needed.

## Labels and errors

Use component `label` and `error` APIs when they represent the requested field
presentation.

Keep validation logic outside the visual component.

Example:

```tsx
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
/>
```

Do not duplicate the same error text both inside the field API and as a separate
accessible message unless the design/semantics require distinct content.

## Disabled versus inactive

Several ARCUI fields distinguish:

- `disabled`: fully disabled semantic state;
- `active={false}`: unavailable in the current interaction flow with ARCUI's
  inactive presentation.

Use the state that matches application semantics.

Do not use visual color alone to simulate disabled behavior.

## Input trailing actions

`Input` supports either a decorative right icon or an interactive right action.

They are mutually exclusive.

Interactive icon-only right actions require a non-empty accessibility label.

Do not use a decorative icon when the user must be able to activate it.

## `Select`

Select is controlled.

Single mode:

```tsx
const [value, setValue] = useState<string | null>(null);

<Select
  value={value}
  onValueChange={setValue}
  options={options}
/>;
```

Multiple mode:

```tsx
const [values, setValues] = useState<string[]>([]);

<Select
  multiple
  values={values}
  onValuesChange={setValues}
  options={options}
/>;
```

Do not mix single- and multiple-mode props.

### Search

With local search, ARCUI filters provided options.

With `onSearchAsync`, external search is consumer-owned.

The consumer also owns async loading state through `searchLoading` and the
resulting `options`.

When external search is active, Select may call `onSearchAsync("")` while
closing/resetting the search field. The consumer should treat the empty query as
a valid reset request and update options according to application semantics.

Do not make Select guess network lifecycle.

## `Slider`

Slider is controlled.

Single mode:

```tsx
const [value, setValue] = useState(50);

<Slider
  value={value}
  onValueChange={setValue}
  onValueCommit={handleCommit}
/>;
```

Range mode:

```tsx
const [values, setValues] = useState<[number, number]>([20, 80]);

<Slider
  range
  values={values}
  onValuesChange={setValues}
  onValuesCommit={handleRangeCommit}
/>;
```

Use live change callbacks when application UI needs the snapped value during
interaction.

Use commit callbacks for persistence, analytics, network work, or other
side-effects that should happen only after interaction completes.

ARCUI does not call live change callbacks for every gesture frame.

Slider mode is fixed for the lifetime of a mounted instance. Do not switch a
mounted Slider between single-value and range mode. Remount it with a new `key`
when the semantic mode genuinely changes.

## Async submission

Keep asynchronous business work in application code.

A typical pattern:

```tsx
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
  if (submitting) return;

  setSubmitting(true);

  try {
    await submit();
  } finally {
    setSubmitting(false);
  }
};

<Button
  loading={submitting}
  onPress={handleSubmit}
>
  Save
</Button>;
```

Do not move network lifecycle into ARCUI animation state.

## Layout transitions around validation

Use `FluidView` when validation messages or conditional fields should cause
surrounding layout to reposition smoothly.

```tsx
<FluidView>
  {showExtraField ? <Input {...extraFieldProps} /> : null}
</FluidView>
```

Semantic field presence remains React-owned.

## Native escape hatches

ARCUI input components intentionally inherit supported native input props.

Use exact React Native props when they match the requirement instead of adding a
parallel ARCUI abstraction.

Examples may include:

- keyboard type;
- auto-capitalization;
- auto-complete behavior;
- return-key behavior;
- native `defaultValue` for preserved uncontrolled text-input modes.

Inspect the installed declarations because specialized ARCUI inputs
intentionally omit native props that would conflict with their semantics.

## Custom input components

Use public `useInputState` only when implementing a genuinely custom input-like
component that should follow ARCUI focus/modifier semantics.

Its render-time modifier priority is:

```text
disabled -> inactive -> error -> focused -> normal
```

The hook intentionally uses React state because it is a semantic/render-time
extension API, not ARCUI's internal frame-level field-motion primitive.

Do not use it to clone an existing ARCUI field.

## Form checklist

1. Form/business state is React/application-owned.
2. `Input` / `InputArea` controlled-uncontrolled ownership does not switch after mount.
3. Specialized ARCUI input is used where it matches.
4. Validation logic is separate from presentation.
5. `disabled` and `active` reflect real semantics.
6. Icon-only input actions are accessible.
7. Select single/multiple modes are not mixed.
8. Async Select search keeps network state consumer-owned.
9. Async Select handlers support the empty-query reset request.
10. Slider live callbacks are not used for expensive per-frame work.
11. Slider single/range mode does not switch after mount.
12. Submit/persistence work uses semantic callbacks, not animation progress.
13. Larger text and validation messages do not clip the layout.
