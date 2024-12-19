import browser from "webextension-polyfill";
import { ExtensionStorage } from "~utils/storage";

export const ARCONNECT_THEME_BACKGROUND_COLOR =
  "ARCONNECT_THEME_BACKGROUND_COLOR";
export const ARCONNECT_THEME_TEXT_COLOR = "ARCONNECT_THEME_TEXT_COLOR";

/**
 * Clear all storage keys except for gateways.
 */
export async function resetStorage() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(ARCONNECT_THEME_BACKGROUND_COLOR);
    localStorage.removeItem(ARCONNECT_THEME_TEXT_COLOR);
  }

  try {
    // get all keys except gateways
    const allStoredKeys = Object.keys(
      (await browser.storage.local.get(null)) || {}
    ).filter((key) => key !== "gateways");

    // remove all keys except gateways
    await Promise.allSettled(
      allStoredKeys.map((key) => ExtensionStorage.remove(key))
    );
  } catch {}
}
