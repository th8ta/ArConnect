import { CSSProperties } from "react";
import {
  RouteConfig,
  StateModifier,
  WanderEmbeddedIframeOptions
} from "../../wander-embedded.types";
import { asCSSVars } from "../../utils/styles/styles.utils";

export class WanderIframe {
  static DEFAULT_BACKDROP_ID = "wanderEmbeddedBackdrop" as const;
  static DEFAULT_IFRAME_ID = "wanderEmbeddedIframe" as const;

  static hideStyle: CSSProperties = {
    pointerEvents: "none",
    opacity: 0
  };

  static showStyle: CSSProperties = {
    pointerEvents: "auto",
    opacity: 1
  };

  // static DEFAULT_CLASSNAMES: Record<StateModifier, string> = {};

  private backdrop: HTMLDivElement;
  private iframe: HTMLIFrameElement;

  private options: WanderEmbeddedIframeOptions;

  // private classNames: Partial<Record<StateModifier, string>>;
  // private cssVars?: Partial<Record<StateModifier, WanderEmbeddedModalCSSVars>>;

  constructor(src: string, options: WanderEmbeddedIframeOptions = {}) {
    // console.log("WanderIframe constructor");

    this.options = options;

    /*
    this.classNames = typeof options.className === "string"
      ? { default: options.className } satisfies Partial<Record<StateModifier, string>>
      : (options.className || {});
    this.cssVars = options.cssVars || {};
    */

    const elements = WanderIframe.initializeIframe(src, options);

    this.backdrop = elements.backdrop;
    this.iframe = elements.iframe;
  }

  public getElements() {
    return {
      backdrop: this.backdrop,
      iframe: this.iframe
    };
  }

  public show(): void {
    Object.assign(this.backdrop.style, WanderIframe.showStyle);
  }

  public hide(): void {
    Object.assign(this.backdrop.style, WanderIframe.hideStyle);
  }

  static initializeIframe(src: string, options: WanderEmbeddedIframeOptions) {
    // TODO: Considering using a `<dialog>` element or adding proper aria- tags.

    const backdrop = document.createElement("div");

    backdrop.id = WanderIframe.DEFAULT_BACKDROP_ID;

    const iframe = document.createElement("iframe");

    iframe.id = options.id || WanderIframe.DEFAULT_IFRAME_ID;
    iframe.src = src;

    // TODO: top, left, transform only for modal mode...

    // TODO: On mobile, just take the whole screen. One desktop, leave space for button.

    // TODO: Add slight rotation towards/against the mouse (except when directly on top)?

    const iframeStyle: CSSProperties = {
      position: "fixed",
      // top: "50%",
      // left: "50%",
      // transform: "translate(-50%, -50%)",
      bottom: "var(--backdropPadding, 32px)",
      right: "var(--backdropPadding, 32px)",
      background: "var(--background, white)",
      border: "var(--border, 2px solid rgba(0, 0, 0, .125))",
      borderRadius: "var(--borderRadius, 10px)",
      boxShadow: "var(--boxShadow, 0 0 16px 0 rgba(0, 0, 0, 0.125))",
      zIndex: "var(--zIndex, 9998)",
      width: "var(--preferredWidth, 400px)",
      height: "var(--preferredHeight, 600px)",
      minWidth: "400px",
      minHeight: "400px",
      maxWidth: "calc(100dvw - 2 * var(--backdropPadding, 32px))",
      maxHeight: "calc(100dvh - 2 * var(--backdropPadding, 32px))",
      boxSizing: "content-box",
      transition: "height linear 300ms, width linear 300ms"
    };

    // TODO: Use shadow DOM?
    Object.assign(iframe.style, iframeStyle, asCSSVars({}));

    const backdropStyle: CSSProperties = {
      position: "fixed",
      inset: 0,
      background: "var(--backdropBackground, rgba(255, 255, 255, .0625))",
      backdropFilter: "var(--backdropBackdropFilter, blur(12px))",
      padding: "var(--backdropPadding, 32px)",
      // TODO: Add CSS vars for this:
      transition: "all linear 150ms",
      ...WanderIframe.hideStyle
    };

    Object.assign(backdrop.style, backdropStyle, asCSSVars({}));

    // TODO: Apply CSS variables and modifiers.

    backdrop.appendChild(iframe);

    return {
      iframe,
      backdrop
    };
  }

  addModifier(modifier: StateModifier) {}

  removeModifier(modifier: StateModifier) {}

  resize(routeConfig: RouteConfig): void {
    // TODO: Also account for routeConfig.preferredType & routeConfig.routeType

    if (routeConfig.width !== undefined) {
      this.iframe.style.setProperty(
        "--preferredWidth",
        `${routeConfig.width}px`
      );
    }

    this.iframe.style.setProperty(
      "--preferredHeight",
      `${routeConfig.height}px`
    );
  }
}
