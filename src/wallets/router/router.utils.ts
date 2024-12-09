import { useCallback, useEffect, useMemo } from "react";
import {
  useSearch as useWearch,
  useLocation as useWouterLocation
} from "wouter";
import type {
  RouteConfig,
  ArConnectRoutePath,
  RoutePath,
  RouteOverride
} from "~wallets/router/router.types";

export function isRouteOverride(
  path: RoutePath | RouteOverride
): path is RouteOverride {
  return path.startsWith("/__OVERRIDES/");
}

export function prefixRoutes(
  routes: RouteConfig[],
  prefix: RoutePath
): RouteConfig[] {
  return routes.map((route) => ({
    ...route,
    path: isRouteOverride(route.path)
      ? (route.path satisfies RouteOverride)
      : (`${prefix}${route.path}` satisfies RoutePath)
  }));
}

export function BodyScroller() {
  const { location } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

export type NavigateAction = "prev" | "next" | "up" | number;

function isNavigateAction(
  to: ArConnectRoutePath | NavigateAction
): to is NavigateAction {
  return typeof to === "number" || !to.startsWith("/");
}

export function useLocation() {
  const [wocation, wavigate] = useWouterLocation();

  const navigate = useCallback(
    <S = any>(
      to: ArConnectRoutePath | NavigateAction,
      options?: {
        replace?: boolean;
        state?: S;
        search?: Record<string, string | number>;
      }
    ) => {
      let toPath = to as ArConnectRoutePath;

      if (isNavigateAction(to)) {
        const toParts = wocation.split("/");
        const lastPart = toParts.pop();
        const parentPath = `/${toParts.join("/")}` as ArConnectRoutePath;

        if (to === "up") {
          toPath = parentPath;
        } else if (typeof to === "string") {
          const page = parseInt(lastPart);

          if (isNaN(page))
            throw new Error(
              `The current location "${location}" doesn't end with an index`
            );

          if (to === "prev") {
            if (page === 1) throw new Error(`Page 0 out of bounds`);

            toPath = `${parentPath}/${page - 1}` as ArConnectRoutePath;
          } else if (to === "next") {
            toPath = `/${parentPath}/${page + 1}` as ArConnectRoutePath;
          }
        } else {
          if (to <= 0) throw new Error(`Page ${to} out of bounds`);

          toPath = `${parentPath}/${to}` as ArConnectRoutePath;
        }
      }

      if (options?.search) {
        const searchParams = new URLSearchParams();

        Object.entries(options.search).forEach(([key, value]) => {
          searchParams.append(key, encodeURIComponent(value));
        });

        if (searchParams.size > 0) {
          toPath += `?${searchParams.toString()}`;
        }
      }

      return wavigate(toPath, options);
    },
    [wocation, wavigate]
  );

  const back = useCallback(() => {
    history.back();
  }, []);

  return {
    location: wocation,
    navigate,
    back
  } as {
    location: ArConnectRoutePath;
    navigate: typeof navigate;
    back: typeof back;
  };
}

export function useSearchParams<S>() {
  const searchString = useWearch();

  return useMemo(() => {
    if (!searchString) return {};

    const searchParams = new URLSearchParams(searchString);

    return Object.fromEntries(searchParams.entries());
  }, [searchString]) as S;
}
