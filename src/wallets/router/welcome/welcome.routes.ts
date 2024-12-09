import { HomeWelcomeView } from "~routes/welcome";
import { GettingStartedWelcomeView } from "~routes/welcome/gettingStarted";
import { SetupWelcomeView, type WelcomeSetupMode } from "~routes/welcome/setup";
import { StartWelcomeView } from "~routes/welcome/start";
import type { RouteConfig } from "~wallets/router/router.types";

export type WelcomeRoutePath =
  | "/"
  | `/start/${string}`
  | `/getting-started/${string}`
  | `/${WelcomeSetupMode}/${string}`;

export const WelcomePaths = {
  Home: "/",
  Start: "/start/:page",
  GettingStarted: "/getting-started/:page",
  Setup: "/:setupMode/:page"
} as const;

export const WELCOME_ROUTES = [
  {
    path: WelcomePaths.Home,
    component: HomeWelcomeView
  },
  {
    path: WelcomePaths.Start,
    component: StartWelcomeView
  },
  {
    path: WelcomePaths.GettingStarted,
    component: GettingStartedWelcomeView
  },
  {
    path: WelcomePaths.Setup,
    component: SetupWelcomeView
  }
] as const satisfies RouteConfig[];
