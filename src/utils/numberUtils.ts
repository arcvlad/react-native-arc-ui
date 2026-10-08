import type { DimensionValue } from "react-native";

export type TNumericTextOptions = {
  allowDecimal: boolean;
  allowNegative: boolean;
};

export type TResolveNumberOptions = {
  min?: number;
  max?: number;
  decimals?: number;
};

export type TStepNumberOptions = TResolveNumberOptions & {
  value: number;
  step: number;
  direction: -1 | 1;
};

/**
 * Whether a runtime value is a finite JavaScript number.
 */
export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/**
 * Whether a runtime value is a finite, non-negative number.
 *
 * Useful for cosmetic native metrics such as size, radius, thickness
 * and dimensions where negative values are not meaningful.
 */
export const isNonNegativeFiniteNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value >= 0;

/**
 * Resolves a finite numeric metric or falls back to a safe value.
 *
 * Negative values remain valid because some metrics, such as angles or
 * offsets, legitimately support them.
 */
export const resolveFiniteMetric = (
  value: number | undefined,
  fallback: number,
): number => (isFiniteNumber(value) ? value : fallback);

/**
 * Resolves a finite, non-negative numeric metric or falls back safely.
 */
export const resolveNonNegativeMetric = (
  value: number | undefined,
  fallback: number,
): number => (isNonNegativeFiniteNumber(value) ? value : fallback);

/**
 * Resolves a finite, non-negative integer or falls back safely.
 *
 * Useful for counts and other discrete configuration values.
 */
export const resolveNonNegativeInteger = (
  value: number | undefined,
  fallback: number,
): number => {
  const resolvedFallback = isNonNegativeFiniteNumber(fallback)
    ? Math.floor(fallback)
    : 0;

  return isNonNegativeFiniteNumber(value)
    ? Math.floor(value)
    : resolvedFallback;
};

/**
 * Resolves a finite positive integer with a minimum value of 1.
 *
 * Useful for visible-item counts and other configurations where zero
 * would make the component structurally unusable.
 */
export const resolvePositiveInteger = (
  value: number | undefined,
  fallback: number,
): number => Math.max(1, resolveNonNegativeInteger(value, fallback));

/**
 * Preserves valid native DimensionValue inputs while protecting numeric
 * dimensions from negative, NaN and infinite values.
 *
 * Non-numeric native values such as percentages are passed through unchanged.
 */
export const resolveDimension = (
  value: DimensionValue | undefined,
  fallback: DimensionValue,
): DimensionValue => {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "number") {
    return value;
  }

  return isNonNegativeFiniteNumber(value) ? value : fallback;
};

/**
 * Parses a percentage string into its numeric 0–100 representation.
 *
 * Returns null when the input is not a finite percentage between 0 and 100.
 */
export const parsePercentage = (value: string): number | null => {
  const trimmed = value.trim();

  if (!trimmed.endsWith("%")) {
    return null;
  }

  const raw = trimmed.slice(0, -1).trim();

  if (raw.length === 0) {
    return null;
  }

  const percentage = Number(raw);

  if (!isFiniteNumber(percentage) || percentage < 0 || percentage > 100) {
    return null;
  }

  return percentage;
};

/**
 * Normalizes the decimal separator accepted by numeric text parsing.
 *
 * The rendered editing text is intentionally left untouched so consumers can
 * type either "." or "," naturally. This normalization is only for parsing.
 */
export const normalizeNumericText = (text: string): string =>
  text.replace(/,/g, ".");

/**
 * Whether a string can still become a valid numeric value while the user is
 * editing.
 *
 * Temporary states such as "", "-", ".", "-.", "12." and "12," are allowed
 * when their corresponding numeric features are enabled.
 */
export const isPotentialNumericText = (
  text: string,
  { allowDecimal, allowNegative }: TNumericTextOptions,
): boolean => {
  const sign = allowNegative ? "-?" : "";

  if (allowDecimal) {
    return new RegExp(`^${sign}\\d*(?:[.,]\\d*)?$`).test(text);
  }

  return new RegExp(`^${sign}\\d*$`).test(text);
};

/**
 * Parses only complete numeric editing states.
 *
 * Temporary states intentionally return null and therefore do not emit a
 * semantic numeric value.
 */
export const parseNumericText = (
  text: string,
  options: TNumericTextOptions,
): number | null => {
  if (!isPotentialNumericText(text, options)) {
    return null;
  }

  const normalized = normalizeNumericText(text);

  if (
    normalized.length === 0 ||
    normalized === "-" ||
    normalized === "." ||
    normalized === "-." ||
    normalized.endsWith(".")
  ) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Applies ARCUI numeric precision semantics.
 *
 * decimals=undefined means integer-only.
 */
export const normalizeNumberPrecision = (
  value: number,
  decimals?: number,
): number => {
  if (decimals === undefined) {
    return Math.round(value);
  }

  return Number(value.toFixed(decimals));
};

export const clampNumber = (
  value: number,
  min?: number,
  max?: number,
): number => {
  let resolved = value;

  if (min !== undefined) {
    resolved = Math.max(resolved, min);
  }

  if (max !== undefined) {
    resolved = Math.min(resolved, max);
  }

  return resolved;
};

/**
 * Normalizes precision first and then applies the configured numeric bounds.
 */
export const resolveNumberValue = (
  value: number,
  { min, max, decimals }: TResolveNumberOptions,
): number => clampNumber(normalizeNumberPrecision(value, decimals), min, max);

/**
 * Resolves one semantic step without exposing floating-point artifacts such as
 * 0.1 + 0.2 = 0.30000000000000004.
 */
export const stepNumber = ({
  value,
  step,
  direction,
  min,
  max,
  decimals,
}: TStepNumberOptions): number =>
  resolveNumberValue(value + direction * step, {
    min,
    max,
    decimals,
  });

/**
 * Formats the non-editing representation.
 *
 * When decimals is explicitly supplied, trailing zeroes are intentional.
 */
export const formatNumber = (value: number, decimals?: number): string => {
  const normalized = normalizeNumberPrecision(value, decimals);

  if (decimals === undefined) {
    return String(normalized);
  }

  return normalized.toFixed(decimals);
};
