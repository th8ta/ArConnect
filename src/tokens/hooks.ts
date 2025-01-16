import { useQuery, useQueries } from "@tanstack/react-query";
import {
  fetchTokenBalance,
  getBotegaPrice,
  getBotegaPrices,
  useAoTokens,
  type TokenInfo
} from "./aoTokens/ao";
import { useMemo } from "react";
import useSetting from "~settings/hook";
import { getConversionRate } from "~utils/currency";
import BigNumber from "bignumber.js";
import { ExtensionStorage } from "~utils/storage";
import { useStorage } from "@plasmohq/storage/hook";

const defaultOptions = {
  refetchInterval: 300_000,
  staleTime: 300_000,
  gcTime: 300_000,
  retry: 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchOnWindowFocus: true
};

export function useTokenBalance(
  token: TokenInfo,
  address: string,
  refresh?: boolean
) {
  return useQuery({
    queryKey: ["tokenBalance", token.processId, address],
    queryFn: async () => {
      try {
        const balance = await fetchTokenBalance(token, address, refresh);
        return balance || "0";
      } catch (error) {
        throw error;
      }
    },
    ...defaultOptions,
    select: (data) => data || "0",
    enabled: !!address
  });
}

export function useBotegaPrice(id?: string, currency = "USD") {
  const conversionRateQuery = useQuery({
    queryKey: ["conversionRate", currency],
    queryFn: () => getConversionRate(currency),
    ...defaultOptions
  });

  const priceQuery = useQuery({
    queryKey: ["botegaPrice", id],
    queryFn: () => getBotegaPrice(id!),
    enabled: !!id && id !== "AR",
    ...defaultOptions
  });

  const convertedPrice = useMemo(() => {
    if (!priceQuery.data || !conversionRateQuery.data) return null;
    return priceQuery.data * (conversionRateQuery.data || 1);
  }, [priceQuery.data, conversionRateQuery.data]);

  return {
    hasPrice: priceQuery.data !== null,
    loading: priceQuery.isLoading || conversionRateQuery.isLoading,
    price: convertedPrice
  };
}

export function useBotegaPrices(ids?: string[], refresh?: boolean) {
  const [currency = "USD"] = useSetting("currency");

  const conversionRateQuery = useQuery({
    queryKey: ["conversionRate", currency],
    queryFn: () => getConversionRate(currency),
    enabled: !!currency,
    ...defaultOptions
  });

  const pricesQuery = useQuery({
    queryKey: ["botegaPrices", ids?.slice().sort().join(",")],
    queryFn: () => getBotegaPrices(ids!),
    enabled: !!ids?.length,
    ...defaultOptions
  });

  const convertedPrices = useMemo(() => {
    if (!pricesQuery.data) return {};

    return Object.fromEntries(
      (ids || []).map((id) => [
        id,
        pricesQuery.data[id] !== null
          ? pricesQuery.data[id] * (conversionRateQuery.data || 1)
          : null
      ])
    );
  }, [ids, pricesQuery.data, conversionRateQuery.data]);

  return {
    prices: convertedPrices,
    loading: pricesQuery.isLoading || conversionRateQuery.isLoading
  };
}

export function useTotalFiatBalance() {
  const { tokens } = useAoTokens({ type: "asset", hidden: false });
  const [address] = useStorage<string>({
    key: "active_address",
    instance: ExtensionStorage
  });
  const [currency] = useSetting("currency");

  const arBalanceQuery = useQuery({
    queryKey: ["arBalance", address],
    queryFn: () => null,
    enabled: false
  });

  const arPriceQuery = useQuery({
    queryKey: ["arPrice", currency],
    queryFn: () => null,
    enabled: false
  });

  const conversionRateQuery = useQuery({
    queryKey: ["conversionRate", currency],
    queryFn: () => null,
    enabled: false
  });

  const tokenIds = tokens.map((token) => token.id);
  const pricesQuery = useQuery({
    queryKey: ["botegaPrices", tokenIds?.slice().sort().join(",")],
    queryFn: () => null,
    enabled: false
  });

  const tokenBalanceQueries = useQueries({
    queries: tokens.map((token) => ({
      queryKey: ["tokenBalance", token.id, address],
      queryFn: () => null,
      enabled: false
    }))
  });

  return useMemo(() => {
    if (!address) return BigNumber(0);
    let total = BigNumber(0);

    const conversionRate = conversionRateQuery.data || 1;

    if (arBalanceQuery.data && arPriceQuery.data) {
      total = total.plus(
        BigNumber(arBalanceQuery.data).times(arPriceQuery.data)
      );
    }

    tokens.forEach((token, index) => {
      const balance = tokenBalanceQueries[index].data;
      const price = pricesQuery.data?.[token.id] || 0;

      if (balance && price) {
        total = total.plus(
          BigNumber(balance).times(price).times(conversionRate)
        );
      }
    });

    return total;
  }, [
    tokens,
    address,
    arBalanceQuery.data,
    arPriceQuery.data,
    conversionRateQuery.data,
    pricesQuery.data,
    tokenBalanceQueries
  ]);
}
