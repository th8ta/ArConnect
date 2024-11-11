import browser from "webextension-polyfill";
import singlefile from "~lib/archive/singlefile.js";
import type { PlasmoCSConfig } from "plasmo";
import { sendMessage } from "@arconnect/webext-bridge";

export const config: PlasmoCSConfig = {
  matches: ["file://*/*", "http://*/*", "https://*/*"],
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
        removeImports: true,
        blockScripts: true,
        blockAudios: true,
        blockVideos: true,
        compressHTML: true,
        removeAlternativeFonts: true,
        removeAlternativeMedias: true,
        removeAlternativeImages: true,
        groupDuplicateImages: true
      });
      await sendMessage("archive", pageData, "background");
    } catch (err) {
      console.log("Failed to archive page: " + err.message);
    }
  }
});
