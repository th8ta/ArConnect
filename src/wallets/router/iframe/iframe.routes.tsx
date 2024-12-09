import { AUTH_ROUTES } from "~wallets/router/auth/auth.routes";
import { getExtensionOverrides } from "~wallets/router/extension/extension.routes";
import { POPUP_ROUTES } from "~wallets/router/popup/popup.routes";
import type { RouteConfig } from "~wallets/router/router.types";
import { isRouteOverride, prefixRoutes } from "~wallets/router/router.utils";

export type EmbeddedRoutePath = "/auth" | "/auth/wallet";

export const EmbeddedPaths = {
  Auth: "/auth",
  AuthWallet: "/auth/wallet"
} as const satisfies Record<string, EmbeddedRoutePath>;

const IFRAME_OWN_ROUTES = [
  {
    path: "/auth",
    component: () => <p>Placeholder Auth</p>
  },
  {
    path: "/auth/wallet",
    component: () => <p>Placeholder Auth / Wallet</p>
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
