import Arweave from "arweave";
import BigNumber from "bignumber.js";
import { findGateway } from "~gateways/wayfinder";
import { getArPrice } from "~lib/coingecko";
import { withRetry } from "./promises/retry";

interface Wallet {
  address: string;
}

export async function fetchWalletBalances(wallets: Wallet[], currency: string) {
  try {
    if (wallets.length === 0) return {};

    const [gateway, arPriceValue] = await Promise.all([
      findGateway({}),
      withRetry(() => getArPrice(currency))
    ]);

    const arPrice = BigNumber(arPriceValue);
    const arweave = new Arweave(gateway);

    const balances: Record<string, { ar: BigNumber; fiat: BigNumber }> = {};

    await Promise.all(
      wallets.map(async (wallet) => {
        try {
          const winstonBalance = await withRetry(() =>
            arweave.wallets.getBalance(wallet.address)
          );
          const arBalance = BigNumber(arweave.ar.winstonToAr(winstonBalance));
          const fiatBalance = arBalance.multipliedBy(arPrice);
          balances[wallet.address] = { ar: arBalance, fiat: fiatBalance };
        } catch (error) {
          console.error(`Error fetching balance for ${wallet.address}:`, error);
          balances[wallet.address] = { ar: BigNumber(0), fiat: BigNumber(0) };
        }
      })
    );

    return balances;
  } catch (error) {
    console.error("Error fetching wallet balances:", error);
    return {};
  }
}
