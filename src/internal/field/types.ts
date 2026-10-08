import type { DerivedValue, SharedValue } from "react-native-reanimated";

import type { TTypographyStyle } from "../../tokens/Typography";

export type TFieldAnimatedString = SharedValue<string> | DerivedValue<string>;

/**
 * Field typography uses the same native-first contract as component tokens.
 * ARCUI-managed font metrics and color are resolved by the field primitive.
 */
export type TFieldTypography = TTypographyStyle;
