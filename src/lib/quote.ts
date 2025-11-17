import { FixedInt } from "fpnum";
import {
  getTokenAToBQuote,
  JBChainId,
  JBProjectToken,
  ReservedPercent,
  RulesetWeight,
} from "juice-sdk-core";
import { Address } from "viem";
import { Token } from "./token";

export interface Quote {
  chainId: JBChainId;
  type: "issuance" | "amm";
  payerTokens: JBProjectToken;
  reservedTokens: JBProjectToken;
  pool?: Pool;
}

export interface Pool {
  address: Address;
  fee: number;
  liquidity: string;
  chainId: JBChainId;
}

export function getTokenAToBIssuanceQuote(
  amountIn: bigint,
  baseToken: Pick<Token, "decimals" | "isNative">,
  tokenIn: Pick<Token, "isNative">,
  usdToEthPrice: bigint | null | undefined,
  weight: RulesetWeight,
  reservedPercent: ReservedPercent,
  chainId: JBChainId,
): Quote {
  const amountInBaseCurrency = toBaseCurrencyAmount(
    amountIn,
    determineConversion(baseToken.isNative, tokenIn.isNative),
    usdToEthPrice,
  );

  const quote = getTokenAToBQuote(new FixedInt(amountInBaseCurrency, baseToken.decimals), {
    weight,
    reservedPercent,
  });

  return {
    chainId,
    type: "issuance",
    payerTokens: new JBProjectToken(quote.payerTokens),
    reservedTokens: new JBProjectToken(quote.reservedTokens),
  };
}

type Conversion = "NONE" | "USD_TO_ETH" | "ETH_TO_USDC";

export function determineConversion(baseIsNative: boolean, selectedIsNative: boolean): Conversion {
  if (baseIsNative && !selectedIsNative) return "USD_TO_ETH";
  if (!baseIsNative && selectedIsNative) return "ETH_TO_USDC";
  return "NONE";
}

function toBaseCurrencyAmount(
  amountIn: bigint,
  conversion: Conversion,
  usdToEthPrice: bigint | null | undefined,
): bigint {
  if (usdToEthPrice && conversion === "USD_TO_ETH") {
    return (amountIn * 10n ** 30n) / usdToEthPrice; // 18d
  }
  if (usdToEthPrice && conversion === "ETH_TO_USDC") {
    return (amountIn * usdToEthPrice) / 10n ** 30n; // 6d
  }
  return amountIn;
}

export function fromProjectCurrencyAmount(
  projectAmount: bigint,
  conversion: Conversion,
  usdToEthPrice: bigint | null | undefined,
): { amount: bigint; decimals: 6 | 18 } | null {
  if (!usdToEthPrice || conversion === "NONE") return null;
  if (conversion === "USD_TO_ETH") {
    const usd = (projectAmount * usdToEthPrice) / 10n ** 30n; // 6d
    return { amount: usd, decimals: 6 };
  }
  const eth = (projectAmount * 10n ** 30n) / usdToEthPrice; // 18d
  return { amount: eth, decimals: 18 };
}
