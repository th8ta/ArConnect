import { Storage as PlasmoStorage } from "@plasmohq/storage";

export class StorageMock extends PlasmoStorage {
  constructor() {
    super({ area: "session" });
  }

  get primaryClient(): chrome.storage.StorageArea {
    throw new Error("Method not implemented.");
  }

  get secondaryClient(): Storage {
    throw new Error("Method not implemented.");
  }

  get area(): "session" | "sync" | "local" | "managed" {
    return "session";
  }

  get hasWebApi(): boolean {
    return true;
  }

  get hasExtensionApi(): boolean {
    return false;
  }

  get copiedKeySet(): Set<string> {
    throw new Error("Method not implemented.");
  }

  setCopiedKeySet(keyList: string[]): void {
    // Do nothing...
  }

  get allCopied(): boolean {
    throw new Error("Method not implemented.");
  }

  // GET:

  getItem<T = string>(key: string): Promise<T | undefined> {
    return Promise.resolve(JSON.parse(sessionStorage.getItem(key)));
  }

  getItems<T = string>(keys: string[]): Promise<Record<string, T | undefined>> {
    return Promise.resolve(
      keys.reduce((acc, key) => {
        acc[key] = JSON.parse(sessionStorage.getItem(key));

        return acc;
      }, {})
    );
  }

  get: <T = string>(key: string) => Promise<T | undefined> = this.getItem;
  getMany: <T = any>(keys: string[]) => Promise<Record<string, T | undefined>> =
    this.getItems;

  // SET:

  setItem(key: string, rawValue: any): Promise<void> {
    return new Promise((resolve) => {
      sessionStorage.setItem(key, JSON.stringify(rawValue));
      resolve();
    });
  }

  setItems(items: Record<string, any>): Promise<void> {
    return new Promise<void>((resolve) => {
      Object.entries(items).forEach(([key, value]) => {
        sessionStorage.setItem(key, JSON.stringify(value));
      });
      resolve();
    });
  }

  set: (key: string, rawValue: any) => Promise<null> = this.setItem as any;
  setMany: (items: Record<string, any>) => Promise<null> = this.setItems as any;

  // REMOVE  CLEAR

  removeItem(key: string): Promise<void> {
    return new Promise<void>(() => {
      sessionStorage.removeItem(key);
    });
  }

  removeItems(keys: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
      keys.forEach((key) => {
        sessionStorage.removeItem(key);
      });
      resolve();
    });
  }

  remove: (key: string) => Promise<void> = this.removeItem;
  removeMany: (keys: string[]) => Promise<void> = this.removeItems;

  removeAll: () => Promise<void> = () => {
    return new Promise<void>(() => {
      sessionStorage.clear();
    });
  };
}
