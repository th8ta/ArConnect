import { CSSProperties } from "react";
import {
  HalfLayoutConfig,
  LayoutConfig,
  LayoutType,
  ModalLayoutConfig,
  PopupLayoutConfig,
  RouteConfig,
  RouteType,
  SidebarLayoutConfig,
  StateModifier,
  WanderEmbeddedIframeOptions,
  WanderEmbeddedModalCSSVars
} from "../../wander-embedded.types";
import { addCSSVariables } from "../../utils/styles/styles.utils";

export class WanderIframe {
  static DEFAULT_BACKDROP_ID = "wanderEmbeddedBackdrop" as const;
  static DEFAULT_IFRAME_ID = "wanderEmbeddedIframe" as const;

  static IFRAME_BASE_STYLE: CSSProperties = {
    position: "fixed",
    zIndex: "calc(var(--zIndex, 9999) + 1)",
    background: "var(--background, white)",
    border:
      "var(--borderWidth, 2px) solid var(--borderColor, rgba(0, 0, 0, .125))",
    borderRadius: "var(--borderRadius, 10px)",
    boxShadow: "var(--boxShadow, 0 0 16px 0 rgba(0, 0, 0, 0.125))",
    width: "calc(var(--preferredWidth, 400px) - 2 * var(--borderWidth, 2px))",
    height: "calc(var(--preferredHeight, 600px) - 2 * var(--borderWidth, 2px))",
    minWidth: "400px",
    minHeight: "400px",
    maxWidth:
      "calc(100dvw - 2 * var(--backdropPadding, 32px) - 2 * var(--borderWidth, 2px))",
    maxHeight:
      "calc(100dvh - 2 * var(--backdropPadding, 32px) - 2 * var(--borderWidth, 2px))",
    boxSizing: "content-box"
  };

  static BACKDROP_HIDE_STYLE: CSSProperties = {
    pointerEvents: "none",
    opacity: 0
  };

  static BACKDROP_SHOW_STYLE: CSSProperties = {
    pointerEvents: "auto",
    opacity: 1
  };

  static BACKDROP_BASE_STYLE: CSSProperties = {
    position: "fixed",
    zIndex: "var(--zIndex, 9999)",
    inset: 0,
    background: "var(--backdropBackground, rgba(255, 255, 255, .0625))",
    backdropFilter: "var(--backdropBackdropFilter, blur(12px))",
    padding: "var(--backdropPadding, 32px)",
    // TODO: Add CSS vars for this:
    transition: "opacity linear 150ms"
    // ...WanderIframe.BACKDROP_HIDE_STYLE
  };

  // static DEFAULT_CLASSNAMES: Record<StateModifier, string> = {};

  static DEFAULT_ROUTE_LAYOUT = {
    modal: {
      type: "modal"
    } as ModalLayoutConfig,
    popup: {
      type: "popup"
    } as PopupLayoutConfig,
    sidebar: {
      type: "sidebar"
    } as SidebarLayoutConfig,
    half: {
      type: "half"
    } as HalfLayoutConfig
  };

  private backdrop: HTMLDivElement;
  private iframe: HTMLIFrameElement;

  private options: WanderEmbeddedIframeOptions;
  private routeLayout: Partial<Record<RouteType, LayoutConfig>>;

  private iframeHideStyle: CSSProperties = {};
  private iframeShowStyle: CSSProperties = {};

  // State:
  private currentLayoutType: LayoutType | null = null;
  private isOpen = false;

  // private classNames: Partial<Record<StateModifier, string>>;
  // private cssVars?: Partial<Record<StateModifier, WanderEmbeddedModalCSSVars>>;

  constructor(src: string, options: WanderEmbeddedIframeOptions = {}) {
    // console.log("WanderIframe constructor");

    this.options = options;

    const { routeLayout } = options;

    this.routeLayout = {
      default: WanderIframe.getLayoutConfig(routeLayout?.default),
      auth: WanderIframe.getLayoutConfig(routeLayout?.auth),
      account: WanderIframe.getLayoutConfig(routeLayout?.account),
      settings: WanderIframe.getLayoutConfig(routeLayout?.settings),
      "auth-request": WanderIframe.getLayoutConfig(
        routeLayout?.["auth-request"]
      )
    };

    /*
    this.classNames = typeof options.className === "string"
      ? { default: options.className } satisfies Partial<Record<StateModifier, string>>
      : (options.className || {});
    this.cssVars = options.cssVars || {};
    */

    const elements = WanderIframe.initializeIframe(src, options);

    this.backdrop = elements.backdrop;
    this.iframe = elements.iframe;

    // Apply initial styling:

    this.resize({
      routeType: "auth",
      preferredLayoutType: this.routeLayout.auth?.type || "modal",
      height: 0
    });

    // TODO: Initialize CSS variables with options?
    // TODO: Apply CSS variables and modifiers.
  }

  static getLayoutConfig(
    layoutConfig?: LayoutConfig | LayoutType
  ): LayoutConfig | undefined {
    if (!layoutConfig) return undefined;

    return typeof layoutConfig === "object"
      ? layoutConfig
      : WanderIframe.DEFAULT_ROUTE_LAYOUT[layoutConfig];
  }

  static initializeIframe(src: string, options: WanderEmbeddedIframeOptions) {
    // TODO: Considering using a `<dialog>` element or adding proper aria- tags.

    const backdrop = document.createElement("div");

    backdrop.id = WanderIframe.DEFAULT_BACKDROP_ID;

    const iframe = document.createElement("iframe");

    iframe.id = options.id || WanderIframe.DEFAULT_IFRAME_ID;
    iframe.src = src;

    // We don't add the iframe as a child of backdrop to have more control over the hide/show transitions:

    return {
      iframe,
      backdrop
    };
  }

  getElements() {
    return {
      backdrop: this.backdrop,
      iframe: this.iframe
    };
  }

  show(): void {
    console.log("SHOW");

    this.isOpen = true;

    Object.assign(this.backdrop.style, WanderIframe.BACKDROP_SHOW_STYLE);
    Object.assign(this.iframe.style, this.iframeShowStyle);
  }

  hide(): void {
    console.log("HIDE");

    this.isOpen = false;

    Object.assign(this.backdrop.style, WanderIframe.BACKDROP_HIDE_STYLE);
    Object.assign(this.iframe.style, this.iframeHideStyle);
  }

  addModifier(modifier: StateModifier) {}

  removeModifier(modifier: StateModifier) {}

  resize(routeConfig: RouteConfig): void {
    const layoutConfig =
      this.routeLayout[routeConfig.routeType] ||
      WanderIframe.DEFAULT_ROUTE_LAYOUT[routeConfig.preferredLayoutType];

    const layoutType: LayoutType = layoutConfig.type;
    const resetLayout = layoutType !== this.currentLayoutType;

    this.currentLayoutType = layoutType;

    console.log("RESIZE", layoutConfig);

    // TODO: On mobile, just take the whole screen. One desktop, leave space for button.
    // TODO: Enable/disable close with click outside? Only when backdrop visible?
    // TODO: Add slight rotation towards/against the mouse (except when directly on top)?

    const backdropStyle: CSSProperties = {};
    const iframeStyle: CSSProperties = {};
    const iframeCSSVars: WanderEmbeddedModalCSSVars = {};

    switch (layoutConfig.type) {
      case "modal": {
        iframeStyle.top = "50%";
        iframeStyle.left = "50%";
        iframeStyle.transform = "translate(-50%, -50%)"; // TODO: Add scale effect when appearing?
        iframeStyle.transition =
          "height linear 300ms, width linear 300ms, opacity linear 150ms";
        iframeCSSVars.preferredWidth =
          layoutConfig.fixedWidth || routeConfig.width;
        iframeCSSVars.preferredHeight =
          layoutConfig.fixedHeight || routeConfig.height;
        this.iframeHideStyle = WanderIframe.BACKDROP_HIDE_STYLE;
        this.iframeShowStyle = WanderIframe.BACKDROP_SHOW_STYLE;

        break;
      }

      case "popup": {
        const [y, x] = (layoutConfig.position || "bottom-right").split("-") as [
          "top" | "bottom",
          "left" | "right"
        ];

        iframeStyle[y] = "var(--backdropPadding, 32px)";
        iframeStyle[x] = "var(--backdropPadding, 32px)";
        iframeStyle.transition =
          "height linear 300ms, width linear 300ms, opacity linear 150ms";
        iframeCSSVars.preferredWidth =
          layoutConfig.fixedWidth || routeConfig.width;
        iframeCSSVars.preferredHeight =
          layoutConfig.fixedHeight || routeConfig.height;
        this.iframeHideStyle = WanderIframe.BACKDROP_HIDE_STYLE;
        this.iframeShowStyle = WanderIframe.BACKDROP_SHOW_STYLE;

        break;
      }

      case "sidebar":
      case "half": {
        const y = layoutConfig.position || "right";
        const sign = y === "right" ? "+" : "-";

        iframeStyle.top = 0;
        iframeStyle[y] = 0;
        iframeStyle.transition = "transform linear 150ms";
        // iframeStyle.maxHeight = "100dvh";

        this.iframeHideStyle = {
          transform: `translate(calc(${sign}100% ${sign} var(--backdropPadding, 32px)), 0)`
        };

        this.iframeShowStyle = {
          transform: `translate(0, 0)`
        };

        iframeCSSVars.backdropPadding = 0;

        if (layoutConfig.type === "sidebar") {
          iframeCSSVars.preferredWidth =
            layoutConfig.fixedWidth || routeConfig.width;
          iframeCSSVars.preferredHeight = "100dvw";
        } else {
          iframeCSSVars.preferredWidth = "50vw";
          iframeCSSVars.preferredHeight = "100dvw";

          // TODO Set imgSrc
        }

        break;
      }
    }

    // Every time we change the layout type (e.g. going from the auth routes "modal" to the default routes "popup"), the
    // style attribute must be reset to avoid conflicts with leftover properties from the previous layout
    if (resetLayout) {
      this.backdrop.removeAttribute("style");
      this.iframe.removeAttribute("style");

      Object.assign(backdropStyle, WanderIframe.BACKDROP_BASE_STYLE);
      Object.assign(iframeStyle, WanderIframe.IFRAME_BASE_STYLE);

      // TODO: Animate/transition this. First close the old layout. Then open the new one.
    }

    Object.assign(
      this.backdrop.style,
      backdropStyle,
      this.isOpen
        ? WanderIframe.BACKDROP_SHOW_STYLE
        : WanderIframe.BACKDROP_HIDE_STYLE
    );

    Object.assign(
      this.iframe.style,
      iframeStyle,
      this.isOpen ? this.iframeShowStyle : this.iframeHideStyle
    );

    addCSSVariables(this.iframe, iframeCSSVars);
  }
}
