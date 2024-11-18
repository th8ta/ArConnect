import browser, { type Menus, type Tabs } from "webextension-polyfill";
import { getActiveAddress, getWallets } from "~wallets";
import { getActiveTab, removeApp } from "~applications";
import { sendMessage } from "@arconnect/webext-bridge";
import { isManifestv3 } from "./runtime";
import { getAppURL } from "./format";
import chromeBrowserPolyfill from "url:~../lib/chrome-browser-polyfill.js";
import singleFileFrames from "url:~../lib/single-file-frames.js";
import singleFileExtensionFrames from "url:~../lib/single-file-extension-frames.js";
import singleFileHooksFrames from "url:~../lib/single-file-hooks-frames.js";
import singleFileBootstrap from "url:~../lib/single-file-bootstrap.js";
import singleFileExtensionCore from "url:~../lib/single-file-extension-core.js";

/**
 * Create context menus (right click actions)
 *
 * @param hasPerms Does the active site have any permissions?
 */
export async function createContextMenus(hasPerms: boolean) {
  await browser.contextMenus.removeAll();

  // remove previous event listener
  if (isManifestv3()) {
    browser.contextMenus.onClicked.removeListener(contextClickListener);
  }

  // if any wallets are added, create
  // a "copy current address" context menu
  const wallets = await getWallets();
  const actionContext = isManifestv3() ? "action" : "browser_action";

  if (wallets.length > 0) {
    browser.contextMenus.create(
      {
        id: "copy_address_context_menu",
        title: "Copy current address",
        contexts: [actionContext],
        onclick: !isManifestv3() ? onCopyAddressClicked : undefined
      },
      () => browser.runtime.lastError
    );
  }

  // if the site has any perms,
  // display the disconnect
  // context menu
  if (hasPerms) {
    browser.contextMenus.create(
      {
        id: "disconnect_context_menu",
        title: "Disconnect from current site",
        contexts: [actionContext, "page"],
        onclick: !isManifestv3()
          ? (_, tab) => onDisconnectClicked(tab)
          : undefined
      },
      () => browser.runtime.lastError
    );
  }

  browser.contextMenus.create(
    {
      id: "archive_page_context_menu",
      title: "Archive this page",
      contexts: [actionContext, "page"],
      onclick: !isManifestv3()
        ? (_, tab) => onArchivePageClicked(tab)
        : undefined
    },
    () => browser.runtime.lastError
  );

  // if we are one manifest v3, we add an event
  // listener for context menu clicks
  if (isManifestv3() && (hasPerms || wallets.length > 0)) {
    browser.contextMenus.onClicked.addListener(contextClickListener);
  }
}

/**
 * Handle context menu click event for manifest v3
 */
async function contextClickListener(info: Menus.OnClickData, tab: Tabs.Tab) {
  try {
    switch (info.menuItemId) {
      case "disconnect_context_menu":
        await onDisconnectClicked(tab);
        break;

      case "copy_address_context_menu":
        await onCopyAddressClicked();
        break;

      case "archive_page_context_menu":
        await onArchivePageClicked(tab);
        break;
    }
  } catch {}
}

/**
 * Handle copy address click
 */
async function onCopyAddressClicked() {
  const activeAddress = await getActiveAddress();

  if (!activeAddress || activeAddress === "") return;

  const activeTab = await getActiveTab();

  await sendMessage(
    "copy_address",
    activeAddress,
    `content-script@${activeTab.id}`
  );
}

/**
 * Handle disconnect context menu click
 */
async function onDisconnectClicked(tab: Tabs.Tab) {
  if (!tab.url) return;

  // remove the app and reload the tab
  await removeApp(getAppURL(tab.url));
  await browser.tabs.reload(tab.id);
}

export async function injectSingleFileScripts(
  scripts: string[],
  world: "MAIN" | "ISOLATED",
  tabId: number
) {
  try {
    const files = scripts.map(
      (script) =>
        "/" +
        script
          .replace(/chrome-extension:\/\/[a-z]*\/([^?]*)\?.*/i, "$1")
          .replace("static/background/../../", "")
    );

    const results = await chrome.scripting.executeScript({
      target: { tabId },
      files,
      world
    });

    console.debug("SingleFile scripts injection successful:", results);
    return results;
  } catch (error) {
    console.error("Failed to inject SingleFile scripts:", error);
  }
}

/**
 * Handle archive page context menu click
 */
async function onArchivePageClicked(tab: Tabs.Tab) {
  if (!tab.url) return;
  await injectSingleFileScripts(
    [
      chromeBrowserPolyfill,
      singleFileFrames,
      singleFileExtensionFrames,
      singleFileBootstrap,
      singleFileExtensionCore
    ],
    "ISOLATED",
    tab.id
  );
  await injectSingleFileScripts([singleFileHooksFrames], "MAIN", tab.id);
  await browser.tabs.sendMessage(tab.id, {
    action: "archive-page",
    tabId: tab.id
  });
}
