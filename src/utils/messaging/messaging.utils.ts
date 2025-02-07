import {
  onMessage as webExtBridgeOnMessage,
  sendMessage as webExtBridgeSendMessage,
  type IBridgeMessage,
  type ProtocolMap
} from "@arconnect/webext-bridge";
import { log, LOG_GROUP } from "~utils/log/log.utils";

export type MessageID = keyof ProtocolMap;

export interface MessageData<K extends MessageID> {
  messageId: K;
  tabId?: number;
  data: ProtocolMap[K];
}

const READY_MESSAGE_SUFFIX = "_ready" as const;

let messageCounter = 0;

/**
 * Send a message of `<messageId>` type to the specific `tabId` or background straight away. If that message fails
 * because no one is listening, listen for `<messageId>${ READY_MESSAGE_SUFFIX }` messages for 6 seconds, and try to send the message again
 * once that's received, or throw a time out error otherwise.
 */
export async function isomorphicSendMessage<K extends MessageID>({
  messageId,
  tabId,
  data
}: MessageData<K>) {
  // See the "Receive API calls" comment in `Wander/src/contents/api.ts` for more on message passing.

  const currentMessage = messageCounter++;

  const destination = tabId ? `web_accessible@${tabId}` : "background";

  async function sendMessage() {
    const result = await webExtBridgeSendMessage(
      messageId,
      data as any,
      destination
    );

    // check the result
    if (
      result &&
      typeof result === "object" &&
      result.hasOwnProperty("error")
    ) {
      throw new Error(
        result.hasOwnProperty("data")
          ? (result as any).data
          : "Unknown webExtBridge error."
      );
    }

    return result;
  }

  return new Promise(async (resolve, reject) => {
    let timeoutTimeoutID = 0;
    let retryIntervalID = 0;

    function resolveAndClearTimeouts(value: unknown) {
      clearTimeout(timeoutTimeoutID);
      clearInterval(retryIntervalID);

      resolve(value);
    }

    function rejectAndClearTimeouts(reason?: any) {
      clearTimeout(timeoutTimeoutID);
      clearInterval(retryIntervalID);

      reject(reason);
    }

    log(
      LOG_GROUP.MSG,
      `[${currentMessage}] Sending ${messageId} to ${destination}`
    );

    sendMessage()
      .then((result) => {
        log(LOG_GROUP.MSG, `[${currentMessage}] ${messageId} sent`);

        resolveAndClearTimeouts(result);
      })
      .catch((err) => {
        const errorMessage = `${err.message || ""}`;

        if (
          !/No handler registered in '.+' to accept messages with id '.+'/.test(
            errorMessage
          ) ||
          messageId.endsWith(READY_MESSAGE_SUFFIX)
        ) {
          log(LOG_GROUP.MSG, `[${currentMessage}] ${messageId} error =`, err);

          rejectAndClearTimeouts(err);

          return;
        }

        // The retry after ready logic below will NOT run if `messageId` already ends in `READY_MESSAGE_SUFFIX`:

        log(
          LOG_GROUP.MSG,
          `[${currentMessage}] Waiting for ${messageId}${READY_MESSAGE_SUFFIX}`
        );

        timeoutTimeoutID = setTimeout(() => {
          reject(
            new Error(
              `Timed out waiting for ${messageId}${READY_MESSAGE_SUFFIX} from ${destination}`
            )
          );
        }, 6000);

        // TODO: Implement retry in case the initial call to `sendMessage()` above fails and the "ready" event is never
        // received (e.g. popup opens, `sendMessage()` fails, background sends "ready" event, popup starts listening for
        // ready event).
        // retryIntervalID = setInterval(() => {}, 2000);

        async function handleTabReady({ sender }: IBridgeMessage<any>) {
          // validate sender by it's tabId
          if (sender.tabId !== tabId) {
            return;
          }

          log(
            LOG_GROUP.MSG,
            `[${currentMessage}] Sending ${messageId} to ${destination} again`
          );

          await sendMessage()
            .then((result) => {
              log(LOG_GROUP.MSG, `[${currentMessage}] ${messageId} resent`);

              resolveAndClearTimeouts(result);
            })
            .catch((err) => {
              log(
                LOG_GROUP.MSG,
                `[${currentMessage}] ${messageId} error again =`,
                err
              );

              rejectAndClearTimeouts(err);
            });
        }

        webExtBridgeOnMessage(
          `${messageId}${READY_MESSAGE_SUFFIX}`,
          handleTabReady as any
        );
      });
  });
}

export function isomorphicOnMessage<K extends MessageID>(
  messageID: K,
  callback: (
    message: Omit<IBridgeMessage<any>, "data"> & { data: ProtocolMap[K] }
  ) => void
): void {
  webExtBridgeOnMessage(messageID, callback as any);

  isomorphicSendMessage({
    messageId: `${messageID}${READY_MESSAGE_SUFFIX}` as any,
    data: null
  });
}
