import { Fragment, isValidElement, type ReactNode } from "react";

export const resolveTextContent = (node: ReactNode): string | null => {
  if (
    typeof node === "string" ||
    typeof node === "number" ||
    typeof node === "bigint"
  ) {
    return String(node);
  }

  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }

  if (Array.isArray(node)) {
    let result = "";

    for (const child of node) {
      const resolvedChild = resolveTextContent(child);

      if (resolvedChild === null) {
        return null;
      }

      result += resolvedChild;
    }

    return result;
  }

  if (
    isValidElement<{ children?: ReactNode }>(node) &&
    node.type === Fragment
  ) {
    return resolveTextContent(node.props.children);
  }

  return null;
};
