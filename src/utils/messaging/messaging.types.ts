import type { IBridgeMessage, ProtocolMap } from "@arconnect/webext-bridge";

// sendMessage():

export type MessageID = keyof ProtocolMap;

export type MessageDestination =
  | "background"
  | `popup@${number}`
  | `content-script@${number}`;

export interface MessageData<K extends MessageID> {
  // TODO: Check if removing this broke anything:
  // tabId?: number;
  destination: MessageDestination;
  messageId: K;
  data: ProtocolMap[K];
}

// onMessage():

export type OnMessageCallback<K extends MessageID> = (
  message: Omit<IBridgeMessage<any>, "data"> & { data: ProtocolMap[K] }
) => void;
