import { nanoid } from "nanoid";
import { sleep } from "~utils/promises/sleep";
import type {
  CreateRecoverySharePrams,
  CreateWalletParams
} from "~utils/wallets/wallets.service";
import { WalletUtils, type DeviceNonce } from "~utils/wallets/wallets.utils";
import Arweave from "arweave";
import { defaultGateway } from "~gateways/gateway";

export type AuthMethod =
  | "passkey"
  | "google"
  | "emailPassword"
  | "facebook"
  | "apple"
  | "x";

interface DbAuthMethod {
  type: AuthMethod;
}

export interface DbUser {
  id: string;
  name: string;
}

// TODO: Add an entity to link DbWallet / DbKeyShare to sites where they've been activated.

// TODO: Add an entity to log events (authentication, wallet activation, wallet recovery, etc.)

export interface DbWallet {
  // PK = userId + chain + address
  id: string;
  userId: string;
  chain: "arweave";
  address: string; // TODO: Depending on privacy setting?
  publicKey: string; // TODO: Depending on privacy setting (wallet cannot be recovered is this is not stored).
  walletType: "secret" | "private" | "public";
  canBeUsedToRecoverAccount: boolean;
  canRecover: boolean; // TODO: True if recovery share where downloaded or the wallet was exported.

  // TODO: lastBackedUp: any; // Derived? Includes date and device/location info.
  // TODO: lastExported: any; // Derived? Includes date and device/location info.

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
    // TODO: Add a more detailed identifier about the actual code used and version?
    from: "seedPhrase" | "binary" | "keyFile" | "shareFile";
    deviceAndLocationInfo: any;
  };

  lastUsed: number; // TODO: Derived from wallet log
  status: "enabled" | "disabled" | "watchOnly" | "lost"; // Lost is like watchOnly but notifies user about activity.
}

interface DbKeyShare {
  // PK = userId + walletId + deviceNonce
  id: string;
  status: string;

  // Common:
  userId: string;
  walletId: string;
  walletAddress: string;
  createdAt: number;
  deviceNonceRotatedAt: number;
  sharesRotatedAt: number;
  lastRequestedAt: number;
  usagesAfterExpiration: number;

  // D + A SSS:
  deviceNonce: string;
  authShare: string;
  deviceShareHash: string;

  // RB + RA SSS:
  recoveryAuthShare: string;
  recoveryBackupShareHash: string;
}

interface DbWalletExports {
  // TODO: Keep track of when/where the wallet (not shares) where exported.
}

// Wallet Management:

const authMethodsByUserId: Record<string, DbAuthMethod> = {};
const wallets: DbWallet[] = [];
const keyShares: DbKeyShare[] = [];

async function fetchWallets(userId: string) {
  await sleep(2000);

  return wallets.filter((wallet) => wallet.userId === userId);
}

async function addWallet(
  addWalletParams: CreateWalletParams
): Promise<DbWallet> {
  await sleep(2000);

  const arweave = new Arweave(defaultGateway);
  const walletAddress = await arweave.wallets.ownerToAddress(
    addWalletParams.publicKey
  );

  // TODO: Check no duplicates (user-chain-address is unique...)

  const walletId = nanoid();

  const wallet: DbWallet = {
    // PK = userId + chain + address
    id: walletId,

    userId: currentSession.userId,
    chain: "arweave",
    address: walletAddress,
    publicKey: addWalletParams.publicKey,
    walletType: "public",
    canBeUsedToRecoverAccount: true,
    canRecover: false,

    info: {
      identifierType: "alias",
      alias: "",
      ans: null,
      pns: null
    },

    source: {
      ...addWalletParams.source,
      deviceAndLocationInfo: {} // TODO: Add IP, IP location, device info...
    },

    lastUsed: Date.now(),
    status: "enabled"
  };

  wallets.push(wallet);

  keyShares.push({
    // PK = userId + walletId + deviceNonce
    id: nanoid(),
    status: "",

    // Common:
    userId: currentSession.userId,
    walletId,
    walletAddress,
    createdAt: Date.now(),
    deviceNonceRotatedAt: Date.now(),
    sharesRotatedAt: Date.now(),
    lastRequestedAt: Date.now(),
    usagesAfterExpiration: 0,

    // D + A SSS:
    // TODO: We might want to store the device info/nonce on a separate table as we'll also rotate this.
    // this means that if there are recovery shares linked to a specific device, when its nonce is rotated, we can
    // still verify, when an user tries to use the recoveryDeviceShare, that they also have the nonce.
    deviceNonce: addWalletParams.deviceNonce,
    authShare: addWalletParams.authShare,
    deviceShareHash: addWalletParams.deviceShareHash,

    // RB + RA SSS:
    recoveryAuthShare: "",
    recoveryBackupShareHash: ""
  });

  // TODO: Persist mocked state

  console.log("addWallet() =", wallet, keyShares[keyShares.length - 1]);

  return wallet;
}

async function addRecoveryShare(
  addRecoveryShareParams: CreateRecoverySharePrams
) {
  await sleep(2000);

  keyShares.push({
    // PK = userId + walletId + deviceNonce
    id: nanoid(),
    status: "",

    // Common:
    userId: currentSession.userId,
    walletId: addRecoveryShareParams.walletId,
    walletAddress: addRecoveryShareParams.walletAddress,
    createdAt: Date.now(),
    deviceNonceRotatedAt: Date.now(),
    sharesRotatedAt: Date.now(),
    lastRequestedAt: Date.now(),
    usagesAfterExpiration: 0,
    // TODO: Add addRecoveryShareParams.deviceInfo

    // D + A SSS:
    deviceNonce: addRecoveryShareParams.deviceNonce,
    authShare: "",
    deviceShareHash: "",

    // RB + RA SSS:
    recoveryAuthShare: addRecoveryShareParams.recoveryAuthShare,
    recoveryBackupShareHash: addRecoveryShareParams.recoveryBackupShareHash
  });

  console.log("addRecoveryShare() =", keyShares[keyShares.length - 1]);
}

export interface GetShareForDeviceParams {
  deviceNonce: DeviceNonce;
  walletAddress: string;
  deviceShareHash: string;
}

export interface GetShareForDeviceReturn {
  authShare: string | null;
  rotateChallenge: boolean | null;
}

async function getKeyShareForDevice({
  deviceNonce,
  walletAddress,
  deviceShareHash
}: GetShareForDeviceParams): Promise<GetShareForDeviceReturn> {
  await sleep(2000);

  const keyShare: DbKeyShare = keyShares.find((keyShare) => {
    return (
      keyShare.userId === currentSession.userId &&
      keyShare.deviceNonce === deviceNonce &&
      keyShare.walletAddress === walletAddress &&
      keyShare.deviceShareHash === deviceShareHash
    );
  });

  if (!keyShare) {
    throw new Error("No match found");
  }

  // TODO: Update `keyShare` dates and add logic for rotation.

  return Promise.resolve({
    authShare: keyShare.authShare,
    rotateChallenge: false
  });
}

async function recoverWallet(
  walletAddress: string,
  challengeSignature: string
) {
  const matchKeyShare = keyShares.find((keyShare) => {
    return (
      keyShare.walletAddress === walletAddress && !!keyShare.recoveryAuthShare
    );
  });

  return matchKeyShare?.recoveryAuthShare || null;
}

// Authentication:

export interface DbAuthenticateData {
  userId: string;
  authMethod: AuthMethod;
}

const mockedUserId = nanoid();

let currentSession: DbAuthenticateData | null = null;

async function authenticate(
  authMethod: AuthMethod
): Promise<DbAuthenticateData> {
  await sleep(2000);

  currentSession = {
    userId: mockedUserId,
    authMethod
  };

  // TODO: Persist these

  return currentSession;
}

async function refreshSession(): Promise<DbAuthenticateData> {
  await sleep(2000);

  return currentSession;
}

interface Challenge {
  id: string;
  status: string;
  key: string; // walletAddress OR walletAddress+userId
  challenge: string;
  createdAt: string;
  version: string; // Do we need to support the older versions?
}

async function fetchWalletRecoveryChallenge(
  walletAddress: string
): Promise<string> {
  await sleep(2000);

  // TODO: Generate and store a walletAddress-challenge pair.

  return nanoid();
}

async function fetchRecoverableAccounts(
  walletAddress: string,
  challengeSignature: string
): Promise<DbUser[]> {
  await sleep(2000);

  // TODO: Find the previous walletAddress-challenge pair, the walletAddress' public key and verify if the signature is
  // correct. If so, return all users that have this wallet added as a recovery wallet.

  return [
    {
      id: "0",
      name: "Recoverable user"
    }
  ];
}

async function fetchAccountRecoveryChallenge(
  userId: string,
  walletAddress: string
): Promise<string> {
  await sleep(2000);

  // TODO: Generate and store a userId-walletAddress-challenge tuple.

  return nanoid();
}

async function recoverAccount(
  authMethod: AuthMethod,
  userId: string,
  walletAddress: string,
  challengeSignature: string
) {
  await sleep(2000);

  // TODO: Find the previous userId-walletAddress-challenge tuple, the walletAddress' public key and verify if the
  // signature is correct. If so, authenticate the user and link the wallet to their account.

  currentSession = {
    userId,
    authMethod
  };

  return currentSession;
}

export const FakeDB = {
  // Wallet Management:
  fetchWallets,
  addWallet,
  addRecoveryShare,
  getKeyShareForDevice,
  recoverWallet,
  // TODO: Add a method to register "do not ask again" for a specific wallet.

  // Authentication:
  authenticate,
  refreshSession,
  fetchWalletRecoveryChallenge,
  fetchRecoverableAccounts,
  fetchAccountRecoveryChallenge,
  recoverAccount
};

export const MockedFeatureFlags = {
  maintainSeedPhrase: true
} as const;

// Test scenarios (?test = )
//
// -                 = No wallets
// - ok              = Has wallets, device share and nonce. Has recovery share.
// - nonce-gone      = Has wallets and device share, nonce gone. Has recovery share.
// - share-gone      = Has wallets and nonce, device share gone. Has recovery share.
// - lost            = Has wallets, no device info, no backups.
//
// Also available ?auth=1 to be authenticated straight away.
//
// The wallet seedphrase is:
// code napkin summer else endorse road rookie consider merit act sister health
//
// The wallet recovery file is:
// { "version": "1", "recoveryBackupShare": "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" }

const walletId = "ZX6KzIvpA6dqv4NtQbL-b";
const walletAddress = "hnJTIN3zJ-6rH1M3ydMl_yNLAwvgBshdZF5ZxMNRWEA";
const deviceNonce = "2025-01-13T14:01:39.623Z-Gb4slIxRhdp1ZrXkjGyRe";
const deviceShare =
  "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";

const { searchParams } = new URL(location.href);

if (searchParams.get("auth") === "1") {
  currentSession = {
    userId: mockedUserId,
    authMethod: "passkey"
  };
}

const testKey = searchParams.get("test");

if (testKey) {
  localStorage.clear();
  sessionStorage.clear();

  // Wallet and work share:

  wallets.push({
    id: walletId,
    userId: mockedUserId,
    chain: "arweave",
    address: walletAddress,
    publicKey:
      "nPw3bI6yHZOIRLOQ74N3Yet6eMitn48bgJfU9XTTgCMBG6jkj_mhTQh0faheQSSPlljRjjl6MQvll31R8p_SoJ5eZ9JE9H3VIyL2pSlrHA2rAjvRky090qK-5QRDZI-Jsb4IsE8ul8atlT2iqwUk2WBUhCKP-ch1JIq0SQYiPtsP7otEOnjYg1OuUiqqdSdTCigoe6HJyheZ7piQcd51N7nIlRU68odqG9hcOiCfoE61eoDxx_Cw0SVO55uTD3SDv1KS8nCzsWmQtl4Sk8_ltf_FNhLifFh-aCMdwjvByFWFFXQ0wabjI6W3XIh9eA-Eii8wXT7kYmnOZ2Je07bdxqAcazTLh7ik1kyg_vh6cqlCvcP2DFzFXH4cTxgSDwF_Dk8w3lPjIJUbau7I1u9lJ9O70kwajvktbjm-if-iA8e5y_JsltPnWNlVGt98qwhspB6OD_0bXU1_pWmbtKdyx3-sCZ96RRmCHaztz28ms6f8HchAVI6co8uUIMvq5gU_oi4v6WKmXFqSiF3z_3IanCCGZ127dggd0fnwWc8xQDqPeo3pib5ttrU787C_0VWM_cZkeZk0Qre_bgR2v40MllooAM5UAM1hBhNnPQo3S1YUgA11d6BlI-W2EKFpUvDoNs3UbXqSffUl-GHNraCGyV6qUfJKyJ_wp_JJS-NqgSE",
    walletType: "public",
    canBeUsedToRecoverAccount: true,
    canRecover: false,
    info: {
      identifierType: "alias",
      alias: "",
      ans: null,
      pns: null
    },
    source: {
      type: "imported",
      from: "seedPhrase",
      deviceAndLocationInfo: {}
    },
    lastUsed: 1736953788658,
    status: "enabled"
  });

  keyShares.push({
    id: "2xFrAEXZU3iS_JQv5Mc5G",
    status: "",
    userId: mockedUserId,
    walletId: walletId,
    walletAddress: walletAddress,
    createdAt: 1736953788658,
    deviceNonceRotatedAt: 1736953788658,
    sharesRotatedAt: 1736953788658,
    lastRequestedAt: 1736953788658,
    usagesAfterExpiration: 0,
    deviceNonce: deviceNonce,
    authShare:
      "Fj6A0m5XSdYQv0I1h8zt9J/L4QVjmvDuuIDRAtXExYXVxhkOBLjEGZ5wRK+AFUJ9orAS3G7rdx7261m2KtcK8PPpMXC4iW3C4L/pdB1oAhSaQem2vdDqPXEFeUcO786CS78/3+IxvC/ZOz4AJUDNAgmBm60NIuD0F6rVZ8GMeyNq11hUJf3/KkPqHE5sTiXNkY5uV5tlX90CWVZhfQaSP8WTfsAQyQvENsGg4QWFjsrJ1qxf9wVnVkOKx+kpeBuE03pM8LuJukBFYQomtvd3myCrEUDZqbv8L2MyGfy/MMoqMSn7++ePsiQItZg90EsVFSaQHInwY079VOyJ9leFqibebwd9HzwWd6ortTpOZfnkJM8IvzsNu0lINb2JfW27rfcscYR4xP4WwKEUVfGTse53uV+hHK+X7Pjg2AWeBuQ8r52tI6XBrhJg3bHDkHdbJDaPVc9yoHLNUFAgX1JmXl9ObYJDZvM+DOG+Tla1YsXGd7+Ez7ExZY3TsWWnAFVte5pcqyjucsLQMRzQfJnEadD3pJprhGvLBfn4e2OEKsTGYwF7A+p5KBB6wsEZA7bZ38RaM4qsK5eao9UPIh4b5blgZZ8/Sh7r0+MS2KbEF9JuMFx14hqdTEdFJ2ez+JF8vxl16vTK3An1cvmrAs8/hf+4D42VU3Y40Q6Uz2DH/QImc/Y+do0BefJKAZuvp/j8qVUwHYMNm4+Scif5z+3iRJZjwTgzp4tZsYcloc5Rweicg9rwjiyvK+jczcaNayfBggZR7f+5+RivBdsJNWmJNPCRm0EdYNHxvJyWiA6BJJBvVqqDHvAKMjl/7gS9FTA7bbP7cQFFq70VeUhWGiNwGaqsseB1cq0N+VN7PcPEWtBjwraqe3ViQ9VpVvz64TfsMQ88XbUjLGfWezSo1IgU2zlqFzFvD7A3oDDMsY8YfqrLEqFn9TpLW0fo/XlGIUzgg6WoUG4ZgFa150miMhsmG2SGfI9e98Db/VEmm9dW9OUpBMGtuYdLfw5Zyim8WTKsMraT1MJUYoVqecA9iTOMlQlk3QBahY0IApxaXcf8dIXvOgubwwzyES1B8X4LC4mces5CMWRKZXSB603VYsvGaKK/gWa0SQbdpcjqnD8SanS26QtmXLu3yZfCEdbBHaFM/kjBz/vcb3arWX2RQt77XkPpgO+iUzCyUnfvV3RMfztEacLQQvdhYVq6ROtFHmxfv8+cHqKJ7vClKtseJ8JFeQ4Ot58U6pYNhAPiPIe5CZ31/CvyHM1+ThjnSnELbR1BQ/lk1Ib9pZXKzWGMvWvKOW9GcA2ZCij+ABzLiRsurxvDXkj9YAB1On4kW7atds6/yYJv54ohJgvdC9LWjHnpl27wyzKJmfwjxxqcX9vVGpSr+YlIonyrlQ9RrR5aQWfgtTeFTqdX5BMJ3yT/tSDGdhT3jrVFzmvzxbchexstlTqzY8R7rBdQ09g7m8bkZ2y16xY3nCZX9Bx1i9wysJZTBeO1NF6HLWyTgwWRWPqbwMDeFuxGweCWJhtXPhYKDsuYUwISc5c/pD4zVTULura2fZvCRrVTZGjm/JUPO6i14Ooh46BSlYv1YnnjDCXajeiGmPQSLOQYaqdEdCn2vGCx6P5i4/J4H1IV9z/lYKtjz5ezDTP81GeBdw3bqdSY4Oe7t37PnhSBqqrJ93067dgdZ4dEsBV9ZC4JGkbLs7wytNqpNv61h3vGbXnEGdHvNOPRCi/ZuLwL6PtUpo7lNU0ibdvLCDrOUmZzmH7rvKWFPFK6nBOKxWD7K4Oe8qNFsJ+QCqxJ0GGoVI2UL7Ngc/cLzScM4OHjPZMY9zYAlLp+rV7nuUbwpUngEKWuSI9mkciKf5H/F1OBVaJx0QicoSb5knZW+dy/t1Kq19/8/3gobah8KdArG1vDKjzQXPTzRMYI3WfJBGUefYiMFDr/zS+wHM4nJn5uiUzJ/7aHQrT8C6qkhI6bFnf5UplM7xhJBPBHxr9NrUnyMkyxPB8TdrFKs2iiyZVCOFiYphv3ooryhJauib9/sS8wjNyZU5h4VJLHi8RJbyuka20xJdI1ivAHOa9mnGlYpYFoMpWEVM7/05HPHPPKcSLkv3qovUhevas0HP7cRG06jWHViZRIV/R1QnSm5zImT3Z0yWXRcKSenUJu3ELr66lxtLN8OjUSWoJUg+OG0ev1EG5rtNSK6MiqA6VD/Tt48hzdn5xEp8lXbhLMQ7eRwZyke2tfLE+U9HUCmsO2fyq6gyjiOL8dVFiQ5wxFB3es2WHUCY/tMFbs0ckAcU/rDo0G4TiO7/aHAy2C5JanC7F7pC2x1+YnevxxaC1Hf6XJCeyRD3O6pVTCecCjJPISaL0UXJPjbfmZRuqQdUmez3+8Ty2FOdywH4iPabWIxdEhyLJY+pxvKtiA7cuLvjdh2E5ns6ar219LLriEqYo6/linYJwHq7Y5oYwj2c++XXSvZiNdZ8FF//N1Bs85kJ+/ea9mshKxcq+Z8/nGhMKoqH8SfAzMrOYOH4lkIwvMFKHWXfBp4LTrD7b5lip2ztpVLId6Hq2JCKEa7fMNoLuGeenasczZ1Ifd6xu0j0fGHs0/BJaib40sj7vMU5WM/Tcw+FbE7DllMPiP889qZnH7wxDpfjOd9b5w5PWSmeJTUrpPW0Dtjzmki914UkK3WvOQnOCHP8RExKatob1I+oQcV+s+oCF1S/8zz65Xs4tUzwTZHSUp+Ye36VQclDINONG6DJiYrEi/1dBwIj6p/u23OqFRjPO+BFeFpKsUGWvlABFwbmO/IOx26vpUSTQggd1nmiVH/thZl4e9MCvN0rsLCuzFhMuwtEn+R030KkUq66daHty6AYOb+LUJ0m2V+OkGGO1djcAIPuNql/PPLAOlh26qhPpAn3G4kWxoToUNGieQcOX1Qs8DL7W5L5RD9+/WCG1AQ95xVQu44k/ObREMVxjdXQcujglAyUWfc3hwclJLp/qfe3wb+XP+HqmzU6KBsnWdOP6GzKe/hAucTVSIKdDwGNV8mdttqWESYsUijgkSopmGJQXiSx6jjuda3IlPknxNTPgx6T2CpY6BUD3wmvMVLzpBOENYfMak9nGBuGMMcq92y071vcnltq5FlVilDl68lLnBk2g0gPwYJ/+9pAv6LpUYa3d7lUJRReDAqYxt+1g=",
    deviceShareHash:
      "OpCZkKlyyqnDwpC9fjFs48Uk/NaCIoet4niR5e+A8wtx8L7/hTi5vj6rLFcJOwFDCCepnlw1QkkLEO82dwEx1g==",
    recoveryAuthShare: "",
    recoveryBackupShareHash: ""
  });
}

if (testKey !== "lost") {
  keyShares.push({
    id: "r4b0b3RZXhJ7ZLU7Z9fw0",
    status: "",
    userId: mockedUserId,
    walletId: walletId,
    walletAddress: walletAddress,
    createdAt: 1736953955219,
    deviceNonceRotatedAt: 1736953955219,
    sharesRotatedAt: 1736953955219,
    lastRequestedAt: 1736953955219,
    usagesAfterExpiration: 0,
    deviceNonce: deviceNonce,
    authShare: "",
    deviceShareHash: "",
    recoveryAuthShare:
      "xKCEpCBLNyj5citIWH8tDiqYENfHtGk15pI/8TJEn95Ady03aUspPTwzbvnMZZF7tEReIlJ3S0AJxGHMNz5a/lf3UlXyu4HkUYl0AgHFVCECOg+lvX5jWei6uqKl63XdIWbfYLLlhDzvEehSSrypTyq1zJo6EVWtWbK8BM3CyOsYEeTkH9WgLfy/OLBrnbC3I75k891Hfi3ucXWO3lK63Qhv15m+5LgWgqzdRQmUKw194ozNwoHf/l8E310yGszHFCf92z3sfBykDvfZgpp96wd1ld8a6pINfnHYrvhosOZGqhwVV0ksrB3XLBhtgEMAZL24mChUIhcE6Ao89Xb3iQDk9URVa3tUiAzJRVUDVRtJ2ji2QvYroVW3n6LRBBJrvbOX1LhGLycbsODjfGp5Aeing6KrHlnuAY1Y5xLcn4YRMLOlmLiUKd/wz/ksuWFQJnLooKHI/uFwWiuiWanB9xN+kxYYbrjUUwZeo5qDRV/NaN5pZ3k3WIv7CiD6PTh4ojjyEMVXTY+3NFIb2Nmuzp4lXpflctLTG+G52FV9GfDzmbhRr65cUIZLPJnXZuISuyANw+YljTdEzqu0kBXqf6O59H1yHbZOwQZR7htJtBg3saBO9AMkbDjVt1dtqOCYkcgyY6Q+UDbdQmVX5cp84QTJ2NGGJoMUpr3A+uHXYMBSH4KOnIZnc/XsSYAZNINlj+NHl26wpHiUErMh/r2ZzzOeGKDu7qnoDTPIUuZz8bE+JVvvZfu1rm7jLs+oy4IyeMZhReeCVOb6YyhwSXbvVLib0cpHiNXUDGEQG0DmzHbjCkhcmKVw7WjavjXBYR3VSITTy7sDGSzBvqeRtzNQ6/QDazDYpTsHkWvFu4cyppzDNJi+wM4yceQhbrCUiG0/xkwQaU9qRQAh30NkNQAJNfnfvJK14A0+DNiCn80B+SuDY4AWqPPixdeidSgO7BoSlWFyMixfGHyK9JeLwCdcXigtBLaY8gM2/WLYvCCeH0Q9peMzpFoRadsQVEXJy5HoyqVQ9/JOsF8ve9O6zTGshDZD5b7t8RadnElnBYPpF+aOBKFys57LYZ2IGjtE0g/L+oqaLhWfyscbNcniVdEQ4uL5oUShIjxKln5tBApe5+Y2aCupMb6Ekrrefr8YkQrc6AM6XCkpLUJTsfVx04YnTY1ZCs8R17qO/tQvhqSql/vDfjU96ytBSthh56o4TuQLJsB8EmmYOqxSSjLXr2mFmGW2AfTnoLZhd+j81pFKEU475J6XUv0TJRz9R2Z4XiMNfN3whTXesiNrgyTfkLolNaww4qpyb+1sL5HHYT1AZfc4cnnNhA8tkC9f58Fr7EwQ9h23vtxZRXrP++JhRF/03P9ytxlFyXQsMOYg8v0OFloLPcYwpEGpsjMHfA4KIojGU1QfvfPDw/dJvNdKydCazlrTPjnhyYMsG1dEs9e5rAWeCIIx6sjl69f7jAAjyu92x4HhrtfphPkF1Xl6HlXh/7ZLfatUw/ABvAJvQ2Rr9bcR4ZxA/J88QCUMAong9bYbMcLf5+cCiHOxOj5+sEihwC+kRuVjb7sBK8qI3bNuYMgupqp7wm/4+P5/Yzae0IUa4RvynsE6gq3CsEwytX6dsrXNnVJHgqq8RA4TkKdaPoX9VPshEfOHTYueJKIzZzu8v8w61lM+KbWQ2R/u0kl+qUdhEfeak6kXTt9jc9GGh/8EYBUOQdlfWgfBXaSj9b0+M9XdlzGWCWyXnnjAgIcaf6rmv9JTiv9uqeSG/sv9m36lHg4v/UCcRFdQt9zS1tbG8PQOaH26f6M5jmDiqrI2x74j7ZHhM10K8gYNfIEnxFqiW1w6/FvFsbYzBeIYSsCw51XKuZtW2+qGgUftwdLVAgpJtWrBpoNK4cNqOj+4JcccmrmZqk+1tU7+9Jn3qIZBlik2tnPSptERAfSMuD7y8DubKeDSVKZsL14xEQ9icRpQJZPFB1jleYZnDqkwgizS9sUrOwLrdkrNODjp9RiLqlNPYuMvLWbJ3A8q7naFJsLkpvUG2Tl9QVvFWw4SrgTmKAypXEOtLeBT35hmRub+/6GNETCDtvYCnadzZC5ojUG0fdKleJGGYXlHbbOHKZcIisgnOjIdKniA8Zte42jUZ1Phxs5TD08/La5yKllRJTd3SgZSd8lxbi64oyuttwl3h7DCFLwxuCOpFQGQg9abjSlHCXTogVy/J295lUUT4Eg0Dk4MdhYbBjXimvBlgCcgS6KROKSWIoDYJHu2rhbbpdRWNyXZ4Xm0zT7BQIyN7CF0D43fZPisVHU1j297LmwzBmjbG689ir32L6xyIln4NvRkX8J5t8cZJMKlSykP1ETCcl48m6x/ffui1PWQUTcNN52HB49XGaqKcSejR/rFgt1pDlLVIQM5PidBVXXpqYD4+7W3BmIumkD1wJPijGBhejpE+xcS18V3RuqkLY5QVipFexrcNTdEW9paUbTsuTfppZ3BUaFyGOWdtr14v7NYkCLwPyb1NKLNr/6/cj121VlHiddc4W+E2fC1WJmbF4oJlYjUf9LxKUVBRYq+bLVGJsUCg4vpSL0ErBBDk//WTc4NkyIIYIOTGZC/CPJoPFQc2xP0728jklRP6mU07KaRSdoQ/CsdRtgcH8Oidridl3yTp3iKdaFxddj8vI7G15SD4tSAb6HV46Llg6z3R/a+yr6zbAcBexY2AyLOZFK6mzTAQyd6viCRJhbA3vxYHigyjEdxKR9/xEaRxZywCaAReTlZb5n9bsAm3CBTGRCZ+nB4Jq5IfaqFcM91DkwhFTgeZk4PzTLTNDzOkwU1jNf16XcgFRx3uiNFPNcPa8MVEKLwOlkSRnPal3jLnyrbAAkwcfbSEoboUP8W9Tzk0CVzKWSRpiknHgTwNLy6OWAeQmqbf9XeECI8gWnN+Ocm309gSakNco8vr51BM7BCd1xLTNegPoyuINdeVr3Q2Vh/lh+W76wyjGIuBBbnnrrHfCSx2ESOyjKTVV2QlB3VEOBFGxORBd5/RMNMqSH9lCP2Hugyy7iL5NorXFDo78iw68gOLc878Z2syJcRJxA56HuGxaprqWmDp5y4rIxrb9XSZssY5wiPI2UM+Lq1KI2ZIA5VpmF4ki7rUImhTiFXUCnlZzbMdTex1Jm28vhgtC0VTxRHa43VKlg=",
    recoveryBackupShareHash:
      "BpQfrkaCQJo1wy/zBCtvNJhSAU/cpCYEtR36xRd5zun78/vzdwKgc60DuaaI8X/gSgyMdJ5Zro8OJFl8tSbkAw=="
  });
}

if (testKey === "ok" || testKey === "nonce-gone") {
  WalletUtils.storeDeviceShare(deviceShare, mockedUserId, walletAddress);
}

if (testKey === "ok" || testKey === "share-gone") {
  WalletUtils.storeDeviceNonce(deviceNonce);
}
