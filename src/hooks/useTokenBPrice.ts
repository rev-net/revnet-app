import { useJBRulesetContext } from "juice-sdk-react";
import { useTokenA } from "./useTokenA";
import { getTokenBPrice } from "juice-sdk-core";

/**
 * Returns the current price of token B in terms of token A.
 *
 * Depends on JBRulesetContext.
 */
export function useTokenBPrice() {
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const tokenA = useTokenA();

  console.log('🔍 useTokenBPrice hook debug:', {
    hasRuleset: !!ruleset?.data,
    hasRulesetMetadata: !!rulesetMetadata?.data,
    tokenASymbol: tokenA.symbol,
    tokenADecimals: tokenA.decimals,
    weight: ruleset?.data?.weight?.toString(),
    reservedPercent: rulesetMetadata?.data?.reservedPercent?.toString()
  });

  if (!ruleset?.data || !rulesetMetadata?.data) {
    console.log('❌ useTokenBPrice: Missing ruleset or rulesetMetadata data');
    return;
  }

  const tokenBPrice = getTokenBPrice(tokenA.decimals, {
    weight: ruleset?.data?.weight,
    reservedPercent: rulesetMetadata?.data?.reservedPercent,
  });

  // Convert from wei to ETH (divide by 10^18)
  // The juice-sdk returns price in wei, but we need it in ETH for pool initialization
  const priceInEth = tokenBPrice.value / BigInt(10 ** 18);

  console.log('📊 useTokenBPrice result:', {
    tokenBPriceObject: tokenBPrice,
    tokenBPriceValue: tokenBPrice.value,
    tokenBPriceValueString: tokenBPrice.value.toString(),
    priceInEth: priceInEth.toString(),
    priceInEthNumber: Number(priceInEth) / 1e18, // Convert to human-readable
    tokenASymbol: tokenA.symbol,
    tokenADecimals: tokenA.decimals
  });

  // Return the price in ETH (not wei)
  return priceInEth;
}
