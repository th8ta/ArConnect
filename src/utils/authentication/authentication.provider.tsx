import type { JWKInterface } from "arweave/web/lib/wallet";
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
import { WalletService } from "~utils/wallets/wallets.service";
import { WalletUtils } from "~utils/wallets/wallets.utils";

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
  wallets: DbWallet[];
}

interface AuthContextData extends AuthContextState {
  authenticate: (authMethod: AuthMethod) => Promise<void>;
  addWallet: (jwk: JWKInterface) => void;
}

const AUTH_CONTEXT_INITIAL_STATE: AuthContextState = {
  authStatus: "unknown",
  authMethod: null,
  userId: null,
  wallets: []
};

export const AuthContext = createContext<AuthContextData>({
  ...AUTH_CONTEXT_INITIAL_STATE,
  authenticate: async () => null,
  addWallet: () => null
});

interface AuthProviderProps extends PropsWithChildren {}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authContextState, setAuthContextState] = useState<AuthContextState>(
    AUTH_CONTEXT_INITIAL_STATE
  );

  const { authStatus } = authContextState;

  useEffect(() => {
    if (authStatus !== "unknown") {
      const coverElement = document.getElementById("cover");

      coverElement.setAttribute("aria-hidden", "true");
    }
  }, [authStatus]);

  // TODO: Need to observe storage to keep track of new wallets, removed wallets or active wallet changes... Or just
  // migrate wallet management to Mobx altogether for both extensions...

  const addWallet = useCallback((jwk: JWKInterface) => {
    // TODO: Add wallet to ExtensionStorage, but make sure to:
    // - Remove/update alarm to NOT remove it.
    // - Rotate it with newly generated passwords?
    // - Storage in the embedded wallet must be temp (memory).
    // - Router should force users out the auth screens
    // - See if signing, etc. works.

    WalletUtils.storeEncryptedWalletJWK(jwk);

    const wallet: WalletInfo = {
      isActive: false, // TODO: Should be true if this is a new wallet...
      isReady: true
    };

    // Optimistically add wallet.
    // TODO: We could consider calling `initEmbeddedWallet` again instead, which will make sure the wallet has been
    // properly added to the backend as well.

    setAuthContextState(({ wallets: prevWallets }) => {
      const wallets = prevWallets;

      if (
        !wallets.find((prevWallet) => prevWallet.address === wallet.address)
      ) {
        wallets.push(wallet);
      }

      return {
        ...AUTH_CONTEXT_INITIAL_STATE,
        authStatus: "unlocked",
        wallets
      };
    });
  }, []);

  const initEmbeddedWallet = useCallback(async (authMethod?: AuthMethod) => {
    setAuthContextState({
      ...AUTH_CONTEXT_INITIAL_STATE,
      authStatus: "authLoading"
    });

    // TODO: Handle errors:

    const authentication = authMethod
      ? await AuthenticationService.authenticate(authMethod)
      : await AuthenticationService.refreshSession();

    if (!authentication.userId) {
      setAuthContextState({
        ...AUTH_CONTEXT_INITIAL_STATE,
        authStatus: "noAuth"
      });

      return;
    }

    const wallets = await WalletService.fetchWallets();

    let authStatus = "noAuth" as AuthStatus;

    if (wallets.length > 0) {
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

          addWallet(jwk);

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

    setAuthContextState({
      ...AUTH_CONTEXT_INITIAL_STATE,
      authStatus,
      wallets
    });
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

      setAuthContextState({
        ...AUTH_CONTEXT_INITIAL_STATE,
        authStatus: "authLoading",
        authMethod
      });

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
        addWallet
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
