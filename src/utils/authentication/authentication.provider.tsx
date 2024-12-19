import type { JWKInterface } from "arweave/web/lib/wallet";
import { nanoid } from "nanoid";
import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import { AuthenticationService } from "~utils/authentication/authentication.service";
import type { AuthMethod, DbWallet } from "~utils/authentication/fakeDB";
import { ExtensionStorage } from "~utils/storage";
import { WalletService } from "~utils/wallets/wallets.service";
import { WalletUtils } from "~utils/wallets/wallets.utils";
import { getWallets } from "~wallets";

export type AuthStatus =
  | "unknown"
  | "authLoading"
  | "authError"
  | "noAuth"
  | "noWallets"
  | "noShares"
  // TODO: Do not mix auth loading with regular loading...
  | "loading"
  | "locked"
  | "unlocked";

interface WalletInfo extends DbWallet {
  isActive: boolean;
  isReady: boolean;
}

interface AuthContextState {
  authStatus: AuthStatus;
  authMethod: null | AuthMethod;
  userId: null | string;
  wallets: WalletInfo[];
  promptToBackUp: boolean;
  backedUp: boolean;
}

interface AuthContextData extends AuthContextState {
  authenticate: (authMethod: AuthMethod) => Promise<void>;
  addWallet: (jwk: JWKInterface, dbWallet: DbWallet) => Promise<void>;
  activateWallet: (jwk: JWKInterface) => void;
  skipBackUp: (doNotAskAgain: boolean) => void;
  registerBackUp: () => Promise<void>;
}

const AUTH_CONTEXT_INITIAL_STATE: AuthContextState = {
  authStatus: "unknown",
  authMethod: null,
  userId: null,
  wallets: [],
  promptToBackUp: true,
  backedUp: false
};

export const AuthContext = createContext<AuthContextData>({
  ...AUTH_CONTEXT_INITIAL_STATE,
  authenticate: async () => null,
  addWallet: async () => null,
  activateWallet: () => null,
  skipBackUp: () => null,
  registerBackUp: async () => null
});

interface AuthProviderProps extends PropsWithChildren {}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authContextState, setAuthContextState] = useState<AuthContextState>(
    AUTH_CONTEXT_INITIAL_STATE
  );

  const { authStatus, userId, wallets } = authContextState;

  useEffect(() => {
    if (authStatus !== "unknown") {
      const coverElement = document.getElementById("cover");

      coverElement.setAttribute("aria-hidden", "true");
    }
  }, [authStatus]);

  const skipBackUp = useCallback((doNotAskAgain: boolean) => {
    // TODO: Persist lastPromptData (local?) and doNotAskAgain (server?)...

    setAuthContextState((prevAuthContextState) => ({
      ...prevAuthContextState,
      promptToBackUp: false
    }));
  }, []);

  const registerBackUp = useCallback(async () => {
    // TODO: Do we need to register this on the server? Here or on from the view itself?

    setAuthContextState((prevAuthContextState) => ({
      ...prevAuthContextState,
      backedUp: true
    }));
  }, []);

  // TODO: Need to observe storage to keep track of new wallets, removed wallets or active wallet changes... Or just
  // migrate wallet management to Mobx altogether for both extensions...

  const addWallet = useCallback(
    async (jwk: JWKInterface, dbWallet: DbWallet) => {
      // TODO: Add wallet to ExtensionStorage, but make sure to:
      // - Remove/update alarm to NOT remove it.
      // - Rotate it with newly generated passwords?
      // - Storage in the embedded wallet must be temp (memory).
      // - Router should force users out the auth screens
      // - See if signing, etc. works.

      await WalletUtils.storeEncryptedWalletJWK(jwk);

      console.log("WALLET ADDED =", await getWallets());

      // Optimistically add wallet.
      // TODO: We could consider calling `initEmbeddedWallet` again instead, which will make sure the wallet has been
      // properly added to the backend as well.

      setAuthContextState(({ wallets: prevWallets }) => {
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
          ...AUTH_CONTEXT_INITIAL_STATE,
          authStatus: "unlocked",
          wallets: nextWallets
        };
      });
    },
    [userId]
  );

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
    setAuthContextState({
      ...AUTH_CONTEXT_INITIAL_STATE,
      authStatus: "authLoading",
      authMethod
    });

    // TODO: Relocate this reset and handle storage better:

    try {
      // We want to use `ExtensionStorage` as in-memory storage, but even setting it as "session", it's not a properly
      // implemented "any storage" abstraction:
      await ExtensionStorage.clear(true);
    } catch (err) {
      console.warn("Error clearing ExtensionStorage");

      // At this point, there might already be valid data in `localStorage` (e.g. gateways) so we cannot simply do
      // `localStorage.clear()`, unfortunately. For that, this reset needs to be moved to the (background) setup script.
      localStorage.removeItem("wallets");
      localStorage.removeItem("active_address");
    }

    // TODO: Handle errors:
    const authentication = authMethod
      ? await AuthenticationService.authenticate(authMethod)
      : await AuthenticationService.refreshSession();

    if (!authentication?.userId) {
      setAuthContextState((prevAuthContextState) => ({
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

    setAuthContextState((prevAuthContextState) => ({
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

          // TODO: Better to update the backend to return the Wallet object and pass it here, instead of the jwk:
          await addWallet(jwk, dbWallet);

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

    setAuthContextState((prevAuthContextState) => ({
      ...prevAuthContextState,
      authStatus
    }));
  }, []);

  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;

    isInitializedRef.current = true;

    initEmbeddedWallet();
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
    <AuthContext.Provider
      value={{
        ...authContextState,
        authenticate,
        addWallet,
        activateWallet,
        skipBackUp,
        registerBackUp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
