import type { ApiCall, ApiResponse, Event } from "shim";
import type { InjectedEvents } from "~utils/events";
import { nanoid } from "nanoid";
import { foregroundModules } from "~api/foreground/foreground-modules";
import mitt from "mitt";
import { log, LOG_GROUP } from "~utils/log/log.utils";
import { version } from "../../../package.json";

export function setupWalletSDK(targetWindow: Window = window) {
  log(LOG_GROUP.SETUP, "setupWalletSDK()");

  /** Init events */
  const events = mitt<InjectedEvents>();

  /** Init wallet API */
  const WalletAPI: Record<string, any> = {
    walletName: "ArConnect",
    walletVersion: version,
    events
  };

  /** Inject each module */
  for (const mod of foregroundModules) {
    /** Handle foreground module and forward the result to the background */
    WalletAPI[mod.functionName] = (...params: any[]) =>
      new Promise<any>(async (resolve, reject) => {
        // execute foreground module
        // TODO: Use a default function for those that do not have/need one and see if chunking can be done automatically or if it is needed at all:
        const foregroundResult = await mod.function(...params);

        // construct data to send to the background
        const callID = nanoid();
        const data: ApiCall & { ext: "wander" } = {
          type: `api_${mod.functionName}`,
          ext: "wander",
          callID,
          data: {
            params: foregroundResult || params
          }
        };

        // TODO: Replace `postMessage` with `isomorphicSendMessage`, which should be updated to handle
        // chunking automatically based on data size, rather than relying on `sendChunk` to be called from
        // the foreground scripts manually.

        // Send message to background script (Wander Extension) or to the iframe window (Wander Embedded):
        targetWindow.postMessage(data, window.location.origin);

        // TODO: Note this is replacing the following from `api.content-script.ts`, so the logic to await and get the response is missing with just the
        // one-line change above.
        //
        // const res = await sendMessage(
        //   data.type === "chunk" ? "chunk" : "api_call",
        //   data,
        //   "background"
        // );
        //
        // window.postMessage(res, window.location.origin);

        // wait for result from background
        window.addEventListener("message", callback);

        // TODO: Declare outside (factory) to facilitate testing?
        async function callback(e: MessageEvent<ApiResponse>) {
          // TODO: Make sure the response comes from targetWindow.
          // See https://stackoverflow.com/questions/16266474/javascript-listen-for-postmessage-events-from-specific-iframe.

          let { data: res } = e;

          // validate return message
          if (`${data.type}_result` !== res.type) return;

          // only resolve when the result matching our callID is deleivered
          if (data.callID !== res.callID) return;

          window.removeEventListener("message", callback);

          // check for errors
          if (res.error) {
            return reject(res.data);
          }

          // call the finalizer function if it exists
          if (mod.finalizer) {
            const finalizerResult = await mod.finalizer(
              res.data,
              foregroundResult,
              params
            );

            // if the finalizer transforms data
            // update the result
            if (finalizerResult) {
              res.data = finalizerResult;
            }
          }

          // check for errors after the finalizer
          if (res.error) {
            return reject(res.data);
          }

          // resolve promise
          return resolve(res.data);
        }
      });
  }

  // @ts-expect-error
  window.arweaveWallet = WalletAPI;

  // at the end of the injected script,
  // we dispatch the wallet loaded event
  dispatchEvent(new CustomEvent("arweaveWalletLoaded", { detail: {} }));

  // send wallet loaded event again if page loaded
  window.addEventListener("load", () => {
    if (!window.arweaveWallet) return;
    dispatchEvent(new CustomEvent("arweaveWalletLoaded", { detail: {} }));
  });

  // TODO: Remove it before to make sure there's no duplicate listener?

  /** Handle events */
  window.addEventListener(
    "message",
    (
      e: MessageEvent<{
        type: "wander_event";
        event: Event;
      }>
    ) => {
      if (e.data.type !== "wander_event") return;

      events.emit(e.data.event.name, e.data.event.value);
    }
  );
}
