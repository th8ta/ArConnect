import type { JWKInterface } from "arweave/web/lib/wallet";
import { nanoid } from "nanoid";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { setupBackgroundService } from "~api/background/background-setup";
import { AuthenticationService } from "~utils/authentication/authentication.service";
import {
  MockedFeatureFlags,
  type AuthMethod,
  type DbWallet
} from "~utils/authentication/fakeDB";
import { ExtensionStorage } from "~utils/storage";
import { WalletService } from "~utils/wallets/wallets.service";
import { WalletUtils } from "~utils/wallets/wallets.utils";
import { getKeyfile, getWallets, type LocalWallet } from "~wallets";
import Arweave from "arweave";
import { defaultGateway } from "~gateways/gateway";
import { freeDecryptedWallet } from "~wallets/encryption";
import { downloadKeyfile as downloadKeyfileUtil } from "~utils/file";
import { sleep } from "~utils/promises/sleep";
import type {
  EmbeddedContextState,
  EmbeddedContextData,
  EmbeddedProviderProps,
  WalletInfo,
  TempWallet,
  AuthStatus,
  TempWalletPromise
} from "~utils/embedded/embedded.types";
import { isTempWalletPromiseExpired } from "~utils/embedded/embedded.utils";

const EMBEDDED_CONTEXT_INITIAL_STATE: EmbeddedContextState = {
  authStatus: "unknown",
  authMethod: null,
  userId: null,
  wallets: [],
  generatedTempWalletAddress: null,
  importedTempWalletAddress: null,
  lastRegisteredWallet: null,
  promptToBackUp: true,
  backedUp: false
};

export const EmbeddedContext = createContext<EmbeddedContextData>({
  ...EMBEDDED_CONTEXT_INITIAL_STATE,
  authenticate: async () => null,
  generateTempWallet: async () => null,
  deleteGeneratedTempWallet: async () => null,
  importTempWallet: async () => null,
  deleteImportedTempWallet: async () => null,
  registerWallet: async () => null,
  clearLastRegisteredWallet: () => null,
  activateWallet: () => null,
  skipBackUp: () => null,
  registerBackUp: async () => null,
  downloadKeyfile: async () => null,
  copySeedphrase: async () => null
});

export function EmbeddedProvider({ children }: EmbeddedProviderProps) {
  const [embeddedContextState, setEmbeddedContextState] =
    useState<EmbeddedContextState>(EMBEDDED_CONTEXT_INITIAL_STATE);

  const { authStatus, userId, wallets } = embeddedContextState;

  useEffect(() => {
    if (authStatus !== "unknown") {
      const coverElement = document.getElementById("cover");

      coverElement.setAttribute("aria-hidden", "true");
    }
  }, [authStatus]);

  /*
  const clearLastWallet = useCallback(() => {
    setEmbeddedContextState((prevAuthContextState) => ({
      ...prevAuthContextState,
      lastWallet: null
    }));
  }, []);

  const deleteLastWallet = useCallback(() => {
    // TODO: It also needs to be deleted from the backend.

    setEmbeddedContextState(
      ({
        authStatus,
        wallets: prevWallets,
        lastWallet,
        ...prevAuthContextState
      }) => {
        const wallets = prevWallets.filter(
          (wallet) => wallet.address !== lastWallet.address
        );

        return {
          ...prevAuthContextState,
          authStatus: wallets.length === 0 ? "noWallets" : authStatus,
          wallets,
          lastWallet: null
        };
      }
    );
  }, []);
  */

  const skipBackUp = useCallback(async (doNotAskAgain: boolean) => {
    // TODO: Persist lastPromptData (local?) and doNotAskAgain (server?)...

    if (doNotAskAgain) {
      await sleep(5000);
    }

    setEmbeddedContextState((prevAuthContextState) => ({
      ...prevAuthContextState,
      promptToBackUp: false
    }));
  }, []);

  const registerBackUp = useCallback(async () => {
    // TODO: Do we need to register this on the server? Here or on from the view itself?

    await sleep(5000);

    setEmbeddedContextState((prevAuthContextState) => ({
      ...prevAuthContextState,
      backedUp: true
    }));
  }, []);

  const downloadKeyfile = useCallback(async (walletAddress: string) => {
    // TODO: Add an option to encrypt with a password

    const decryptedWallet = (await getKeyfile(
      walletAddress
    )) as LocalWallet<JWKInterface>;

    downloadKeyfileUtil(walletAddress, decryptedWallet.keyfile);

    // TODO: Make sure we use `freeDecryptedWallet` all over the place in the new code for Embedded:
    freeDecryptedWallet(decryptedWallet.keyfile);
  }, []);

  const copySeedphrase = useCallback(async (walletAddress: string) => {
    const seedPhrase = WalletUtils.getDecryptedSeedPhrase(
      walletAddress,
      {} as any
    );

    await navigator.clipboard.writeText(seedPhrase);
  }, []);

  // TODO: Need to observe storage to keep track of new wallets, removed wallets or active wallet changes... Or just
  // migrate wallet management to Mobx altogether for both extensions...

  const addWallet = useCallback(
    async (jwk: JWKInterface, dbWallet: DbWallet, isNewWallet = false) => {
      // TODO: Add wallet to ExtensionStorage, but make sure to:
      // - Remove/update alarm to NOT remove it.
      // - Rotate it with newly generated passwords?
      // - Storage in the embedded wallet must be temp (memory).
      // - Router should force users out the auth screens
      // - See if signing, etc. works.

      await WalletUtils.storeEncryptedWalletJWK(jwk);

      freeDecryptedWallet(jwk);

      console.log("WALLET ADDED =", await getWallets());

      // Optimistically add wallet.
      // TODO: We could consider calling `initEmbeddedWallet` again instead, which will make sure the wallet has been
      // properly added to the backend as well.

      setEmbeddedContextState(({ wallets: prevWallets }) => {
        const nextWallets = [...prevWallets];

        if (
          !nextWallets.find(
            (prevWallet) => prevWallet.address === dbWallet.address
          )
        ) {
          nextWallets.push({
            ...dbWallet,
            isActive: false,
            isReady: true
          } satisfies WalletInfo);
        }

        return {
          ...EMBEDDED_CONTEXT_INITIAL_STATE,
          authStatus: "unlocked",
          wallets: nextWallets,
          lastRegisteredWallet: isNewWallet ? dbWallet : null
        };
      });
    },
    [userId]
  );

  // GENERATE WALLET:

  const generatedTempWalletPromiseRef = useRef<null | TempWalletPromise>(null);

  const deleteGeneratedTempWallet = useCallback(async () => {
    setEmbeddedContextState((prevAuthContextState) => ({
      ...prevAuthContextState,
      generatedTempWalletAddress: null
    }));

    const generatedTempWalletPromise = generatedTempWalletPromiseRef.current;

    if (generatedTempWalletPromise) {
      generatedTempWalletPromise.controller.abort();

      const tempWallet = await Promise.race([
        generatedTempWalletPromise.promise,
        sleep(1)
      ]);

      if (tempWallet) {
        console.log("Cleaned up...");

        freeDecryptedWallet(tempWallet.jwk);
      }
    }

    generatedTempWalletPromiseRef.current = null;
  }, []);

  const generateTempWallet = useCallback(() => {
    const generatedTempWalletPromise = generatedTempWalletPromiseRef.current;

    if (
      generatedTempWalletPromise &&
      !isTempWalletPromiseExpired(generatedTempWalletPromise)
    ) {
      return generatedTempWalletPromise.promise;
    }

    deleteGeneratedTempWallet();

    console.log("generateTempWallet()");

    const controller = new AbortController();
    const { signal } = controller;

    const promise: Promise<TempWallet> = new Promise(
      async (resolve, reject) => {
        signal.addEventListener("abort", reject);

        const seedPhrase = await WalletUtils.generateSeedPhrase();
        const jwk = await WalletUtils.generateWalletJWK(seedPhrase);
        const arweave = new Arweave(defaultGateway);
        const walletAddress = await arweave.wallets.jwkToAddress(jwk);

        setEmbeddedContextState((prevAuthContextState) => ({
          ...prevAuthContextState,
          generatedTempWalletAddress: walletAddress
        }));

        resolve({
          seedPhrase,
          jwk,
          walletAddress
        });

        signal.removeEventListener("abort", reject);
      }
    );

    generatedTempWalletPromiseRef.current = {
      createdAt: Date.now(),
      promise,
      controller
    };

    return promise;
  }, []);

  // IMPORT WALLET:

  const importedTempWalletPromiseRef = useRef<null | TempWalletPromise>();

  // This function is called in the import views when users don't confirm the import or when they leave the screen:

  const deleteImportedTempWallet = useCallback(async () => {
    console.log("deleteImportedTempWallet");

    setEmbeddedContextState((prevAuthContextState) => ({
      ...prevAuthContextState,
      importedTempWalletAddress: null
    }));

    const importedTempWalletPromise = importedTempWalletPromiseRef.current;

    if (importedTempWalletPromise) {
      importedTempWalletPromise.controller.abort();

      const tempWallet = await Promise.race([
        importedTempWalletPromise.promise,
        sleep(1)
      ]);

      if (tempWallet) {
        console.log("Cleaned up...");

        freeDecryptedWallet(tempWallet.jwk);
      }
    }

    importedTempWalletPromiseRef.current = null;
  }, []);

  const importTempWallet = useCallback(
    async (jwkOrSeedPhrase: JWKInterface | string) => {
      await deleteImportedTempWallet();

      console.log("importTempWallet()", jwkOrSeedPhrase);

      const controller = new AbortController();
      const { signal } = controller;

      const promise: Promise<TempWallet> = new Promise(
        async (resolve, reject) => {
          signal.addEventListener("abort", reject);

          const importedSeedPhrase: string | null =
            typeof jwkOrSeedPhrase === "string" ? jwkOrSeedPhrase : null;
          const importedJWK: JWKInterface | null =
            typeof jwkOrSeedPhrase === "string" ? null : jwkOrSeedPhrase;
          const jwk =
            importedJWK ||
            (await WalletUtils.generateWalletJWK(importedSeedPhrase));
          const arweave = new Arweave(defaultGateway);
          const walletAddress = await arweave.wallets.jwkToAddress(jwk);

          setEmbeddedContextState((prevAuthContextState) => ({
            ...prevAuthContextState,
            importedTempWalletAddress: walletAddress
          }));

          resolve({
            seedPhrase: importedSeedPhrase,
            jwk,
            walletAddress
          });

          signal.removeEventListener("abort", reject);
        }
      );

      importedTempWalletPromiseRef.current = {
        createdAt: Date.now(),
        promise,
        controller
      };

      return promise;
    },
    []
  );

  // REGISTER WALLET:

  const registerWallet = useCallback(
    async (sourceType: "generated" | "imported") => {
      console.log(`registerWallet(${sourceType})`);

      const promise =
        sourceType === "generated"
          ? generatedTempWalletPromiseRef.current?.promise
          : importedTempWalletPromiseRef.current?.promise;

      const { seedPhrase, jwk, walletAddress } = await promise;

      console.log(`seedPhrase = ${seedPhrase}`);

      const { authShare, deviceShare } =
        await WalletUtils.generateWalletWorkShares(jwk);

      const deviceShareHash = await WalletUtils.generateShareHash(deviceShare);

      const deviceNonce =
        WalletUtils.getDeviceNonce() || WalletUtils.generateDeviceNonce();

      const dbWallet = await WalletService.createWallet({
        address: walletAddress,
        publicKey: jwk.n,
        walletType: "public",
        deviceNonce,
        authShare,
        deviceShareHash,
        canBeUsedToRecoverAccount: true, // TODO: What should be the default here?

        source: {
          type: sourceType,
          from: seedPhrase ? "seedPhrase" : "keyFile"
        }
      });

      WalletUtils.storeDeviceNonce(deviceNonce);
      WalletUtils.storeDeviceShare(deviceShare, walletAddress);

      // TODO: This flag must be checked on launch and the stored seedphrase should be removed if the flag becomes false.
      if (seedPhrase && MockedFeatureFlags.maintainSeedPhrase) {
        WalletUtils.storeEncryptedSeedPhrase(walletAddress, seedPhrase, jwk);
      }

      try {
        await addWallet(jwk, dbWallet, true);
      } finally {
        freeDecryptedWallet(jwk);
      }

      return dbWallet;
    },
    []
  );

  const clearLastRegisteredWallet = useCallback(() => {
    setEmbeddedContextState((prevAuthContextState) => ({
      ...prevAuthContextState,
      lastRegisteredWallet: null
    }));
  }, []);

  const activateWallet = useCallback(
    (jwk: JWKInterface) => {
      // TODO: Add wallet to ExtensionStorage, but make sure to:
      // - Remove/update alarm to NOT remove it.
      // - Rotate it with newly generated passwords?
      // - Storage in the embedded wallet must be temp (memory).
      // - Router should force users out the auth screens
      // - See if signing, etc. works.

      WalletUtils.storeEncryptedWalletJWK(jwk);

      if (!wallets.find((prevWallet) => prevWallet.publicKey === jwk.n)) {
        throw new Error(
          "The wallet you are trying to active could not be found"
        );
      }
    },
    [wallets]
  );

  const initEmbeddedWallet = useCallback(async (authMethod?: AuthMethod) => {
    setEmbeddedContextState({
      ...EMBEDDED_CONTEXT_INITIAL_STATE,
      authStatus: "authLoading",
      authMethod
    });

    // TODO: Handle errors:
    const authentication = authMethod
      ? await AuthenticationService.authenticate(authMethod)
      : await AuthenticationService.refreshSession();

    if (!authentication?.userId) {
      generateTempWallet();

      setEmbeddedContextState((prevAuthContextState) => ({
        ...prevAuthContextState,
        authStatus: "noAuth"
      }));

      return;
    }

    const dbWallets = await WalletService.fetchWallets();

    const wallets = dbWallets.map(
      (dbWallet) =>
        ({
          ...dbWallet,
          isActive: false,
          isReady: false
        } satisfies WalletInfo)
    );

    setEmbeddedContextState((prevAuthContextState) => ({
      ...prevAuthContextState,
      wallets
    }));

    let authStatus = "noAuth" as AuthStatus;

    if (dbWallets.length > 0) {
      // TODO: TODO: We need to keep track of the last used one, not the last created one:
      const deviceSharesInfo = WalletUtils.getDeviceSharesInfo();

      let deviceNonce = WalletUtils.getDeviceNonce();

      if (deviceNonce && deviceSharesInfo.length > 0) {
        // TODO: The need to rotate might come in `wallets`, so this call below could already rotate the deviceNonce,
        // send the old value and also rotate the wallet if needed...

        // TODO: This step can be deferred until the wallet is going to be used...:
        // TODO: Do this sequentially for each available deviceShare until one works:
        const authShareResponse =
          await WalletService.fetchFirstAvailableAuthShare({
            deviceNonce,
            deviceSharesInfo
          });

        if (authShareResponse) {
          const { authShare, walletAddress, rotateChallenge } =
            authShareResponse;

          let { deviceShare } = authShareResponse;

          const jwk = await WalletUtils.generateWalletJWKFromShares(
            walletAddress,
            [authShare, deviceShare]
          );

          if (rotateChallenge) {
            const oldDeviceNonce = deviceNonce;
            const newDeviceNonce = WalletUtils.generateDeviceNonce();

            const { authShare: newAuthShare, deviceShare: newDeviceShare } =
              await WalletUtils.generateWalletWorkShares(jwk);

            const challengeSignature =
              await WalletUtils.generateChallengeSignature(
                rotateChallenge,
                jwk
              );

            // TODO: This wallet needs to be regenerated as well and the authShare updated. If this is not done after X
            // "warnings", the Shards entry will be removed anyway.
            await WalletService.rotateAuthShare({
              walletAddress,
              oldDeviceNonce,
              newDeviceNonce,
              authShare: newAuthShare,
              challengeSignature
            });

            deviceNonce = newDeviceNonce;
            deviceShare = newDeviceShare;
          }

          WalletUtils.storeDeviceNonce(deviceNonce);
          WalletUtils.storeDeviceShare(deviceShare, walletAddress);

          const dbWallet = dbWallets.find((dbWallet) => {
            return dbWallet.address === walletAddress;
          });

          try {
            await addWallet(jwk, dbWallet);
          } finally {
            freeDecryptedWallet(jwk);
          }

          // TODO: Rebuild pk, generate random password, store encrypted in storage.

          authStatus = "unlocked";
        } else {
          authStatus = "noShares";
        }
      } else {
        authStatus = "noShares";
      }
    } else {
      authStatus = "noWallets";
    }

    setEmbeddedContextState((prevAuthContextState) => ({
      ...prevAuthContextState,
      authStatus
    }));
  }, []);

  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;

    isInitializedRef.current = true;

    async function init() {
      // TODO: Relocate this reset and handle storage better:

      try {
        // We want to use `ExtensionStorage` as in-memory storage, but even setting it as "session", it's not a properly
        // implemented "any storage" abstraction:
        await ExtensionStorage.clear(true);

        // ExtensionStorage.clear() seems to leave behind ao_tokens, gateways, setting_currency, setting_display_theme and wallets...
        localStorage.clear();
      } catch (err) {
        console.warn("Error clearing ExtensionStorage");

        // At this point, there might already be valid data in `localStorage` (e.g. gateways) so we cannot simply do
        // `localStorage.clear()`, unfortunately. For that, this reset needs to be moved to the (background) setup script.
        localStorage.removeItem("wallets");
        localStorage.removeItem("active_address");
      }

      console.log("Initializing ArConnect Embedded background services...");
      setupBackgroundService();

      console.log("Initializing ArConnect Embedded wallets...");
      initEmbeddedWallet();
    }

    init();
  }, [initEmbeddedWallet]);

  const authenticate = useCallback(
    async (authMethod: AuthMethod) => {
      // TODO: What to do if this is called while already authenticated?

      // TODO: Handle errors:
      await initEmbeddedWallet(authMethod);
    },
    [initEmbeddedWallet]
  );

  return (
    <EmbeddedContext.Provider
      value={{
        ...embeddedContextState,
        authenticate,
        generateTempWallet,
        deleteGeneratedTempWallet,
        importTempWallet,
        deleteImportedTempWallet,
        registerWallet,
        clearLastRegisteredWallet,
        activateWallet,
        skipBackUp,
        registerBackUp,
        downloadKeyfile,
        copySeedphrase
      }}
    >
      {children}
    </EmbeddedContext.Provider>
  );
}
