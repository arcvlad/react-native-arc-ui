export type TARCUIStrings = {
  modalCloseAccessibilityLabel: string;
  headerBackAccessibilityLabel: string;

  inputClearAccessibilityLabel: string;
  inputPasswordShowAccessibilityLabel: string;
  inputPasswordHideAccessibilityLabel: string;
  inputOTPAccessibilityLabel: string;

  inputNumberDecrementAccessibilityLabel: string;
  inputNumberIncrementAccessibilityLabel: string;

  selectSearchPlaceholder: string;
  selectEmptyLabel: string;

  sliderAccessibilityLabel: string;
  sliderLowerAccessibilityLabel: string;
  sliderUpperAccessibilityLabel: string;
};

export type TARCUIStringsOverride = Partial<TARCUIStrings>;

export const defaultStrings: TARCUIStrings = {
  modalCloseAccessibilityLabel: "Close modal",
  headerBackAccessibilityLabel: "Go back",

  inputClearAccessibilityLabel: "Clear input",
  inputPasswordShowAccessibilityLabel: "Show password",
  inputPasswordHideAccessibilityLabel: "Hide password",
  inputOTPAccessibilityLabel: "One-time code",

  inputNumberDecrementAccessibilityLabel: "Decrease value",
  inputNumberIncrementAccessibilityLabel: "Increase value",

  selectSearchPlaceholder: "Search options",
  selectEmptyLabel: "No results found",

  sliderAccessibilityLabel: "Slider",
  sliderLowerAccessibilityLabel: "Minimum value",
  sliderUpperAccessibilityLabel: "Maximum value",
};

export const resolveStrings = (
  override?: TARCUIStringsOverride,
): TARCUIStrings => ({
  modalCloseAccessibilityLabel:
    override?.modalCloseAccessibilityLabel ??
    defaultStrings.modalCloseAccessibilityLabel,

  headerBackAccessibilityLabel:
    override?.headerBackAccessibilityLabel ??
    defaultStrings.headerBackAccessibilityLabel,

  inputClearAccessibilityLabel:
    override?.inputClearAccessibilityLabel ??
    defaultStrings.inputClearAccessibilityLabel,

  inputPasswordShowAccessibilityLabel:
    override?.inputPasswordShowAccessibilityLabel ??
    defaultStrings.inputPasswordShowAccessibilityLabel,

  inputPasswordHideAccessibilityLabel:
    override?.inputPasswordHideAccessibilityLabel ??
    defaultStrings.inputPasswordHideAccessibilityLabel,

  inputOTPAccessibilityLabel:
    override?.inputOTPAccessibilityLabel ??
    defaultStrings.inputOTPAccessibilityLabel,

  inputNumberDecrementAccessibilityLabel:
    override?.inputNumberDecrementAccessibilityLabel ??
    defaultStrings.inputNumberDecrementAccessibilityLabel,

  inputNumberIncrementAccessibilityLabel:
    override?.inputNumberIncrementAccessibilityLabel ??
    defaultStrings.inputNumberIncrementAccessibilityLabel,

  selectSearchPlaceholder:
    override?.selectSearchPlaceholder ?? defaultStrings.selectSearchPlaceholder,

  selectEmptyLabel:
    override?.selectEmptyLabel ?? defaultStrings.selectEmptyLabel,

  sliderAccessibilityLabel:
    override?.sliderAccessibilityLabel ??
    defaultStrings.sliderAccessibilityLabel,

  sliderLowerAccessibilityLabel:
    override?.sliderLowerAccessibilityLabel ??
    defaultStrings.sliderLowerAccessibilityLabel,

  sliderUpperAccessibilityLabel:
    override?.sliderUpperAccessibilityLabel ??
    defaultStrings.sliderUpperAccessibilityLabel,
});
