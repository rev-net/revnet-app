import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";

/**
 * Token A is the token used to buy the project's token (Token B).
 *
 * @todo this currently assumes token A is always the network's native token (ETH, OP etc).
 * In theory, it could be any token (USDC etc.), so this should be updated to reflect that.
 */
export function useTokenA() {
  const nativeTokenSymbol = useNativeTokenSymbol();
  return { symbol: nativeTokenSymbol, decimals: 18 };
}
