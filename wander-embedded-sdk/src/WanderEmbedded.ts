import { WanderEmbeddedOptions } from "./types";
import { WanderButton } from "./components/WanderButton";
import { WanderIframe } from "./components/WanderIframe";
import { IncomingMessage } from "./types/messages";
import { UIComponents } from "./types/embedded";

export class WanderEmbedded {
  private components: UIComponents;
  private readonly DEFAULT_IFRAME_SRC =
    "https://arweave.net/PI6EC3mZA-fVlb5Jq63-kihE1Hgt6eepsRAcocELIKA";
  private options: WanderEmbeddedOptions;

  constructor(options?: WanderEmbeddedOptions) {
    this.options = options || {};
    this.components = this.initializeComponents(options);
    this.initializeWalletShim();
  }

  private initializeComponents(options?: WanderEmbeddedOptions): UIComponents {
    const container = this.createContainer();

    const button = new WanderButton({
      buttonStyles: options?.buttonStyles,
      onClick: () => this.open(),
      buttonRef: options?.buttonRef
    });

    const iframe = new WanderIframe({
      src: this.DEFAULT_IFRAME_SRC,
      onMessage: (message) => this.handleIframeMessage(message),
      iframeRef: options?.iframeRef,
      iframeStyles: options?.iframeStyles
    });

    // Only append elements to DOM if they weren't provided as refs
    if (!options?.buttonRef) {
      container.appendChild(button.getElement());
      document.body.appendChild(container);
    }

    if (!options?.iframeRef) {
      document.body.appendChild(iframe.getElement());
    }

    return { container, button, iframe };
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement("div");
    container.id = "wander-embedded-container";
    return container;
  }

  private handleIframeMessage(message: IncomingMessage): void {
    switch (message.type) {
      case "embedded_open":
        this.components.iframe.show();
        this.options.onOpen?.();
        break;
      case "embedded_close":
        this.components.iframe.hide();
        this.options.onClose?.();
        break;
      case "embedded_resize":
        this.components.iframe.resize(message.payload);
        this.options.onResize?.(message.payload);
        break;
    }
  }

  private initializeWalletShim(): void {
    if (typeof window !== "undefined") {
      if (!window.arweaveWallet) {
        window.arweaveWallet = {};
      }
      window.arweaveWallet.someRandomMethod = () => {
        console.log("Hello from arweaveWallet!");
      };
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
    // Only remove container if we created the button
    if (!this.options.buttonRef) {
      this.components.container.remove();
    }
  }
}
