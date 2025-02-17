import {
  BalanceInfo,
  WanderEmbeddedButtonCSSVars,
  WanderEmbeddedButtonOptions,
  WanderEmbeddedButtonStatus
} from "../../wander-embedded.types";
import { wanderButtonTemplateContent } from "./wander-button.template";
import { addCSSVariables } from "../../utils/styles/styles.utils";
import { merge } from "ts-deepmerge";

export class WanderButton {
  static DEFAULT_BUTTON_ID = "wanderEmbeddedButton" as const;

  static DEFAULT_CSS_VARS: WanderEmbeddedButtonCSSVars = {
    // Button (button):
    gapX: 16,
    gapY: 16,
    gapInside: 8,
    minWidth: 0,
    minHeight: 0,
    zIndex: "9999",
    padding: "12px 20px 12px 16px",
    font: "24px sans-serif",

    // Button (button, affected by :hover & :focus):
    background: "black",
    color: "white",
    borderWidth: 0,
    borderColor: "black",
    borderRadius: 128,
    boxShadow: "0px 4px 40px 0px rgba(0, 0, 0, 0.25)",

    // Logo (img / svg):
    logoBackground: "",
    logoBorderWidth: "",
    logoBorderColor: "",
    logoBorderRadius: "",

    // Labels (span):

    // Balance (span):

    // Notifications (span):
    notificationsBackground: "",
    notificationsBorderWidth: "",
    notificationsBorderColor: "",
    notificationsBorderRadius: "",
    notificationsBoxShadow: "",
    notificationsPadding: ""
  };

  // Elements:
  private host: HTMLDivElement;
  private button: HTMLButtonElement;
  private wanderLogo: SVGElement;
  private dappLogo: HTMLImageElement | SVGElement;
  private label: HTMLSpanElement;
  private balance: HTMLSpanElement;
  private notifications: HTMLSpanElement;

  // Options:
  private options: WanderEmbeddedButtonOptions;

  // State:
  private status: Partial<Record<WanderEmbeddedButtonStatus, boolean>> = {};

  constructor(options: WanderEmbeddedButtonOptions = {}) {
    this.options = options;

    const elements = WanderButton.initializeButton(options);

    this.host = elements.host;
    this.button = elements.button;
    this.wanderLogo = elements.wanderLogo;
    this.dappLogo = elements.dappLogo;
    this.label = elements.label;
    this.balance = elements.balance;
    this.notifications = elements.notifications;
  }

  // TODO: Button needs 3 states/labels:
  // noAuth => Sign in
  // noConnect => Open (show "connected" / "not connected" icon)? The dApp has to connect by itself.
  // connected => Open
  // pending auth requests => Review requests
  // (and hover for each of them?)

  static initializeButton(options: WanderEmbeddedButtonOptions) {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    const template = document.createElement("template");

    template.innerHTML = wanderButtonTemplateContent(options.customStyles);
    shadow.appendChild(template.content);

    const button = shadow.querySelector(".button") as HTMLButtonElement;
    const wanderLogo = shadow.querySelector(".wanderLogo") as SVGElement;
    const dappLogo = shadow.querySelector(".dappLogo") as
      | HTMLImageElement
      | SVGElement;
    const label = shadow.querySelector(".label") as HTMLSpanElement;
    const balance = shadow.querySelector(".balance") as HTMLSpanElement;
    const notifications = shadow.querySelector(
      ".notifications"
    ) as HTMLSpanElement;

    if (
      !button ||
      !wanderLogo ||
      !dappLogo ||
      !label ||
      !balance ||
      !notifications
    )
      throw new Error("Missing elements");

    const [y, x] = (options.position || "bottom-right").split("-") as [
      "top" | "bottom",
      "left" | "right"
    ];

    button.style[y] = "var(--gapY)";
    button.style[x] = "var(--gapX)";

    const cssVars = merge(options.cssVars || {}, WanderButton.DEFAULT_CSS_VARS);

    addCSSVariables(host, cssVars);

    return {
      host,
      button,
      wanderLogo,
      dappLogo,
      label,
      balance,
      notifications
    };

    /*
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
    */
  }

  getElements() {
    return {
      host: this.host,
      button: this.button,
      wanderLogo: this.wanderLogo,
      dappLogo: this.dappLogo,
      label: this.label,
      balance: this.balance,
      notifications: this.notifications
    };
  }

  setBalance(balanceInfo: BalanceInfo) {
    // TODO: Show label if no balance?
    const formattedBalance = new Intl.NumberFormat(undefined, {
      currency: balanceInfo.currency
    }).format(balanceInfo.amount);

    this.balance.textContent = `${formattedBalance}`;
  }

  setNotifications(notificationsCount: number) {
    // TODO: Show / hide if there aren't any:
    this.notifications.textContent =
      notificationsCount > 0 ? `${notificationsCount}` : "";
  }

  setStatus(status: WanderEmbeddedButtonStatus) {
    this.status[status] = true;
    this.button.classList.add(status);

    if (status === "isAuthenticated") {
      this.label.textContent = "Sign in";
    }
  }

  unsetStatus(status: WanderEmbeddedButtonStatus) {
    this.status[status] = false;
    this.button.classList.add(status);

    if (status === "isAuthenticated") {
      this.label.textContent = "";
    }
  }
}
