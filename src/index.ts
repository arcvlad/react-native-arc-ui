// ─── Provider & Public Hooks ──────────────────────────────────────────────────

export { ARCUI } from "./contexts/Provider";

export {
  useARCUITheme,
  useARCUIAnimatedTheme,
  useARCUISystem,
  useARCUIStrings,
} from "./contexts/hooks";

export { useModal } from "./components/Modal/ModalProvider";

// ─── Extension Hooks ──────────────────────────────────────────────────────────

// Public on purpose: custom inputs can reuse ARCUI's focus/modifier semantics.
export { useInputState } from "./hooks/useInputState";

// ─── Context & Hook Types ─────────────────────────────────────────────────────

export type {
  TStaticTheme,
  TAnimatedTheme,
  TSystemContext,
  TSafeAreaInsets,
  TARCUIProps,
} from "./contexts/Provider";

export type {
  TInputModifier,
  IUseInputState,
  TUseInputStateResult,
} from "./hooks/useInputState";

// ─── Token Types ──────────────────────────────────────────────────────────────

export type {
  TTokens,
  TTokensOverride,
  TThemeWithCustomTokens,
} from "./types/tokens";

export type {
  TSafeAreaOffset,
  TSafeAreaComponentTokens,
  TSafeAreaTokens,
} from "./tokens/SafeArea";

// ─── Strings / Localization ──────────────────────────────────────────────────

export { defaultStrings } from "./strings/Strings";

export type { TARCUIStrings, TARCUIStringsOverride } from "./strings/Strings";

// ─── Token Values ─────────────────────────────────────────────────────────────

export { defaultTokens } from "./tokens";

export { Colors, ColorsLight, ColorsDark } from "./tokens/Colors";

export { Sizings } from "./tokens/Sizings";
export { Spacing } from "./tokens/Spacing";
export { SafeArea } from "./tokens/SafeArea";
export { Radius } from "./tokens/Radius";
export { Border } from "./tokens/Border";
export { Typography } from "./tokens/Typography";
export { ZIndex } from "./tokens/ZIndex";

// ─── Animation Types ──────────────────────────────────────────────────────────

export type {
  TAnimationDirection,
  TEasing,
  TPressAnimation,
} from "./tokens/Animations";

// ─── Components ───────────────────────────────────────────────────────────────

export { Screen } from "./components/Screen/Screen";
export { ThemedView } from "./components/ThemedView/ThemedView";
export { Divider } from "./components/Divider/Divider";
export { Text } from "./components/Text/Text";
export { Button } from "./components/Button/Button";
export { Checkbox } from "./components/Checkbox/Checkbox";
export { Radio } from "./components/Radio/Radio";
export { Toggle } from "./components/Toggle/Toggle";
export { Infobox } from "./components/Infobox/Infobox";

export { Icon } from "./components/Icon/Icon";
export { defaultIcons } from "./components/Icon/defaultIcons";

export { Accordion } from "./components/Accordion/Accordion";

export { AccordionGroup } from "./components/Accordion/AccordionGroup";

export { SelectionGroup } from "./components/SelectionGroup/SelectionGroup";

export { SpinnerLoader } from "./components/SpinnerLoader/SpinnerLoader";

export { Chip } from "./components/Chip/Chip";

export { ProgressBar } from "./components/ProgressBar/ProgressBar";

export { SkeletonLoader } from "./components/SkeletonLoader/SkeletonLoader";

export { Header } from "./components/Header/Header";

export { TabBar } from "./components/Tabs/TabBar";
export { Tab } from "./components/Tabs/Tab";

export { TabNavigation } from "./components/Tabs/TabNavigation";

export { TabScreen } from "./components/Tabs/TabScreen";

export { Badge } from "./components/Badge/Badge";

export { Select } from "./components/Select/Select";

export { Input } from "./components/Input/Input";

export { InputPassword } from "./components/InputPassword/InputPassword";

export { InputArea } from "./components/InputArea/InputArea";

export { InputNumber } from "./components/InputNumber/InputNumber";

export { InputOTP } from "./components/InputOTP/InputOTP";

export { Slider } from "./components/Slider/Slider";

export { Dropdown } from "./components/Dropdown/Dropdown";

export { Modal } from "./components/Modal/Modal";

export { ReverseTheme } from "./components/ReverseTheme/ReverseTheme";

export { FluidView } from "./components/FluidView/FluidView";

// ─── Imperative APIs ──────────────────────────────────────────────────────────

export { showToast, hideToast } from "./components/Toast/ToastProvider";

export { showDialog, hideDialog } from "./components/Dialog/DialogContext";

// ─── Component Types ──────────────────────────────────────────────────────────

export type { IButton } from "./components/Button/types";

export type { ICheckbox } from "./components/Checkbox/types";

export type { IRadio } from "./components/Radio/types";

export type { IToggle } from "./components/Toggle/types";

export type { IInfobox, TInfoboxType } from "./components/Infobox/types";

export type {
  IIcon,
  TIconType,
  TIconSet,
  TIconAnimatedColor,
} from "./components/Icon/types";

export type { IDivider } from "./components/Divider/types";

export type { IText } from "./components/Text/types";

export type { IAccordion } from "./components/Accordion/types";

export type { IAccordionGroup } from "./components/Accordion/AccordionGroup";

export type {
  ISelectionGroup,
  TSelectionValue,
} from "./components/SelectionGroup/types";

export type {
  TDialog,
  TDialogAction,
  TDialogActionType,
} from "./components/Dialog/types";

export type { ISpinnerLoader } from "./components/SpinnerLoader/types";

export type { IChip } from "./components/Chip/types";

export type { IProgressBar } from "./components/ProgressBar/types";

export type { ISkeletonLoader } from "./components/SkeletonLoader/types";

export type {
  IHeader,
  THeaderAction,
  THeaderTitleAlign,
} from "./components/Header/types";

export type {
  ITab,
  ITabBar,
  ITabNavigation,
  ITabScreen,
  TTabBadge,
  TTabType,
  TTabBarPosition,
  TTabBarOrientation,
  TTabBarSizeMode,
  TTabBarLayout,
  TTabBarAlignment,
  TTabIconPosition,
  TTabContent,
} from "./components/Tabs/types";

export type { IBadge } from "./components/Badge/types";

export type {
  ISelect,
  TSelectOption,
  TSelectValue,
} from "./components/Select/types";

export type {
  IInput,
  TInputType,
  TInputRightAction,
} from "./components/Input/types";

export type { IInputPassword } from "./components/InputPassword/types";

export type { IInputArea } from "./components/InputArea/types";

export type {
  IInputNumber,
  TInputNumberButtonType,
  TInputNumberButtonShape,
  TInputNumberValueType,
} from "./components/InputNumber/types";

export type {
  IInputOTP,
  TInputOTPType,
  TInputOTPRef,
} from "./components/InputOTP/types";

export type {
  ISlider,
  TSliderLayout,
  TSliderRangeValue,
} from "./components/Slider/types";

export type {
  IDropdown,
  TDropdownItem,
  TDropdownPlacement,
  TDropdownTriggerProps,
} from "./components/Dropdown/types";

export type { IModal, TModalHeight } from "./components/Modal/types";

export type { IFluidView } from "./components/FluidView/types";

export type { IReverseTheme } from "./components/ReverseTheme/types";

export type { IScreen } from "./components/Screen/types";

export type { IThemedView } from "./components/ThemedView/types";

export type {
  TToastId,
  TToastInput,
  TToastPlacement,
} from "./components/Toast/types";

export type { TTypographyStyle } from "./tokens/Typography";
