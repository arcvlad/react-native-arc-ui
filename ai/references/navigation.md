# ARCUI Navigation Components

Use this reference for ARCUI Header, Tab, TabBar, TabNavigation, and TabScreen.

ARCUI navigation components own presentation and interaction semantics, not the
consumer application's entire routing architecture.

Preserve the app's existing router/navigation solution unless the task requires
changing it.

## `Header`

Use `Header` for ARCUI screen-header presentation.

It can own:

- title presentation;
- built-in back control;
- icon actions;
- custom end content;
- safe-area-aware header layout;
- semantic bottom border.

### Back behavior

A Header can receive a local `onBack`.

ARCUI provider may also expose application-level `onBack`.

If `showBack={true}` is requested, a local or provider-level back callback must
exist. Treat a back button with no back behavior as configuration misuse rather
than rendering a dead control.

Use the existing app navigation architecture to implement the callback.

Do not make Header itself responsible for routing logic that belongs to the
consumer's navigation library.

Icon-only Header actions require `accessibilityLabel`.

Use `actions` for ARCUI-owned icon actions.

Use `endContent` for arbitrary consumer-owned end content.

Do not try to occupy both mutually exclusive slots.

## `TabBar`

`TabBar` is controlled.

```tsx
const [activeTab, setActiveTab] = useState("overview");

<TabBar activeTab={activeTab} onActiveTabChange={setActiveTab}>
  <Tab value="overview" label="Overview" />
  <Tab value="activity" label="Activity" />
</TabBar>;
```

The consumer owns `activeTab`.

Tab values must be non-empty and unique.

If a dynamic `activeTab` does not match any rendered Tab, ARCUI may fall back
visually to the first available tab while leaving the consumer-controlled value
unchanged. Keep `activeTab` valid rather than relying on that visual fallback.

Do not maintain a second local active-tab state around a controlled TabBar.

## Tab content

`Tab` is used directly with `TabBar`. `TabNavigation` derives its tab controls
from declarative `TabScreen` children. Do not render a standalone `Tab` as a
generic button.

`Tab` supports:

- text-only;
- icon + text;
- icon-only.

Icon-only tabs require an explicit accessible label.

Do not use a generic button in place of `Tab` inside `TabBar`.

## `TabNavigation`

Use `TabNavigation` when ARCUI should coordinate TabBar presentation and page
content.

It is controlled through `activeTab`.

Its children are declarative `TabScreen` elements.

```tsx
const [activeTab, setActiveTab] = useState("overview");

<TabNavigation activeTab={activeTab} onActiveTabChange={setActiveTab}>
  <TabScreen value="overview" label="Overview">
    {overviewContent}
  </TabScreen>

  <TabScreen value="activity" label="Activity">
    {activityContent}
  </TabScreen>
</TabNavigation>;
```

`TabScreen` values must be non-empty and unique.

ARCUI may visually fall back during invalid dynamic controlled input, but it
does not silently mutate the consumer's semantic `activeTab`.

Keep the controlled value valid.

## Swipe behavior

`TabNavigation` can support swipe navigation through its public contract.

A completed swipe requests a semantic tab change through
`onActiveTabChange`.

The consumer still owns whether that requested value is committed.

Do not mirror swipe position into React state frame by frame.

## TabBar layout

Use public TabBar/TabNavigation options for:

- visual type;
- horizontal/vertical orientation;
- top/bottom/start/end placement;
- fill/content sizing;
- inline/overlay TabNavigation layout;
- logical alignment.

Do not recreate supported tab indicator geometry externally.

When overlay layout is used, remember that overlay bars do not automatically
add content padding. Compose the page layout accordingly.

## RTL/logical layout

ARCUI navigation APIs use logical concepts such as start/end where relevant.

Preserve logical directionality instead of hardcoding left/right assumptions
into custom surrounding layout.

## External navigation libraries

ARCUI can be used inside React Navigation, Expo Router, or another routing
architecture.

ARCUI does not require replacing the router.

Typical ownership:

```text
router/navigation library
→ route stack and route transitions

ARCUI Header / Tabs
→ screen-level presentation and supported tab semantics

application state
→ business/navigation decisions
```

## Accessibility

Header icon actions need meaningful labels.

Icon-only tabs need meaningful labels.

Active tab semantics must follow the controlled `activeTab`.

Do not encode navigation state only through color or animation.

## Navigation checklist

1. Preserve the existing app router unless change is required.
2. Header callbacks delegate to application navigation logic.
3. Tab selection is controlled.
4. Tab/TabScreen values are stable, unique, and non-empty.
5. Icon-only controls have accessible names.
6. Swipe motion does not drive React state per frame.
7. Overlay TabBar layout is accounted for by surrounding content.
8. `showBack={true}` always has a real back callback.
9. Logical start/end behavior is preserved.
