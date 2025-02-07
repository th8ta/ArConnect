import { setupWalletSDK } from "wallet-api/wallet-sdk.es.js";
import { WanderButton } from "./components/button/wander-button.component";
import { WanderIframe } from "./components/iframe/wander-iframe.component";
import {
  IncomingMessage,
  IncomingMessageId,
  IncomingResizeMessageData
} from "./types/messages";
import {
  WanderEmbeddedComponents,
  WanderEmbeddedOptions
} from "./wander-embedded.types";

export class WanderEmbedded {
  static DEFAULT_IFRAME_SRC = "http://localhost:5174/" as const;

  private components: WanderEmbeddedComponents;
  private options: WanderEmbeddedOptions;

  constructor(options?: WanderEmbeddedOptions) {
    this.options = options || {};
    this.components = this.initializeComponents(options);
  }

  private initializeComponents(
    options?: WanderEmbeddedOptions
  ): WanderEmbeddedComponents {
    const iframe = new WanderIframe({
      src: WanderEmbedded.DEFAULT_IFRAME_SRC,
      onMessage: (message) => this.handleIframeMessage(message),
      iframeRef: options?.iframeRef,
      iframeStyles: options?.iframeStyles
    });

    if (!options?.iframeRef) {
      document.body.appendChild(iframe.getElement());
    }
    this.initializeWalletShim(iframe.getElement());

    if (options?.buttonStyles !== "none") {
      const container = this.createContainer();

      const button = new WanderButton({
        buttonStyles: options?.buttonStyles,
        onClick: () => this.open(),
        logo: options?.logo,
        balance: options?.balance
      });
      container.appendChild(button.getElement());
      document.body.appendChild(container);

      return { container, button, iframe };
    }

    return { iframe };
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement("div");
    container.id = "wander-embedded-container";
    return container;
  }

  private handleIframeMessage(
    message: IncomingMessage<IncomingMessageId>
  ): void {
    switch (message.type) {
      case "embedded_close":
        this.components.iframe.hide();
        this.options.onClose?.();
        break;
      case "embedded_resize":
        this.components.iframe.resize(
          message.data as IncomingResizeMessageData
        );
        this.components.iframe.show();

        this.options.onOpen?.();
        this.options.onResize?.(message.data as IncomingResizeMessageData);
        break;
    }
  }

  private initializeWalletShim(iframe: HTMLIFrameElement): void {
    if (typeof window !== "undefined") {
      setupWalletSDK(iframe.contentWindow as Window);
    }
  }

  public open(): void {
    this.components.iframe.show();
  }

  public close(): void {
    this.components.iframe.hide();
  }

  public destroy(): void {
    this.components.iframe.destroy();
    this.components?.container?.remove();
  }
}
