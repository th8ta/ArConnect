import { CSSProperties } from "react";
import {
  BalanceInfo,
  StateModifier,
  WanderEmbeddedButtonOptions
} from "../../wander-embedded.types";
import { createWanderSVG } from "../logo/wander-logo.component";
// import { asCSSVars } from "../../utils/styles/styles.utils";

export class WanderButton {
  static DEFAULT_BUTTON_ID = "wanderEmbeddedButton" as const;

  // static DEFAULT_CLASSNAMES: Record<StateModifier, string> = {};

  private button: HTMLButtonElement;
  private logo: HTMLImageElement | SVGElement;
  private label: HTMLSpanElement;
  private balance: HTMLSpanElement;
  private notifications: HTMLSpanElement;

  private options: WanderEmbeddedButtonOptions;

  // private classNames: Partial<Record<StateModifier, string>>;
  // private cssVars?: Partial<Record<StateModifier, WanderEmbeddedButtonCSSVars>>;

  // TODO: How to manage light/dark theme?

  // TODO: Add a variant that says "Sign" if there are sign requests and make the button change color/blink

  // TODO: Add black and white option?

  // TODO: Add styling shortcuts (different defaults): sketch, smooth, rounded

  constructor(options: WanderEmbeddedButtonOptions = {}) {
    console.log("WanderButton constructor");

    this.options = options;

    // TODO: Add function to change options later...

    /*
    this.classNames = typeof options.className === "string"
      ? { default: options.className } satisfies Partial<Record<StateModifier, string>>
      : (options.className || {});
    this.cssVars = options.cssVars || {};
    */

    const elements = WanderButton.initializeButton(options);

    this.button = elements.button;
    this.logo = elements.logo;
    this.label = elements.label;
    this.balance = elements.balance;
    this.notifications = elements.notifications;
  }

  // TODO: Button needs 3 states/labels:
  // noAuth => Sign in/Close
  // noConnect => No specific label cause the dApp has to do it
  // connected => Open/Close
  // (and hover for each of them?)

  static initializeButton(options: WanderEmbeddedButtonOptions) {
    // TODO: Always add all elements (logo and balance) but show/hide them

    const button = document.createElement("button");

    button.id = WanderButton.DEFAULT_BUTTON_ID;

    const logo =
      typeof options.logo === "string"
        ? document.createElement("img")
        : createWanderSVG({
            width: "30px",
            height: "30px"
          });

    if (typeof options.logo === "string" && logo instanceof Image) {
      logo.src = options.logo;
      logo.width = 30;
      logo.height = 30;
    }

    const label = document.createElement("span");

    label.textContent = "Sign in";

    const balance = document.createElement("span");

    balance.textContent = new Intl.NumberFormat().format(0);

    const notifications = document.createElement("span");

    notifications.textContent = "2";

    const buttonStyle: CSSProperties = {
      position: "fixed",
      bottom: "40px",
      right: "40px",
      display: "flex",
      alignItems: "center",
      padding: "16px",
      gap: "8px",
      borderRadius: "50px",
      border: "1px solid rgba(51, 51, 51, 1)",
      outline: "none",
      backgroundColor: "rgba(25, 25, 25, 1)",
      boxShadow: "0px 4px 40px 0px rgba(0, 0, 0, 0.25)",
      fontSize: "24px",
      // lineHeight: "28.8px",
      color: "white",
      zIndex: "9999"
    };

    // TODO: Use shadow DOM?
    Object.assign(button.style, buttonStyle);

    const logoStyle: CSSProperties = {};

    Object.assign(logo.style, logoStyle);

    const labelStyle: CSSProperties = {};

    Object.assign(label.style, labelStyle);

    const balanceStyle: CSSProperties = {};

    Object.assign(balance.style, balanceStyle);

    const notificationsStyle: CSSProperties = {
      position: "absolute",
      right: "-4px",
      bottom: "-4px",
      zIndex: -1,
      padding: "2px 4px",
      background: "red",
      borderRadius: "16px",
      fontSize: "12px",
      fontWeight: "bold",
      minHeight: "22px",
      minWidth: "22px",
      textAlign: "center"
    };

    Object.assign(notifications.style, notificationsStyle);

    button.appendChild(logo);
    button.appendChild(label);
    button.appendChild(balance);
    button.appendChild(notifications);

    return {
      button,
      logo,
      label,
      balance,
      notifications
    };
  }

  getElement(): HTMLButtonElement {
    return this.button;
  }

  addModifier(modifier: StateModifier) {}

  removeModifier(modifier: StateModifier) {}

  setBalance(balanceInfo: BalanceInfo) {
    // TODO: Show label if no balance?
    const formattedBalance = new Intl.NumberFormat(undefined, {
      currency: balanceInfo.currency
    }).format(balanceInfo.aggregatedBalance);

    this.balance.textContent = `${formattedBalance}`;
  }

  setNotifications(notificationsCount: number) {
    // TODO: Show / hide if there aren't any:
    this.notifications.textContent = `${notificationsCount}`;
  }
}
