import browser from "webextension-polyfill";
import singlefile from "~../lib/single-file.js";
import type { PlasmoCSConfig } from "plasmo";
import { sendMessage } from "@arconnect/webext-bridge";

export const config: PlasmoCSConfig = {
  matches: ["*://*/*"],
  run_at: "document_start"
};

browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === "archive-page") {
    try {
      // @ts-ignore
      const pageData = await singlefile.getPageData({
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
      });
      await sendMessage("archive", pageData, "background");
    } catch (err) {
      console.log("Failed to archive page: " + err.message);
    }
  }
});

// @ts-ignore
window.singlefile = singlefile;
