import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { formatUnits, parseUnits } from "viem";
import { useJBTokenContext } from "juice-sdk-react";

/**
 * Token A is the token used to buy the project's token (Token B).
 *
 * @todo this currently assumes token A is always the network's native token (ETH, OP etc).
 * In theory, it could be any token (USDC etc.), so this should be updated to reflect that.
 */
export function useTokenA() {
  const nativeTokenSymbol = useNativeTokenSymbol();
  const { token } = useJBTokenContext();
  const projectTokenDecimals = token?.data?.decimals ?? 18;
  return { symbol: nativeTokenSymbol, decimals: projectTokenDecimals };
}
