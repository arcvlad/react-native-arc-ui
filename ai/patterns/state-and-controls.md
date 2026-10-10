# ARCUI State and Control Patterns

These are composition patterns, not mandatory templates.

## Controlled standalone state

```tsx
const [checked, setChecked] = useState(false);

<Checkbox
  checked={checked}
  onCheckedChange={setChecked}
>
  Receive updates
</Checkbox>;
```

The React value is the semantic source of truth.

## Controlled single-selection group

```tsx
const [value, setValue] = useState<string | null>(null);

<SelectionGroup
  value={value}
  onValueChange={setValue}
>
  <Radio value="one">One</Radio>
  <Radio value="two">Two</Radio>
</SelectionGroup>;
```

Do not pass standalone `checked` to grouped Radio.

## Controlled multiple-selection group

```tsx
const [values, setValues] = useState<string[]>([]);

<SelectionGroup
  multiple
  values={values}
  onValuesChange={setValues}
>
  <Checkbox value="one">One</Checkbox>
  <Checkbox value="two">Two</Checkbox>
</SelectionGroup>;
```

## Controlled disclosure

```tsx
const [expanded, setExpanded] = useState(false);

<Accordion
  title="More information"
  expanded={expanded}
  onExpandedChange={setExpanded}
>
  {content}
</Accordion>;
```

## Controlled accordion group

```tsx
const [value, setValue] = useState<string | null>(null);

<AccordionGroup
  value={value}
  onValueChange={setValue}
>
  <Accordion value="one" title="One">
    {oneContent}
  </Accordion>

  <Accordion value="two" title="Two">
    {twoContent}
  </Accordion>
</AccordionGroup>;
```

## Controlled tabs

```tsx
const [activeTab, setActiveTab] = useState("one");

<TabBar
  activeTab={activeTab}
  onActiveTabChange={setActiveTab}
>
  <Tab value="one" label="One" />
  <Tab value="two" label="Two" />
</TabBar>;
```

## Request validation

Callbacks request semantic changes.

Business rules may reject a request:

```tsx
const handleChange = (nextValue: string | null) => {
  if (!canChangeSelection) {
    return;
  }

  setValue(nextValue);
};
```

ARCUI visual/accessible semantic state should follow the controlled value, not a
separate optimistic local mirror.

## Rule

If React or accessibility needs to know the state, keep it in React/application
state.

Use SharedValues only for frame-level visual motion.
