import { Redirect as Wedirect } from "wouter";
import type { ArConnectRoutePath } from "~wallets/router/router.types";

export interface RedirectProps {
  to: ArConnectRoutePath;
  state?: unknown;
}

export function Redirect(props: RedirectProps) {
  return <Wedirect {...props} />;
}
