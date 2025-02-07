// Messages sent from iframe to SDK
export type IncomingMessageId =
  | "embedded_auth"
  | "embedded_close"
  | "embedded_resize"
  | "embedded_balance"
  | "embedded_notification";

// embedded_auth:

export interface UserDetails {
  // TODO: Add props
}

export interface IncomingAuthMessageData {
  userDetails: null | UserDetails;
}

// embedded_resize

export type RouteType =
  | "auth"
  | "account"
  | "settings"
  | "auth-request"
  | "default";

export type RouteLayout = "modal" | "popup";

export interface IncomingResizeMessageData {
  routeType: RouteType;
  preferredLayout: RouteLayout;
  width?: number;
  height: number;
}

// embedded_balance:

export interface IncomingBalanceMessageData {
  aggregatedBalance: number;
  currency: "USD" | "EUR"; // TODO: Replace with a type that includes all options in the settings?
}

// embedded_notification

export interface IncomingNotificationMessageData {
  notificationsCount: number;
}

export interface IncomingMessageMap {
  embedded_auth: IncomingAuthMessageData;
  embedded_close: void;
  embedded_resize: IncomingResizeMessageData;
  embedded_balance: IncomingBalanceMessageData;
  embedded_notification: IncomingNotificationMessageData;
}
export interface IncomingMessage<K extends IncomingMessageId> {
  id: string;
  type: K;
  data: IncomingMessageMap[K];
}

// Messages sent from SDK to iframe examples
export type OutgoingMessage = {
  type: "THEME_UPDATE";
  payload: string;
};

// Type guard for incoming messages
export function isIncomingMessage<K extends IncomingMessageId>(
  message: any
): message is IncomingMessage<K> {
  if (!message || typeof message !== "object" || !message.type || !message.id)
    return false;

  switch (message.type) {
    case "embedded_auth":
      return (
        message.data &&
        typeof message.data === "object" &&
        typeof message.data.userDetails !== "undefined"
      );
    case "embedded_balance":
      return (
        message.data &&
        typeof message.data === "object" &&
        typeof message.data.aggregatedBalance !== "undefined" &&
        typeof message.data.currency !== "undefined"
      );
    case "embedded_close":
      return true;
    case "embedded_resize":
      return (
        message.data &&
        typeof message.data === "object" &&
        typeof message.data.routeType !== "undefined" &&
        typeof message.data.preferredLayout !== "undefined" &&
        typeof message.data.width !== "undefined" &&
        typeof message.data.height !== "undefined"
      );
    default:
      return false;
  }
}

// Type guard for outgoing messages
export function isOutgoingMessage(message: any): message is OutgoingMessage {
  if (!message || typeof message !== "object" || !message.type) return false;

  switch (message.type) {
    case "THEME_UPDATE":
      return (
        message.payload &&
        typeof message.payload === "object" &&
        typeof message.payload.primary === "string" &&
        typeof message.payload.secondary === "string"
      );
    case "WALLET_CONNECTED":
      return (
        message.payload &&
        typeof message.payload === "object" &&
        typeof message.payload.address === "string"
      );
    case "WALLET_DISCONNECTED":
      return true;
    default:
      return false;
  }
}
