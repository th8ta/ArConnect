import {
  FakeDB,
  type AuthMethod,
  type DbAuthenticateData,
  type DbUser
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

async function fetchWalletRecoveryChallenge(
  walletAddress: string
): Promise<string> {
  return FakeDB.fetchWalletRecoveryChallenge(walletAddress);
}

async function fetchRecoverableAccounts(
  walletAddress: string,
  challengeSignature: string
): Promise<DbUser[]> {
  return FakeDB.fetchRecoverableAccounts(walletAddress, challengeSignature);
}

async function fetchAccountRecoveryChallenge(
  userId: string,
  walletAddress: string
): Promise<string> {
  return FakeDB.fetchAccountRecoveryChallenge(userId, walletAddress);
}

async function recoverAccount(
  authMethod: AuthMethod,
  userId: string,
  walletAddress: string,
  challengeSignature: string
): Promise<DbAuthenticateData> {
  return FakeDB.recoverAccount(
    authMethod,
    userId,
    walletAddress,
    challengeSignature
  );
}

export const AuthenticationService = {
  refreshSession,
  authenticate,
  signOut,
  fetchWalletRecoveryChallenge,
  fetchRecoverableAccounts,
  fetchAccountRecoveryChallenge,
  recoverAccount
} as const;
