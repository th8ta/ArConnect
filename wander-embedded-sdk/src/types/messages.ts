// Messages sent from iframe to SDK
export type IncomingMessage =
  | { type: "embedded_open" }
  | { type: "embedded_close" }
  | { type: "embedded_resize"; payload: { width: number; height: number } };

// Messages sent from SDK to iframe examples
export type OutgoingMessage =
  | { type: "THEME_UPDATE"; payload: { primary: string; secondary: string } }
  | { type: "WALLET_CONNECTED"; payload: { address: string } }
  | { type: "WALLET_DISCONNECTED" };

// Type guard for incoming messages
export function isIncomingMessage(message: any): message is IncomingMessage {
  if (!message || typeof message !== "object" || !message.type) return false;

  switch (message.type) {
    case "embedded_open":
    case "embedded_close":
      return true;
    case "embedded_resize":
      return (
        message.payload &&
        typeof message.payload === "object" &&
        typeof message.payload.width === "number" &&
        typeof message.payload.height === "number"
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
