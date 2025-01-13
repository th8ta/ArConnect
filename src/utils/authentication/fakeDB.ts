import { nanoid } from "nanoid";
import { sleep } from "~utils/promises/sleep";
import type { CreateWalletParams } from "~utils/wallets/wallets.service";
import type { DeviceNonce } from "~utils/wallets/wallets.utils";
import Arweave from "arweave";
import { defaultGateway } from "~gateways/gateway";

export type AuthMethod =
  | "passkey"
  | "google"
  | "emailPassword"
  | "facebook"
  | "apple"
  | "x";

interface DbAuthMethod {
  type: AuthMethod;
}

export interface DbUser {
  id: string;
  name: string;
}

// TODO: Add an entity to link DbWallet / DbKeyShare to sites where they've been activated.

export interface DbWallet {
  // PK = userId + chain + address
  id: string;
  userId: string;
  chain: "arweave";
  address: string; // TODO: Depending on privacy setting?
  publicKey: string; // TODO: Depending on privacy setting (wallet cannot be recovered is this is not stored).
  walletType: "secret" | "private" | "public";
  canBeUsedToRecoverAccount: boolean;

  info: {
    identifierType: "alias" | "ans" | "pns";
    alias: string;
    ans: any;
    pns: any;
    // description?: string;
    // tags?: string[];
  };

  source: {
    type: "imported" | "generated";
    // TODO: Add a more detailed identifier about the actual code used and version?
    from: "seedPhrase" | "binary" | "keyFile" | "shareFile";
    deviceAndLocationInfo: any;
  };

  lastUsed: number; // TODO: Derived from wallet log
  status: "enabled" | "disabled" | "watchOnly" | "lost"; // Lost is like watchOnly but notifies user about activity.
}

interface DbKeyShare {
  // PK = userId + walletId + deviceNonce
  id: string;
  status: string;

  // Common:
  userId: string;
  walletId: string;
  walletAddress: string;
  createdAt: number;
  deviceNonceRotatedAt: number;
  sharesRotatedAt: number;
  lastRequestedAt: number;
  usagesAfterExpiration: number;

  // D + A SSS:
  deviceNonce: string;
  authShare: string;
  deviceShareHash: string;

  // RB + RA + RD SSS:
  recoveryAuthShare: string;
  recoveryBackupShareHash: string;
  recoveryDeviceShareHash: string;
}

// Wallet Management:

const authMethodsByUserId: Record<string, DbAuthMethod> = {};
const wallets: DbWallet[] = [];
const keyShares: DbKeyShare[] = [];

async function addWallet(
  addWalletParams: CreateWalletParams
): Promise<DbWallet> {
  const arweave = new Arweave(defaultGateway);
  const walletAddress = await arweave.wallets.ownerToAddress(
    addWalletParams.publicKey
  );

  // TODO: Check no duplicates (user-chain-address is unique...)

  const walletId = nanoid();

  const wallet: DbWallet = {
    // PK = userId + chain + address
    id: walletId,

    userId: currentSession.userId,
    chain: "arweave",
    address: walletAddress,
    publicKey: addWalletParams.publicKey,
    walletType: "public",
    canBeUsedToRecoverAccount: true,

    info: {
      identifierType: "alias",
      alias: "",
      ans: null,
      pns: null
    },

    source: {
      ...addWalletParams.source,
      deviceAndLocationInfo: {} // TODO: Add IP, IP location, device info...
    },

    lastUsed: Date.now(),
    status: "enabled"
  };

  wallets.push(wallet);

  keyShares.push({
    // PK = userId + walletId + deviceNonce
    id: nanoid(),
    status: "",

    // Common:
    userId: currentSession.userId,
    walletId,
    walletAddress,
    createdAt: Date.now(),
    deviceNonceRotatedAt: Date.now(),
    sharesRotatedAt: Date.now(),
    lastRequestedAt: Date.now(),
    usagesAfterExpiration: 0,

    // D + A SSS:
    deviceNonce: addWalletParams.deviceNonce,
    authShare: addWalletParams.authShare,
    deviceShareHash: addWalletParams.deviceShareHash,

    // RB + RA + RD SSS:
    recoveryAuthShare: "",
    recoveryBackupShareHash: "",
    recoveryDeviceShareHash: ""
  });

  // TODO: Persist these

  return wallet;
}

export interface GetShareForDeviceParams {
  deviceNonce: DeviceNonce;
  walletAddress: string;
  deviceShareHash: string;
}

export interface GetShareForDeviceReturn {
  authShare: string | null;
  rotateChallenge: boolean | null;
}

async function getKeyShareForDevice({
  deviceNonce,
  walletAddress,
  deviceShareHash
}: GetShareForDeviceParams): Promise<GetShareForDeviceReturn> {
  await sleep(2000);

  const keyShare: DbKeyShare = keyShares.find((keyShare) => {
    return (
      keyShare.userId === currentSession.userId &&
      keyShare.deviceNonce === deviceNonce &&
      keyShare.walletAddress === walletAddress &&
      keyShare.deviceShareHash === deviceShareHash
    );
  });

  if (!keyShare) {
    throw new Error("No match found");
  }

  // TODO: Update `keyShare` dates and add logic for rotation.

  return Promise.resolve({
    authShare: keyShare.authShare,
    rotateChallenge: false
  });
}

// Authentication:

export interface DbAuthenticateData {
  userId: string;
  authMethod: AuthMethod;
}

let currentSession: DbAuthenticateData | null = null;

async function authenticate(
  authMethod: AuthMethod
): Promise<DbAuthenticateData> {
  await sleep(2000);

  currentSession = {
    userId: nanoid(),
    authMethod
  };

  // TODO: Persist these

  return currentSession;
}

async function refreshSession(): Promise<DbAuthenticateData> {
  await sleep(2000);

  return currentSession;
}

interface Challenges {
  id: string;
  status: string;
  key: string; // walletAddress OR walletAddress+userId
  challenge: string;
  createdAt: string;
}

async function fetchWalletRecoveryChallenge(
  walletAddress: string
): Promise<string> {
  await sleep(2000);

  // TODO: Generate and store a walletAddress-challenge pair.

  return nanoid();
}

async function fetchRecoverableAccounts(
  walletAddress: string,
  challengeSignature: string
): Promise<DbUser[]> {
  await sleep(2000);

  // TODO: Find the previous walletAddress-challenge pair, the walletAddress' public key and verify if the signature is
  // correct. If so, return all users that have this wallet added as a recovery wallet.

  return [
    {
      id: "0",
      name: "Recoverable user"
    }
  ];
}

async function fetchAccountRecoveryChallenge(
  userId: string,
  walletAddress: string
): Promise<string> {
  await sleep(2000);

  // TODO: Generate and store a userId-walletAddress-challenge tuple.

  return nanoid();
}

async function recoverAccount(
  authMethod: AuthMethod,
  userId: string,
  walletAddress: string,
  challengeSignature: string
) {
  await sleep(2000);

  // TODO: Find the previous userId-walletAddress-challenge tuple, the walletAddress' public key and verify if the
  // signature is correct. If so, authenticate the user and link the wallet to their account.

  currentSession = {
    userId,
    authMethod
  };

  return currentSession;
}

export const FakeDB = {
  // Wallet Management:
  addWallet,
  getKeyShareForDevice,

  // Authentication:
  authenticate,
  refreshSession,
  fetchWalletRecoveryChallenge,
  fetchRecoverableAccounts,
  fetchAccountRecoveryChallenge,
  recoverAccount
};

export const MockedFeatureFlags = {
  maintainSeedPhrase: true
} as const;
