import type { AuthMethod } from "~utils/authentication/fakeDB";
import { sleep } from "~utils/promises/sleep";

export interface AuthenticateData {
  userId: string;
}

// TODO: Store AuthenticateData as "session data"

async function refreshSession(): Promise<AuthenticateData | null> {
  await sleep(5000);

  if (DB.hasUser())
    // TODO: But wallets need to be re-fetched either way (this needs to send the device shad again)
    // so that we get the corresponding auth shard back.
    // return  ? mockedAuthenticateData : null;

    return null;
}

async function authenticate(
  authMethod: AuthMethod
): Promise<AuthenticateData | null> {
  await sleep(5000);

  mockedAuthenticateData.authMethod = authMethod;

  // TODO: Filter if shardHash matches

  return mockedAuthenticateData;
}

async function signOut(): Promise<void> {
  await sleep(5000);
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
