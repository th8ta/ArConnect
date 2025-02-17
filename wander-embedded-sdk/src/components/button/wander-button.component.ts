import {
  BalanceInfo,
  isThemeRecord,
  ThemeSetting,
  WanderEmbeddedButtonCSSVars,
  WanderEmbeddedButtonOptions,
  WanderEmbeddedButtonStatus
} from "../../wander-embedded.types";
import { getWanderButtonTemplateContent } from "./wander-button.template";
import { addCSSVariables } from "../../utils/styles/styles.utils";
import { merge } from "ts-deepmerge";

export class WanderButton {
  static DEFAULT_HOST_ID = "wanderEmbeddedButtonHost" as const;

  static DEFAULT_LIGHT_CSS_VARS: WanderEmbeddedButtonCSSVars = {
    // Button (button):
    gapX: 16,
    gapY: 16,
    gapInside: 12,
    minWidth: 0,
    minHeight: 0,
    zIndex: "9999",
    padding: "12px 20px 12px 16px",
    font: "16px monospace",

    // Button (button, affected by :hover & :focus):
    background: "white",
    color: "black",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 128,
    boxShadow: "0 0 32px 0px rgba(0, 0, 0, 0.25)",

    // Logo (img / svg):
    logoBackground: "",
    logoBorderWidth: "",
    logoBorderColor: "",
    logoBorderRadius: "",

    // Notifications (span):
    notificationsBackground: "",
    notificationsBorderWidth: "",
    notificationsBorderColor: "",
    notificationsBorderRadius: "",
    notificationsBoxShadow: "",
    notificationsPadding: ""
  };

  static DEFAULT_DARK_CSS_VARS: WanderEmbeddedButtonCSSVars = {
    ...WanderButton.DEFAULT_LIGHT_CSS_VARS,

    // Button (button, affected by :hover & :focus):
    background: "black",
    color: "white",
    borderColor: "black",

    // Logo (img / svg):
    logoBackground: "",
    logoBorderWidth: "",
    logoBorderColor: "",
    logoBorderRadius: "",

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
  private label: HTMLSpanElement;
  private balance: HTMLSpanElement;
  private indicator: HTMLSpanElement;
  private dappLogo: HTMLImageElement | SVGElement;
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
    this.label = elements.label;
    this.balance = elements.balance;
    this.indicator = elements.indicator;
    this.dappLogo = elements.dappLogo;
    this.notifications = elements.notifications;
  }

  static initializeButton(options: WanderEmbeddedButtonOptions) {
    const id = options.id || WanderButton.DEFAULT_HOST_ID;
    const position = options.position || "bottom-right";
    const themeSetting: ThemeSetting = options.theme || "system";
    const cssVars = options.cssVars || {};

    const host = document.createElement("div");

    host.id = id;
    host.setAttribute("data-theme", themeSetting);

    const shadow = host.attachShadow({ mode: "open" });
    const template = document.createElement("template");

    console.log("SRC =", options.dappLogoSrc);

    template.innerHTML = getWanderButtonTemplateContent({
      dappLogoSrc: options.dappLogoSrc,
      customStyles: options.customStyles,
      // TODO: It would be better to create an interface with the subset of vars that we can override when changing themes:
      cssVariableKeys: Object.keys(WanderButton.DEFAULT_LIGHT_CSS_VARS)
    });

    shadow.appendChild(template.content);

    const button = shadow.querySelector(".button") as HTMLButtonElement;
    const wanderLogo = shadow.querySelector(".wanderLogo") as SVGElement;
    const label = shadow.querySelector(".label") as HTMLSpanElement;
    const balance = shadow.querySelector(".balance") as HTMLSpanElement;
    const indicator = shadow.querySelector(".indicator") as HTMLSpanElement;
    const dappLogo = shadow.querySelector(".dappLogo") as
      | HTMLImageElement
      | SVGElement;
    const notifications = shadow.querySelector(
      ".notifications"
    ) as HTMLSpanElement;

    if (
      !button ||
      !wanderLogo ||
      !label ||
      !balance ||
      !indicator ||
      !dappLogo ||
      !notifications
    )
      throw new Error("Missing elements");

    const [y, x] = position.split("-") as ["top" | "bottom", "left" | "right"];

    host.style.position = "fixed";
    host.style[y] = "var(--gapY)";
    host.style[x] = "var(--gapX)";

    let cssVarsLight: WanderEmbeddedButtonCSSVars | null = null;
    let cssVarsDark: WanderEmbeddedButtonCSSVars | null = null;

    if (Object.keys(cssVars).length === 0) {
      cssVarsLight = WanderButton.DEFAULT_LIGHT_CSS_VARS;
      cssVarsDark = WanderButton.DEFAULT_DARK_CSS_VARS;
    } else if (isThemeRecord(cssVars)) {
      cssVarsLight = merge(
        cssVars?.light || {},
        WanderButton.DEFAULT_LIGHT_CSS_VARS
      ) as WanderEmbeddedButtonCSSVars;
      cssVarsDark = merge(
        cssVars?.dark || {},
        WanderButton.DEFAULT_DARK_CSS_VARS
      ) as WanderEmbeddedButtonCSSVars;
    } else if (themeSetting !== "dark") {
      cssVarsLight = merge(
        cssVars || {},
        WanderButton.DEFAULT_LIGHT_CSS_VARS
      ) as WanderEmbeddedButtonCSSVars;
    } else {
      cssVarsDark = merge(
        cssVars || {},
        WanderButton.DEFAULT_DARK_CSS_VARS
      ) as WanderEmbeddedButtonCSSVars;
    }

    if (cssVarsLight) addCSSVariables(host, cssVarsLight);
    if (cssVarsDark) addCSSVariables(host, cssVarsDark, "Dark");

    return {
      host,
      button,
      wanderLogo,
      label,
      balance,
      indicator,
      dappLogo,
      notifications
    };
  }

  getElements() {
    return {
      host: this.host,
      button: this.button,
      wanderLogo: this.wanderLogo,
      label: this.label,
      balance: this.balance,
      indicator: this.indicator,
      dappLogo: this.dappLogo,
      notifications: this.notifications
    };
  }

  setBalance(balanceInfo: BalanceInfo) {
    const formattedBalance = new Intl.NumberFormat(undefined, {
      currency: balanceInfo.currency
    }).format(balanceInfo.amount);

    this.balance.textContent = `${formattedBalance}`;
  }

  setNotifications(notificationsCount: number) {
    if (notificationsCount > 0) {
      this.notifications.textContent = `${notificationsCount}`;
      this.label.textContent = "Review requests";
    } else {
      this.notifications.textContent = "";
      this.label.textContent = this.status.isAuthenticated ? "" : "Sign in";
    }
  }

  setStatus(status: WanderEmbeddedButtonStatus) {
    this.status[status] = true;
    this.button.classList.add(status);

    if (status === "isAuthenticated") {
      this.label.textContent = "";
    }
  }

  unsetStatus(status: WanderEmbeddedButtonStatus) {
    this.status[status] = false;
    this.button.classList.add(status);

    if (status === "isAuthenticated") {
      this.label.textContent = "Sign in";
    }
  }
}
