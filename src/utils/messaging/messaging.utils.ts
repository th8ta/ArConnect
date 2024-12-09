import {
  extensionIsomorphicOnMessage,
  extensionIsomorphicSendMessage
} from "~utils/messaging/strategies/extension/extension-messaging.strategy";
import {
  iframeIsomorphicOnMessage,
  iframeIsomorphicSendMessage
} from "~utils/messaging/strategies/iframe/iframe-messaging.strategy";

// sendMessage():

export const isomorphicSendMessage =
  process.env.PLASMO_PUBLIC_APP_TYPE === "iframe"
    ? (iframeIsomorphicSendMessage satisfies typeof extensionIsomorphicSendMessage)
    : (extensionIsomorphicSendMessage satisfies typeof iframeIsomorphicSendMessage);

// onMessage():

export const isomorphicOnMessage =
  process.env.PLASMO_PUBLIC_APP_TYPE === "iframe"
    ? (iframeIsomorphicOnMessage satisfies typeof extensionIsomorphicOnMessage)
    : (extensionIsomorphicOnMessage satisfies typeof iframeIsomorphicOnMessage);
