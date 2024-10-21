import { FixedInt } from "fpnum";
import { useJBRulesetContext } from "juice-sdk-react";
import { useTokenA } from "./useTokenA";
import { getTokenAToBQuote } from "juice-sdk-core";
import { parseUnits } from "viem";

/**
 * Returns the amount of token B you can get for each token A.
 *
 * Depends on JBRulesetContext.
 */
export function useTokenBAmount() {
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const tokenA = useTokenA();

  if (!ruleset?.data || !rulesetMetadata?.data) {
    return;
  }
  const { weight } = ruleset.data;
  const { reservedPercent } = rulesetMetadata.data;
  const cycleParams = { weight, reservedPercent };
  return getTokenAToBQuote(new FixedInt(parseUnits("1", tokenA.decimals), tokenA.decimals), cycleParams);
}
