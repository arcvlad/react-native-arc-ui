# ARCUI Loading and Transition Patterns

Choose loading feedback based on what the application actually knows.

## Indeterminate loading

Use `SpinnerLoader` when progress amount is unknown:

```tsx
{loading ? <SpinnerLoader /> : content}
```

Application `loading` state remains React-owned.

`SpinnerLoader` is visual feedback. If the loading state must be announced to
assistive technology, expose that semantic busy/loading state through the
surrounding application content or an appropriate accessible status.

## Determinate progress

Use `ProgressBar` when measurable progress exists:

```tsx
<ProgressBar
  value={progress}
  label="Uploading"
  showValue
/>
```

Do not invent a percentage when work is actually indeterminate.

## Skeleton content

Use `SkeletonLoader` when preserving approximate content geometry improves the
loading experience:

```tsx
<View>
  <SkeletonLoader
    variant="rect"
    height={24}
  />
  <SkeletonLoader
    variant="rect"
    height={80}
  />
</View>
```

Use square/circle variants when they match the placeholder geometry.

`SkeletonLoader` is intentionally hidden from the accessibility tree. Keep the
meaningful loading/busy semantics in the surrounding application state/content.

Do not use skeletons where a simple spinner or immediate content replacement is
clearer.

## Button loading

Use the Button loading state for async actions:

```tsx
<Button
  loading={submitting}
  onPress={handleSubmit}
>
  Save
</Button>
```

The application owns `submitting`.

## Fluid layout change

```tsx
<FluidView>
  {error ? <Text>{error}</Text> : null}
</FluidView>
```

Use when surrounding layout should smoothly reposition.

## Presence transition

```tsx
{visible ? (
  <FluidView
    entering
    exiting
  >
    {content}
  </FluidView>
) : null}
```

Presence remains controlled by React.

`FluidView` owns only the visual transition and respects Reduced Motion.

## Rule

Never use loading animation progress as the semantic loading source of truth.

React/application state owns whether work is loading, complete, failed, or
available.
