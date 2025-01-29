import { IncomingMessage, IncomingMessageId } from "./messages";

export interface ArConnectIframeStyles extends Partial<CSSStyleDeclaration> {}

export interface ArConnectIframeConfig {
  src: string;
  iframeStyles?: ArConnectIframeStyles;
  onMessage: (message: IncomingMessage<IncomingMessageId>) => void;
  iframeRef?: HTMLIFrameElement;
}
