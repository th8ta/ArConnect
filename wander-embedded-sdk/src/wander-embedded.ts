import { setupWalletSDK } from "wallet-api/wallet-sdk.es.js";
import { WanderButton } from "./components/button/wander-button.component";
import { WanderIframe } from "./components/iframe/wander-iframe.component";
import {
  IncomingMessage,
  IncomingMessageId,
  IncomingResizeMessageData,
  isIncomingMessage
} from "./types/messages";
import { WanderEmbeddedOptions } from "./wander-embedded.types";

export class WanderEmbedded {
  static DEFAULT_IFRAME_SRC = "http://localhost:5174/" as const;

  static DEFAULT_OPTIONS = {} as const satisfies WanderEmbeddedOptions;

  // Components:
  private buttonComponent: null | WanderButton = null;
  private iframeComponent: null | WanderIframe = null;

  // HTML elements:
  private buttonRef: null | HTMLButtonElement = null;
  private iframeRef: null | HTMLIFrameElement = null;

  // TODO: Implement logic to update them:
  public isOpen = false;
  public isAuthenticated = false;
  public width: number | null = null;
  public height: number | null = null;
  public balance: any | null = null;
  public notifications: number = 0;

  constructor(options: WanderEmbeddedOptions = {}) {
    // TODO: Pass options or default (add merge util function and add static DEFAULT_OPTIONS):
    const completeOptions = merge(options, WanderEmbedded.DEFAULT_OPTIONS);

    // Create or get references to iframe and, maybe, button:
    this.initializeComponents(completeOptions);

    if (!this.iframeRef) throw new Error("Error creating iframe");

    // Once we have all the elements in place, start listening for wallet messages and set `window.arweaveWallet`:
    this.handleMessage = this.handleMessage.bind(this);
    window.addEventListener("message", this.handleMessage);
    setupWalletSDK(this.iframeRef.contentWindow as Window);
  }

  private initializeComponents(options?: WanderEmbeddedOptions): void {
    if (options?.iframe instanceof HTMLElement) {
      this.iframeRef = options.iframe;
    } else {
      // TODO: Pass options to `WanderIframe`:
      this.iframeComponent = new WanderIframe({
        // TODO: There should be an option to pass a custom URL and/or to set the API key:
        src: WanderEmbedded.DEFAULT_IFRAME_SRC,
        iframeStyles: options?.iframeStyles
      });

      this.iframeRef = this.iframeComponent.getElement();

      document.body.appendChild(this.iframeRef);
    }

    if (typeof options?.button === "object" || options?.button === true) {
      this.buttonComponent = new WanderButton({
        buttonStyles: options?.buttonStyles,
        onClick: () => this.open(),
        logo: options?.logo,
        balance: options?.balance
      });

      this.buttonRef = this.buttonComponent.getElement();

      document.body.appendChild(this.buttonRef);
    }
  }

  /*
    const messageHandler: () => void = (event: MessageEvent) => {

      if (isIncomingMessage(message)) {
        this.config.onMessage(message);
      }
    }
   */

  private handleMessage(event: MessageEvent): void {
    const message = event.data;

    if (!isIncomingMessage(message)) return;

    switch (message.type) {
      case "embedded_auth":
        this.isAuthenticated = true;
        this.userDetails = message.data;
        this.options.onAuth(message.data);
        break;

      case "embedded_close":
        if (this.isOpen) {
          this.isOpen = false;
          this.iframeComponent.hide();
          this.options.onClose();
        }
        break;

      case "embedded_resize":
        this.width = message.data.width;
        this.height = message.data.height;

        this.iframeComponent.resize(message.data as IncomingResizeMessageData);

        this.options.onResize?.(message.data as IncomingResizeMessageData);

        if (!this.isOpen) {
          this.isOpen = true;
          this.iframeComponent.show();
          this.options.onOpen();
        }

        break;

      case "embedded_balance":
        this.balance = message.data;
        this.options.onBalance(message.data);
        break;

      case "embedded_notification":
        this.notifications = message.data.notificationsCount;
        this.options.onNotification(message.data);
        break;
    }

    this.iframeComponent.updateStateModifiers();
    this.buttonComponent.updateStateModifiers();
  }

  public open(): void {
    if (!this.iframeComponent && !this.buttonComponent) {
      throw new Error(
        "Wander Embedded's iframe and button has been created manually"
      );
    }

    if (this.iframeComponent && !this.isOpen) {
      this.isOpen = true;
      this.iframeComponent.show();
    }

    // TODO: Update iframe and button styles (StateModifier)
  }

  public close(): void {
    if (!this.iframeComponent && !this.buttonComponent) {
      throw new Error(
        "Wander Embedded's iframe and button has been created manually"
      );
    }

    if (this.iframeComponent && this.isOpen) {
      this.isOpen = false;
      this.iframeComponent.hide();
    }

    // TODO: Update iframe and button styles (StateModifier)
  }

  public destroy(): void {
    window.removeEventListener("message", this.handleMessage);

    // Only remove the elements we crated:
    if (this.iframeComponent) this.iframeRef?.remove();
    if (this.buttonComponent) this.buttonRef?.remove();
  }
}
