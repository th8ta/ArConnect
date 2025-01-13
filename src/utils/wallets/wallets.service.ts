import { FakeDB, type DbWallet } from "~utils/authentication/fakeDB";
import type {
  DeviceNonce,
  DeviceShareInfo
} from "~utils/wallets/wallets.utils";

async function fetchWallets(): Promise<DbWallet[]> {
  return Promise.resolve([]);
}

export interface CreateWalletParams {
  // TODO: Bring in the B64 utils and types from Othent

  // TODO: Local wallets for those that do not want anything to do with our server/db:
  address: string;
  publicKey: string;
  walletType: "secret" | "private" | "public"; // TODO: Add "local"?
  deviceNonce: string;
  authShare: string;
  deviceShareHash: string;
  canBeUsedToRecoverAccount: boolean;

  source: {
    type: "imported" | "generated";
    from: "seedPhrase" | "binary" | "keyFile" | "shareFile";
  };
}

async function createWallet(wallet: CreateWalletParams): Promise<DbWallet> {
  return FakeDB.addWallet(wallet);
}

export interface FetchFirstAvailableAuthShareParams {
  deviceNonce: DeviceNonce;
  deviceSharesInfo: DeviceShareInfo[];
}

export interface FetchFirstAvailableAuthShareReturn {
  walletAddress: string;
  authShare: string;
  deviceShare: string;
  rotateChallenge?: string;
}

async function fetchFirstAvailableAuthShare({
  deviceNonce,
  deviceSharesInfo
}: FetchFirstAvailableAuthShareParams): Promise<FetchFirstAvailableAuthShareReturn> {
  // TODO: Should we also send signatures for this?

  return new Promise(async (resolve, reject) => {
    for (const deviceSharesInfoItem of deviceSharesInfo) {
      const { walletAddress, deviceShare } = deviceSharesInfoItem;

      const { authShare, rotateChallenge } = await FakeDB.getKeyShareForDevice(
        deviceNonce,
        walletAddress
      ).catch(() => null);

      // TODO: Resolve challenge to get the authShare...

      if (authShare) {
        resolve({
          walletAddress,
          authShare,
          deviceShare,
          rotateChallenge
        });

        break;
      }
    }
  });
}

export interface RotateDeviceShardParams {
  walletAddress: string;
  oldDeviceNonce?: string;
  newDeviceNonce: string;
  authShare: string;
  challengeSignature: string;
}

async function rotateAuthShare({}: RotateDeviceShardParams) {
  // TODO: Take into account challengeSignature needs to be used as key too. Also, `oldDeviceNonce` might be `undefined`
  // but only when `initiateWalletRecovery` has been called before...
}

export interface InitiateWalletRecoveryReturn {
  recoveryChallenge: string;
  rotateChallenge: string;
}

async function initiateWalletRecovery(
  walletAddress: string,
  recoverySharePublicKey: string
): Promise<InitiateWalletRecoveryReturn> {
  return Promise.resolve({
    recoveryChallenge: "",
    rotateChallenge: ""
  });
}

async function resolveRecoveryChallenge(
  challengeSignature: string
): Promise<string> {
  return Promise.resolve("");
}

export const WalletService = {
  fetchWallets,
  createWallet,
  fetchFirstAvailableAuthShare,
  rotateAuthShare,
  initiateWalletRecovery,
  resolveRecoveryChallenge
};
