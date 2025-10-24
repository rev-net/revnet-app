import { ETH_CURRENCY_ID, JBVersion, USD_CURRENCY_ID } from "juice-sdk-core";

export function toBaseCurrencyId(currency: number | string, version: JBVersion) {
  if (Number(currency) === 1 || Number(currency) === 61166) return ETH_CURRENCY_ID;
  return USD_CURRENCY_ID(version);
}

const usdSymbols = ["USDC", "USD", "USDT", "DAI"];

export function isUsd(symbol: string) {
  return usdSymbols.includes(symbol);
}
