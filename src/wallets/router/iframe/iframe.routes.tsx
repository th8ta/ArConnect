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
import { AuthImportWalletEmbeddedView } from "~routes/embedded/auth/import-wallet/auth-import-wallet.view";
import { AuthRestoreSharesEmbeddedView } from "~routes/embedded/auth/restore-shares/auth-restore-shares.view";
import { AuthRecoverAccountEmbeddedView } from "~routes/embedded/auth/recover-account/auth-recover-account.view";

// Account Management Views:
import { AccountEmbeddedView } from "~routes/embedded/account/account/account.view";
import { AccountGenerateWalletEmbeddedView } from "~routes/embedded/account/generate-wallet/account-generate-wallet.view";
import { AccountImportWalletEmbeddedView } from "~routes/embedded/account/import-wallet/account-import-wallet.view";
import { AccountBackupSharesEmbeddedView } from "~routes/embedded/account/backup-shares/account-backup-shares.view";
import { AccountExportWalletEmbeddedView } from "~routes/embedded/account/export-wallet/account-export-wallet.view";

export type EmbeddedRoutePath =
  | "/auth"
  | "/auth/generate-wallet"
  | "/auth/add-device"
  | "/auth/add-auth-provider"
  | "/auth/import-wallet"
  | "/auth/restore-shards"
  | "/auth/recover-account"
  | "/account"
  | "/account/generate-wallet"
  | "/account/import-wallet"
  | "/account/backup-shares"
  | "/account/export-wallet";

export const EmbeddedPaths = {
  // TODO: Consider nesting these instead:

  // Authentication:
  Auth: "/auth",
  AuthGenerateWallet: "/auth/generate-wallet",
  AuthAddDevice: "/auth/add-device",
  AuthAddAuthProvider: "/auth/add-auth-provider",
  AuthImportWallet: "/auth/import-wallet",
  AuthRestoreShards: "/auth/restore-shards",
  AuthRecoverAccount: "/auth/recover-account",

  // Account Management:
  Account: "/account",
  AccountGenerateWallet: "/account/generate-wallet",
  AccountImportWallet: "/account/import-wallet",
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
    path: EmbeddedPaths.AuthGenerateWallet,
    component: AuthGenerateWalletEmbeddedView
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
    path: EmbeddedPaths.AuthImportWallet,
    component: AuthImportWalletEmbeddedView
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
    path: EmbeddedPaths.AccountGenerateWallet,
    component: AccountGenerateWalletEmbeddedView
  },
  {
    path: EmbeddedPaths.AccountImportWallet,
    component: AccountImportWalletEmbeddedView
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
