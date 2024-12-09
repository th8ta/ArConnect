import { Link as Wink } from "wouter";
import type { ArConnectRoutePath } from "~wallets/router/router.types";

export interface LinkProps {
  to: ArConnectRoutePath;
  state?: unknown;
}

export function Link(props: LinkProps) {
  return <Wink {...props} />;
}
