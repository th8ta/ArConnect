import { useQuery } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { useState, useCallback, useEffect } from "react";
import redstone from "redstone-api";
import { retryWithDelay } from "~utils/promises/retry";

/**
 * Compare two currencies
 *
 * @param symbol Symbol of the currency to get the price for
 * @param currency What to return the price in
 */
export async function getPrice(symbol: string, currency: string) {
  const data: CoinGeckoPriceResult = await (
    await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=${currency.toLowerCase()}`
    )
  ).json();

  return data[symbol.toLowerCase()][currency.toLowerCase()];
}

/**
 * Get price for the AR token using the coingecko API
 *
 * @param currency Currency to get the price in
 * @returns Price of 1 AR
 */
export async function getArPrice(currency: string) {
  try {
    return await getPrice("arweave", currency.toLowerCase());
  } catch (error) {
    console.error(error, "redirecting to redstone");

    const res = await redstone.getPrice("AR");

    if (!res.value) {
      return 0;
    }

    return res.source.coingecko;
  }
}

/**
 * Hook to fetch and manage AR token price in React Native
 * @param currency Currency to get the price in
 * @returns Object containing price as BigNumber, loading state, and reload function
 */
export function useArPrice(currency: string) {
  return useQuery({
    queryKey: ["arPrice", currency],
    queryFn: async () => {
      if (!currency) return "0";
      const result = await getArPrice(currency);
      return String(result || "0");
    },
    select: (data) => data || "0",
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: 30_000,
    staleTime: 30_000,
    gcTime: 30_000,
    enabled: !!currency
  });
}

interface CoinGeckoPriceResult {
  arweave: {
    [key: string]: number;
  };
  [key: string]: {
    [key: string]: number;
  };
}

export async function getMarketChart(currency: string, days = "max") {
  const data: CoinGeckoMarketChartResult = await (
    await fetch(
      `https://api.coingecko.com/api/v3/coins/arweave/market_chart?vs_currency=${currency}&days=${days}`
    )
  ).json();

  return data;
}

/**
 * Get 24-hour price change for the AR token using the CoinGecko API
 *
 * @param currency Currency to get the price change in
 * @returns 24-hour price change percentage of AR
 */
export async function getAr24hChange(currency: string): Promise<number> {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=${currency.toLowerCase()}&include_24hr_change=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const changeKey = `${currency.toLowerCase()}_24h_change`;

    return data.arweave[changeKey];
  } catch (error) {
    throw new Error("Failed to fetch AR price change");
  }
}

interface CoinGeckoMarketChartResult {
  /** Prices: arrany of date in milliseconds and price */
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export const currencies = [
  "USD",
  "EUR",
  "GBP",
  "CNY",
  "INR",
  "AED",
  "ARS",
  "AUD",
  "BDT",
  "BHD",
  "BMD",
  "BRL",
  "CAD",
  "CHF",
  "CLP",
  "CZK",
  "DKK",
  "HKD",
  "HUF",
  "IDR",
  "ILS",
  "JPY",
  "KRW",
  "KWD",
  "LKR",
  "MMK",
  "MXN",
  "MYR",
  "NGN",
  "NOK",
  "NZD",
  "PHP",
  "PKR",
  "PLN",
  "RUB",
  "SAR",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "TWD",
  "UAH",
  "VEF",
  "VND",
  "ZAR"
];
