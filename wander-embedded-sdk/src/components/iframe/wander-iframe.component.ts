import {
  IncomingResizeMessageData,
  OutgoingMessage,
  isIncomingMessage
} from "../../types/messages";
import { WanderIframeConfig, WanderIframeStyles } from "./wander-iframe.types";

export class WanderIframe {
  private iframe: HTMLIFrameElement;
  private config: WanderIframeConfig;

  constructor(config: WanderIframeConfig) {
    this.config = config;
    this.iframe = this.initializeIframe();
  }

  public getElement(): HTMLIFrameElement {
    return this.iframe;
  }

  public show(): void {
    this.iframe.style.display = "block";
  }

  public hide(): void {
    this.iframe.style.display = "none";
  }

  public resize(data: IncomingResizeMessageData): void {
    if (data.width !== undefined)
      this.iframe.style.setProperty("--iframe-width", `${data.width}px`);

    this.iframe.style.setProperty("--iframe-height", `${data.height}px`);
  }

  public sendMessage(message: OutgoingMessage): void {
    if (this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage(message, "*");
    }
  }

  private initializeIframe(): HTMLIFrameElement {
    if (this.config.iframeRef) {
      this.iframe = this.config.iframeRef;
      if (this.iframe.src !== this.config.src) {
        this.iframe.src = this.config.src;
      }
    } else {
      this.iframe = document.createElement("iframe");
      this.iframe.src = this.config.src;
      this.iframe.id = "wander-embedded-iframe";
    }

    const defaultStyles: WanderIframeStyles = {
      position: "fixed",
      bottom: "120px",
      right: "20px",
      width: "var(--iframe-width, 400px)",
      height: "var(--iframe-height, 600px)",
      minWidth: "400px",
      maxWidth: "calc(100dvw - 64px)",
      maxHeight: "calc(100dvh - 64px)",
      display: "none",
      border: "1px solid #ccc",
      borderRadius: "10px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      zIndex: "9998"
    };

    if (!this.config.iframeRef) {
      Object.assign(this.iframe.style, defaultStyles);
    }

    // Always apply custom styles if provided
    if (this.config.iframeStyles) {
      const styles = { ...defaultStyles, ...this.config.iframeStyles };
      Object.assign(this.iframe.style, styles);
    }

    return this.iframe;
  }
}
