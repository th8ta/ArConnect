import { UserDetails } from "./utils/message/message.types";

export type RouteType =
  | "default"
  | "auth"
  | "account"
  | "settings"
  | "auth-request";

export interface ModalLayoutConfig {
  type: "modal";
  fixedWidth?: number;
  fixedHeight?: number;
}

export interface PopupLayoutConfig {
  type: "popup";
  position?: WanderEmbeddedButtonPosition;
  fixedWidth?: number;
  fixedHeight?: number;
}

export interface SidebarLayoutConfig {
  type: "sidebar";
  position?: "left" | "right";
  expanded?: boolean;
  fixedWidth?: number;
}

export interface HalfLayoutConfig {
  type: "half";
  position?: "left" | "right";
  expanded?: boolean;
  imgSrc?: string | boolean;
}

export type LayoutConfig =
  | ModalLayoutConfig
  | PopupLayoutConfig
  | SidebarLayoutConfig
  | HalfLayoutConfig;

export type LayoutType = LayoutConfig["type"];

export const LAYOUT_TYPES = [
  "modal",
  "popup",
  "sidebar",
  "half"
] as const satisfies LayoutType[];

export function isRouteConfig(obj: unknown): obj is LayoutConfig {
  return !!(
    obj &&
    typeof obj === "object" &&
    "type" in obj &&
    LAYOUT_TYPES.includes(obj.type as LayoutType)
  );
}

export interface RouteConfig {
  routeType: RouteType;
  preferredLayoutType: LayoutType;
  width?: number;
  height: number;
}

export interface BalanceInfo {
  amount: number;
  currency: "USD" | "EUR"; // TODO: Replace with a type that includes all options in the settings?
}

export interface WanderEmbeddedOptions {
  src?: string;
  iframe?: WanderEmbeddedIframeOptions | HTMLIFrameElement;
  button?: WanderEmbeddedButtonOptions | boolean;

  // TODO: Also export the messages types:
  onAuth?: (userDetails: UserDetails | null) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onResize?: (routeConfig: RouteConfig) => void;
  onBalance?: (balanceInfo: BalanceInfo) => void;
  onNotification?: (notificationsCount: number) => void;
}

// Common:

export interface WanderEmbeddedComponentOptions<T> {
  id?: string;
  className?: string;
  cssVars?: T;
}

// Modal (iframe):

export type WanderEmbeddedClickOutsideBehavior = "auto" | boolean;

export interface WanderEmbeddedIframeOptions
  extends WanderEmbeddedComponentOptions<WanderEmbeddedModalCSSVars> {
  // TODO: Default should automatically be used for auth-requests, and auth for account and settings?
  routeLayout?:
    | LayoutType
    | LayoutConfig
    | Partial<Record<RouteType, LayoutType | LayoutConfig>>;

  /**
   * Close Wander Embedded when clicking outside of it:
   *
   * - "auto": Will close if `backdropBackground` is not transparent or if `backdropBackdropFilter` is used.
   * - false: Will never close. Use this if you want Wander Embedded to close by clicking the close icon.
   * - true: Will always close. Use this if you want Wander Embedded to close when clicking outside, even if the
   *   backdrop is not visible.
   */
  clickOutsideBehavior?: WanderEmbeddedClickOutsideBehavior;
}

// Button:

export type WanderEmbeddedButtonStatus = "isAuthenticated" | "isOpen";

export interface WanderEmbeddedButtonOptions
  extends WanderEmbeddedComponentOptions<WanderEmbeddedButtonCSSVars> {
  position?: WanderEmbeddedButtonPosition;
  logo?: boolean | string;
  balance?: boolean | WanderEmbeddedBalanceOptions;
  notifications?: WanderEmbeddedButtonNotifications;
}

export type WanderEmbeddedButtonPosition =
  | "top-right"
  | "bottom-right"
  | "top-left"
  | "bottom-left";

export interface WanderEmbeddedBalanceOptions {
  balanceOf: "total" | string; // string would be a token id
  currency: "auto" | string; // "auto" would be the one the user selected on the wallet, string would be a token id or currency symbol (e.g. USD).
}

export type WanderEmbeddedButtonNotifications = "off" | "counter" | "alert";

// Styles:

export interface WanderEmbeddedModalCSSVars {
  // Modal (iframe):
  background?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number | string;
  boxShadow?: string;
  zIndex?: string;
  preferredWidth?: number | string;
  preferredHeight?: number | string;

  // App wrapper (inside iframe):
  iframePadding?: number;
  iframeMaxWidth?: number;
  iframeMaxHeight?: number;

  // Backdrop (div):
  backdropBackground?: string;
  backdropBackdropFilter?: string;
  backdropPadding?: number | string;

  /**
   * TODO: If `backdropBackground` is transparent and `backdropBackdropFilter` is not set, this will be set to "none", unless
   * a different value is specified. In any other case, this is ignored.
   */
  backdropPointerEvents?: string;
}

export interface WanderEmbeddedButtonCSSVars {
  // Button (button):
  background?: string;
  borderWidth?: number | string;
  borderColor?: string;
  borderRadius?: number | string;
  boxShadow?: string;
  zIndex?: string;
  minWidth?: number | string;
  minHeight?: number | string;
  padding?: number | string;
  font?: string;

  // Logo (img / svg):
  logoBackground?: string;
  logoBorder?: string; // TODO: Border-right only?
  logoBorderRadius?: number | string;

  // Labels (span):

  // Balance (span):

  // Notifications (span):
  notificationsBackground?: string;
  notificationsBorder?: string;
  notificationsBorderRadius?: number | string;
  notificationsBoxShadow?: string;
  notificationsPadding?: number | string;

  // TODO: :hover and :focus specific styling.
}
