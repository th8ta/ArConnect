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
  private onRequest: (pendingRequests: number) => void = NOOP;

  // Components:
  private buttonComponent: null | WanderButton = null;
  private iframeComponent: null | WanderIframe = null;

  // HTML elements:
  private buttonHostRef: null | HTMLDivElement = null;
  private buttonRef: null | HTMLButtonElement = null;
  private backdropRef: null | HTMLDivElement = null;
  private iframeRef: null | HTMLIFrameElement = null;

  // State:
  private shouldOpenAutomatically = true;

  public isOpen = false;
  public userDetails: UserDetails | null = null; // TODO: Should we expose this?
  public routeConfig: RouteConfig | null = null;
  public balanceInfo: BalanceInfo | null = null;
  public pendingRequests: number = 0;

  constructor(options: WanderEmbeddedOptions = {}) {
    // Callbacks:
    this.onAuth = options.onAuth ?? NOOP;
    this.onOpen = options.onOpen ?? NOOP;
    this.onClose = options.onClose ?? NOOP;
    this.onResize = options.onResize ?? NOOP;
    this.onBalance = options.onBalance ?? NOOP;
    this.onRequest = options.onRequest ?? NOOP;

    // TODO: Merge options properly:

    const optionsWithDefaults = merge(options, {
      iframe: {
        clickOutsideBehavior: "auto"
      }
    } satisfies WanderEmbeddedOptions);

    // Create or get references to iframe and, maybe, button:
    this.initializeComponents(optionsWithDefaults);

    if (!this.iframeRef) throw new Error("Error creating iframe");

    // TODO: Pass theme, balance config and max width/height to iframe context:
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

      this.backdropRef = elements.backdrop;
      this.iframeRef = elements.iframe;

      document.body.appendChild(elements.backdrop);
      document.body.appendChild(elements.iframe);
    }

    if (typeof buttonOptions === "object" || buttonOptions === true) {
      this.buttonComponent = new WanderButton(
        buttonOptions === true ? {} : buttonOptions
      );

      const { host, button } = this.buttonComponent.getElements();

      this.buttonHostRef = host;
      this.buttonRef = button;

      document.body.appendChild(host);
    }

    const clickOutsideBehavior =
      iframeOptions instanceof HTMLElement
        ? false
        : iframeOptions?.clickOutsideBehavior;

    if (clickOutsideBehavior) {
      document.body.addEventListener("click", ({ target }) => {
        // Do not check if `target` is the backdrop <div> as it might have pointer-events: none.

        const shouldClose =
          clickOutsideBehavior === true ||
          (this.iframeRef !== target &&
            this.buttonHostRef !== target &&
            !this.iframeRef?.contains(target as HTMLElement) &&
            !this.buttonHostRef?.contains(target as HTMLElement) &&
            this.backdropRef &&
            (getComputedStyle(this.backdropRef).backdropFilter !== "none" ||
              // TODO: This is not a good way to check if it's totally transparent:
              getComputedStyle(this.backdropRef).background !== "transparent"));

        if (shouldClose) this.close();
      });
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

        if (
          routeConfig.routeType === "auth-request" &&
          this.shouldOpenAutomatically &&
          !this.isOpen
        ) {
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

      case "embedded_request":
        const { pendingRequests } = message.data;
        this.pendingRequests = pendingRequests;

        this.buttonComponent?.setNotifications(pendingRequests);

        this.onRequest(pendingRequests);
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

      // Manually closing the popup while there are pending requests will prevent it from automatically opening again:
      if (this.pendingRequests > 0) {
        this.shouldOpenAutomatically = false;
      }
    }
  }

  public destroy(): void {
    window.removeEventListener("message", this.handleMessage);
    window.removeEventListener("click", this.handleButtonClick);

    // Remove the elements we crated:

    if (this.iframeComponent) {
      this.backdropRef?.remove();
      this.iframeRef?.remove();
    }

    if (this.buttonComponent) {
      this.buttonHostRef?.remove();
      this.buttonRef?.remove();
    }
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
