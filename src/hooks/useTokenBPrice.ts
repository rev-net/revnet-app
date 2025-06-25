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
    tokenADecimals: tokenA?.decimals,
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

  console.log('📊 useTokenBPrice result:', {
    tokenBPriceObject: tokenBPrice,
    tokenBPriceValue: tokenBPrice.value,
    tokenBPriceValueString: tokenBPrice.value.toString(),
    tokenBPriceType: typeof tokenBPrice.value
  });

  // Return the value as bigint
  return tokenBPrice.value;
}
