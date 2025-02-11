import { UserDetails } from "./utils/message/message.types";

export type RouteType =
  | "default"
  | "auth"
  | "account"
  | "settings"
  | "auth-request";

export type RouteLayoutType = "modal" | "popup";

export interface ModalLayoutConfig {
  position?: "left" | "center" | "right";
  expanded?: boolean;
  imgSrc?: string | boolean;
  fixedWidth?: number;
  fixedHeight?: number;
}

export interface PopupLayoutConfig {
  position?: WanderEmbeddedButtonPosition;
  fixedWidth?: number;
  fixedHeight?: number;
}

export type LayoutConfig = ModalLayoutConfig | PopupLayoutConfig;

// TODO: 2-columns
// TODO: Option to use fixed dimensions?

export interface RouteConfig {
  routeType: RouteType;
  preferredLayout: LayoutConfig;
  width?: number;
  height: number;
}

export interface BalanceInfo {
  aggregatedBalance: number;
  currency: "USD" | "EUR"; // TODO: Replace with a type that includes all options in the settings?
}

export interface WanderEmbeddedOptions {
  src?: string;
  iframe?: WanderEmbeddedIframeOptions | HTMLIFrameElement;
  button?: WanderEmbeddedButtonOptions | boolean;

  // TODO: Add option so that the popup routes have a fixed size and do not resize

  // TODO: Add option to configure the size-images based on route on the side-by-side view (or send them from the modal)

  // TODO: Add effect when spending/signing

  // TODO: Responsive-specific options for narrow screens.

  /*
  logo?: string;
  balance?: string;
  iframeRef?: HTMLIFrameElement;
  buttonStyles?: Partial<CSSStyleDeclaration> | "none";
  iframeStyles?: Partial<CSSStyleDeclaration>;
  */

  // TODO: Also export the messages types:
  onAuth?: (userDetails: UserDetails | null) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onResize?: (routeConfig: RouteConfig) => void;
  onBalance?: (balanceInfo: BalanceInfo) => void;
  onNotification?: (notificationsCount: number) => void;
}

// Common:

export type StateModifier =
  | "default"
  | "isAuthenticated"
  | "isOpen"
  | "isAuthRoute"
  | "isAccountRoute"
  | "isSettingsRoute"
  | "isAuthRequestRoute";

export interface WanderEmbeddedComponentOptions<T> {
  id?: string;
  className?: string | Record<StateModifier, string>;
  // cssVars?: T | Record<StateModifier, T>;
  cssVars?: Record<StateModifier, T>;
}

// Modal (iframe):

export interface WanderEmbeddedIframeOptions
  extends WanderEmbeddedComponentOptions<WanderEmbeddedModalCSSVars> {
  routeLayout?: Record<RouteType, LayoutConfig>;
}

// Button:

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
  border?: string;
  borderRadius?: number | string;
  boxShadow?: string;
  zIndex?: string;
  preferredWidth?: number | string;
  preferredHeight?: number | string;

  // Backdrop (div):
  backdropBackground?: string;
  backdropBackdropFilter?: string;
  backdropPadding?: number | string;
}

export interface WanderEmbeddedButtonCSSVars {
  // Button (button):
  background?: string;
  border?: string;
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
}
