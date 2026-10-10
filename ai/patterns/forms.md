# ARCUI Form Patterns

These examples show ownership and composition, not a prescribed form library.

## Controlled fields

```tsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

<>
  <Input
    label="Email"
    type="email"
    value={email}
    onChangeText={setEmail}
  />

  <InputPassword
    label="Password"
    value={password}
    onChangeText={setPassword}
  />
</>;
```

Form values stay in React/application state.

## Validation

```tsx
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
/>
```

Validation logic stays outside the component.

## Select

```tsx
const [country, setCountry] = useState<string | null>(null);

<Select
  label="Country"
  value={country}
  onValueChange={setCountry}
  options={countryOptions}
/>;
```

## Numeric input

```tsx
const [quantity, setQuantity] = useState(1);

<InputNumber
  label="Quantity"
  value={quantity}
  onValueChange={setQuantity}
  min={1}
/>;
```

## Slider with commit work

```tsx
const [value, setValue] = useState(50);

<Slider
  value={value}
  onValueChange={setValue}
  onValueCommit={saveValue}
/>;
```

Use `onValueCommit` for persistence/network/analytics when live updates are not
needed for that work.

## Async submit action

```tsx
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
  if (submitting) return;

  setSubmitting(true);

  try {
    await submitForm();
  } finally {
    setSubmitting(false);
  }
};

<Button
  loading={submitting}
  onPress={handleSubmit}
>
  Submit
</Button>;
```

ARCUI owns Button loading presentation; the application owns async lifecycle.

## Fluid validation layout

```tsx
<FluidView>
  {showAdditionalField ? (
    <Input
      label="Additional information"
      value={additional}
      onChangeText={setAdditional}
    />
  ) : null}
</FluidView>
```

React owns whether the field exists.

`FluidView` owns only the optional layout transition.

## Form composition rule

Use ARCUI for fields/actions.

Use React Native layout primitives for form rows, sections, scrolling, and
application-specific structure.

Do not rebuild specialized ARCUI field behavior from generic primitives.
