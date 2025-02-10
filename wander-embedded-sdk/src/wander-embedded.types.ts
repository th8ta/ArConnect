import { UserDetails } from "./utils/message/message.types";

export type RouteType =
  | "default"
  | "auth"
  | "account"
  | "settings"
  | "auth-request";

// TODO: 2-columns
export type RouteLayout = "modal" | "popup";

export interface RouteConfig {
  routeType: RouteType;
  preferredLayout: RouteLayout;
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
  routeLayout?: Record<RouteType, RouteLayout>;
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
  // TODO: Similar to just using styles but styes might cause issues with the different states/transitions of the iframe. Also, we probably don't want to give such fine-grained control to developers. In that case, just provide the iframe yourself.
}

export interface WanderEmbeddedButtonCSSVars {
  // TODO: Similar to just using styles but styes might cause issues with the different states/transitions of the button. Also, we probably don't want to give such fine-grained control to developers. In that case, just create and manage the button yourself.
}
