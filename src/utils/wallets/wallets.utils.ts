import * as bip39 from "bip39-web-crypto";
import { getWalletKeyLength, type WalletKeyLengths } from "~wallets";
import { jwkFromMnemonic, pkcs8ToJwk } from "~wallets/generator";
import * as SSS from "shamir-secret-sharing";
import type { JWKInterface } from "arweave/web/lib/wallet";
import { defaultGateway } from "~gateways/gateway";
import Arweave from "arweave";
import { nanoid } from "nanoid";

async function generateSeedPhrase() {
  console.log("1. generateSeedPhrase");

  return bip39.generateMnemonic();
}

async function generateWalletJWK(seedPhrase: string): Promise<JWKInterface> {
  console.log("2. generateWalletJWK");

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
  }

  console.log("attempts =", attempts);

  return generatedKeyfile;
}

export interface WorkShares {
  authShare: string;
  deviceShare: string;
}

async function generateWalletWorkShares(
  jwk: JWKInterface
): Promise<WorkShares> {
  console.log("3. generateWalletShards");

  const privateKey = await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-PSS", hash: "SHA-256" },
    true,
    ["sign"]
  );

  console.log("Re-exporting");

  const exportedKeyBuffer = await window.crypto.subtle.exportKey(
    "pkcs8",
    privateKey
  );

  const exportedKey = new Uint8Array(exportedKeyBuffer);

  // Wanna know why these are called "shares" and not shards?
  // See https://discuss.hashicorp.com/t/is-it-shards-or-shares-in-shamir-secret-sharing/38978/3

  const [authShareBuffer, deviceShareBuffer] = await SSS.split(
    exportedKey,
    2,
    2
  );

  return {
    authShare: btoa(authShareBuffer),
    deviceShare: btoa(deviceShareBuffer)
  };
}

async function generateWalletRecoveryShares(jwk: JWKInterface) {
  // const reconstructedMixed = await SSS.combine([share1, share4]);
  // const reconstructedJWK = await pkcs8ToJwk(reconstructed1);
  /*

  const arweave = new Arweave(defaultGateway);

  const originalAddress = await arweave.wallets
    .jwkToAddress(reconstructedJWK)
    .catch(() => null);
  console.log("originalAddress =", originalAddress);

  console.log("What about integrity?");

  try {
    // This functions throws a DataError already if integrity fails:
    const reconstructedMixedJWK = await pkcs8ToJwk(reconstructedMixed);

    // Most likely nothing below this line will run anyway:
    const reconstructedMixedAddress = await arweave.wallets
      .jwkToAddress(reconstructedMixedJWK)
      .catch(() => null);
    console.log("reconstructedMixedAddress =", reconstructedMixedAddress);
    console.log(originalAddress === reconstructedMixedAddress); // false
  } catch (err) {
    console.log("The key material has been tampered with", err);
  }

  */
}

function generateDeviceNonce(): string {
  return `${new Date().toISOString()}-${nanoid()}`;
}

function generateRandomPassword(): string {
  return "";
}

// Combine:

function combineShards() {
  // TODO: Thus, it is the responsibility of users of this library to verify the integrity of the reconstructed secret.
}

// Getters:

function getDeviceNonce(): string {
  return _deviceNonce;
}

function getDeviceShares(): string[] {
  return [""];
}

function getKeyfile(): JWKInterface {}

// Storage:

function storeSeedPhrase(seedPhrase: string, jwk: JWKInterface) {}

const DEVICE_NONCE_KEY = "DEVICE_NONCE_KEY";

let _deviceNonce: string | null =
  localStorage.getItem(DEVICE_NONCE_KEY) || null;

function storeDeviceNonce(deviceNonce: string) {
  _deviceNonce = deviceNonce;

  localStorage.setItem(DEVICE_NONCE_KEY, deviceNonce);
}

function storeDeviceShare(deviceShare: string) {}

function storeKeyfile(jwk: JWKInterface, password: string) {}

// function recoverPrivateKeyFromShards() {}

export const WalletUtils = {
  // Generation:
  generateSeedPhrase,
  generateWalletJWK,
  generateWalletWorkShares,
  generateWalletRecoveryShares,
  generateDeviceNonce,
  generateRandomPassword,

  // Getters:
  getDeviceNonce,
  getDeviceShares,

  // Storage:
  storeSeedPhrase,
  storeDeviceNonce,
  storeDeviceShare,
  storeKeyfile
};
