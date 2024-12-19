import { FakeDB, type DbWallet } from "~utils/authentication/fakeDB";
import type { DeviceShareInfo } from "~utils/wallets/wallets.utils";

async function fetchWallets(): Promise<DbWallet[]> {
  return Promise.resolve([]);
}

export interface CreateWalletParams {
  // TODO: Bring in the B64 utils and types from Othent

  // TODO: Local wallets for those that do not want anything to do with our server/db:
  walletType: "secret" | "private" | "public"; // TODO: Add "local"?
  publicKey: string;
  deviceNonce: string;
  authShare: string;
  deviceSharePublicKey: string;
  canBeUsedToRecoverAccount: boolean;
}

async function createWallet(wallet: CreateWalletParams) {
  FakeDB.addWallet();
}

export interface FetchFirstAvailableAuthShareParams {
  deviceNonce: string;
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
  return new Promise(async (resolve, reject) => {
    for (const deviceSharesInfoItem of deviceSharesInfo) {
      await FakeDB.getShareForDevice(
        deviceNonce,
        deviceSharesInfoItem.walletAddress
      );
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
