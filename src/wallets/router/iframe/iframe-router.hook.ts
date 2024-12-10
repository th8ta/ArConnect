import { useHashLocation } from "wouter/use-hash-location";
import { useAuth } from "~utils/authentication/authentication.hooks";
import type { AuthStatus } from "~utils/authentication/authentication.provider";
import { NOOP } from "~utils/misc";
import { useAuthRequestsLocation } from "~wallets/router/auth/auth-router.hook";
import type { AuthRoutePath } from "~wallets/router/auth/auth.routes";
import type { ExtensionRouteOverride } from "~wallets/router/extension/extension.routes";
import type { EmbeddedRoutePath } from "~wallets/router/iframe/iframe.routes";
import type {
  ArConnectRoutePath,
  BaseLocationHook,
  RouteRedirect
} from "~wallets/router/router.types";
import {
  isRouteOverride,
  isRouteRedirect,
  parseRouteRedirect
} from "~wallets/router/router.utils";

const AUTH_STATUS_TO_OVERRIDE: Record<
  AuthStatus,
  ExtensionRouteOverride | RouteRedirect<EmbeddedRoutePath> | null
> = {
  authLoading: "/__OVERRIDES/cover",
  noAuth: "/__REDIRECT/auth",
  noWallets: "/__REDIRECT/auth/wallet",
  loading: "/__OVERRIDES/loading",
  locked: "/__OVERRIDES/unlock",
  unlocked: null
};

export function useAuthStatusOverride() {
  const { authStatus } = useAuth();

  return AUTH_STATUS_TO_OVERRIDE[authStatus];
}

export const useEmbeddedLocation: BaseLocationHook = () => {
  // const { authStatus } = useAuth();
  const override = useAuthStatusOverride();
  const [authRequestsLocation, authRequestsNavigate] =
    useAuthRequestsLocation();
  const [wocation, wavigate] = useHashLocation();

  if (override) {
    if (isRouteRedirect(override)) {
      const redirectLocation = parseRouteRedirect(override);

      console.log("redirectLocation =", redirectLocation);

      // TODO: Call wavigate to make the redirect happen

      return [redirectLocation, wavigate];
    } else {
      return [override, NOOP];
    }
  }

  if (authRequestsLocation && !isRouteOverride(authRequestsLocation)) {
    return [authRequestsLocation, authRequestsNavigate];
  }

  // TODO: This should also return a redirect, so redirects should happen AFTER (or at the end) of these location hooks:
  // if (wocation === "/" && authStatus === "noAuth") return [wocation as ArConnectRoutePath, wavigate]

  return [wocation as ArConnectRoutePath, wavigate];
};
