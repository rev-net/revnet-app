import { ETH_CURRENCY_ID, JBVersion, USD_CURRENCY_ID } from "juice-sdk-core";

export function toBaseCurrencyId(currencyId: number, version: JBVersion) {
  if (currencyId === 1 || currencyId === 61166) return ETH_CURRENCY_ID;
  return USD_CURRENCY_ID(version);
}
