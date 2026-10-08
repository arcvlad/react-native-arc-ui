import type { ReactNode } from "react";

import { ARCUI } from "../contexts/Provider";
import type { TARCUIStringsOverride } from "../strings/Strings";
import type { TTokensOverride } from "../types/tokens";

type TARCUIMockProps<TCustom extends object> = {
  children: ReactNode;
  tokens?: TTokensOverride<TCustom>;
  strings?: TARCUIStringsOverride;
};

export function ARCUIMock<TCustom extends object = Record<never, never>>({
  children,
  tokens,
  strings,
}: TARCUIMockProps<TCustom>): React.JSX.Element {
  return (
    <ARCUI<TCustom> tokens={tokens} strings={strings}>
      {children}
    </ARCUI>
  );
}
