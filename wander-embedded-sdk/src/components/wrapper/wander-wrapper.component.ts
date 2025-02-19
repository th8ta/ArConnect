import { CSSProperties } from "react";
import { WanderEmbeddedModalCSSVars } from "../../wander-embedded.types";
import { addCSSVariables } from "../../utils/styles/styles.utils";

export class WanderWrapper {
  static DEFAULT_WRAPPER_ID = "wanderEmbeddedWrapper" as const;

  static WRAPPER_BASE_STYLE: CSSProperties = {
    position: "fixed",
    zIndex: "calc(var(--zIndex, 9999) + 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    transformOrigin: "center center"
  };

  static WRAPPER_HIDE_STYLE: CSSProperties = {
    pointerEvents: "none",
    opacity: 0,
    transform: "scale(0.95)"
  };

  static WRAPPER_SHOW_STYLE: CSSProperties = {
    pointerEvents: "auto",
    opacity: 1,
    transform: "scale(1)"
  };

  private wrapper: HTMLDivElement;
  private iframe: HTMLIFrameElement;
  private isVisible: boolean = false;

  constructor(
    iframe: HTMLIFrameElement,
    options: { id?: string; cssVars?: Partial<WanderEmbeddedModalCSSVars> } = {}
  ) {
    this.iframe = iframe;
    this.wrapper = WanderWrapper.initializeWrapper(iframe, options);
  }

  static initializeWrapper(
    iframe: HTMLIFrameElement,
    options: { id?: string; cssVars?: Partial<WanderEmbeddedModalCSSVars> }
  ) {
    const wrapper = document.createElement("div");
    wrapper.id = options.id || WanderWrapper.DEFAULT_WRAPPER_ID;

    // Copy initial iframe styles that affect positioning
    const iframeStyle = window.getComputedStyle(iframe);
    const positioningProps = [
      "top",
      "right",
      "bottom",
      "left",
      "transform",
      "width",
      "height",
      "minWidth",
      "minHeight",
      "maxWidth",
      "maxHeight"
    ];

    positioningProps.forEach((prop) => {
      wrapper.style[prop as any] = iframeStyle.getPropertyValue(prop);
    });

    // Apply base wrapper styles
    Object.assign(wrapper.style, WanderWrapper.WRAPPER_BASE_STYLE);
    Object.assign(wrapper.style, WanderWrapper.WRAPPER_HIDE_STYLE);

    // Add CSS variables if provided
    if (options.cssVars) {
      addCSSVariables(wrapper, options.cssVars);
    }

    // Move iframe into wrapper
    iframe.parentNode?.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);

    // Reset iframe positioning since it's now relative to wrapper
    iframe.style.position = "relative";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.transform = "none";

    return wrapper;
  }

  show(): void {
    this.isVisible = true;
    Object.assign(this.wrapper.style, WanderWrapper.WRAPPER_SHOW_STYLE);
  }

  hide(): void {
    this.isVisible = false;
    Object.assign(this.wrapper.style, WanderWrapper.WRAPPER_HIDE_STYLE);
  }

  resize(dimensions: {
    width?: string | number;
    height?: string | number;
    top?: string | number;
    left?: string | number;
  }): void {
    Object.entries(dimensions).forEach(([key, value]) => {
      if (value !== undefined) {
        this.wrapper.style[key as any] =
          typeof value === "number" ? `${value}px` : value;
      }
    });
  }

  destroy(): void {
    const parent = this.wrapper.parentNode;
    if (parent) {
      parent.insertBefore(this.iframe, this.wrapper);
      this.wrapper.remove();
    }
  }

  getElements() {
    return {
      wrapper: this.wrapper,
      iframe: this.iframe
    };
  }
}
