export interface WanderEmbeddedOptions {
  logo?: string;
  balance?: string;
  iframeRef?: HTMLIFrameElement;
  buttonStyles?: CSSStyleDeclaration;
  iframeStyles?: CSSStyleDeclaration;
  onOpen?: () => void;
  onClose?: () => void;
  onResize?: (dimensions: { width: number; height: number }) => void;
}

export type Theme = {
  primary: string;
  secondary: string;
};
