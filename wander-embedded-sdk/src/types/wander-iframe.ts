import { IncomingMessage } from "./messages";

export interface WanderIframeStyles extends Partial<CSSStyleDeclaration> {}

export interface WanderIframeConfig {
  src: string;
  iframeStyles?: WanderIframeStyles;
  onMessage: (message: IncomingMessage) => void;
  iframeRef?: HTMLIFrameElement;
}
