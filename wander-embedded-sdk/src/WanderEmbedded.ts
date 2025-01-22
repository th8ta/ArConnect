import { WanderEmbeddedOptions } from "./types";

export class WanderEmbedded {
  private container!: HTMLDivElement;
  private button!: HTMLButtonElement;
  private iframe!: HTMLIFrameElement;
  private iframeSrc: string =
    "https://arweave.net/PI6EC3mZA-fVlb5Jq63-kihE1Hgt6eepsRAcocELIKA";
  private themeColor: string = "#0072f5";

  constructor(options?: WanderEmbeddedOptions) {
    if (options?.theme) {
      this.themeColor = options.theme.primary;
    }

    this.injectOpenButton();

    this.injectIframe();

    if (typeof window !== "undefined") {
      if (!window.arweaveWallet) {
        window.arweaveWallet = {};
      }
      window.arweaveWallet.someRandomMethod = () => {
        console.log("Hello from arweaveWallet!");
      };
    }
  }

  /**
   * open(): Reveal the iframe or set it to visible
   */
  public open(): void {
    if (this.iframe) {
      this.iframe.style.display = "block";
    }
  }

  /**
   * close(): Hide the iframe from view
   */
  public close(): void {
    if (this.iframe) {
      this.iframe.style.display = "none";
    }
  }

  /**
   * changeTheme(): This might change some styling
   */
  public changeTheme(color: string): void {
    this.themeColor = color;
    if (this.button) {
      this.button.style.backgroundColor = this.themeColor;
    }
    // Potentially also postMessage to iframe if you want the iframe to adapt theme
    // ...
  }

  /**
   * sendMessageToIframe(): Send a message to the iframe
   */
  public sendMessageToIframe(msg: string): void {
    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage(
        { type: "FROM_SDK", payload: msg },
        "*"
      );
    }
  }

  private injectOpenButton() {
    this.container = document.createElement("div");
    this.container.id = "wander-embedded-container";

    this.button = document.createElement("button");
    this.button.innerText = "Open";
    this.button.style.backgroundColor = this.themeColor;
    this.button.style.color = "#ffffff";
    this.button.style.padding = "10px 20px";
    this.button.style.fontSize = "16px";
    this.button.style.border = "none";
    this.button.style.cursor = "pointer";
    this.button.style.margin = "10px";

    this.button.style.position = "fixed";
    this.button.style.bottom = "40px";
    this.button.style.right = "40px";
    this.button.style.borderRadius = "50%";
    this.button.style.width = "60px";
    this.button.style.height = "60px";
    this.button.style.padding = "0";
    this.button.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
    this.button.style.zIndex = "9999";

    // Attach open method
    this.button.addEventListener("click", () => this.open());

    this.container.appendChild(this.button);
    document.body.appendChild(this.container);
  }

  private injectIframe() {
    this.iframe = document.createElement("iframe");
    this.iframe.src = this.iframeSrc;
    this.iframe.id = "wander-embedded-iframe";

    // Position iframe as a chatbox above the FAB button
    this.iframe.style.position = "fixed";
    this.iframe.style.bottom = `${this.container.offsetHeight + 120}px`; // Position above container with padding
    this.iframe.style.right = `${this.container.offsetLeft + 20}px`;
    this.iframe.style.width = "400px";
    this.iframe.style.height = "600px";
    this.iframe.style.display = "none";
    this.iframe.style.border = "1px solid #ccc";
    this.iframe.style.borderRadius = "10px";
    this.iframe.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    this.iframe.style.zIndex = "9998"; // Just below the button's z-index

    document.body.appendChild(this.iframe);
  }
}
