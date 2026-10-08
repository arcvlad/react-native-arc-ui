import { Fragment, memo } from "react";

import type { ITabScreen } from "./types";

/**
 * Marker component used by TabNavigation for declarative page metadata.
 *
 * TabNavigation reads value/content metadata and children from props and
 * renders the page directly. The fallback keeps TabScreen harmless when it is
 * rendered outside TabNavigation.
 */
const TabScreenComponent = ({ children }: ITabScreen) => (
  <Fragment>{children}</Fragment>
);

export const TabScreen = memo(TabScreenComponent);

TabScreen.displayName = "TabScreen";
