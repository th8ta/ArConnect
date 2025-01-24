import type { ArConnectRoutePath } from "~wallets/router/router.types";

export type RouteType =
  | "auth"
  | "account"
  | "settings"
  | "auth-request"
  | "default";

const routeTypeByLocationPrefix: Record<string, RouteType> = {
  auth: "auth",
  account: "account",
  "quick-settings": "settings",
  "auth-request": "auth-request"
};

export function locationToRouteType(path: ArConnectRoutePath): RouteType {
  const pathPrefix = path.split("/")[1] || "";

  return routeTypeByLocationPrefix[pathPrefix] || "default";
}

// TODO: This should match SDK's options:
export type EmbeddedLayout = "modal" | "popup";

const preferredLayoutByRouteType: Record<RouteType, EmbeddedLayout> = {
  auth: "modal",
  account: "modal",
  settings: "modal",
  "auth-request": "popup",
  default: "popup"
};

export function routeTypeToPreferredLayout(
  routeType: RouteType
): EmbeddedLayout {
  return preferredLayoutByRouteType[routeType] || "popup";
}
