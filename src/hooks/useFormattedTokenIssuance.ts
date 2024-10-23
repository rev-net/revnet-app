import { FixedInt } from "fpnum";
import { useJBRulesetContext, useJBTokenContext } from "juice-sdk-react";
import { useTokenA } from "./useTokenA";
import { ReservedPercent, RulesetWeight, getTokenAToBQuote } from "juice-sdk-core";
import { formatUnits, parseUnits } from "viem";
import { formatTokenSymbol } from "@/lib/utils";

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

  if (!ruleset?.data || !rulesetMetadata?.data) {
    return;
  }
  const weight = params?.weight || ruleset.data.weight;
  const reservedPercent = params?.reservedPercent || rulesetMetadata.data.reservedPercent;
  const quote = getTokenAToBQuote(
    new FixedInt(parseUnits("1", tokenA.decimals), tokenA.decimals), {
      weight,
      reservedPercent
    }
  );
  const amount = formatUnits(quote.payerTokens, tokenA.decimals);
  const formattedAmount = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 3
  }).format(Number(amount));
  return `${formattedAmount} ${formatTokenSymbol(tokenB)} / ${tokenA.symbol}`;
}
