import type { DbWallet } from "~utils/authentication/fakeDB";
import type { AuthShardFromOtherShard } from "~utils/wallets/wallets.utils";

async function fetchWallets(): Promise<DbWallet[]> {
  return Promise.resolve([]);
}

export interface CreateWalletParams {
  // TODO: Local wallets for those that do not want anything to do with our server/db:
  walletType: "local" | "secret" | "private" | "public";
  // TODO: Bring in the B64 utils and types from Othent
  publicKey: string;
  //address,
  deviceNonce: string;
  authShardFromDeviceShard: AuthShardFromOtherShard;
  authShardFromRecoveryShard: AuthShardFromOtherShard;
}

async function createWallet(wallet: CreateWalletParams) {}

export interface FetchFirstAvailableAuthShareParams {
  deviceNonce: string;
  deviceShares: string[];
}

async function fetchFirstAvailableAuthShare({
  deviceNonce,
  deviceShares
}: FetchFirstAvailableAuthShareParams): Promise<string> {
  return Promise.resolve("");
}

async function updateDeviceNonce(deviceNonce: string): Promise<void> {}

export interface UpdateShardParams {
  deviceNonce: string;
  authShare: string;
}

async function updateShard({}: UpdateShardParams): Promise<void> {}

export const WalletsService = {
  fetchWallets,
  createWallet,
  fetchFirstAvailableAuthShare,
  updateDeviceNonce,
  updateShard
};
