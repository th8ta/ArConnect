import { nanoid } from "nanoid";
import { sleep } from "~utils/promises/sleep";
import type {
  CreateRecoverySharePrams,
  CreateWalletParams
} from "~utils/wallets/wallets.service";
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

// TODO: Add an entity to log events (authentication, wallet activation, wallet recovery, etc.)

export interface DbWallet {
  // PK = userId + chain + address
  id: string;
  userId: string;
  chain: "arweave";
  address: string; // TODO: Depending on privacy setting?
  publicKey: string; // TODO: Depending on privacy setting (wallet cannot be recovered is this is not stored).
  walletType: "secret" | "private" | "public";
  canBeUsedToRecoverAccount: boolean;
  canRecover: boolean; // TODO: True if recovery share where downloaded or the wallet was exported.

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

interface DbWalletExports {
  // TODO: Keep track of when/where the wallet (not shares) where exported.
}

// Wallet Management:

const authMethodsByUserId: Record<string, DbAuthMethod> = {};
const wallets: DbWallet[] = [];
const keyShares: DbKeyShare[] = [];

async function fetchWallets(userId: string) {
  await sleep(2000);

  return wallets.filter((wallet) => wallet.userId === userId);
}

async function addWallet(
  addWalletParams: CreateWalletParams
): Promise<DbWallet> {
  await sleep(2000);

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
    canRecover: false,

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
    // TODO: We might want to store the device info/nonce on a separate table as we'll also rotate this.
    // this means that if there are recovery shares linked to a specific device, when its nonce is rotated, we can
    // still verify, when an user tries to use the recoveryDeviceShare, that they also have the nonce.
    deviceNonce: addWalletParams.deviceNonce,
    authShare: addWalletParams.authShare,
    deviceShareHash: addWalletParams.deviceShareHash,

    // RB + RA + RD SSS:
    recoveryAuthShare: "",
    recoveryBackupShareHash: "",
    recoveryDeviceShareHash: ""
  });

  // TODO: Persist mocked state

  return wallet;
}

async function addRecoveryShare(
  addRecoveryShareParams: CreateRecoverySharePrams
) {
  await sleep(2000);

  keyShares.push({
    // PK = userId + walletId + deviceNonce
    id: nanoid(),
    status: "",

    // Common:
    userId: currentSession.userId,
    walletId: addRecoveryShareParams.walletId,
    walletAddress: addRecoveryShareParams.walletAddress,
    createdAt: Date.now(),
    deviceNonceRotatedAt: Date.now(),
    sharesRotatedAt: Date.now(),
    lastRequestedAt: Date.now(),
    usagesAfterExpiration: 0,
    // TODO: Add addRecoveryShareParams.deviceInfo

    // D + A SSS:
    // TODO: We might want to store the device info/nonce on a separate table as we'll also rotate this.
    // this means that if there are recovery shares linked to a specific device, when its nonce is rotated, we can
    // still verify, when an user tries to use the recoveryDeviceShare, that they also have the nonce.
    deviceNonce: addRecoveryShareParams.deviceNonce,
    authShare: "",
    deviceShareHash: "",

    // RB + RA + RD SSS:
    recoveryAuthShare: addRecoveryShareParams.recoveryAuthShare,
    recoveryDeviceShareHash: addRecoveryShareParams.recoveryDeviceShareHash,
    recoveryBackupShareHash: addRecoveryShareParams.recoveryBackupShareHash
  });

  console.log("BACKUP =", keyShares[keyShares.length - 1]);
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

const mockedUserId = nanoid();

let currentSession: DbAuthenticateData | null = null;

async function authenticate(
  authMethod: AuthMethod
): Promise<DbAuthenticateData> {
  await sleep(2000);

  currentSession = {
    userId: mockedUserId,
    authMethod
  };

  // TODO: Persist these

  return currentSession;
}

async function refreshSession(): Promise<DbAuthenticateData> {
  await sleep(2000);

  return currentSession;
}

interface Challenge {
  id: string;
  status: string;
  key: string; // walletAddress OR walletAddress+userId
  challenge: string;
  createdAt: string;
  version: string; // Do we need to support the older versions?
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
  fetchWallets,
  addWallet,
  addRecoveryShare,
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

// Test scenarios (?test = )
// -                 = Fresh account
// - no-wallets      = Existing account, no wallets
// - wallets         = Existing account, has wallets and device share
// - device-recovery = Existing account, has wallets, no device share, has device recovery share
// - backup-recovery = Existing account, has wallets, no device share, has backup recovery share
// - lost            = Existing accounts, has wallets, no device share, no backups

// Also available ?auth=1 and ?noFrame=1
// Uncomment to have a wallet straight away, as if this was a user signing in on a new device or on a device that has
// lost the device share:

// The wallet seedphrase is: code napkin summer else endorse road rookie consider merit act sister health

/*

wallets.push({
  "id": "Ec4IfiNsNVAv0CjSARWf4",
  "userId": mockedUserId,
  "chain": "arweave",
  "address": "hnJTIN3zJ-6rH1M3ydMl_yNLAwvgBshdZF5ZxMNRWEA",
  "publicKey": "nPw3bI6yHZOIRLOQ74N3Yet6eMitn48bgJfU9XTTgCMBG6jkj_mhTQh0faheQSSPlljRjjl6MQvll31R8p_SoJ5eZ9JE9H3VIyL2pSlrHA2rAjvRky090qK-5QRDZI-Jsb4IsE8ul8atlT2iqwUk2WBUhCKP-ch1JIq0SQYiPtsP7otEOnjYg1OuUiqqdSdTCigoe6HJyheZ7piQcd51N7nIlRU68odqG9hcOiCfoE61eoDxx_Cw0SVO55uTD3SDv1KS8nCzsWmQtl4Sk8_ltf_FNhLifFh-aCMdwjvByFWFFXQ0wabjI6W3XIh9eA-Eii8wXT7kYmnOZ2Je07bdxqAcazTLh7ik1kyg_vh6cqlCvcP2DFzFXH4cTxgSDwF_Dk8w3lPjIJUbau7I1u9lJ9O70kwajvktbjm-if-iA8e5y_JsltPnWNlVGt98qwhspB6OD_0bXU1_pWmbtKdyx3-sCZ96RRmCHaztz28ms6f8HchAVI6co8uUIMvq5gU_oi4v6WKmXFqSiF3z_3IanCCGZ127dggd0fnwWc8xQDqPeo3pib5ttrU787C_0VWM_cZkeZk0Qre_bgR2v40MllooAM5UAM1hBhNnPQo3S1YUgA11d6BlI-W2EKFpUvDoNs3UbXqSffUl-GHNraCGyV6qUfJKyJ_wp_JJS-NqgSE",
  "walletType": "public",
  "canBeUsedToRecoverAccount": true,
  "canRecover": false,
  "info": {
      "identifierType": "alias",
      "alias": "",
      "ans": null,
      "pns": null
  },
  "source": {
      "type": "generated",
      "from": "seedPhrase",
      "deviceAndLocationInfo": {}
  },
  "lastUsed": 1736865352915,
  "status": "enabled"
});

// Work share:

// Uncomment to add the right deviceShare in localStorage:
// TODO: Add code

keyShares.push({
  "id": "s0iP2kksix64hX0XF7Jal",
  "status": "",
  "userId": mockedUserId,
  "walletId": "Ec4IfiNsNVAv0CjSARWf4",
  "walletAddress": "hnJTIN3zJ-6rH1M3ydMl_yNLAwvgBshdZF5ZxMNRWEA",
  "createdAt": 1736865352915,
  "deviceNonceRotatedAt": 1736865352915,
  "sharesRotatedAt": 1736865352915,
  "lastRequestedAt": 1736865352915,
  "usagesAfterExpiration": 0,
  "deviceNonce": "2025-01-13T14:01:39.623Z-Gb4slIxRhdp1ZrXkjGyRe",
  "authShare": "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",
  "deviceShareHash": "rl6Wj9Ay38hrkGecvJ0bI0V0iGwQl7fNF7xlD6w5mLNSLjxUtbHEINBnsiIJgWahjJSAWnkCiNXIFKwcZjrNqg==",
  "recoveryAuthShare": "",
  "recoveryBackupShareHash": "",
  "recoveryDeviceShareHash": ""
});

// Recovery share:

// Uncomment to add the right recoveryDeviceShare in localStorage:
// TODO: Add code

keyShares.push({
  "id": "Uq33DfVMRMO1Pm2MjRIi8",
  "status": "",
  "userId": mockedUserId,
  "walletId": "Ec4IfiNsNVAv0CjSARWf4",
  "walletAddress": "hnJTIN3zJ-6rH1M3ydMl_yNLAwvgBshdZF5ZxMNRWEA",
  "createdAt": 1736869901675,
  "deviceNonceRotatedAt": 1736869901675,
  "sharesRotatedAt": 1736869901675,
  "lastRequestedAt": 1736869901675,
  "usagesAfterExpiration": 0,
  "deviceNonce": "2025-01-13T14:01:39.623Z-Gb4slIxRhdp1ZrXkjGyRe",
  "authShare": "",
  "deviceShareHash": "",
  "recoveryAuthShare": "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",
  "recoveryDeviceShareHash": "hz3vgUyERE9zzxrxdpS8cBKL6WbT87OpdgKQaSfhJpwtwU81CNh81Crtilgttir5VyHQ6f15rELCqwfRkRrrLg==",
  "recoveryBackupShareHash": "bkRz/e1XmGKM1bsX+bhkS3WaF12BJwgFgR6v5dwh7UjCdi1q41kc4Gbe/QYsTa5eumf4oNhCAMzdeSaJl8jfkQ=="
});

// Backup file:
// {"version": 1,"recoveryBackupShare": "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"}
*/
