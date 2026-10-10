# ARCUI Overlays

Use this reference for Modal, Dropdown, Dialog, and Toast.

ARCUI owns one provider-level overlay infrastructure beneath `ARCUI`.

Do not mount internal overlay providers manually.

Do not simulate global overlays with extreme local absolute positioning.

## `Modal`

Modal visibility is controlled application state.

```tsx
const [visible, setVisible] = useState(false);

<Modal
  visible={visible}
  onClose={() => setVisible(false)}
  title="Details"
>
  {content}
</Modal>;
```

`onClose` represents a user dismissal request from supported interactions such
as backdrop, close action, back, swipe, or accessibility dismissal.

A parent changing `visible` from `true` to `false` is controlled state change,
not a user close request.

### Rehosting

Modal content is declaratively rehosted into ARCUI's root Host layer.

Local React Context ancestry below `<ARCUI />` is therefore not guaranteed to
remain available inside Modal content.

When Modal content needs application data, prefer:

- props;
- context provided above `ARCUI`;
- application/global state;
- another architecture that remains valid after rehosting.

Do not assume a local context provider surrounding the Modal declaration will
also surround its rehosted content.

### Scrolling

Modal can own an internal ScrollView through its public `scrollable` contract.

Do not nest unnecessary scrolling containers.

### Stacking

ARCUI owns Modal stacking and top-modal interaction semantics.

Do not build a separate local z-index stack to compete with it.

`useModal()` exposes public semantic modal state such as active modal count;
internal Host ids remain private.

## `Dropdown`

Dropdown owns:

- open state;
- trigger measurement;
- overlay positioning;
- vertical collision resolution;
- dismissal;
- overlay lifecycle.

The consumer owns the trigger's visual presentation through:

```tsx
<Dropdown
  items={items}
  onSelect={handleSelect}
  trigger={({ onPress, isOpen, disabled }) => (
    <Button
      onPress={onPress}
      disabled={disabled}
    >
      {isOpen ? "Close" : "Open"}
    </Button>
  )}
/>
```

Do not introduce separate open state unless application behavior genuinely
requires state outside Dropdown's public contract.

Dropdown item values must be stable and unique.

Use item `destructive` semantics for destructive actions instead of only
hardcoding a red color when the behavior is truly destructive.

## Dialog

Dialog is imperative public API and requires an `ARCUI` provider to be
mounted before it is called:

```tsx
import {
  hideDialog,
  showDialog,
} from "react-native-arc-ui";
```

Show:

```tsx
showDialog({
  title: "Confirm",
  message: "Continue?",
  actions: [
    {
      label: "Continue",
      onPress: handleContinue,
    },
  ],
});
```

ARCUI does not generate an implicit confirmation action.

Provide explicit actions when actions are required.

Dialog supports one active instance.

If a new Dialog is requested while one is active, ARCUI owns replacement
lifecycle.

Do not build an application-level Dialog stack on top of this API unless the
product requirement is fundamentally different.

### Async actions

A Dialog action may return a Promise.

ARCUI uses that Promise to manage action loading state until it settles.

Use `autoDismiss` through the public contract when the Dialog should remain open
after a successful action.

Do not manually synchronize visual Dialog loading through external animation
state when the public async action contract already expresses the behavior.

### Dismissal

Dialog passive dismissal is explicit through `dismissible`.

Use `hideDialog()` when application code intentionally needs to request closing
the current Dialog.

Use `onDismiss` when application code needs notification after the matching
Dialog has completed its exit animation and is no longer visible. Do not treat
an action press as equivalent to completed dismissal.

## Toast

Toast is imperative and requires an `ARCUI` provider to be mounted before it
is called:

```tsx
import {
  hideToast,
  showToast,
} from "react-native-arc-ui";

const id = showToast({
  message: "Saved",
});

hideToast(id);
```

`showToast` returns the Toast id.

Toast `message` must contain non-whitespace text. Use another UI treatment when
there is no meaningful message to present or announce.

Use `hideToast(id)` for early dismissal.

Unknown/already-closing ids are safe no-ops according to the public lifecycle.

Toast `message` is the visible and announced semantic content.

Decorative custom icon content should not duplicate the same accessible
message.

Use Toast for transient feedback, not as a replacement for persistent error or
form validation content.

## Overlay accessibility

ARCUI Modal infrastructure removes underlying application content from
screen-reader traversal while a Modal is active.

Do not defeat this behavior with competing overlay roots.

Custom Modal actions/content remain consumer-owned and must carry appropriate
semantics.

Dialogs and Toasts should contain concise meaningful text.

## Safe area and viewport

ARCUI overlays use provider/system safe-area information and viewport geometry.

Do not hardcode device-specific screen coordinates for overlay placement.

Dropdown and Modal already own their supported placement/geometry behavior.

## Reduced Motion

Overlay motion must respect Reduced Motion.

Built-in ARCUI overlays already own their motion behavior.

Do not wrap them in external mandatory transitions that reintroduce motion under
Reduced Motion.

## Overlay checklist

1. Use ARCUI's provider-owned overlay API.
2. Modal visibility remains controlled React state.
3. Modal rehosting/context implications are understood.
4. Dropdown open/placement lifecycle is not duplicated unnecessarily.
5. Dialog actions are explicit.
6. Async Dialog actions use the Promise contract where appropriate.
7. Toast is used only for transient feedback.
8. Toast ids are used for early dismissal when needed.
9. Background accessibility remains correct.
10. No fake global overlays are built with local absolute-position hacks.
