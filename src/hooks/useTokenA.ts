import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";

/**
 * Token A is the token used to buy the project's token (Token B).
 * Uses the project's base token information to determine the correct token.
*/
export function useTokenA() {
  const baseToken = useProjectBaseToken();
  
  return { 
    symbol: baseToken.symbol, 
    decimals: baseToken.decimals 
  };
}
