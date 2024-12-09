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
  | "loading"
  | "locked"
  | "unlocked";

export interface UserDetails {
  username: string;
}

interface AuthContextState {
  authStatus: AuthStatus;
  user: UserDetails;
}

interface AuthContextData extends AuthContextState {
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AUTH_REQUESTS_CONTEXT_INITIAL_STATE: AuthContextState = {
  authStatus: "authLoading",
  user: null
};

export const AuthContext = createContext<AuthContextData>({
  ...AUTH_REQUESTS_CONTEXT_INITIAL_STATE,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {}
});

interface AuthProviderProps extends PropsWithChildren {}

export function AuthProvider({ children }: AuthProviderProps) {
  const [{ authStatus, user }, setAuthRequestContextState] =
    useState<AuthContextState>(AUTH_REQUESTS_CONTEXT_INITIAL_STATE);

  useEffect(() => {
    async function checkAuth() {
      await sleep(5000);

      const mockedAuthStatus = "unlocked" as AuthStatus;

      setAuthRequestContextState({
        authStatus: mockedAuthStatus,
        user: { username: "@mocked-user" }
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

  const signIn = useCallback(() => {
    return Promise.resolve(null);
  }, []);

  const signUp = useCallback(() => {
    return Promise.resolve(null);
  }, []);

  const signOut = useCallback(() => {
    return Promise.resolve(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        user,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
