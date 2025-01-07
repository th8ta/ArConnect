import type { WalletInterface } from "~components/welcome/load/Migrate";
import type { JWKInterface } from "arweave/web/lib/wallet";
import { type AnsUser, getAnsProfile } from "~lib/ans";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStorage } from "~utils/storage";
import { defaultGateway } from "~gateways/gateway";
import { ExtensionStorage } from "~utils/storage";
import { findGateway } from "~gateways/wayfinder";
import type { HardwareApi } from "./hardware";
import type { StoredWallet } from "~wallets";
import Arweave from "arweave";
import BigNumber from "bignumber.js";
import { retryWithDelayAndTimeout } from "~utils/promises/retry";
import { isPasswordFresh } from "./auth";

/**
 * Wallets with details hook
 */
export function useWalletsDetails(wallets: JWKInterface[]) {
  const [walletDetails, setWalletDetails] = useState<WalletInterface[]>([]);

  useEffect(() => {
    (async () => {
      const arweave = new Arweave(defaultGateway);
      const details: WalletInterface[] = [];

      // load wallet addresses
      for (const wallet of wallets) {
        const address = await arweave.wallets.getAddress(wallet);

        // skip already added wallets
        if (!!walletDetails.find((w) => w.address === address)) {
          continue;
        }

        details.push({ address });
      }

      // load ans labels
      try {
        const profiles = (await getAnsProfile(
          details.map((w) => w.address)
        )) as AnsUser[];

        for (const wallet of details) {
          const profile = profiles.find((p) => p.user === wallet.address);

          if (!profile?.currentLabel) continue;
          wallet.label = profile.currentLabel + ".ar";
        }
      } catch {}

      // set details
      setWalletDetails(details);
    })();
  }, [wallets]);

  return walletDetails;
}

/**
 * Active wallet data (unencrypted)
 */
export function useActiveWallet() {
  // current address
  const [activeAddress] = useStorage<string>({
    key: "active_address",
    instance: ExtensionStorage
  });

  // all wallets added
  const [wallets] = useStorage<StoredWallet[]>(
    {
      key: "wallets",
      instance: ExtensionStorage
    },
    []
  );

  // active wallet
  const wallet = useMemo(
    () => wallets?.find(({ address }) => address === activeAddress),
    [activeAddress, wallets]
  );

  return wallet;
}

/**
 * Type of the current wallet (local/hardware => what type of API for the hardware)
 */
export function useHardwareApi() {
  // current wallet
  const wallet = useActiveWallet();

  // hardware wallet type
  const hardwareApi = useMemo<HardwareApi | false>(
    () => (wallet?.type === "hardware" && wallet.api) || false,
    [wallet]
  );

  return hardwareApi;
}

/**
 * Active wallet balance
 */
export function useBalance() {
  // grab address
  const [activeAddress] = useStorage<string>({
    key: "active_address",
    instance: ExtensionStorage
  });

  // balance in AR
  const [balance, setBalance] = useState(BigNumber("0"));

  const fetchBalance = useCallback(async () => {
    if (!activeAddress) {
      setBalance(BigNumber("0"));
      return;
    }

    const gateway = await findGateway({});
    const arweave = new Arweave(gateway);

    // fetch balance
    const winstonBalance = await arweave.wallets.getBalance(activeAddress);
    if (isNaN(+winstonBalance)) {
      throw new Error("Invalid balance returned");
    }
    const arBalance = BigNumber(arweave.ar.winstonToAr(winstonBalance));
    setBalance(arBalance);
  }, [activeAddress]);

  useEffect(() => {
    if (!activeAddress) return;

    retryWithDelayAndTimeout(fetchBalance).catch((error) => {
      console.log(`Error fetching balance: ${error}`);
    });
  }, [activeAddress, fetchBalance]);

  return balance;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const handler = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    handler.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (handler.current) {
        clearTimeout(handler.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to determine if a password prompt should be shown to the user
 *
 * @description Returns true when the stored password has expired and user needs to re-enter it.
 *
 * @returns {boolean} True if password prompt should be shown, false otherwise
 */
export const useAskPassword = (): boolean => {
  const [askPassword, setAskPassword] = useState(false);

  useEffect(() => {
    isPasswordFresh().then((isFresh) => setAskPassword(!isFresh));
  }, []);

  return askPassword;
};
