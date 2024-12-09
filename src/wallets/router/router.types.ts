import type React from "react";
import type { RouteComponentProps as WouteComponentProps } from "wouter";
import type { AuthRoutePath } from "~wallets/router/auth/auth.routes";
import type { DashboardRoutePath } from "~wallets/router/dashboard/dashboard.routes";
import type { PopupRoutePath } from "~wallets/router/popup/popup.routes";
import type { WelcomeRoutePath } from "~wallets/router/welcome/welcome.routes";

export interface CommonRouteProps<T = any>
  extends Omit<WouteComponentProps, "params"> {
  params: T;
}

export type RoutePath = `/${string}`;

export type RouteOverride = `/__OVERRIDES/${string}`;

export type RouteAuthType = "auth" | "anon";

export interface RouteConfig<
  P extends RoutePath | RouteOverride = RoutePath | RouteOverride
> {
  key?: string;
  path: P;
  component: React.ComponentType<CommonRouteProps>;
  authType?: RouteAuthType;
}

export type ArConnectRoutePath =
  | WelcomeRoutePath
  | AuthRoutePath
  | PopupRoutePath
  | DashboardRoutePath;
