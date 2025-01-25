import { setupWalletSDK } from "wallet-api/wallet-sdk.es.js";
import { WanderEmbeddedOptions } from "./types";
import { WanderButton } from "./components/WanderButton";
import { WanderIframe } from "./components/WanderIframe";
import {
  IncomingMessage,
  IncomingMessageId,
  IncomingResizeMessageData
} from "./types/messages";
import { UIComponents } from "./types/embedded";

export class WanderEmbedded {
  private components: UIComponents;
  private readonly DEFAULT_IFRAME_SRC =
    "https://arweave.net/PI6EC3mZA-fVlb5Jq63-kihE1Hgt6eepsRAcocELIKA";
  private options: WanderEmbeddedOptions;

  constructor(options?: WanderEmbeddedOptions) {
    this.options = options || {};
    this.components = this.initializeComponents(options);
  }

  private initializeComponents(options?: WanderEmbeddedOptions): UIComponents {
    const container = this.createContainer();

    const button = new WanderButton({
      buttonStyles: options?.buttonStyles,
      onClick: () => this.open(),
      logo: options?.logo,
      balance: options?.balance
    });

    const iframe = new WanderIframe({
      src: this.DEFAULT_IFRAME_SRC,
      onMessage: (message) => this.handleIframeMessage(message),
      iframeRef: options?.iframeRef,
      iframeStyles: options?.iframeStyles
    });

    if (!options?.iframeRef) {
      document.body.appendChild(iframe.getElement());
    }

    this.initializeWalletShim(iframe.getElement());

    return { container, button, iframe };
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
    this.components.container.remove();
  }
}
