import { WanderButtonConfig, WanderButtonStyles } from "../types/wander-button";

export class WanderButton {
  private button: HTMLButtonElement;
  private config: WanderButtonConfig;

  constructor(config: WanderButtonConfig) {
    this.config = config;
    this.button = this.initializeButton();
  }

  public getElement(): HTMLButtonElement {
    return this.button;
  }

  private initializeButton(): HTMLButtonElement {
    if (this.config.buttonRef) {
      // Use existing button but apply our styles and click handler
      this.button = this.config.buttonRef;
    } else {
      // Create new button
      this.button = document.createElement("button");
      this.button.innerText = "Open";
    }

    const defaultStyles: WanderButtonStyles = {
      backgroundColor: "black",
      color: "white",
      position: "fixed",
      bottom: "40px",
      right: "40px",
      borderRadius: "50%",
      width: "60px",
      height: "60px",
      padding: "0",
      border: "none",
      cursor: "pointer",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      zIndex: "9999"
    };

    // Only apply default styles if no buttonRef was provided
    if (!this.config.buttonRef) {
      Object.assign(this.button.style, defaultStyles);
    }

    // Always apply custom styles if provided
    if (this.config.buttonStyles) {
      const styles = { ...defaultStyles, ...this.config.buttonStyles };
      Object.assign(this.button.style, styles);
    }

    if (this.config.onClick) {
      this.button.addEventListener("click", this.config.onClick);
    }

    return this.button;
  }
}
