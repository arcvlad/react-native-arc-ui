# ARCUI Layout and Content Patterns

Use native React Native layout together with ARCUI semantic primitives.

## Screen with scrolling content

```tsx
import {
  ScrollView,
  View,
} from "react-native";
import {
  Divider,
  Screen,
  Text,
} from "react-native-arc-ui";

export function ContentScreen() {
  return (
    <Screen>
      <ScrollView>
        <View>
          <Text>Heading</Text>
          <Text>Supporting content</Text>
        </View>

        <Divider />

        <View>
          <Text>Next section</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
```

`Screen` owns the ARCUI screen surface.

`ScrollView` owns scrolling.

`View` owns app-specific grouping.

## Theme-aware card

```tsx
<ThemedView style={styles.card}>
  <Text>Card content</Text>
</ThemedView>
```

Use `ThemedView` only when the background should be ARCUI theme-aware.

A normal `View` is correct for neutral layout wrappers.

## Opposite-theme region

```tsx
<ReverseTheme>
  <ThemedView>
    <Text>Inverted themed region</Text>
  </ThemedView>
</ReverseTheme>
```

Use subtree inversion instead of manually reversing every child color.

## Dynamic layout

```tsx
<FluidView>
  {detailsVisible ? (
    <View>
      <Text>Additional details</Text>
    </View>
  ) : null}
</FluidView>
```

Semantic visibility remains React-owned.

## Responsive content width

```tsx
const { tokens } = useARCUITheme<TAppTokens>();

<View
  style={{
    width: "100%",
    maxWidth: tokens.brand.contentMaxWidth,
    alignSelf: "center",
  }}
>
  {content}
</View>;
```

Use a custom token only when the value is a reusable application design-system
decision.

Keep one-off screen geometry local.

## Rule

Do not create an ARCUI abstraction for normal flexbox.

Use ARCUI where it owns semantics/theme/system behavior and native React Native
layout where that is the simpler, correct primitive.
