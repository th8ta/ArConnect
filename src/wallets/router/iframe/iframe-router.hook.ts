import { useHashLocation } from "wouter/use-hash-location";
import { useAuth } from "~utils/authentication/authentication.hooks";
import type { AuthStatus } from "~utils/authentication/authentication.provider";
import { NOOP } from "~utils/misc";
import { useAuthRequestsLocation } from "~wallets/router/auth/auth-router.hook";
import type { ExtensionRouteOverride } from "~wallets/router/extension/extension.routes";
import type { EmbeddedRoutePath } from "~wallets/router/iframe/iframe.routes";
import type {
  WanderRoutePath,
  BaseLocationHook,
  RoutePath,
  RouteRedirect
} from "~wallets/router/router.types";
import {
  isRouteOverride,
  isRouteRedirect,
  routeTrap,
  withRouterRedirects
} from "~wallets/router/router.utils";

const AUTH_STATUS_TO_OVERRIDE: Record<
  AuthStatus,
  null | ExtensionRouteOverride
> = {
  authLoading: "/__OVERRIDES/cover",
  noAuth: null,
  noWallets: null,
  loading: "/__OVERRIDES/loading",
  locked: "/__OVERRIDES/unlock",
  unlocked: null
};

export function useAuthStatusOverride(
  location?: RoutePath
): null | ExtensionRouteOverride | RouteRedirect<EmbeddedRoutePath> {
  const { authStatus } = useAuth();

  console.log("authStatus =", authStatus);

  if (location) {
    if (authStatus === "noAuth") {
      return routeTrap(location, "/auth");
    }

    if (authStatus === "noWallets") {
      return routeTrap(location, "/auth/confirmation");
    }

    // if (authStatus === "unlocked") force user to be outside /auth (except for confirmation screen while it has location state data)
  }

  return AUTH_STATUS_TO_OVERRIDE[authStatus];
}

export const useEmbeddedLocation: BaseLocationHook = () => {
    const [wocation, wavigate] = useHashLocation();
    const { authStatus } = useAuth();
    const override = useAuthStatusOverride();
    const [authRequestsLocation, authRequestsNavigate] =
    useAuthRequestsLocation();

  if (override) {
    console.log("override =", override);

    return [override, isRouteRedirect(override) ? wavigate : NOOP];
  }

  if (authRequestsLocation && !isRouteOverride(authRequestsLocation)) {
    return [authRequestsLocation, authRequestsNavigate];
  }

  return [wocation as WanderRoutePath, wavigate];
};

