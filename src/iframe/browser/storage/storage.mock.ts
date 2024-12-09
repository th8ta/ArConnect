import type { StorageChange } from "~utils/runtime";

export const storage = {
  local: {
    // TODO: Not needed once `browser.storage.local.get()` is replaced with
    // `ExtensionStorage.getAll()`

    get: (keys?: null | string | string[] | Record<string, any>) => {
      if (keys === undefined || keys === null) {
        return localStorage;
      }

      if (typeof keys === "string") {
        return localStorage.getItem(keys);
      }

      if (Array.isArray(keys)) {
        return keys.map((key) => localStorage.getItem(key));
      }

      if (typeof keys === "object") {
        return Object.entries(keys).map(
          ([key, defaultValue]) => localStorage.getItem(key) ?? defaultValue
        );
      }
    }
  },

  onChanged: {
    addListener: (
      callback: (
        changes: Record<string, StorageChange<any>>,
        areaName: string
      ) => void
    ) => {
      // Note from the docs (meaning, this is probably not working / not needed in ArConnect Embedded):
      //
      // Note: This won't work on the same browsing context that is making the changes — it is really a way for other
      // browsing contexts on the domain using the storage to sync any changes that are made. Browsing contexts on other
      // domains can't access the same storage objects.
      //
      // TODO: Check if this is an issue for the extension.
      // - If it is, find a solution.
      // - If it is not, maybe the mock is not needed at all and this can be excluded from background-setup.ts.

      window.addEventListener("storage", (event: StorageEvent) => {
        const changes: Record<string, StorageChange<any>> = {
          [event.key]: {
            newValue: event.newValue,
            oldValue: event.oldValue
          }
        };

        callback(changes, "local");
      });
    }
  }
};
