import { CSSProperties } from "react";
import {
  BalanceInfo,
  StateModifier,
  WanderEmbeddedButtonOptions
} from "../../wander-embedded.types";
import { getWanderLogo } from "../logo/wander-logo.component";

export class WanderButton {
  // static DEFAULT_CLASSNAMES: Record<StateModifier, string> = {};

  private button: HTMLButtonElement;

  private id: string = "wanderEmbeddedButton";

  // private classNames: Partial<Record<StateModifier, string>>;
  // private cssVars?: Partial<Record<StateModifier, WanderEmbeddedButtonCSSVars>>;

  // TODO: How to manage light/dark theme?

  constructor(options: WanderEmbeddedButtonOptions = {}) {
    this.id = options.id || this.id;

    /*
    this.classNames = typeof options.className === "string"
      ? { default: options.className } satisfies Partial<Record<StateModifier, string>>
      : (options.className || {});
    this.cssVars = options.cssVars || {};
    */

    this.button = this.initializeButton();
  }

  public getElement(): HTMLButtonElement {
    return this.button;
  }

  // TODO: Button needs 3 states: noAuth, noConnect and connected

  private initializeButton(): HTMLButtonElement {
    // TODO: Add logo and balance if provided
    // Create new button
    this.button = document.createElement("button");
    this.button.innerText = "Open";

    const defaultStyles: CSSProperties = {
      position: "fixed",
      bottom: "40px",
      right: "40px",
      display: "flex",
      alignItems: "center",
      padding: "16px",
      gap: "8px",
      borderRadius: "50px",
      border: "1px solid rgba(51, 51, 51, 1)",
      backgroundColor: "rgba(25, 25, 25, 1)",
      boxShadow: "0px 4px 40px 0px rgba(0, 0, 0, 0.25)",
      fontSize: "24px",
      lineHeight: "28.8px",
      color: "white",
      zIndex: "9999"
    };

    Object.assign(this.button.style, defaultStyles);

    // Clear any existing content
    /*
    this.button.innerHTML = "";

    let logo: SVGElement | HTMLImageElement;
    if (this.config.logo) {
      const imgElement = document.createElement("img");
      imgElement.src = this.config.logo;
      imgElement.width = 30;
      imgElement.height = 30;
      logo = imgElement;
    } else {
      logo = getWanderLogo({
        width: "30px",
        height: "30px"
      });
    }

    this.button.appendChild(logo);

    const text = document.createTextNode("Connect");
    this.button.appendChild(text);
    */

    return this.button;
  }

  addModifier(modifier: StateModifier) {}

  removeModifier(modifier: StateModifier) {}

  setBalance(balanceInfo: BalanceInfo) {}

  setNotifications(notificationsCount: number) {}
}
