import { useHashLocation } from "wouter/use-hash-location";
import { useAuth } from "~utils/authentication/authentication.hooks";
import type { AuthStatus } from "~utils/authentication/authentication.provider";
import { NOOP } from "~utils/misc";
import { useAuthRequestsLocation } from "~wallets/router/auth/auth-router.hook";
import type { ExtensionRouteOverride } from "~wallets/router/extension/extension.routes";
import {
  EmbeddedPaths,
  type EmbeddedRoutePath
} from "~wallets/router/iframe/iframe.routes";
import type {
  ArConnectRoutePath,
  BaseLocationHook,
  RoutePath,
  RouteRedirect
} from "~wallets/router/router.types";
import {
  isRouteOverride,
  isRouteRedirect,
  routeTrapMatches,
  withRouterRedirects
} from "~wallets/router/router.utils";

const AUTH_STATUS_TO_OVERRIDE: Record<
  AuthStatus,
  null | ExtensionRouteOverride
> = {
  // TODO: Redefine these override paths:
  unknown: "/__OVERRIDES/cover",
  authLoading: "/__OVERRIDES/loading",
  authError: "/__OVERRIDES/loading",
  noAuth: null,
  noWallets: null,
  noShard: null,
  loading: "/__OVERRIDES/loading",
  locked: "/__OVERRIDES/unlock",
  unlocked: null
};

export function useAuthStatusOverride(
  location?: RoutePath
): null | ExtensionRouteOverride | RouteRedirect<EmbeddedRoutePath> {
  const { authStatus } = useAuth();

  console.log("authStatus =", authStatus);

  // TODO: Memo this:

  if (location) {
    if (authStatus === "noAuth") {
      return routeTrapMatches(
        location,
        [EmbeddedPaths.Authenticate, EmbeddedPaths.RecoverAccount],
        EmbeddedPaths.Authenticate
      );
    }

    if (authStatus === "noWallets") {
      return routeTrapMatches(
        location,
        [
          EmbeddedPaths.GenerateWallet,
          EmbeddedPaths.AddDevice,
          EmbeddedPaths.AddAuthProvider,
          EmbeddedPaths.ImportWallet
          // EmbeddedPaths.AddDevice/<SOMETHING>
          // EmbeddedPaths.AddAuthProvider/<SOMETHING>
        ],
        EmbeddedPaths.GenerateWallet
      );
    }

    if (authStatus === "noShard") {
      return routeTrapMatches(
        location,
        [EmbeddedPaths.RestoreShards, EmbeddedPaths.GenerateWallet],
        EmbeddedPaths.RestoreShards
      );
    }

    // if (authStatus === "unlocked") force user to be outside /auth (except for confirmation screen while it has location state data)
  }

  return AUTH_STATUS_TO_OVERRIDE[authStatus];
}

export const useEmbeddedLocation: BaseLocationHook = withRouterRedirects(() => {
  const [wocation, wavigate] = useHashLocation();
  const override = useAuthStatusOverride(wocation as RoutePath);
  const [authRequestsLocation, authRequestsNavigate] =
    useAuthRequestsLocation();

  if (override) {
    console.log("override =", override);

    return [override, isRouteRedirect(override) ? wavigate : NOOP];
  }

  if (authRequestsLocation && !isRouteOverride(authRequestsLocation)) {
    return [authRequestsLocation, authRequestsNavigate];
  }

  return [wocation as ArConnectRoutePath, wavigate];
});
