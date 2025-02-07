import { IncomingResizeMessageData } from "./messages";

export interface ArConnectEmbeddedOptions {
  logo?: string;
  balance?: string;
  iframeRef?: HTMLIFrameElement;
  buttonStyles?: Partial<CSSStyleDeclaration> | "none";
  iframeStyles?: Partial<CSSStyleDeclaration>;
  onOpen?: () => void;
  onClose?: () => void;
  onResize?: (data: IncomingResizeMessageData) => void;
}
