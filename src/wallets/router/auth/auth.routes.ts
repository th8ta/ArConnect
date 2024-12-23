import { AllowanceAuthRequestView } from "~routes/auth/allowance";
import { BatchSignDataItemAuthRequestView } from "~routes/auth/batchSignDataItem";
import { ConnectAuthRequestView } from "~routes/auth/connect";
import { DecryptAuthRequestView } from "~routes/auth/decrypt";
import { LoadingAuthRequestView } from "~routes/auth/loading";
import { SignAuthRequestView } from "~routes/auth/sign";
import { SignatureAuthRequestView } from "~routes/auth/signature";
import { SignDataItemAuthRequestView } from "~routes/auth/signDataItem";
import { SignKeystoneAuthRequestView } from "~routes/auth/signKeystone";
import { SubscriptionAuthRequestView } from "~routes/auth/subscription";
import { TokenAuthRequestView } from "~routes/auth/token";
import { UnlockAuthRequestView } from "~routes/auth/unlock";
import { getExtensionOverrides } from "~wallets/router/extension/extension.routes";
import type { RouteConfig } from "~wallets/router/router.types";

export type AuthRoutePath =
  | "/"
  | `/connect/${string}`
  | `/allowance/${string}`
  | `/token/${string}`
  | `/decrypt/${string}`
  | `/sign/${string}`
  | `/signKeystone/${string}`
  | `/signature/${string}`
  | `/signDataItem/${string}`
  | `/batchSignDataItem/${string}`
  | `/subscription/${string}`;

export const AuthPaths = {
  Connect: "/connect/:authID",
  Allowance: "/allowance/:authID",
  Token: "/token/:authID",
  Decrypt: "/decrypt/:authID",
  Sign: "/sign/:authID",
  SignKeystone: "/signKeystone/:authID",
  Signature: "/signature/:authID",
  SignDataItem: "/signDataItem/:authID",
  BatchSignDataItem: "/batchSignDataItem/:authID",
  Subscription: "/subscription/:authID"
} as const satisfies Record<string, AuthRoutePath>;

export const AUTH_ROUTES = [
  ...getExtensionOverrides({
    unlockView: UnlockAuthRequestView,
    loadingView: LoadingAuthRequestView
  }),
  {
    path: AuthPaths.Connect,
    component: ConnectAuthRequestView
  },
  {
    path: AuthPaths.Allowance,
    component: AllowanceAuthRequestView
  },
  {
    path: AuthPaths.Token,
    component: TokenAuthRequestView
  },
  {
    path: AuthPaths.Decrypt,
    component: DecryptAuthRequestView
  },
  {
    path: AuthPaths.Sign,
    component: SignAuthRequestView
  },
  {
    path: AuthPaths.SignKeystone,
    component: SignKeystoneAuthRequestView
  },
  {
    path: AuthPaths.Signature,
    component: SignatureAuthRequestView
  },
  {
    path: AuthPaths.SignDataItem,
    component: SignDataItemAuthRequestView
  },
  {
    path: AuthPaths.BatchSignDataItem,
    component: BatchSignDataItemAuthRequestView
  },
  {
    path: AuthPaths.Subscription,
    component: SubscriptionAuthRequestView
  }
] as const satisfies RouteConfig[];
