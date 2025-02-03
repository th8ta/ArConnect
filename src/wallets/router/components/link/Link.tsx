import { Link as Wink } from "wouter";
import type { WanderRoutePath } from "~wallets/router/router.types";

export interface LinkProps {
  to: WanderRoutePath;
  state?: unknown;
}

export function Link(props: LinkProps) {
  return <Wink {...props} />;
}
