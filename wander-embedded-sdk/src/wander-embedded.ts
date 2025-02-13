import { setupWalletSDK } from "wallet-api/wallet-sdk.es.js";
import { WanderButton } from "./components/button/wander-button.component";
import { WanderIframe } from "./components/iframe/wander-iframe.component";
import { merge } from "ts-deepmerge";
import {
  BalanceInfo,
  RouteConfig,
  WanderEmbeddedOptions
} from "./wander-embedded.types";
import {
  IncomingBalanceMessageData,
  IncomingResizeMessageData,
  UserDetails
} from "./utils/message/message.types";
import { isIncomingMessage } from "./utils/message/message.utils";

const NOOP = () => {};

export class WanderEmbedded {
  static DEFAULT_IFRAME_SRC = "http://localhost:5173/" as const;

  // Callbacks:
  private onAuth: (userDetails: UserDetails | null) => void = NOOP;
  private onOpen: () => void = NOOP;
  private onClose: () => void = NOOP;
  private onResize: (data: IncomingResizeMessageData) => void = NOOP;
  private onBalance: (data: IncomingBalanceMessageData) => void = NOOP;
  private onNotification: (notificationsCount: number) => void = NOOP;

  // Components:
  private buttonComponent: null | WanderButton = null;
  private iframeComponent: null | WanderIframe = null;

  // HTML elements:
  private buttonRef: null | HTMLButtonElement = null;
  private iframeRef: null | HTMLIFrameElement = null;

  // State:
  public isOpen = false;
  public userDetails: UserDetails | null = null; // TODO: Should we expose this?
  public routeConfig: RouteConfig | null = null;
  public balanceInfo: BalanceInfo | null = null;
  public notificationsCount: number = 0;

  /*

  TODO:

  - // TODO: Create defaultCssVars property to avoid having to use default values in "var" and get rid of these overrides:
  - // TODO: Animate/transition this. First close the old layout. Then open the new one.
  - Initialize CSS variables with options?
  - Add popup transition like Passkeys
  - Enable/disable close with click outside? Only when backdrop visible?

  - Pass "App wrapper (inside iframe):" to iframe.
  - Add option to configure the size-images based on route on the side-by-side view (or send them from the modal)
  - "popup" layout should probably not resize, only modal.
  - How to manage light/dark theme?
  - Add logic to increase/decrease pending notifications (e.g. when an auth request has been viewed).
  - Add black and white logo option? Consider overlaying the app logo to indicate "connected".
  - Add styling shortcuts (different defaults): sketch, smooth, rounded
  - Add function to change options later
  - On mobile, just take the whole screen. One desktop, leave space for button.
  - Add slight rotation towards/against the mouse (except when directly on top)?
  - TODO: Pass theme, balance config and max width/height to iframe:
  - Make sure this cannot be called twice, or that it first destroys the previous instance(s)
  - Use shadow DOM instead and add :hover, :focus and media queries.
  - Add customizable default size for each layout.
  - Add close button inside iframe and make sure the spinner shows straight away.
  - TODO: Add CSS var for transition duration.
  - Considering having different transitions.
  - Add effect when spending/signing
  - Fix embedded issue: If generation was too long ago and it expires, it just throws an error instead of generating a new one when needed.

  */

  constructor(options: WanderEmbeddedOptions = {}) {
    // Callbacks:
    this.onAuth = options.onAuth ?? NOOP;
    this.onOpen = options.onOpen ?? NOOP;
    this.onClose = options.onClose ?? NOOP;
    this.onResize = options.onResize ?? NOOP;
    this.onBalance = options.onBalance ?? NOOP;
    this.onNotification = options.onNotification ?? NOOP;

    const optionsWithDefaults = merge(options, {
      button: true
    });

    // Create or get references to iframe and, maybe, button:
    this.initializeComponents(optionsWithDefaults);

    if (!this.iframeRef) throw new Error("Error creating iframe");

    // TODO: Pass theme, balance config and max width/height to iframe:
    // this.iframeRef.contentWindow.postMessage(message, "*");

    // Once we have all the elements in place, start listening for wallet messages...
    this.handleMessage = this.handleMessage.bind(this);
    window.addEventListener("message", this.handleMessage);

    // ...and set `window.arweaveWallet`:
    setupWalletSDK(this.iframeRef.contentWindow as Window);

    // And also the button click handler, if needed:
    if (this.buttonRef) {
      this.handleButtonClick = this.handleButtonClick.bind(this);
      this.buttonRef.addEventListener("click", this.handleButtonClick);
    }
  }

  private initializeComponents(options: WanderEmbeddedOptions): void {
    const {
      src = WanderEmbedded.DEFAULT_IFRAME_SRC,
      iframe: iframeOptions,
      button: buttonOptions
    } = options;

    // TODO Use PARAM_ORIGIN_KEY and PARAM_API_KEY instead of hardcoded values:
    const srcWithParams = `${src}?origin=${location.origin}&api-key=123`;

    if (iframeOptions instanceof HTMLElement) {
      if (
        iframeOptions.src &&
        iframeOptions.src !== WanderEmbedded.DEFAULT_IFRAME_SRC
      ) {
        console.warn(
          `Replacing iframe.src ("${iframeOptions.src}") with ${WanderEmbedded.DEFAULT_IFRAME_SRC}`
        );
      }

      iframeOptions.src = srcWithParams;

      this.iframeRef = iframeOptions;
    } else {
      this.iframeComponent = new WanderIframe(srcWithParams, iframeOptions);

      const elements = this.iframeComponent.getElements();

      this.iframeRef = elements.iframe;

      document.body.appendChild(elements.backdrop);
      document.body.appendChild(elements.iframe);
    }

    if (typeof buttonOptions === "object" || buttonOptions === true) {
      this.buttonComponent = new WanderButton(
        buttonOptions === true ? {} : buttonOptions
      );

      this.buttonRef = this.buttonComponent.getElement();

      document.body.appendChild(this.buttonRef);
    }
  }

  private handleMessage(event: MessageEvent): void {
    const message = event.data;

    if (!isIncomingMessage(message)) return;

    console.log("MESSAGE", message);

    switch (message.type) {
      case "embedded_auth":
        const { userDetails } = message.data;
        this.userDetails = userDetails;

        if (userDetails) {
          this.buttonComponent?.setStatus("isAuthenticated");

          this.iframeComponent?.resize({
            routeType: "default",
            preferredLayoutType: "popup",
            height: 0
          });
        } else {
          this.buttonComponent?.unsetStatus("isAuthenticated");

          this.iframeComponent?.resize({
            routeType: "auth",
            preferredLayoutType: "modal",
            height: 0
          });
        }

        this.onAuth(message.data);
        break;

      case "embedded_close":
        if (this.isOpen) {
          this.isOpen = false;

          this.buttonComponent?.unsetStatus("isOpen");

          this.onClose();
        }
        break;

      case "embedded_resize":
        const routeConfig = message.data;

        this.iframeComponent?.resize(routeConfig);

        this.onResize(routeConfig);

        if (!this.isOpen) {
          this.isOpen = true;
          this.buttonComponent?.setStatus("isOpen");
          this.iframeComponent?.show();
          this.onOpen();
        }

        break;

      case "embedded_balance":
        const balanceInfo = message.data;
        this.balanceInfo = balanceInfo;

        this.buttonComponent?.setBalance(balanceInfo);

        this.onBalance(balanceInfo);
        break;

      case "embedded_notification":
        const { notificationsCount } = message.data;
        this.notificationsCount = notificationsCount;

        this.buttonComponent?.setNotifications(notificationsCount);

        this.onNotification(notificationsCount);
        break;
    }
  }

  private handleButtonClick() {
    if (this.isOpen) this.close();
    else this.open();
  }

  public open(): void {
    if (!this.iframeComponent && !this.buttonComponent) {
      throw new Error(
        "Wander Embedded's iframe and button has been created manually"
      );
    }

    if (this.iframeComponent && !this.isOpen) {
      this.isOpen = true;
      this.buttonComponent?.setStatus("isOpen");
      this.iframeComponent.show();
    }
  }

  public close(): void {
    if (!this.iframeComponent && !this.buttonComponent) {
      throw new Error(
        "Wander Embedded's iframe and button has been created manually"
      );
    }

    if (this.iframeComponent && this.isOpen) {
      this.isOpen = false;
      this.buttonComponent?.unsetStatus("isOpen");
      this.iframeComponent.hide();
    }
  }

  public destroy(): void {
    window.removeEventListener("message", this.handleMessage);
    window.removeEventListener("click", this.handleButtonClick);

    // Only remove the elements we crated:
    if (this.iframeComponent) this.iframeRef?.remove();
    if (this.buttonComponent) this.buttonRef?.remove();
  }

  get isAuthenticated() {
    return !!this.userDetails;
  }

  get width() {
    return this.routeConfig?.width;
  }

  get height() {
    return this.routeConfig?.height;
  }
}
