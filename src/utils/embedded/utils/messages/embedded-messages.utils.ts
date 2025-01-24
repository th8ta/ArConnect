import { nanoid } from "nanoid";
import { EMBEDDED_PARENT_ORIGIN } from "~utils/embedded/sdk/utils/url/sdk-url.utils";
import type {
  EmbeddedCall,
  EmbeddedMessageId,
  EmbeddedMessageMap
} from "~utils/embedded/utils/messages/embedded-messages.types";

export interface PostEmbeddedMessageData<K extends EmbeddedMessageId> {
  type: K;
  data: EmbeddedMessageMap[K];
}

export function postEmbeddedMessage<K extends EmbeddedMessageId>({
  type,
  data
}: PostEmbeddedMessageData<K>) {
  if (!type.startsWith("embedded_"))
    throw new Error(
      `Only "embedded_auth", "embedded_balance", "embedded_resize" or "embedded_data" can be posted to the upper frame.`
    );

  const parent = window.parent;

  if (parent === null) {
    throw new Error("Unexpected `null` parent Window.");
  }

  const call: EmbeddedCall<K> = {
    id: nanoid(),
    type,
    data
  };

  if (parent === window) {
    console.warn(
      "ArConnect Embedded running as a standalone page. There's no parent Window to send this to =",
      call
    );

    return;
  }

  parent.postMessage(call, EMBEDDED_PARENT_ORIGIN);
}
