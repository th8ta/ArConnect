import { setupWalletSDK } from "wallet-api/wallet-sdk.es.js";
import { WanderButton } from "./components/button/wander-button.component";
import { WanderIframe } from "./components/iframe/wander-iframe.component";
import { merge } from "ts-deepmerge";
import {
  BalanceInfo,
  RouteConfig,
  RouteType,
  StateModifier,
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

  static ROUTE_MODIFIERS: Record<string, "" | StateModifier> = {
    default: "",
    auth: "isAuthRoute",
    account: "isAccountRoute",
    settings: "isSettingsRoute",
    "auth-request": "isAuthRequestRoute"
  };

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
  public userDetails: UserDetails | null = null;
  public routeConfig: RouteConfig | null = null;
  public balanceInfo: BalanceInfo | null = null;
  public notificationsCount: number = 0;

  constructor(options: WanderEmbeddedOptions = {}) {
    // console.log("WanderEmbedded constructor");

    // TODO: Make sure this cannot be called twice, or that it first destroys the previous instance(s)

    // TODO: Fix embedded issue: If generation was too long ago and it expires, it just throws an error instead of
    // generating a new one when needed.

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

    // TODO: Pass theme and balance config to iframe:
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
          this.iframeComponent?.addModifier("isAuthenticated");
          this.buttonComponent?.addModifier("isAuthenticated");
        } else {
          this.iframeComponent?.removeModifier("isAuthenticated");
          this.buttonComponent?.removeModifier("isAuthenticated");
        }

        this.onAuth(message.data);
        break;

      case "embedded_close":
        if (this.isOpen) {
          this.isOpen = false;

          this.iframeComponent?.removeModifier("isOpen");
          this.buttonComponent?.removeModifier("isOpen");

          this.onClose();
        }
        break;

      case "embedded_resize":
        const routeConfig = message.data;
        const routeModifier =
          WanderEmbedded.ROUTE_MODIFIERS[routeConfig.routeType];

        // TODO: Also account for routeConfig.preferredType & routeConfig.routeType

        if (routeModifier) {
          this.iframeComponent?.addModifier(routeModifier);
          this.buttonComponent?.addModifier(routeModifier);
        }

        this.iframeComponent?.resize(routeConfig);

        this.onResize(routeConfig);

        if (!this.isOpen) {
          this.isOpen = true;
          // this.iframeComponent.show();
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

    // this.iframeComponent.update();
    // this.buttonComponent.update();
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
