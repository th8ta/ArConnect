import type { Alarms } from "webextension-polyfill";
import { getDecryptionKey, removeDecryptionKey } from "~wallets/auth";

/**
 * Listener for the reconnect alarm
 */
export async function handleReconnectAlarm(alarm: Alarms.Alarm) {
  if (alarm.name !== "reconnect") return;

  // check if there is a decryption key
  const decryptionKey = await getDecryptionKey();
  if (!decryptionKey) return;

  // remove the decryption key
  await removeDecryptionKey();
}
