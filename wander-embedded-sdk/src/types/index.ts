import { IncomingResizeMessageData } from "./messages";

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

export type Theme = {
  primary: string;
  secondary: string;
};
