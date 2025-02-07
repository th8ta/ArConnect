import { IncomingResizeMessageData } from "wallet-api/wander-embedded-sdk/src/types/messages";
import { WanderButton } from "./components/button/wander-button.component";
import { WanderIframe } from "./components/iframe/wander-iframe.component";

export interface WanderEmbeddedOptions {
  logo?: string;
  balance?: string;
  iframeRef?: HTMLIFrameElement;
  buttonStyles?: Partial<CSSStyleDeclaration> | "none";
  iframeStyles?: Partial<CSSStyleDeclaration>;

  onOpen?: () => void;
  onClose?: () => void;
  onResize?: (data: IncomingResizeMessageData) => void;
}
export interface WanderEmbeddedComponents {
  container?: HTMLDivElement;
  button?: WanderButton;
  iframe: WanderIframe;
}
