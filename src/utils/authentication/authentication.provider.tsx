import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren
} from "react";
import {
  AuthenticationService,
  type AuthenticateData
} from "~utils/authentication/authentication.service";

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

export type AuthMethod = "passkey" | "emailPassword" | "google";

export interface AuthWallet {
  alias: string;
  // description?: string;
  // tags?: string[];
  ans: any;
  pns: any;
  identifierType: "alias" | "ans" | "pns";
  status: "inactive" | "active" | "";
  address: string; // TODO: Depending on privacy setting?
  publicKey: string; // TODO: Depending on privacy setting?
  lost?: boolean; // TODO: Or some other kind of user-defined status in case they'd like to tag this somehow without deleting? Maybe also readonly?
}

export interface UserDetails {
  id: string;
}

interface AuthContextState {
  authStatus: AuthStatus;
  authMethod: null | AuthMethod;
  wallets: null | AuthWallet[];
  user: null | UserDetails;
}

interface AuthContextData extends AuthContextState {
  authenticate: (authMethod: AuthMethod) => Promise<AuthenticateData | null>;
}

const AUTH_CONTEXT_INITIAL_STATE: AuthContextState = {
  authStatus: "unknown",
  authMethod: null,
  wallets: null,
  user: null
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

  const updateAuthContextState = useCallback(
    (authenticateData: null | AuthenticateData) => {
      let authStatus = "noAuth" as AuthStatus;

      if (authenticateData) {
        if (authenticateData.wallets.length === 0) {
          authStatus = "noWallets";
        } else if (authenticateData.authShard === null) {
          authStatus = "noShard";
        }
      }

      setAuthContextState({
        ...authenticateData,
        authStatus
      });
    },
    []
  );

  useEffect(() => {
    async function initAuth() {
      // TODO: Handle error:
      const authenticateData = await AuthenticationService.refreshSession();

      updateAuthContextState(authenticateData);

      const coverElement = document.getElementById("cover");

      coverElement.setAttribute("aria-hidden", "true");
    }

    initAuth();
  }, [updateAuthContextState]);

  const authenticate = useCallback(
    async (authMethod: AuthMethod) => {
      // TODO: What to do if this is called while already authenticated?

      setAuthContextState({
        ...AUTH_CONTEXT_INITIAL_STATE,
        authStatus: "authLoading"
      });

      // TODO: Handle error:
      const authenticateResponse = await AuthenticationService.authenticate(
        authMethod
      );

      updateAuthContextState(authenticateResponse);

      return authenticateResponse;
    },
    [updateAuthContextState]
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
