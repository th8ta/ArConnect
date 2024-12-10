import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren
} from "react";
import { sleep } from "~utils/promises/sleep";

export type AuthStatus =
  | "authLoading"
  | "noAuth"
  | "noWallets"
  // | "noShard"
  | "loading"
  | "locked"
  | "unlocked";

export type AuthMethod = "passkey" | "emailPassword" | "google";

export interface AuthWallet {
  alias: string;
  ans: any;
  pns: any;
  identifierType: "alias" | "ans" | "pns";
  status: "inactive" | "active" | "";
  address: string; // TODO: Depending on privacy setting?
  publicKey: string; // TODO: Depending on privacy setting?
}

export interface UserDetails {
  id: string;
}

interface AuthContextState {
  authStatus: AuthStatus;
  authMethod: AuthMethod;
  wallets: AuthWallet;
  user: UserDetails;
}

interface AuthContextData extends AuthContextState {
  mockedAuthenticate: () => Promise<void>;
}

const AUTH_REQUESTS_CONTEXT_INITIAL_STATE: AuthContextState = {
  authStatus: "authLoading",
  user: null
};

export const AuthContext = createContext<AuthContextData>({
  ...AUTH_REQUESTS_CONTEXT_INITIAL_STATE,
  mockedAuthenticate: async () => {}
});

interface AuthProviderProps extends PropsWithChildren {}

export function AuthProvider({ children }: AuthProviderProps) {
  const [{ authStatus, user }, setAuthRequestContextState] =
    useState<AuthContextState>(AUTH_REQUESTS_CONTEXT_INITIAL_STATE);

  useEffect(() => {
    async function checkAuth() {
      await sleep(5000);

      const mockedAuthStatus = "noAuth" as AuthStatus;

      setAuthRequestContextState({
        authStatus: mockedAuthStatus,
        user: null
      });

      const coverElement = document.getElementById("cover");

      if (coverElement) {
        if (mockedAuthStatus === "authLoading") {
          coverElement.removeAttribute("aria-hidden");
        } else {
          coverElement.setAttribute("aria-hidden", "true");
        }
      }
    }

    checkAuth();
  }, []);

  const mockedAuthenticate = useCallback(() => {
    return Promise.resolve(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        user,
        mockedAuthenticate
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
