import {
  ArConnectButtonConfig,
  ArConnectButtonStyles
} from "../types/arconnect-button";
import { getArConnectLogo } from "./ArConnectLogo";

export class ArConnectButton {
  private button: HTMLButtonElement;
  private config: ArConnectButtonConfig;

  constructor(config: ArConnectButtonConfig) {
    this.config = config;
    this.button = this.initializeButton();
  }

  public getElement(): HTMLButtonElement {
    return this.button;
  }

  private initializeButton(): HTMLButtonElement {
    // TODO: Add logo and balance if provided
    // Create new button
    this.button = document.createElement("button");
    this.button.innerText = "Open";

    const defaultStyles: ArConnectButtonStyles = {
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

    // Always apply custom styles if provided
    if (this.config.buttonStyles && this.config.buttonStyles !== "none") {
      const styles = { ...this.config.buttonStyles };
      Object.assign(this.button.style, styles);
    } else {
      Object.assign(this.button.style, defaultStyles);
    }

    // Clear any existing content
    this.button.innerHTML = "";

    let logo: SVGElement | HTMLImageElement;
    if (this.config.logo) {
      const imgElement = document.createElement("img");
      imgElement.src = this.config.logo;
      imgElement.width = 30;
      imgElement.height = 30;
      logo = imgElement;
    } else {
      logo = getArConnectLogo({
        width: "30px",
        height: "30px"
      });
    }

    this.button.appendChild(logo);

    const text = document.createTextNode("Connect");
    this.button.appendChild(text);

    if (this.config.onClick) {
      this.button.addEventListener("click", this.config.onClick);
    }

    return this.button;
  }
}
