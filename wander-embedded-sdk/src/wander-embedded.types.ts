import {
  IncomingAuthMessageData,
  IncomingBalanceMessageData,
  IncomingNotificationMessageData,
  IncomingResizeMessageData,
  RouteLayout,
  RouteType
} from "./types/messages";

export interface WanderEmbeddedOptions {
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
  onAuth?: (data: IncomingAuthMessageData) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onResize?: (data: IncomingResizeMessageData) => void;
  onBalance?: (data: IncomingBalanceMessageData) => void;
  onNotification?: (data: IncomingNotificationMessageData) => void;
}

// Common:

type StateModifier =
  | "isAuthenticated"
  | "isOpen"
  | "isAuthRoute"
  | "isAccountRoute"
  | "isSettingsRoute"
  | "isAuthRequestRoute"
  | "isDefaultRoute";

export interface WanderEmbeddedComponentOptions<T> {
  id?: string;
  className?: string | Record<StateModifier, string>;
  cssVars?: T | Record<StateModifier, T>;
}

// Modal (iframe):

export interface WanderEmbeddedIframeOptions
  extends WanderEmbeddedComponentOptions<WanderEmbeddedModalCSSVars> {
  routeLayout: Record<RouteType, RouteLayout>;
}

// Button:

export interface WanderEmbeddedButtonOptions
  extends WanderEmbeddedComponentOptions<WanderEmbeddedButtonCSSVars> {
  logo?: boolean | string;
  balance?: boolean | WanderEmbeddedBalanceOptions;
  notifications?: boolean | WanderEmbeddedNotificationsOptions;
  position: WanderEmbeddedButtonPosition;
}

export interface WanderEmbeddedBalanceOptions {
  balanceOf: "total" | string; // string would be a token id
  currency: "auto" | string; // "auto" would be the one the user selected on the wallet, string would be a token id or currency symbol (e.g. USD).
}

export type WanderEmbeddedButtonPosition =
  | "top-right"
  | "bottom-right"
  | "top-left"
  | "bottom-left";

// Styles:

export interface WanderEmbeddedModalCSSVars {
  // TODO: Similar to just using styles but styes might cause issues with the different states/transitions of the iframe. Also, we probably don't want to give such fine-grained control to developers. In that case, just provide the iframe yourself.
}

export interface WanderEmbeddedButtonCSSVars {
  // TODO: Similar to just using styles but styes might cause issues with the different states/transitions of the button. Also, we probably don't want to give such fine-grained control to developers. In that case, just create and manage the button yourself.
}
