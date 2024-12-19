import {
  FakeDB,
  type AuthMethod,
  type DbAuthenticateData
} from "~utils/authentication/fakeDB";

async function refreshSession(): Promise<DbAuthenticateData | null> {
  return FakeDB.refreshSession();
}

async function authenticate(
  authMethod: AuthMethod
): Promise<DbAuthenticateData | null> {
  return FakeDB.authenticate(authMethod);
}

async function signOut(): Promise<void> {
  // TODO
}

async function recoverAccount(): Promise<void> {
  // TODO
}

export const AuthenticationService = {
  refreshSession,
  authenticate,
  signOut,
  recoverAccount
} as const;
