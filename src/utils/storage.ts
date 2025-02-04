import type Transaction from "arweave/web/lib/transaction";
import { type Gateway } from "~gateways/gateway";
import { Storage } from "@plasmohq/storage";
import { useStorage as usePlasmoStorage } from "@plasmohq/storage/hook";
import { useMemo } from "react";

/**
 * Default extension storage:
 * - In the BE version, values are NOT copied to `localStorage`.
 * - In the Embedded version, values are copied to `localStorage` (NOT memory), and are not cleared automatically
 *   despite using `area: "session"`.
 */
export const ExtensionStorage =
  import.meta.env?.VITE_IS_EMBEDDED_APP === "1"
    ? new Storage({
        area: "session",
        allCopied: true
      })
    : new Storage({
        area: "local"
      });

/**
 * Temporary storage for submitted transfers, with values
 * that are NOT copied to window.sessionStorage
 */
export const TempTransactionStorage = new Storage({
  area: "session"
  // This copies the data to localStorage, NOT to sessionStorage:
  // allCopied: true,
});

/**
 * Session storage raw transfer tx. This will
 * be signed, submitted and removed after
 * authentication.
 */
export const TRANSFER_TX_STORAGE = "last_transfer_tx";

/**
 * Name of old Wander versions' storage.
 */
export const OLD_STORAGE_NAME = "persist:root";

/**
 * Raw transfer tx stored in the session storage
 */
export interface RawStoredTransfer {
  type: "native" | "token";
  gateway: Gateway;
  transaction: ReturnType<Transaction["toJSON"]>;
}

export const useStorage: typeof usePlasmoStorage =
  import.meta.env?.VITE_IS_EMBEDDED_APP === "1"
    ? (((rawKey, onInit) => {
        const [value, ...otherReturnValues] = usePlasmoStorage(rawKey, onInit);

        const returnValue = useMemo(() => {
          return typeof onInit === "function" ? onInit(value) : value ?? onInit;
        }, [value]);

        if (returnValue === null) debugger;

        return [returnValue, ...otherReturnValues];
      }) as any)
    : usePlasmoStorage;
