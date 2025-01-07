import { AUTH_ROUTES } from "~wallets/router/auth/auth.routes";
import { getExtensionOverrides } from "~wallets/router/extension/extension.routes";
import { POPUP_ROUTES } from "~wallets/router/popup/popup.routes";
import type { RouteConfig } from "~wallets/router/router.types";
import { isRouteOverride, prefixRoutes } from "~wallets/router/router.utils";

// Authentication Views:
import { AuthEmbeddedView } from "~routes/embedded/auth/auth/auth.view";
import { AuthGenerateWalletEmbeddedView } from "~routes/embedded/auth/generate-wallet/auth-generate-wallet.view";
import { AuthAddDeviceEmbeddedView } from "~routes/embedded/auth/add-device/auth-add-device.view";
import { AuthAddAuthProviderEmbeddedView } from "~routes/embedded/auth/add-auth-provider/auth-add-auth-provider.view";
import { AuthImportSeedPhraseEmbeddedView } from "~routes/embedded/auth/import-seed-phrase/auth-import-seed-phrase.view";
import { AuthRestoreSharesEmbeddedView } from "~routes/embedded/auth/restore-shares/auth-restore-shares.view";
import { AuthRecoverAccountEmbeddedView } from "~routes/embedded/auth/recover-account/auth-recover-account.view";

// Account Management Views:
import { AccountEmbeddedView } from "~routes/embedded/account/account/account.view";
import { AccountGenerateWalletEmbeddedView } from "~routes/embedded/account/generate-wallet/account-generate-wallet.view";
import { AccountImportSeedPhraseEmbeddedView } from "~routes/embedded/account/import-seed-phrase/account-import-seed-phrase.view";
import { AccountBackupSharesEmbeddedView } from "~routes/embedded/account/backup-shares/account-backup-shares.view";
import { AccountExportWalletEmbeddedView } from "~routes/embedded/account/export-wallet/account-export-wallet.view";
import { AuthAddWalletEmbeddedView } from "~routes/embedded/auth/add-wallet/auth-add-wallet.view";
import { AuthImportKeyfileEmbeddedView } from "~routes/embedded/auth/import-keyfile/auth-import-keyfile.view";
import { AccountAddWalletEmbeddedView } from "~routes/embedded/account/add-wallet/account-add-wallet.view";
import { AccountImportKeyfileEmbeddedView } from "~routes/embedded/account/import-keyfile/account-import-keyfile.view";

export type EmbeddedRoutePath =
  | "/auth"
  // | "/auth/more-providers"
  | "/auth/add-wallet"
  | "/auth/generate-wallet"
  | "/auth/import-seed-phrase"
  | "/auth/import-keyfile"
  | "/auth/add-device"
  | "/auth/confirmation"
  | "/auth/add-auth-provider"
  | "/auth/restore-shards"
  | "/auth/recover-account"
  | "/account"
  // | "/account/add-provider"
  // | "/account/add-provider/more-providers"
  | "/account/add-wallet"
  | "/account/generate-wallet"
  | "/account/import-seed-phrase"
  | "/account/import-keyfile"
  | "/account/backup-shares"
  | "/account/export-wallet";

export const EmbeddedPaths = {
  // TODO: Consider nesting these instead:

  // Authentication:
  Auth: "/auth",
  AuthAddWallet: "/auth/add-wallet",
  AuthGenerateWallet: "/auth/generate-wallet",
  AuthImportSeedPhrase: "/auth/import-seed-phrase",
  AuthImportKeyfile: "/auth/import-keyfile",
  AuthAddDevice: "/auth/add-device",
  AuthAddAuthProvider: "/auth/add-auth-provider",
  AuthRestoreShards: "/auth/restore-shards",
  AuthRecoverAccount: "/auth/recover-account",

  // Account Management:
  Account: "/account",
  AccountAddWallet: "/account/add-wallet",
  AccountGenerateWallet: "/account/generate-wallet",
  AccountImportSeedPhrase: "/account/import-seed-phrase",
  AccountImportKeyfile: "/account/import-keyfile",
  AccountBackupShares: "/account/backup-shares",
  AccountExportWallet: "/account/export-wallet"
} as const satisfies Record<string, EmbeddedRoutePath>;

const IFRAME_OWN_ROUTES = [
  // Authentication:

  {
    path: EmbeddedPaths.Auth,
    component: AuthEmbeddedView
  },
  {
    path: EmbeddedPaths.AuthAddWallet,
    component: AuthAddWalletEmbeddedView
  },
  {
    path: EmbeddedPaths.AuthGenerateWallet,
    component: AuthGenerateWalletEmbeddedView
  },
  {
    path: EmbeddedPaths.AuthImportSeedPhrase,
    component: AuthImportSeedPhraseEmbeddedView
  },
  {
    path: EmbeddedPaths.AuthImportKeyfile,
    component: AuthImportKeyfileEmbeddedView
  },
  {
    path: EmbeddedPaths.AuthAddDevice,
    component: AuthAddDeviceEmbeddedView
  },
  {
    path: EmbeddedPaths.AuthAddAuthProvider,
    component: AuthAddAuthProviderEmbeddedView
  },
  {
    path: EmbeddedPaths.AuthRestoreShards,
    component: AuthRestoreSharesEmbeddedView
  },
  {
    path: EmbeddedPaths.AuthRecoverAccount,
    component: AuthRecoverAccountEmbeddedView
  },

  // Account Management:

  {
    path: EmbeddedPaths.Account,
    component: AccountEmbeddedView
  },
  {
    path: EmbeddedPaths.AccountAddWallet,
    component: AccountAddWalletEmbeddedView
  },
  {
    path: EmbeddedPaths.AccountGenerateWallet,
    component: AccountGenerateWalletEmbeddedView
  },
  {
    path: EmbeddedPaths.AccountImportSeedPhrase,
    component: AccountImportSeedPhraseEmbeddedView
  },
  {
    path: EmbeddedPaths.AccountImportKeyfile,
    component: AccountImportKeyfileEmbeddedView
  },
  {
    path: EmbeddedPaths.AccountBackupShares,
    component: AccountBackupSharesEmbeddedView
  },
  {
    path: EmbeddedPaths.AccountExportWallet,
    component: AccountExportWalletEmbeddedView
  }
] as const satisfies RouteConfig<EmbeddedRoutePath>[];

export const IFRAME_ROUTES = [
  ...getExtensionOverrides({
    unlockView: () => <p>Placeholder Unlock</p>,
    loadingView: () => <p>Placeholder Loading</p>
  }),

  // popup.tsx:
  ...POPUP_ROUTES.filter((route) => !isRouteOverride(route.path)),

  // auth.tsx:
  // TODO: How to add this prefix to routes to when using push(), etc? ENV variable in the enum?
  ...prefixRoutes(
    "/auth-request",
    AUTH_ROUTES.filter((route) => !isRouteOverride(route.path))
  ),

  // Embedded wallet only:
  ...IFRAME_OWN_ROUTES
] as const satisfies RouteConfig[];
