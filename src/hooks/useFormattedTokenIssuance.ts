import { formatTokenSymbol } from "@/lib/utils";
import { FixedInt } from "fpnum";
import { ReservedPercent, RulesetWeight, getTokenAToBQuote } from "juice-sdk-core";
import { useJBRulesetContext, useJBTokenContext } from "juice-sdk-react";
import { formatUnits, parseUnits } from "viem";
import { useProjectBaseToken } from "./useProjectBaseToken";
import { useTokenA } from "./useTokenA";

interface TokenIssuanceParams {
  weight?: RulesetWeight;
  reservedPercent?: ReservedPercent;
}

/**
 * Returns the amount of token B you can get for each token A.
 *
 * Depends on JBRulesetContext.
 * Can pass in differnt weight and reservePercent if looking at future stage issuance.
 */
export function useFormattedTokenIssuance(params?: TokenIssuanceParams) {
  const tokenA = useTokenA();
  const { token: tokenB } = useJBTokenContext();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const baseToken = useProjectBaseToken();

  if (!ruleset?.data || !rulesetMetadata?.data) {
    return;
  }
  const weight = params?.weight || ruleset.data.weight;
  const reservedPercent = params?.reservedPercent || rulesetMetadata.data.reservedPercent;
  const quote = getTokenAToBQuote(new FixedInt(parseUnits("1", tokenA.decimals), tokenA.decimals), {
    weight,
    reservedPercent,
  });
  const amount = formatUnits(quote.payerTokens, 18);
  const formattedAmount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
  }).format(Number(amount));

  // Use the base token symbol instead of hardcoded currency names
  const denominator = baseToken.symbol;
  return `${formattedAmount} ${formatTokenSymbol(tokenB)} / ${denominator}`;
}
