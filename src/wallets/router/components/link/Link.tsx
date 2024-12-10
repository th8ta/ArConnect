import type { PropsWithChildren } from "react";
import { Link as Wink } from "wouter";
import type { WanderRoutePath } from "~wallets/router/router.types";

export interface LinkProps extends PropsWithChildren {
  to: WanderRoutePath;
  state?: unknown;
}

export function Link(props: LinkProps) {
  return <Wink {...props} />;
}
