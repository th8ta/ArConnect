import browser from "webextension-polyfill";
import singlefile from "~../lib/single-file.js";
import type { PlasmoCSConfig } from "plasmo";
import { onMessage, sendMessage } from "@arconnect/webext-bridge";
import type { ArchiveResult, PageData } from "~lib/archive";

export const config: PlasmoCSConfig = {
  matches: ["*://*/*"],
  run_at: "document_start"
};

const MASK_TAGNAME = "singlefile-mask";
const MASK_CONTENT_CLASSNAME = "singlefile-mask-content";
const SINGLE_FILE_UI_ELEMENT_CLASS = "single-file-ui-element";

const DEFAULT_PAGE_DATA_OPTIONS = {
  removeHiddenElements: true,
  removeUnusedStyles: true,
  removeUnusedFonts: true,
  compressHTML: true,
  loadDeferredImages: true,
  loadDeferredImagesMaxIdleTime: 1500,
  filenameReplacementCharacter: "_",
  removeAlternativeFonts: true,
  removeAlternativeMedias: true,
  removeAlternativeImages: true,
  groupDuplicateImages: true,
  saveFavicon: true,
  blockScripts: true,
  blockVideos: true,
  blockAudios: true
} as const;

type NotificationType = "success" | "error" | "info";

interface NotificationOptions {
  type?: NotificationType;
  duration?: number;
  autoRemove?: boolean;
}

function showMaskNotification(
  message: string,
  options: NotificationOptions = {}
) {
  const { type = "info", duration = 3000, autoRemove = true } = options;

  const maskElement = document.querySelector(MASK_TAGNAME);
  if (!maskElement) return;

  const progressText = maskElement.shadowRoot.querySelector(".progress-text");
  if (!progressText) return;

  progressText.textContent = message;
  progressText.className = `progress-text ${type}`;

  if (autoRemove) {
    setTimeout(() => maskElement.remove(), duration);
  }

  return {
    remove: () => maskElement.remove(),
    update: (newMessage: string) => {
      if (progressText) progressText.textContent = newMessage;
    }
  };
}

function createMaskElement() {
  let maskElement = document.querySelector(MASK_TAGNAME);
  if (!maskElement) {
    maskElement = createElement(MASK_TAGNAME, document.documentElement);
    const shadowRoot = maskElement.attachShadow({ mode: "open" });
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .${MASK_CONTENT_CLASSNAME} {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 2147483646;
        background-color: rgba(0, 0, 0, 0.3);  
        transition: opacity 250ms;
        display: flex;
        align-items: flex-end;
        justify-content: flex-start;
        padding: 24px;
        box-sizing: border-box;
      }
      .progress-text {
        background: rgba(255, 255, 255, 0.95);
        padding: 16px 32px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #1a1a1a;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        position: relative;
        transform: translateZ(0);
        backface-visibility: hidden;
        -webkit-font-smoothing: antialiased;
        pointer-events: none;  
      }
      .progress-text.error {
        background: rgba(255, 235, 235, 0.95);
        color: #cc0000;
      }
      .progress-text.success {
        background: rgba(235, 255, 235, 0.95);
        color: #006600;
      }
      .progress-text.info {
        background: rgba(255, 255, 255, 0.95);
        color: #1a1a1a;
      }
    `;
    shadowRoot.appendChild(styleElement);

    const maskElementContent = document.createElement("div");
    maskElementContent.classList.add(MASK_CONTENT_CLASSNAME);

    const progressText = document.createElement("div");
    progressText.className = "progress-text";
    progressText.textContent = "Preparing to archive this page...";

    maskElementContent.appendChild(progressText);
    shadowRoot.appendChild(maskElementContent);
  }

  return {
    maskElement,
    progressText: maskElement.shadowRoot.querySelector(".progress-text")
  };
}

function createElement(tagName: string, parentElement?: Element) {
  const element = document.createElement(tagName);
  element.className = SINGLE_FILE_UI_ELEMENT_CLASS;
  if (parentElement) {
    parentElement.appendChild(element);
  }
  return element;
}

async function createPreviewWindow(
  pageData: PageData,
  maskElement: Element,
  progressText: Element
) {
  // Store if confirm button was clicked
  let isConfirmArchiveClicked = false;

  // Create full-screen preview popup
  const previewWindow = window.open(
    "",
    "Archive Preview",
    "width=" + screen.availWidth + ",height=" + screen.availHeight
  );
  if (!previewWindow) throw new Error("Failed to create preview window");

  previewWindow.document.write(pageData.content);
  previewWindow.document.close();

  // Inject theme styles
  const styleSheet = previewWindow.document.createElement("style");
  styleSheet.textContent = `
    .archive-confirm-btn {
      display: flex !important;
      color: #fff !important;
      background-color: #8E7BEA !important;
      border: none !important;
      outline: none !important;
      cursor: pointer !important;
      font-size: 16px !important;
      font-weight: 500 !important;
      padding: 10px 24px !important;
      min-width: 100px !important;
      height: 42px !important;
      border-radius: 10px !important;
      text-align: center !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.23s ease-in-out !important;
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }

    .archive-confirm-btn:hover {
      background-color: #7B66D9 !important;
    }
  `;
  previewWindow.document.head.appendChild(styleSheet);

  // Create button with matching styles
  const confirmButton = previewWindow.document.createElement("button");
  confirmButton.textContent = "Confirm Archive";
  confirmButton.className = "archive-confirm-btn";

  previewWindow.document.body.appendChild(confirmButton);

  previewWindow.onbeforeunload = () => {
    if (!isConfirmArchiveClicked) {
      maskElement.remove();
    }
  };

  // Wait for user confirmation
  await new Promise((resolve) => {
    confirmButton.onclick = () => {
      isConfirmArchiveClicked = true;
      previewWindow.close();
      progressText.textContent = "Authorize to archive this page...";
      resolve(true);
    };
  });
}

browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === "archive-page") {
    try {
      // Create mask element with progress text
      const { maskElement, progressText } = createMaskElement();

      // @ts-ignore
      const pageData = await singlefile.getPageData(DEFAULT_PAGE_DATA_OPTIONS);

      // Update progress text
      progressText.textContent = "Preview ready - please review and confirm";

      // Create full-screen preview popup
      await createPreviewWindow(pageData, maskElement, progressText);

      const archiveResult: ArchiveResult = await sendMessage(
        "archive",
        pageData,
        "background"
      );

      if (archiveResult.status === "OK") {
        showMaskNotification("Page archived successfully!", {
          type: "success"
        });
      } else {
        showMaskNotification(`Failed to archive page: ${archiveResult.error}`, {
          type: "error"
        });
      }
    } catch (error) {
      showMaskNotification(
        `Failed to archive page: ${error?.message || error}`,
        {
          type: "error"
        }
      );
    }
  }
});

onMessage("archive-authorized", () => {
  const maskElement = document.querySelector(MASK_TAGNAME);
  if (!maskElement) return;

  const progressText = maskElement.shadowRoot.querySelector(".progress-text");
  if (!progressText) return;

  progressText.textContent = "Archiving page...";
});

// @ts-ignore
window.singlefile = singlefile;
