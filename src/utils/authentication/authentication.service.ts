import type {
  AuthMethod,
  AuthWallet,
  UserDetails
} from "~utils/authentication/authentication.provider";
import { sleep } from "~utils/promises/sleep";

export interface AuthenticateData {
  authMethod: null | AuthMethod;
  authShard: null | string;
  wallets: null | AuthWallet[];
  user: null | UserDetails;
}

const mockedAuthenticateData: AuthenticateData = {
  authMethod: "passkey",
  authShard: null,
  wallets: [],
  user: { id: "USER-1" }
};

async function refreshSession(): Promise<AuthenticateData | null> {
  await sleep(5000);

  return localStorage.getItem("alreadyAuth") ? mockedAuthenticateData : null;
}

async function authenticate(
  authMethod: AuthMethod
): Promise<AuthenticateData | null> {
  await sleep(5000);

  localStorage.setItem("alreadyAuth", "true");

  mockedAuthenticateData.authMethod = authMethod;

  return mockedAuthenticateData;
}

async function signOut(): Promise<void> {
  await sleep(5000);

  localStorage.removeItem("alreadyAuth");
}

export const AuthenticationService = {
  refreshSession,
  authenticate,
  signOut
} as const;
