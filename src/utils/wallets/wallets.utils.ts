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

async function generateSeedPhrase() {
  console.log("generateSeedPhrase()");

  return bip39.generateMnemonic();
}

async function generateWalletJWK(seedPhrase: string): Promise<JWKInterface> {
  console.log("generateWalletJWK()");

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
  console.log("generateWalletWorkShares()");

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

  console.log(
    "privateKeyPKCS8 =",
    privateKeyPKCS8.byteLength,
    "Uint8Array(privateKeyPKCS8).length =",
    new Uint8Array(privateKeyPKCS8).length,
    "Uint8Array(privateKeyPKCS8).byteLength =",
    new Uint8Array(privateKeyPKCS8).byteLength,
    "getWalletKeyLength",
    await getWalletKeyLength(jwk)
  );

  // Wanna know why these are called "shares" and not shards?
  // See https://discuss.hashicorp.com/t/is-it-shards-or-shares-in-shamir-secret-sharing/38978/3

  const [authShareBuffer, deviceShareBuffer] = await SSS.split(
    new Uint8Array(privateKeyPKCS8),
    2,
    2
  );

  /*
  const justTest = await window.crypto.subtle.importKey(
    "raw",
    new Uint8Array(authShareBuffer),
    { name: "RSA-PSS", hash: "SHA-256" },
    true,
    ["sign"]
  );

  console.log("justTest =", justTest)
  */

  console.log(
    "deviceShareBuffer.length =",
    deviceShareBuffer.length,
    "deviceShareBuffer.byteLength =",
    deviceShareBuffer.byteLength
  );

  // TODO: Need to add Buffer polyfill
  return {
    authShare: Buffer.from(authShareBuffer).toString("base64"),
    deviceShare: Buffer.from(deviceShareBuffer).toString("base64")
  };
}

async function generateWalletRecoveryShares(jwk: JWKInterface) {
  console.log("generateWalletRecoveryShares()");

  // TODO: Add implementation once the backup shares view is added.
}

function generateDeviceNonce(): DeviceNonce {
  console.log("generateDeviceNonce()");

  return `${new Date().toISOString()}-${nanoid()}` as DeviceNonce;
}

function generateRandomPassword(): string {
  console.log("generateRandomPassword()");

  return Buffer.from(crypto.getRandomValues(new Uint8Array(512))).toString(
    "base64"
  );
}

async function generateWalletJWKFromShares(
  // TODO: Do we want to use the walletAddress or maybe better a hash?
  walletAddress: string,
  shares: string[]
): Promise<JWKInterface> {
  console.log("generateWalletJWKFromShares()");

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

async function generateShareJWK(share: string): Promise<JWKInterface> {
  console.log("generateShareJWK()");

  /*

    TODO: Instead of using a share as a private key to sign, we can simply send a hash of it, the challange and some
    additional data that the server already has. The server should also verify the IP / IP location.

    hash(share + challenge + userAgent)
  */

  return Promise.resolve({
    n: ""
  } as any);

  /*
  const shareBuffer = new Uint8Array(Buffer.from(share, "base64"));

  console.log(1);

  const shareKeyPKCS8 = await window.crypto.subtle.importKey(
    "raw",
    shareBuffer,
    { name: "RSA-PSS", hash: "SHA-256" },
    true,
    ["sign"]
  );

  console.log(2);

  const shareKeyJWK = await window.crypto.subtle.exportKey(
    "jwk",
    shareKeyPKCS8
  );

  console.log(
    "shareKeyJWK =", shareKeyJWK,
  );

  return pkcs8ToJwk(shareBuffer);
  */
}

async function generateSharePublicKey(share: string): Promise<string> {
  console.log("generateSharePublicKey()");

  const shareJWK = await generateShareJWK(share);

  return shareJWK?.n || null;
}

async function generateChallengeSignature(
  challenge: string,
  jwk: JWKInterface
): Promise<string> {
  console.log("generateChallengeSignature()");

  // TODO

  return Promise.resolve("");
}

// Data (localStorage):

// Device Nonce:

const DEVICE_NONCE_KEY = "DEVICE_NONCE_KEY";

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

function loadDeviceSharesInfo(): Record<string, DeviceShareInfo> {
  try {
    let deviceSharesInfo = JSON.parse(
      localStorage.getItem(DEVICE_SHARES_INFO_KEY)
    );

    // TODO: Add additional validation...

    if (typeof deviceSharesInfo !== "object" || !deviceSharesInfo) {
      deviceSharesInfo = {};
    }

    return deviceSharesInfo as Record<string, DeviceShareInfo>;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      throw new Error(`${INVALID_DEVICE_SHARES_INFO_ERR_MSG}: ${err?.message}`);
    } else {
      console.warn(`${INVALID_DEVICE_SHARES_INFO_ERR_MSG}: ${err?.message}`);
    }
  }
}

let _deviceSharesInfo: Record<string, DeviceShareInfo> = loadDeviceSharesInfo();

// Getters:

function getDeviceNonce(): DeviceNonce {
  console.log("getDeviceNonce()");

  return _deviceNonce;
}

function getDeviceSharesInfo(): DeviceShareInfo[] {
  console.log("getDeviceSharesInfo()");

  return Object.values(_deviceSharesInfo).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

// Storage:

function storeEncryptedSeedPhrase(seedPhrase: string, jwk: JWKInterface) {
  console.log("storeEncryptedSeedPhrase()");

  // TODO
}

function storeDeviceNonce(deviceNonce: DeviceNonce) {
  console.log("storeDeviceNonce()");

  _deviceNonce = deviceNonce;

  localStorage.setItem(DEVICE_NONCE_KEY, _deviceNonce);
}

function storeDeviceShare(
  deviceShare: string,
  // TODO: Do we want to use the walletAddress or maybe better a hash?
  walletAddress: string
) {
  console.log("storeDeviceShare()");

  const deviceShareInfo: DeviceShareInfo = {
    deviceShare,
    walletAddress,
    createdAt: Date.now()
  };

  _deviceSharesInfo[walletAddress] = deviceShareInfo;

  localStorage.setItem(
    DEVICE_SHARES_INFO_KEY,
    JSON.stringify(_deviceSharesInfo)
  );
}

async function storeEncryptedWalletJWK(jwk: JWKInterface): Promise<void> {
  // This password is only used for the current session. As soon as the page is reloaded, the wallet(s)' private key
  // must be reconstructed using the authShare and the deviceShare and added to the ExtensionStorage object again,
  // using a different random password:

  let randomPassword: string = "";

  do {
    randomPassword = generateRandomPassword();
  } while (!checkPasswordValid(randomPassword));

  await setDecryptionKey(randomPassword);

  console.log("decryptionKey =", await ExtensionStorage.get("decryption_key"));

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
  generateShareJWK,
  generateSharePublicKey,
  generateChallengeSignature,

  // Getters:
  getDeviceNonce,
  getDeviceSharesInfo,

  // Storage:
  storeDeviceNonce,
  storeDeviceShare,
  storeEncryptedSeedPhrase,
  storeEncryptedWalletJWK
};
