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
  // Store if confirm / cancel buttons were clicked
  let isConfirmArchiveClicked = false;
  let isCancelArchiveClicked = false;

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
    .archive-buttons {
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      display: inline-flex !important;
      width: fit-content !important;
      gap: 12px !important;
      z-index: 2147483647 !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      transform: none !important;
      padding: 12px !important;
      background-color: rgba(255, 255, 255, 0.95) !important;
      border-radius: 12px !important;
    }

    .archive-btn {
      display: flex !important;
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
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }

    .archive-confirm-btn {
      color: #fff !important;
      background-color: #8E7BEA !important;
    }

    .archive-confirm-btn:hover {
      background-color: #7B66D9 !important;
    }

    .archive-cancel-btn {
      color: #1a1a1a !important;
      background-color: #fff !important;
      border: 1px solid #8E7BEA !important;
    }

    .archive-cancel-btn:hover {
      background-color: #f5f5f5 !important;
    }
  `;
  previewWindow.document.head.appendChild(styleSheet);

  /// Create button container
  const buttonContainer = previewWindow.document.createElement("div");
  buttonContainer.className = "archive-buttons";

  // Create cancel button
  const cancelButton = previewWindow.document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.className = "archive-btn archive-cancel-btn";

  // Create confirm button
  const confirmButton = previewWindow.document.createElement("button");
  confirmButton.textContent = "Confirm Archive";
  confirmButton.className = "archive-btn archive-confirm-btn";

  // Add buttons to container
  buttonContainer.style.cssText = `
    position: fixed !important;
    visibility: visible !important;
    z-index: 2147483647 !important;
  `;
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(confirmButton);
  previewWindow.document.body.appendChild(buttonContainer);

  previewWindow.onbeforeunload = () => {
    if (!isConfirmArchiveClicked && !isCancelArchiveClicked) {
      maskElement.remove();
    }
  };

  // Wait for user confirmation
  await new Promise((resolve, reject) => {
    confirmButton.onclick = () => {
      isConfirmArchiveClicked = true;
      previewWindow.close();
      progressText.textContent = "Authorize to archive this page...";
      resolve(true);
    };

    cancelButton.onclick = () => {
      isCancelArchiveClicked = true;
      previewWindow.close();
      reject(new Error("Archive cancelled"));
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

  progressText.textContent = "Archiving page... 0%";
});

onMessage("archive-progress", ({ data: progress }) => {
  const maskElement = document.querySelector(MASK_TAGNAME);
  if (!maskElement) return;

  const progressText = maskElement.shadowRoot.querySelector(".progress-text");
  if (!progressText) return;

  progressText.textContent = `Archiving page... ${progress}%`;
});

// @ts-ignore
window.singlefile = singlefile;
