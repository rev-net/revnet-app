import {
  JBChainId,
  JBProjectToken,
  MAX_RESERVED_PERCENT,
  NATIVE_TOKEN,
  ReservedPercent,
  RulesetWeight,
} from "@bananapus/nana-sdk-core";
import { Address } from "viem";
import { PaymentTerminalType } from "./paymentTerminal";
import { Token } from "./token";

export interface Quote {
  chainId: JBChainId;
  type: "issuance" | "amm";
  payerTokens: JBProjectToken;
  reservedTokens: JBProjectToken;
  pool?: Pool;
  /** Terminal that produced this issuance quote (v6 on-chain preview). */
  terminal?: {
    address: Address;
    type: PaymentTerminalType;
  };
}

export interface Pool {
  address: Address;
  fee: number;
  liquidity: string;
  chainId: JBChainId;
}

/** Accounting-context currency id for a token (`uint32(uint160(token))`). */
export function tokenCurrencyId(token: Address): number {
  return Number(BigInt(token) & 0xffffffffn);
}

/** Currency id a multi-terminal pay would record for `tokenIn`. */
export function paymentCurrencyId(
  tokenIn: Pick<Token, "address" | "isNative">,
  baseToken: Pick<Token, "address"> & { currency?: number },
): number {
  if (
    tokenIn.address.toLowerCase() === baseToken.address.toLowerCase() &&
    baseToken.currency != null
  ) {
    return baseToken.currency;
  }
  if (tokenIn.isNative || tokenIn.address.toLowerCase() === NATIVE_TOKEN.toLowerCase()) {
    return tokenCurrencyId(NATIVE_TOKEN as Address);
  }
  return tokenCurrencyId(tokenIn.address);
}

/** ETH base currency (1) and the native-token accounting currency (61166) are the same unit. */
export function currenciesMatchForWeight(a: number, b: number): boolean {
  if (a === b) return true;
  const ethUnits = new Set([1, tokenCurrencyId(NATIVE_TOKEN as Address)]);
  return ethUnits.has(a) && ethUnits.has(b);
}

/**
 * Issuance quote matching JBTerminalStore.recordPaymentFrom:
 *
 *   weightRatio = (amount.currency == baseCurrency)
 *     ? 10 ** amount.decimals
 *     : PRICES.pricePerUnitOf(amount.currency, baseCurrency, amount.decimals)
 *   tokenCount  = amount * weight / weightRatio
 *
 * `weightRatio` must already be resolved by the caller (1:1 path or live price).
 */
export function getTokenAToBIssuanceQuoteWithWeightRatio(
  amountIn: bigint,
  weightRatio: bigint,
  weight: RulesetWeight,
  reservedPercent: ReservedPercent,
  chainId: JBChainId,
): Quote {
  if (weightRatio <= 0n) {
    throw new Error("Invalid weight ratio for issuance quote");
  }

  const totalTokens = (weight.value * amountIn) / weightRatio;
  const reservedTokens =
    (weight.value * reservedPercent.value * amountIn) / BigInt(MAX_RESERVED_PERCENT) / weightRatio;
  const payerTokens = totalTokens - reservedTokens;

  return {
    chainId,
    type: "issuance",
    payerTokens: new JBProjectToken(payerTokens),
    reservedTokens: new JBProjectToken(reservedTokens),
  };
}

/**
 * Slippage floor for `minReturnedTokens`.
 *
 * - `slippageBps` is basis points (100 = 1%, 500 = 5%).
 * - A verified zero quote stays zero (zero-issuance projects).
 * - A positive quote never floors to zero (that would disable protection).
 */
export function minReturnedTokens(quoted: bigint, slippageBps: bigint = 500n): bigint {
  if (quoted <= 0n) return 0n;
  const min = (quoted * (10_000n - slippageBps)) / 10_000n;
  return min === 0n ? 1n : min;
}

