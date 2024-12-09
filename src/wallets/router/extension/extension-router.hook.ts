import type { BaseLocationHook } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { NOOP } from "~utils/misc";
import { useWallets } from "~utils/wallets/wallets.hooks";
import type { WalletStatus } from "~utils/wallets/wallets.provider";
import type { ExtensionRouteOverride } from "~wallets/router/extension/extension.routes";

const WALLET_STATUS_TO_OVERRIDE: Record<
  WalletStatus,
  ExtensionRouteOverride | null
> = {
  noWallets: "/__OVERRIDES/cover",
  loading: "/__OVERRIDES/loading",
  locked: "/__OVERRIDES/unlock",
  unlocked: null
};

export function useExtensionStatusOverride() {
  const { walletStatus } = useWallets();

  return WALLET_STATUS_TO_OVERRIDE[walletStatus];
}

export const useExtensionLocation: BaseLocationHook = () => {
  const override = useExtensionStatusOverride();
  const [wocation, wavigate] = useHashLocation();

  if (override) return [override, NOOP];

  return [wocation, wavigate];
};
