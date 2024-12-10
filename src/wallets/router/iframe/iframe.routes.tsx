import { GenerateWalletEmbeddedView } from "~routes/embedded/generate-wallet/generate-wallet.view";
import { AddDeviceEmbeddedView } from "~routes/embedded/add-device/add-device.view";
import { AuthenticateEmbeddedView } from "~routes/embedded/authenticate/authenticate.view";
import { ImportWalletEmbeddedView } from "~routes/embedded/import-wallet/import-wallet.view";
import { RestoreShardsEmbeddedView } from "~routes/embedded/restore-shards/restore-shards.view";
import { AUTH_ROUTES } from "~wallets/router/auth/auth.routes";
import { getExtensionOverrides } from "~wallets/router/extension/extension.routes";
import { POPUP_ROUTES } from "~wallets/router/popup/popup.routes";
import type { RouteConfig } from "~wallets/router/router.types";
import { isRouteOverride, prefixRoutes } from "~wallets/router/router.utils";
import { RecoverAccountEmbeddedView } from "~routes/embedded/recover-account/recover-account.view";
import { AddAuthProviderEmbeddedView } from "~routes/embedded/add-auth-provider/add-auth-provider.view";

export type EmbeddedRoutePath =
  | "/auth"
  | "/auth/generate-wallet"
  | "/auth/add-device"
  | "/auth/add-auth-provider"
  | "/auth/import-wallet"
  | "/auth/recover-account"
  | "/auth/restore-shards";

export const EmbeddedPaths = {
  Authenticate: "/auth",
  GenerateWallet: "/auth/generate-wallet",
  AddDevice: "/auth/add-device",
  AddAuthProvider: "/auth/add-auth-provider",
  ImportWallet: "/auth/import-wallet",
  RecoverAccount: "/auth/recover-account",
  RestoreShards: "/auth/restore-shards"
} as const satisfies Record<string, EmbeddedRoutePath>;

const IFRAME_OWN_ROUTES = [
  {
    path: EmbeddedPaths.Authenticate,
    component: AuthenticateEmbeddedView
  },
  {
    path: EmbeddedPaths.GenerateWallet,
    component: GenerateWalletEmbeddedView
  },
  {
    path: EmbeddedPaths.AddDevice,
    component: AddDeviceEmbeddedView
  },
  {
    path: EmbeddedPaths.AddAuthProvider,
    component: AddAuthProviderEmbeddedView
  },
  {
    path: EmbeddedPaths.ImportWallet,
    component: ImportWalletEmbeddedView
  },
  {
    path: EmbeddedPaths.RecoverAccount,
    component: RecoverAccountEmbeddedView
  },
  {
    path: EmbeddedPaths.RestoreShards,
    component: RestoreShardsEmbeddedView
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
