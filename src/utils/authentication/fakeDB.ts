import type { AuthenticateData } from "~utils/authentication/authentication.service";

interface DBUser {
  id: string;
}

const users: DBUser[] = [];

export type AuthMethod = "passkey" | "emailPassword" | "google";

interface DbAuthMethod {
  type: AuthMethod;
}

const authMethodsByUserId: Record<string, DbAuthMethod> = {};

export interface DbWallet {
  // PK = userId + chain + address
  id: string;
  userId: string;
  chain: "arweave";
  address: string; // TODO: Depending on privacy setting?
  publicKey: string; // TODO: Depending on privacy setting (wallet cannot be recovered is this is not stored).
  walletType: "secret" | "private" | "public";

  info: {
    identifierType: "alias" | "ans" | "pns";
    alias: string;
    ans: any;
    pns: any;
    // description?: string;
    // tags?: string[];
  };

  source: {
    type: "imported" | "generated";
    from: "seedPhrase" | "binary" | "keyFile" | "shareFile";
  };

  lastUsed: Date; // TODO: Derived from wallet log
  status: "enabled" | "disabled" | "watchOnly" | "lost"; // Lost is like watchOnly but notifies user about activity.
}

const walletsByUserId: Record<string, DbWallet> = {};

interface DbKeyShare {
  // PK = userId + walletId + deviceNonce

  // Common:
  userId: string;
  walletId: string;
  createdAt: Date;
  rotatedAt: Date;
  lastRequestedAt: Date;
  usagesAfterExpiration: number;

  // D + A SSS:
  deviceNonce: string;
  authShare: string;
  // deviceSharePublicKey: string; // Not needed because we already have the device nonce...

  // RB + RA + RD SSS:
  walletAddress: string;
  recoveryAuthShare: string;
  recoveryBackupSharePublicKey: string;
  recoveryDeviceSharePublicKey: string;
}

const keyShareByDeviceNonce: Record<string, DbKeyShare> = {};
