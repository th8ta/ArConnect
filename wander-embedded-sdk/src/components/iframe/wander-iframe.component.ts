import { CSSProperties } from "react";
import {
  RouteConfig,
  StateModifier,
  WanderEmbeddedIframeOptions
} from "../../wander-embedded.types";

export class WanderIframe {
  static DEFAULT_ID = "wanderEmbeddedIframe";

  // static DEFAULT_CLASSNAMES: Record<StateModifier, string> = {};

  private iframe: HTMLIFrameElement;

  private options: WanderEmbeddedIframeOptions;

  // private classNames: Partial<Record<StateModifier, string>>;
  // private cssVars?: Partial<Record<StateModifier, WanderEmbeddedModalCSSVars>>;

  constructor(src: string, options: WanderEmbeddedIframeOptions = {}) {
    this.options = options;

    /*
    this.classNames = typeof options.className === "string"
      ? { default: options.className } satisfies Partial<Record<StateModifier, string>>
      : (options.className || {});
    this.cssVars = options.cssVars || {};
    */

    this.iframe = this.initializeIframe(src, options);
  }

  public getElement(): HTMLIFrameElement {
    return this.iframe;
  }

  public show(): void {
    this.iframe.style.display = "block";
  }

  public hide(): void {
    this.iframe.style.display = "none";
  }

  private initializeIframe(
    src: string,
    options: WanderEmbeddedIframeOptions
  ): HTMLIFrameElement {
    this.iframe = document.createElement("iframe");
    this.iframe.src = src;
    this.iframe.id = options.id || WanderIframe.DEFAULT_ID;

    // CSS vars:
    // outerPadding
    // background
    // color
    // border
    // borderRadius
    // boxShadow
    // zIndex

    // TODO: Add backdrop too

    const defaultStyles: CSSProperties = {
      position: "fixed",
      // TODO: top, left, transform only for modal mode...
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "var(--iframe-width, 400px)",
      height: "var(--iframe-height, 600px)",
      minWidth: "400px",
      maxWidth: "calc(100dvw - 64px)",
      maxHeight: "calc(100dvh - 64px)",
      display: "none",
      border: "1px solid #ccc",
      borderRadius: "10px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      zIndex: "9998"
    };

    // TODO: Use shadow DOM?
    Object.assign(this.iframe.style, defaultStyles);

    // TODO: Apply CSS variables and modifiers.

    return this.iframe;
  }

  addModifier(modifier: StateModifier) {}

  removeModifier(modifier: StateModifier) {}

  resize(routeConfig: RouteConfig): void {
    // TODO: Also account for routeConfig.preferredType & routeConfig.routeType

    if (routeConfig.width !== undefined) {
      this.iframe.style.setProperty("--iframe-width", `${routeConfig.width}px`);
    }

    this.iframe.style.setProperty("--iframe-height", `${routeConfig.height}px`);
  }
}
