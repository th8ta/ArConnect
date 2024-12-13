import * as bip39 from "bip39-web-crypto";
import { getWalletKeyLength, type WalletKeyLengths } from "~wallets";
import { jwkFromMnemonic, pkcs8ToJwk } from "~wallets/generator";
import * as SSS from "shamir-secret-sharing";
import type { JWKInterface } from "arweave/web/lib/wallet";
import { defaultGateway } from "~gateways/gateway";
import Arweave from "arweave";

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

async function generateWalletShards(jwk: JWKInterface) {
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

  const [share1, share2, share3] = await SSS.split(exportedKey, 3, 2);

  console.log("4. verifyingShards");

  const reconstructed1 = await SSS.combine([share1, share2]);
  const reconstructed2 = await SSS.combine([share1, share3]);
  const reconstructed3 = await SSS.combine([share2, share3]);

  console.log(btoa(reconstructed1 as any) === btoa(exportedKey as any)); // true
  console.log(btoa(reconstructed2 as any) === btoa(exportedKey as any)); // true
  console.log(btoa(reconstructed3 as any) === btoa(exportedKey as any)); // true

  console.log("Are shares the same?");

  const [share4, share5, share6] = await SSS.split(exportedKey, 3, 2);

  console.log(btoa(share1 as any) === btoa(share4 as any)); // false
  console.log(btoa(share2 as any) === btoa(share5 as any)); // false
  console.log(btoa(share3 as any) === btoa(share6 as any)); // false

  const reconstructedMixed = await SSS.combine([share1, share4]);
  console.log(btoa(reconstructedMixed as any) === btoa(exportedKey as any)); // false

  console.log("Are JWKs the same?");

  const reconstructedJWK = await pkcs8ToJwk(reconstructed1);

  console.log(
    "SHOULD BE EQUAL",
    JSON.stringify(jwk) === JSON.stringify(reconstructedJWK)
  );

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

  return [share1, share2, share3];

  // TODO: Thus, it is the responsibility of users of this library to verify the integrity of the reconstructed secret.
}

function getDeviceNonce(): string {
  return "";
}

function getDeviceShares(): string[] {
  return [""];
}

function storeDeviceShard(deviceShard: string) {}

function generateRandomPassword(): string {
  return "";
}

function storePrivateKeyAndPassword(jwk: JWKInterface, password: string) {}

function recoverPrivateKeyFromShards() {}

export const WalletUtils = {
  // Generation:
  generateSeedPhrase,
  generateWalletJWK,
  generateWalletShards,

  // Shares:
  getDeviceNonce,
  getDeviceShares,
  storeDeviceShard,
  generateRandomPassword,
  storePrivateKeyAndPassword
};
