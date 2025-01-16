import { useQuery } from "@tanstack/react-query";
import {
  fetchTokenBalance,
  getBotegaPrice,
  getBotegaPrices,
  type TokenInfo
} from "./aoTokens/ao";
import { useMemo } from "react";
import useSetting from "~settings/hook";
import { getConversionRate } from "~utils/currency";

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
