# ARCUI Motion

Use this reference for custom animation, gestures, layout transitions, or
performance-sensitive visual behavior around ARCUI.

ARCUI motion is UI-thread-first.

## State ownership

React/application state owns semantic and structural state.

SharedValues own frame-level visual state.

Use React state for:

- selected/checked/expanded state;
- form values;
- active tabs;
- visible structure;
- loading/error semantics;
- callback-visible application data.

Use SharedValues for:

- gesture position;
- animation progress;
- transforms;
- opacity;
- animated geometry;
- color interpolation;
- temporary visual transition state.

Do not use a SharedValue as a hidden semantic source of truth when React needs
to understand the state.

## `.value`

ARCUI consistently uses Reanimated SharedValue `.value`.

Do not read or write `.value` during normal React render.

Use `.value` in:

- worklets;
- animated hooks;
- effects;
- event callbacks;
- gesture callbacks;
- lifecycle callbacks.

Do not migrate isolated consumer code to another SharedValue access style merely
for theoretical consistency if the installed Reanimated contract differs, but
when extending ARCUI-oriented patterns, `.value` matches ARCUI 1.x.

## No JS-thread animation frames

Do not drive visual frames with:

- React state updates;
- `setInterval`;
- repeated `setTimeout`;
- JS `requestAnimationFrame`;
- per-frame JS callbacks;
- per-frame React rerenders.

Use Reanimated for continuous frame-level motion.

Keep UI-to-JS crossings semantic and infrequent.

## Reduced Motion

Reduced Motion is required.

When custom motion is non-essential, disable or simplify it when the user
prefers reduced motion.

Semantic state must remain identical whether motion is enabled or reduced.

ARCUI built-in components already implement their own Reduced Motion behavior.

Do not wrap them in external motion that defeats that preference.

## Cancellation and reversal

Cancel stale animation before replacing it when an old transition could keep
running or complete with stale effects.

Use reversal when the interaction can naturally change direction before the
previous transition completes.

Avoid queued animations that visually lag behind current semantic state.

## Animation tokens

Prefer component-specific ARCUI animation tokens when extending behavior that
belongs to that component family.

Use global animation tokens as fallback where appropriate.

Relevant token namespaces include global, press, entering/exiting, and
component-specific animation configuration.

Inspect the installed `TTokens` type instead of assuming names from another
version.

## Press behavior

ARCUI press behavior is tokenized.

Do not recreate press scale/highlight motion around built-in ARCUI controls
unless the requested interaction explicitly requires a different outer effect.

When building a custom application-specific pressable, use ARCUI press tokens if
the intent is to visually match ARCUI controls.

## Layout motion with `FluidView`

Use `FluidView` for opt-in animated layout repositioning.

Its normal layout transition is disabled under Reduced Motion.

Presence transitions are explicit through `entering` and `exiting`.

```tsx
<FluidView entering exiting>
  {content}
</FluidView>
```

Use custom Reanimated entry/exit transitions only when needed.

## Slider

Slider gesture position is UI-thread-driven.

`onValueChange` / `onValuesChange` represent live semantic snapped-value
changes, not every gesture frame.

Use `onValueCommit` / `onValuesCommit` for persistence, analytics, network work,
or other work that should happen after the final changed value is known.

Do not move frame-level slider motion to React state.

## Theme interpolation

Use `useARCUIAnimatedTheme()` when a custom visual needs to animate with ARCUI
theme transitions.

ARCUI theme progress is:

```text
0 = dark
1 = light
```

Extract reusable token primitives before worklets where practical.

Avoid repeatedly traversing large token objects inside frame-level worklets.

## Independent dimensions

Prefer independent SharedValues for independent visual dimensions.

Do not force unrelated state such as focus, error, disabled, and press progress
into one arbitrary ordinal state machine unless interpolation genuinely
represents one semantic visual axis.

When modifiers overlap, visual priority must be explicit.

## Performance

Correctness and accessibility come before speculative micro-optimization.

Optimize real bottlenecks.

Distinguish:

- JS/input/render cost;
- UI-thread animation cost;
- native layout cost;
- development instrumentation cost.

A development FPS fluctuation alone is not evidence that architecture needs to
change when frame-critical UI-thread motion remains smooth.

## Effects

Effects are appropriate for external/lifecycle synchronization such as:

- timers;
- subscriptions;
- listeners;
- AppState;
- native focus/blur;
- Host lifecycle;
- animation synchronization.

Do not use effects merely to mirror props into duplicate semantic state.

## Custom motion checklist

1. Is semantic state still owned by React/application state?
2. Is frame-level state kept in SharedValues?
3. Is `.value` avoided during render?
4. Is animation UI-thread-driven?
5. Is Reduced Motion handled?
6. Can stale motion be cancelled or reversed if needed?
7. Are component animation tokens used where relevant?
8. Are UI-to-JS crossings semantic rather than per-frame?
9. Are accessibility semantics independent of animation progress?
10. Is added complexity justified by real behavior?
