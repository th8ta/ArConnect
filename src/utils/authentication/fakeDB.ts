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

export interface DbWallet {
  // PK = userId + chain + address
  id: string;
  userId: string;
  chain: "arweave";
  address: string; // TODO: Depending on privacy setting?
  publicKey: string; // TODO: Depending on privacy setting (wallet cannot be recovered is this is not stored).
  walletType: "secret" | "private" | "public";

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

    info: {
      identifierType: "alias",
      alias: "",
      ans: null,
      pns: null
    },

    source: addWalletParams.source,

    lastUsed: Date.now(),
    status: "enabled"
  };

  wallets.push(wallet);

  keyShares.push({
    // PK = userId + walletId + deviceNonce
    id: nanoid(),

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
    deviceSharePublicKey: addWalletParams.deviceSharePublicKey,

    // RB + RA + RD SSS:
    recoveryAuthShare: "",
    recoveryBackupSharePublicKey: "",
    recoveryDeviceSharePublicKey: ""
  });

  // TODO: Persist these

  return wallet;
}

interface GetShareForDeviceReturn {
  authShare: string;
  rotateChallenge: boolean;
}

async function getKeyShareForDevice(
  deviceNonce: DeviceNonce,
  walletAddress: string
): Promise<GetShareForDeviceReturn> {
  await sleep(2000);

  const keyShare: DbKeyShare = keyShares.find((keyShare) => {
    return (
      keyShare.userId === currentSession.userId &&
      keyShare.deviceNonce === deviceNonce &&
      keyShare.walletAddress === walletAddress
    );
  });

  // TODO: Update `keyShare` dates and add logic for rotation.

  // TODO: Persist these

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

export const FakeDB = {
  // Wallet Management:
  addWallet,
  getKeyShareForDevice,

  // Authentication:
  authenticate,
  refreshSession
};

export const MockedFeatureFlags = {
  maintainSeedPhrase: true
} as const;
