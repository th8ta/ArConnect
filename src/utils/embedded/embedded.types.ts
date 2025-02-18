import type { PropsWithChildren } from "react";
import type {
  DbWallet,
  AuthMethod,
  DbUser
} from "~utils/authentication/fakeDB";
import type { JWKInterface } from "arweave/web/lib/wallet";

export type AuthStatus =
  | "unknown"
  | "authLoading"
  | "authError"
  | "noAuth"
  | "noWallets"
  | "noShares"
  // TODO: Do not mix auth loading with regular loading...
  | "loading"
  | "locked"
  | "unlocked";

export interface WalletInfo extends DbWallet {
  isActive: boolean;
  isReady: boolean;
}

export interface TempWallet {
  seedPhrase: null | string;
  jwk: JWKInterface;
  walletAddress: string;
}

export interface TempWalletPromise {
  createdAt: number;
  promise: Promise<TempWallet>;
  controller: AbortController;
}

export interface EmbeddedProviderProps extends PropsWithChildren {}

export interface EmbeddedContextState {
  authStatus: AuthStatus;
  authMethod: null | AuthMethod;
  userId: null | string;
  wallets: WalletInfo[];
  generatedTempWalletAddress: null | string;
  importedTempWalletAddress: null | string;
  lastRegisteredWallet: null | DbWallet;
  recoverableAccounts: null | DbUser[];
  // TODO: This needs to reference which wallet needs to be backed up (assuming each one is backed up individually)
  promptToBackUp: boolean;
  backedUp: boolean;
}

export interface RecoveryJSON {
  version: string;
  recoveryBackupShare: string;
}

export interface EmbeddedContextData extends EmbeddedContextState {
  authenticate: (authMethod: AuthMethod) => Promise<void>;
  fetchRecoverableAccounts: () => Promise<DbUser[]>;
  clearRecoverableAccounts: () => void;
  recoverAccount: (
    authMethod: AuthMethod,
    accountToRecoverId: string
  ) => Promise<void>;
  restoreWallet: (
    walletAddress: string,
    recoveryData: RecoveryJSON | JWKInterface | string
  ) => Promise<void>;

  generateTempWallet: () => Promise<TempWallet>;
  deleteGeneratedTempWallet: () => Promise<void>;

  importTempWallet: (
    jwkOrSeedPhrase: JWKInterface | string
  ) => Promise<TempWallet>;
  deleteImportedTempWallet: () => Promise<void>;

  registerWallet: (source: "generated" | "imported") => Promise<DbWallet>;
  clearLastRegisteredWallet: () => void;

  skipBackUp: (doNotAskAgain: boolean) => void | Promise<void>;
  registerBackUp: () => Promise<void>;
  downloadKeyfile: (walletAddress: string) => Promise<void>;
  copySeedphrase: (walletAddress: string) => Promise<void>;
  generateRecoveryAndDownload: (walletAddress: string) => Promise<void>;
}
