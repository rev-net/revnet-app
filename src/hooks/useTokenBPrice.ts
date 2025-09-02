import { getTokenBPrice } from "juice-sdk-core";
import { useJBRulesetContext } from "juice-sdk-react";
import { useTokenA } from "./useTokenA";

/**
 * Returns the current price of token B in terms of token A.
 *
 * Depends on JBRulesetContext.
 */
export function useTokenBPrice() {
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const tokenA = useTokenA();

  if (!ruleset?.data || !rulesetMetadata?.data) {
    return;
  }

  return getTokenBPrice(tokenA.decimals, {
    weight: ruleset?.data?.weight,
    reservedPercent: rulesetMetadata?.data?.reservedPercent,
  });
}
