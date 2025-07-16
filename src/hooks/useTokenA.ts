import { useProjectAccountingContext } from "@/hooks/useProjectAccountingContext";

/**
 * Token A is the token used to buy the project's token (Token B).
 * Now uses the project's accounting context to determine the correct token.
 * @todo this currently assumes token A is always the network's native token (ETH, OP etc).
*/
export function useTokenA() {
  const { data: accountingContext } = useProjectAccountingContext();
  
  // Get token symbol from accounting context
  const tokenSymbol = accountingContext?.project?.token ? 
    (accountingContext.project.token === "0x000000000000000000000000000000000000eeee" ? "ETH" : "USDC") : 
    "ETH"; // fallback
  
  // Get decimals from accounting context
  const tokenDecimals = accountingContext?.project?.decimals ?? 18;
  return { symbol: tokenSymbol, decimals: tokenDecimals };
}
