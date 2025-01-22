import * as bip39 from "bip39-web-crypto";
import {
  addWallet,
  getWalletKeyLength,
  updatePassword,
  type WalletKeyLengths
} from "~wallets";
import {
  checkPasswordValid,
  jwkFromMnemonic,
  pkcs8ToJwk
} from "~wallets/generator";
import * as SSS from "shamir-secret-sharing";
import type { JWKInterface } from "arweave/web/lib/wallet";
import { defaultGateway } from "~gateways/gateway";
import Arweave from "arweave";
import { nanoid } from "nanoid";
import { setDecryptionKey } from "~wallets/auth";
import {
  INVALID_DEVICE_NONCE_ERR_MSG,
  INVALID_DEVICE_SHARES_INFO_ERR_MSG
} from "~utils/wallets/wallets.constants";
import { ExtensionStorage } from "~utils/storage";
import { log, LOG_GROUP } from "~utils/log/log.utils";

async function generateSeedPhrase() {
  log(LOG_GROUP.WALLET_GENERATION, "generateSeedPhrase()");

  return bip39.generateMnemonic();
}

async function generateWalletJWK(seedPhrase: string): Promise<JWKInterface> {
  if (!seedPhrase) throw new Error("Missing `seedPhrase`");

  log(LOG_GROUP.WALLET_GENERATION, "generateWalletJWK()");

  let generatedKeyfile: JWKInterface | null = null;
  let walletKeyLength: WalletKeyLengths | null = null;

  let attempts = 0;

  // This do-while is used to just to make sure the key has the right length, as we had some reports
  // in the past of people having RSA-2048. In any case, this should never run more than once.
  do {
    ++attempts;

    generatedKeyfile = await jwkFromMnemonic(seedPhrase);

    walletKeyLength = await getWalletKeyLength(generatedKeyfile);
  } while (!generatedKeyfile || !walletKeyLength.match);

  if (attempts > 1) {
    // TODO: Send this to Sentry or whatever...
    console.warn(
      "Took multiple attempts to generate a wallet with the right length!"
    );
  }

  return generatedKeyfile;
}

export interface WorkShares {
  authShare: string;
  deviceShare: string;
}

async function generateWalletWorkShares(
  jwk: JWKInterface
): Promise<WorkShares> {
  log(LOG_GROUP.WALLET_GENERATION, "generateWalletWorkShares()");

  const privateKeyJWK = await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-PSS", hash: "SHA-256" },
    true,
    ["sign"]
  );

  const privateKeyPKCS8 = await window.crypto.subtle.exportKey(
    "pkcs8",
    privateKeyJWK
  );

  // Wanna know why these are called "shares" and not shards?
  // See https://discuss.hashicorp.com/t/is-it-shards-or-shares-in-shamir-secret-sharing/38978/3

  const [authShareBuffer, deviceShareBuffer] = await SSS.split(
    new Uint8Array(privateKeyPKCS8),
    2,
    2
  );

  return {
    authShare: Buffer.from(authShareBuffer).toString("base64"),
    deviceShare: Buffer.from(deviceShareBuffer).toString("base64")
  };
}

export interface RecoverShares {
  recoveryAuthShare: string;
  recoveryBackupShare: string;
}

async function generateWalletRecoveryShares(
  jwk: JWKInterface
): Promise<RecoverShares> {
  log(LOG_GROUP.WALLET_GENERATION, "generateWalletRecoveryShares()");

  const privateKeyJWK = await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-PSS", hash: "SHA-256" },
    true,
    ["sign"]
  );

  const privateKeyPKCS8 = await window.crypto.subtle.exportKey(
    "pkcs8",
    privateKeyJWK
  );

  // Wanna know why these are called "shares" and not shards?
  // See https://discuss.hashicorp.com/t/is-it-shards-or-shares-in-shamir-secret-sharing/38978/3

  const [recoveryAuthShareBuffer, recoveryBackupShareBuffer] = await SSS.split(
    new Uint8Array(privateKeyPKCS8),
    2,
    2
  );

  return {
    recoveryAuthShare: Buffer.from(recoveryAuthShareBuffer).toString("base64"),
    recoveryBackupShare: Buffer.from(recoveryBackupShareBuffer).toString(
      "base64"
    )
  };
}

function generateDeviceNonce(): DeviceNonce {
  log(LOG_GROUP.WALLET_GENERATION, "generateDeviceNonce()");

  return `${new Date().toISOString()}-${nanoid()}` as DeviceNonce;
}

function generateRandomPassword(): string {
  log(LOG_GROUP.WALLET_GENERATION, "generateRandomPassword()");

  return Buffer.from(crypto.getRandomValues(new Uint8Array(512))).toString(
    "base64"
  );
}

async function generateWalletJWKFromShares(
  // TODO: Do we want to use the walletAddress or maybe better a hash?
  walletAddress: string,
  shares: string[]
): Promise<JWKInterface> {
  log(LOG_GROUP.WALLET_GENERATION, "generateWalletJWKFromShares()");

  const privateKeyPKCS8 = await SSS.combine(
    shares.map((share) => new Uint8Array(Buffer.from(share, "base64")))
  );

  // This functions throws a DataError if integrity fails:
  const privateKeyJWK = await pkcs8ToJwk(privateKeyPKCS8);

  const arweave = new Arweave(defaultGateway);

  // Most likely nothing below this line will run anyway:
  const addressCandidate = await arweave.wallets
    .jwkToAddress(privateKeyJWK)
    .catch(() => null);

  // From SSS' docs:
  // > Thus, it is the responsibility of users of this library to verify the integrity of the reconstructed secret.

  if (addressCandidate !== walletAddress) {
    throw new Error(`Unexpected generated address`);
  }

  return privateKeyJWK;
}

async function generateShareHash(share: string): Promise<string> {
  log(LOG_GROUP.WALLET_GENERATION, "generateShareHash()");

  /*

  TODO: Instead of using a share as a private key to sign, we can simply send a hash of it, the challange and some
  additional data that the server already has. The server should also verify the IP / IP location.

  hash(share + challenge + userAgent)

  In any case, using signatures or zk would still be superior.

  */

  const hashBuffer = await crypto.subtle.digest("SHA-512", Buffer.from(share));

  return Buffer.from(new Uint8Array(hashBuffer)).toString("base64");
}

async function generateChallengeSignature(
  challenge: string,
  jwk: JWKInterface
): Promise<string> {
  log(LOG_GROUP.WALLET_GENERATION, "generateChallengeSignature()");

  // TODO

  return Promise.resolve("");
}

// Data (localStorage):

// Device Nonce:

const DEVICE_NONCE_KEY = "DEVICE_NONCE";

export type DeviceNonce =
  `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z-${string}`;

function loadDeviceNonce(): DeviceNonce | null {
  let deviceNonce = localStorage.getItem(DEVICE_NONCE_KEY) || null;

  if (
    deviceNonce === null ||
    /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)\-[\w_-]{21}/.test(
      deviceNonce
    )
  )
    return deviceNonce as DeviceNonce;

  if (process.env.NODE_ENV === "development") {
    throw new Error(INVALID_DEVICE_NONCE_ERR_MSG);
  } else {
    console.warn(INVALID_DEVICE_NONCE_ERR_MSG);
  }
}

let _deviceNonce: DeviceNonce | null = loadDeviceNonce();

// Device Shares:

const DEVICE_SHARES_INFO_KEY = "DEVICE_SHARES_INFO";

export interface DeviceShareInfo {
  deviceShare: string;
  // TODO: Do we want to use the walletAddress or maybe better a hash?
  walletAddress: string;
  createdAt: number;
}

function loadDeviceSharesInfo(): Record<
  string,
  Record<string, DeviceShareInfo>
> {
  try {
    let deviceSharesInfo = JSON.parse(
      localStorage.getItem(DEVICE_SHARES_INFO_KEY)
    );

    // TODO: Add additional validation...

    if (typeof deviceSharesInfo !== "object" || !deviceSharesInfo) {
      deviceSharesInfo = {};
    }

    return deviceSharesInfo as Record<string, Record<string, DeviceShareInfo>>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      throw new Error(`${INVALID_DEVICE_SHARES_INFO_ERR_MSG}: ${err?.message}`);
    } else {
      console.warn(`${INVALID_DEVICE_SHARES_INFO_ERR_MSG}: ${err?.message}`);
    }
  }
}

let _deviceSharesInfo: Record<
  string,
  Record<string, DeviceShareInfo>
> = loadDeviceSharesInfo();

// Getters:

function getDeviceNonce(): DeviceNonce {
  return _deviceNonce;
}

function getDeviceSharesInfo(userId: string): DeviceShareInfo[] {
  return Object.values(_deviceSharesInfo[userId] || {}).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

// Storage:

const ENCRYPTED_SEED_PHRASE_KEY = "ENCRYPTED_SEED_PHRASE";

function storeEncryptedSeedPhrase(
  walletAddress: string,
  seedPhrase: string,
  jwk: JWKInterface
) {
  log(LOG_GROUP.WALLET_GENERATION, "storeEncryptedSeedPhrase()");

  // TODO: Encrypt it...
  const encryptedSeedPhrase = seedPhrase;

  localStorage.setItem(
    `${ENCRYPTED_SEED_PHRASE_KEY}-${walletAddress}`,
    encryptedSeedPhrase
  );
}

function hasEncryptedSeedPhrase(walletAddress: string) {
  return !!localStorage.getItem(
    `${ENCRYPTED_SEED_PHRASE_KEY}-${walletAddress}`
  );
}

function getDecryptedSeedPhrase(walletAddress: string, jwk: JWKInterface) {
  const encryptedSeedPhrase = localStorage.getItem(
    `${ENCRYPTED_SEED_PHRASE_KEY}-${walletAddress}`
  );

  // TODO: Decrypt it...
  return encryptedSeedPhrase;
}

function storeDeviceNonce(deviceNonce: DeviceNonce) {
  log(LOG_GROUP.WALLET_GENERATION, "storeDeviceNonce()");

  _deviceNonce = deviceNonce;

  localStorage.setItem(DEVICE_NONCE_KEY, _deviceNonce);
}

function storeDeviceShare(
  deviceShare: string,
  userId: string,
  // TODO: Do we want to use the walletAddress or maybe better a hash?
  walletAddress: string
) {
  log(LOG_GROUP.WALLET_GENERATION, "storeDeviceShare()");

  const deviceShareInfo: DeviceShareInfo = {
    deviceShare,
    walletAddress,
    createdAt: Date.now()
  };

  if (!_deviceSharesInfo[userId]) _deviceSharesInfo[userId] = {};

  _deviceSharesInfo[userId][walletAddress] = deviceShareInfo;

  localStorage.setItem(
    DEVICE_SHARES_INFO_KEY,
    JSON.stringify(_deviceSharesInfo)
  );
}

async function storeEncryptedWalletJWK(jwk: JWKInterface): Promise<void> {
  log(LOG_GROUP.WALLET_GENERATION, "storeEncryptedWalletJWK()");

  // This password is only used for the current session. As soon as the page is reloaded, the wallet(s)' private key
  // must be reconstructed using the authShare and the deviceShare and added to the ExtensionStorage object again,
  // using a different random password:

  let randomPassword: string = "";

  do {
    randomPassword = generateRandomPassword();
  } while (!checkPasswordValid(randomPassword));

  await setDecryptionKey(randomPassword);

  // TODO: Consider calling this periodically to rotate the random passwords. We might need to use a Mutex for this...
  // updatePassword(randomPassword);

  return addWallet(jwk, randomPassword);
}

export const WalletUtils = {
  // Generation:
  generateSeedPhrase,
  generateWalletJWK, // TODO: Rename to generateWalletKeyfile
  generateWalletWorkShares,
  generateWalletRecoveryShares,
  generateDeviceNonce,
  generateWalletJWKFromShares,
  generateShareHash,
  generateChallengeSignature,

  // Getters:
  getDeviceNonce,
  getDeviceSharesInfo,

  // Storage:
  storeDeviceNonce,
  storeDeviceShare,
  storeEncryptedSeedPhrase,
  hasEncryptedSeedPhrase,
  getDecryptedSeedPhrase,
  storeEncryptedWalletJWK
};
