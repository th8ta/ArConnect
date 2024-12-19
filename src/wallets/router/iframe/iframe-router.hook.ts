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
import { PopupPaths } from "~wallets/router/popup/popup.routes";
import type {
  WanderRoutePath,
  BaseLocationHook,
  RoutePath,
  RouteRedirect
} from "~wallets/router/router.types";
import {
  isRouteOverride,
  isRouteRedirect,
  routeTrapInside,
  routeTrapMatches,
  routeTrapOutside,
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
  noShares: null,
  loading: "/__OVERRIDES/loading",
  locked: "/__OVERRIDES/unlock",
  unlocked: null
};

export function useAuthStatusOverride(
  location?: RoutePath
): null | ExtensionRouteOverride | RouteRedirect<ArConnectRoutePath> {
  const { authStatus, promptToBackUp } = useAuth();

  // console.log("authStatus =", authStatus);

  // TODO: Memo this:

  if (location) {
    if (authStatus === "noAuth") {
      return routeTrapMatches(
        location,
        [EmbeddedPaths.Auth, EmbeddedPaths.AuthRecoverAccount],
        EmbeddedPaths.Auth
      );
    }

    if (authStatus === "noWallets") {
      return routeTrapMatches(
        location,
        [
          EmbeddedPaths.AuthGenerateWallet,
          EmbeddedPaths.AuthAddDevice,
          EmbeddedPaths.AuthAddAuthProvider,
          EmbeddedPaths.AuthImportWallet
          // EmbeddedPaths.AddDevice/<SOMETHING>
          // EmbeddedPaths.AddAuthProvider/<SOMETHING>
        ],
        EmbeddedPaths.AuthGenerateWallet
      );
    }

    if (authStatus === "noShares") {
      return routeTrapMatches(
        location,
        [EmbeddedPaths.AuthRestoreShards, EmbeddedPaths.AuthGenerateWallet],
        EmbeddedPaths.AuthRestoreShards
      );
    }

    if (authStatus === "unlocked") {
      // TODO: What if we are here but the wallet, for whatever reason, is not in the wallet provider / ExtensionStore?
      // TODO: We need a routeOffLimits to keep users away from /auth after they authenticate (except for confirmation screen while it has location state data)

      return promptToBackUp
        ? routeTrapMatches(
            location,
            [EmbeddedPaths.AccountBackupShares],
            EmbeddedPaths.AccountBackupShares
          )
        : routeTrapOutside(location, EmbeddedPaths.Auth, PopupPaths.Home);
    }
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
    // console.log("override =", override);

    return [override, isRouteRedirect(override) ? wavigate : NOOP];
  }

  if (authRequestsLocation && !isRouteOverride(authRequestsLocation)) {
    return [authRequestsLocation, authRequestsNavigate];
  }

  return [wocation as WanderRoutePath, wavigate];
};

