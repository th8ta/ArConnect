import { AUTH_ROUTES } from "~wallets/router/auth/auth.routes";
import { POPUP_ROUTES } from "~wallets/router/popup/popup.routes";
import type { RouteConfig } from "~wallets/router/router.types";
import { prefixRoutes } from "~wallets/router/router.utils";

export type EmbeddedRoutePath = "/auth" | "/auth/wallet";

export const EmbeddedPaths = {
  Auth: "/auth",
  AuthWallet: "/auth/wallet"
} as const satisfies Record<string, EmbeddedRoutePath>;

export type EmbeddedRouteOverride =
  | `/__OVERRIDES/cover`
  | `/__OVERRIDES/unlock`
  | `/__OVERRIDES/loading`;

export const EmbeddedOverrides = {
  Cover: "/__OVERRIDES/cover",
  Unlock: "/__OVERRIDES/unlock",
  Loading: "/__OVERRIDES/loading"
} as const satisfies Record<string, EmbeddedRouteOverride>;

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
  {
    path: EmbeddedOverrides.Cover,
    component: () => <></>
  },
  {
    path: EmbeddedOverrides.Unlock,
    component: () => <p>Placeholder Unlock</p>
  },
  {
    path: EmbeddedOverrides.Loading,
    component: () => <p>Placeholder Loading</p>
  },

  // popup.tsx:
  ...POPUP_ROUTES,

  // auth.tsx:
  // TODO: How to add this prefix to routes to when using push(), etc? ENV variable in the enum?
  ...prefixRoutes("/auth-request", AUTH_ROUTES),

  // Embedded wallet only:
  ...IFRAME_OWN_ROUTES
] as const satisfies RouteConfig[];
