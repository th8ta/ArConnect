import { Mutex } from "~utils/mutex";
import browser from "webextension-polyfill";
import { keepConnectionUrls } from "./connection.constants";
import { getActiveTab } from "~applications";

let keepAliveInterval: number | null = null;
const mutex = new Mutex();

/**
 * Function to send periodic keep-alive messages for specific urls
 */
export async function keepConnectionAlive() {
  const unlock = await mutex.lock();

  const activeTab = await getActiveTab();
  const foundUrl = keepConnectionUrls.find((keepUrl: string) =>
    activeTab.url.includes(keepUrl)
  );

  try {
    if (!keepAliveInterval && foundUrl) {
      keepAliveInterval = setInterval(
        () => browser.alarms.create("keep-alive", { when: Date.now() + 1 }),
        20000
      );
    }
  } finally {
    unlock();
  }
}
