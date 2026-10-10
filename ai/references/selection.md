# ARCUI Selection and Disclosure

Use this reference for Checkbox, Radio, Toggle, Chip, SelectionGroup, Accordion,
and AccordionGroup.

ARCUI semantic selection state has one clear owner.

## Standalone controls

Standalone `Checkbox`, `Radio`, and `Toggle` use controlled `checked`.

```tsx
const [checked, setChecked] = useState(false);

<Checkbox
  checked={checked}
  onCheckedChange={setChecked}
/>;
```

The same ownership principle applies to standalone Radio and Toggle.

Do not create a parallel internal selected state around a controlled ARCUI
control.

## `SelectionGroup`

`SelectionGroup` owns coordinated child selection semantics but remains
controlled by the consumer.

### Single selection

```tsx
const [value, setValue] = useState<string | null>(null);

<SelectionGroup
  value={value}
  onValueChange={setValue}
>
  <Radio value="a">Option A</Radio>
  <Radio value="b">Option B</Radio>
</SelectionGroup>;
```

`null` represents no selection.

Single mode may use `allowDeselect` where the semantic control family supports
deselecting the active value.

### Multiple selection

```tsx
const [values, setValues] = useState<string[]>([]);

<SelectionGroup
  multiple
  values={values}
  onValuesChange={setValues}
>
  <Checkbox value="a">Option A</Checkbox>
  <Checkbox value="b">Option B</Checkbox>
</SelectionGroup>;
```

Do not mix `value` and `values` ownership modes.

## Child ownership inside a group

Inside a `SelectionGroup`, group-aware children use `value` as their identity.

The group owns selected/checked state.

Do not also pass standalone `checked`/`selected` props when the public
discriminated union forbids them.

Child callbacks may provide child-level notification, but the controlled group
state remains the semantic source of truth.

## Radio semantics

Grouped Radio is for single-selection mode.

Do not place Radio into a multiple-selection group.

Use Checkbox, Toggle, or selectable Chip when multiple selection is the intended
semantics.

## Toggle semantics

Use Toggle for an on/off setting or switch-style state.

Do not use Toggle as a visually convenient replacement for an action Button.

Grouped Toggle follows group selection state.

## Chip modes

Chip can be:

- action-only;
- standalone selectable;
- group selectable.

Action Chip does not have selection state.

Standalone selectable Chip uses controlled `selected`.

Grouped selectable Chip uses `value` and receives selection from the group.

Do not infer selectability merely from visual appearance.

## Accordion

Standalone Accordion uses controlled `expanded`:

```tsx
const [expanded, setExpanded] = useState(false);

<Accordion
  title="Details"
  expanded={expanded}
  onExpandedChange={setExpanded}
>
  {content}
</Accordion>;
```

Grouped Accordion uses `value` instead of standalone `expanded`.

Accordion can participate directly in a compatible `SelectionGroup`.
`AccordionGroup` is the specialized convenience wrapper for direct Accordion
children and also applies connected group-position styling.

Do not drive expansion semantics from animation progress.

## AccordionGroup

`AccordionGroup` accepts direct Accordion children.

Each child must have a unique `value`.

Single mode behaves as a controlled single-selection disclosure group and allows
the active accordion to be deselected/collapsed.

```tsx
const [value, setValue] = useState<string | null>(null);

<AccordionGroup
  value={value}
  onValueChange={setValue}
>
  <Accordion value="first" title="First">
    {firstContent}
  </Accordion>

  <Accordion value="second" title="Second">
    {secondContent}
  </Accordion>
</AccordionGroup>;
```

Multiple mode uses `values` / `onValuesChange`.

## Controlled request callbacks

ARCUI callbacks request semantic changes.

The consumer remains responsible for committing controlled state.

Do not assume that calling a callback means state has already changed.

This matters when:

- validation rejects a selection;
- permissions prevent a toggle;
- business rules limit choices;
- a controlled parent intentionally keeps the old state.

Visual semantics should follow the controlled value supplied back to ARCUI.

## Accessibility

Selected/checked/expanded accessibility state follows the real controlled
semantic state.

Do not mirror selection into separate accessibility-only state.

Textual child content receives ARCUI-owned typography/accessibility behavior
where the component contract says so.

Custom ReactNode child content remains consumer-owned.

## Validation errors

Checkbox, Radio, and Toggle can expose component error presentation through
their public contracts.

Keep validation decisions in application state.

Do not use visual error animation as the semantic error source.

## Selection checklist

1. Choose the correct semantic control.
2. Standalone state is controlled by the consumer.
3. Grouped state comes from `SelectionGroup`.
4. Single and multiple group props are not mixed.
5. Radio is not used for multiple selection.
6. Chip mode is explicit: action vs selectable.
7. Group child values are stable and unique.
8. Accordion standalone/group ownership is not mixed.
9. Accessibility state follows controlled semantic state.
10. Animation does not become the selection source of truth.
