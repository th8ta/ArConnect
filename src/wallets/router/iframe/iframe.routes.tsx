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
import { RecoverCredentialsEmbeddedView } from "~routes/embedded/recover-credentials/recover-credentials.view";

export type EmbeddedRoutePath =
  | "/auth"
  | "/auth/generate-wallet"
  | "/auth/add-device"
  | "/auth/confirmation"
  | "/auth/import-wallet"
  | "/auth/recover-credentials"
  | "/auth/restore-shards";

export const EmbeddedPaths = {
  Authenticate: "/auth",
  GenerateWallet: "/auth/generate-wallet",
  AddDevice: "/auth/add-device",
  ImportWallet: "/auth/import-wallet",
  RecoverCredentials: "/auth/recover-credentials",
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
    path: EmbeddedPaths.ImportWallet,
    component: ImportWalletEmbeddedView
  },
  {
    path: EmbeddedPaths.RecoverCredentials,
    component: RecoverCredentialsEmbeddedView
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
