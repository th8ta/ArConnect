import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import {
  AuthenticationService,
  type AuthenticateData
} from "~utils/authentication/authentication.service";
import type { AuthMethod, DbWallet } from "~utils/authentication/fakeDB";
import { WalletsService } from "~utils/wallets/wallets.service";
import { WalletUtils } from "~utils/wallets/wallets.utils";

export type AuthStatus =
  | "unknown"
  | "authLoading"
  | "authError"
  | "noAuth"
  | "noWallets"
  | "noShard"
  // TODO: Do not mix auth loading with regular loading...
  | "loading"
  | "locked"
  | "unlocked";

interface AuthContextState {
  authStatus: AuthStatus;
  userId: null | string;
  wallets: DbWallet[];
}

interface AuthContextData extends AuthContextState {
  authenticate: (authMethod: AuthMethod) => Promise<void>;
}

const AUTH_CONTEXT_INITIAL_STATE: AuthContextState = {
  authStatus: "unknown",
  userId: null,
  wallets: []
};

export const AuthContext = createContext<AuthContextData>({
  ...AUTH_CONTEXT_INITIAL_STATE,
  authenticate: async () => null
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

  const initEmbeddedWallet = useCallback(async (authMethod?: AuthMethod) => {
    let authStatus = "noAuth" as AuthStatus;

    // TODO: Handle errors:

    const authentication = authMethod
      ? await AuthenticationService.authenticate(authMethod)
      : await AuthenticationService.refreshSession();

    if (!authentication.userId) {
      setAuthContextState({
        ...AUTH_CONTEXT_INITIAL_STATE,
        authStatus
      });

      return;
    }

    const wallets = await WalletsService.fetchWallets();

    if (wallets.length > 0) {
      const deviceNonce = WalletUtils.getDeviceNonce();
      const deviceShares = WalletUtils.getDeviceShares();

      if (deviceNonce && deviceShares.length > 0) {
        // TODO: The need to rotate might come in `wallets`, so this call below could already rotate the deviceNonce,
        // send the old value and also rotate the wallet if needed...

        // TODO: This step can be deferred until the wallet is going to be used...:
        // TODO: Do this sequentially for each available deviceShare until one works:
        const authShareResponse =
          await WalletsService.fetchFirstAvailableAuthShare({
            deviceNonce,
            deviceShares
          });

        if (authShareResponse) {
          if (authShareResponse.regenerateWallet) {
            let oldDeviceNonce = WalletUtils.getDeviceNonce();

            deviceNonce = WalletUtils.updateDeviceNonce();

            // TODO: We need the public key and/or address to validate it's fine:
            const newShares = WalletUtils.regenerateShares([
              authShare,
              deviceShares
            ]);

            // TODO: This wallet needs to be regenerated as well and the authShare updated. If this is not done after X
            // "warnings", the Shards entry will be removed anyway.
            await WalletsService.rotateDeviceShares({
              oldDeviceNonce,
              deviceNonce,
              newShares
            });
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
        authStatus: "authLoading"
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
        authenticate
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
