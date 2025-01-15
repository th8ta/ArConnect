import { FakeDB, type DbWallet } from "~utils/authentication/fakeDB";
import {
  WalletUtils,
  type DeviceNonce,
  type DeviceShareInfo
} from "~utils/wallets/wallets.utils";

async function fetchWallets(userId: string): Promise<DbWallet[]> {
  return FakeDB.fetchWallets(userId);
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
  deviceInfo: any; // TODO: Add type

  source: {
    type: "imported" | "generated";
    from: "seedPhrase" | "binary" | "keyFile" | "shareFile";
  };
}

async function createWallet(wallet: CreateWalletParams): Promise<DbWallet> {
  return FakeDB.addWallet(wallet);
}

export interface CreateRecoverySharePrams {
  walletId: string;
  walletAddress: string;
  deviceNonce: string;
  recoveryAuthShare: string;
  recoveryBackupShareHash: string;
  deviceInfo: any;
}

async function createRecoveryShare(
  recoveryData: CreateRecoverySharePrams
): Promise<void> {
  return FakeDB.addRecoveryShare(recoveryData);
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
}: FetchFirstAvailableAuthShareParams): Promise<null | FetchFirstAvailableAuthShareReturn> {
  return new Promise(async (resolve, reject) => {
    for (const deviceSharesInfoItem of deviceSharesInfo) {
      const { walletAddress, deviceShare } = deviceSharesInfoItem;
      const deviceShareHash = await WalletUtils.generateShareHash(deviceShare);

      // TODO: Better with zk: instead of hashes or use a challenge here?

      const { authShare, rotateChallenge } = await FakeDB.getKeyShareForDevice({
        deviceNonce,
        walletAddress,
        deviceShareHash
      }).catch(() => ({
        authShare: null,
        rotateChallenge: null
      }));

      if (authShare) {
        // TODO: We need to have some date associated to the Share to force rotation. If `rotateChallenge` is ignored too many times, the share entry will be
        // removed and the user will be forced to use the recovery share or a keyfile/seedphrase.

        resolve({
          walletAddress,
          authShare,
          deviceShare,
          rotateChallenge
        });

        return;
      }
    }

    resolve(null);
  });
}

export interface RotateDeviceShareParams {
  walletAddress: string;
  oldDeviceNonce?: DeviceNonce;
  newDeviceNonce: DeviceNonce;
  authShare: string;
  newDeviceShareHash: string;
  challengeSignature: string;
}

async function rotateAuthShare({}: RotateDeviceShareParams) {
  // TODO: Take into account challengeSignature needs to be used as key too. Also, `oldDeviceNonce` might be `undefined`
  // but only when `initiateWalletRecovery` has been called before...
}

export interface InitiateWalletRecoveryReturn {
  recoveryChallenge: string;
  rotateChallenge: string;
}

async function fetchWalletRecoveryChallenge(
  walletAddress: string,
  recoverySharePublicKey: string
): Promise<InitiateWalletRecoveryReturn> {
  return Promise.resolve({
    recoveryChallenge: "",
    rotateChallenge: ""
  });
}

async function recoverWallet(
  walletAddress: string,
  challengeSignature: string
): Promise<string> {
  return FakeDB.recoverWallet(walletAddress, challengeSignature);
}

export const WalletService = {
  fetchWallets,
  createWallet,
  createRecoveryShare,
  fetchFirstAvailableAuthShare,
  rotateAuthShare,
  fetchWalletRecoveryChallenge,
  recoverWallet
};
