import {
  DEFAULT_NATIVE_TOKEN_SYMBOL,
  JBChainId,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  USDC_ADDRESSES,
} from "juice-sdk-core";
import { formatUnits, parseUnits } from "viem";

export interface Currency {
  symbol: string;
  address: `0x${string}`;
  isNative: boolean;
  decimals: number;
}

type Conversion = "NONE" | "USD_TO_ETH" | "ETH_TO_USDC";

export function determineConversion(baseIsNative: boolean, selectedIsNative: boolean): Conversion {
  if (baseIsNative && !selectedIsNative) return "USD_TO_ETH";
  if (!baseIsNative && selectedIsNative) return "ETH_TO_USDC";
  return "NONE";
}

export function toProjectCurrencyAmount(
  valueRaw: string,
  conversion: Conversion,
  usdToEthPrice: bigint | null | undefined,
  projectDecimals: number,
): bigint {
  if (usdToEthPrice && conversion === "USD_TO_ETH") {
    const usdc = parseUnits(valueRaw, 6);
    return (usdc * 10n ** 30n) / usdToEthPrice; // 18d
  }
  if (usdToEthPrice && conversion === "ETH_TO_USDC") {
    const eth = parseUnits(valueRaw, 18);
    return (eth * usdToEthPrice) / 10n ** 30n; // 6d
  }
  return parseUnits(valueRaw, projectDecimals);
}

export function fromProjectCurrencyAmount(
  projectAmount: bigint,
  conversion: Conversion,
  usdToEthPrice: bigint | null | undefined,
): { amount: bigint; decimals: 6 | 18 } | null {
  if (!usdToEthPrice || conversion === "NONE") return null;
  if (conversion === "USD_TO_ETH") {
    const usdc = (projectAmount * usdToEthPrice) / 10n ** 30n; // 6d
    return { amount: usdc, decimals: 6 };
  }
  const eth = (projectAmount * 10n ** 30n) / usdToEthPrice; // 18d
  return { amount: eth, decimals: 18 };
}

export function getCurrenciesForChain(chainId: JBChainId | undefined): Currency[] {
  if (!chainId) return [];

  const currencies: Currency[] = [
    {
      symbol: DEFAULT_NATIVE_TOKEN_SYMBOL,
      address: NATIVE_TOKEN as `0x${string}`,
      isNative: true,
      decimals: NATIVE_TOKEN_DECIMALS,
    },
  ];

  const usdcAddress = USDC_ADDRESSES[chainId];
  if (usdcAddress) {
    currencies.push({
      symbol: "USDC",
      address: usdcAddress,
      isNative: false,
      decimals: 6,
    });
  }

  return currencies;
}

export function formatCurrency(amount: bigint, currency: Currency) {
  const formatted = formatUnits(amount, currency.decimals);

  return Number(formatted).toLocaleString("en-US", getFractionDigits(currency));
}

function getFractionDigits(currency: Currency) {
  if (currency.symbol === "USDC") return { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  if (currency.symbol === "ETH") return { minimumFractionDigits: 0, maximumFractionDigits: 4 };
  return { minimumFractionDigits: 0, maximumFractionDigits: 2 };
}
