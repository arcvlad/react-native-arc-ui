# ARCUI Overlay and Feedback Patterns

## Controlled Modal

```tsx
const [visible, setVisible] = useState(false);

<>
  <Button onPress={() => setVisible(true)}>
    Open
  </Button>

  <Modal
    visible={visible}
    onClose={() => setVisible(false)}
    title="Details"
  >
    {content}
  </Modal>
</>;
```

The application owns `visible`.

ARCUI owns Modal presentation, dismissal gestures, Host lifecycle, and
stacking.

## Dropdown trigger

```tsx
<Dropdown
  items={items}
  onSelect={handleSelect}
  trigger={({ onPress, isOpen, disabled }) => (
    <Button
      onPress={onPress}
      disabled={disabled}
    >
      {isOpen ? "Close menu" : "Open menu"}
    </Button>
  )}
/>
```

The trigger owns its appearance.

Dropdown owns open state and placement.

## Dialog

```tsx
showDialog({
  title: "Delete item?",
  message: "This action cannot be undone.",
  actions: [
    {
      label: "Delete",
      onPress: handleDelete,
    },
    {
      label: "Cancel",
      type: "border",
    },
  ],
});
```

Actions are explicit.

Do not invent a public `<Dialog />` component.

## Async Dialog action

```tsx
showDialog({
  title: "Save changes?",
  actions: [
    {
      label: "Save",
      onPress: async () => {
        await saveChanges();
      },
    },
  ],
});
```

Returning a Promise lets ARCUI own the action loading lifecycle.

## Toast

```tsx
const toastId = showToast({
  message: "Changes saved",
});

// Optional early dismissal:
hideToast(toastId);
```

Use Toast for transient feedback.

Persistent form errors and validation belong in the relevant screen/field
content.

## Rule

Use ARCUI's root overlay infrastructure.

Do not add competing local overlay hosts or z-index hacks when ARCUI already
provides the required semantic overlay.
