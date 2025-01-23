import {
  authenticate,
  refreshSession,
  fakeAuthenticate,
  fakeRefreshSession,
  signOut
} from "~utils/embedded/sdk/authentication/sdk-authentication.utils";
import {
  registerRecoveryShare,
  registerWalletExport
} from "~utils/embedded/sdk/backup/sdk-backup.utils";
import {
  generateWalletRecoveryChallenge,
  fetchRecoverableAccounts,
  generateAccountRecoveryChallenge,
  recoverAccount
} from "~utils/embedded/sdk/share-recovery/sdk-share-recovery.utils";
import {
  generateAuthShareChallenge,
  activateWallet,
  rotateAuthShare
} from "~utils/embedded/sdk/shares/sdk-shares.utils";
import {
  generateShareRecoveryChallenge,
  recoverWallet
} from "~utils/embedded/sdk/wallet-recovery/sdk-wallet-recovery.utils";
import {
  fetchWallets,
  createWallet,
  updateWallet,
  deleteWallet
} from "~utils/embedded/sdk/wallets/sdk-wallets.utils";

export const EmbeddedSDK = {
  Auth: {
    authenticate,
    refreshSession,
    signOut,
    fakeAuthenticate,
    fakeRefreshSession
  },

  Wallets: {
    fetchWallets,
    createWallet,
    updateWallet,
    deleteWallet
  },

  Shares: {
    generateAuthShareChallenge,
    activateWallet,
    rotateAuthShare
  },

  BackUp: {
    registerRecoveryShare,
    registerWalletExport
  },

  WalletRecovery: {
    generateShareRecoveryChallenge,
    recoverWallet
  },

  ShareRecovery: {
    generateWalletRecoveryChallenge,
    fetchRecoverableAccounts,
    generateAccountRecoveryChallenge,
    recoverAccount
  }
};
