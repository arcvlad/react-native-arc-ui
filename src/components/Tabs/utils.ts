import type { TTabType } from "./types";

type TTabsOwner = "TabBar" | "TabNavigation";

export const resolveTabType = (value: string, owner: TTabsOwner): TTabType => {
  switch (value) {
    case "solid":
    case "border":
    case "text":
    case "underline":
    case "segment":
      return value;

    default:
      if (__DEV__) {
        console.error(
          `[react-native-arc-ui] ${owner} type "${String(
            value,
          )}" is invalid. Falling back to "underline".`,
        );
      }

      return "underline";
  }
};
