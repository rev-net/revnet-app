import { useJBChainId } from "juice-sdk-react";
import { optimismSepolia, sepolia } from "viem/chains";

export function useNativeTokenSymbol() {
  const symbols: { [k: number]: string } = {
    [sepolia.id]: "SepETH",
    [optimismSepolia.id]: "OPSepETH",
  };

  const chainId = useJBChainId();
  return symbols[chainId ?? 0] ?? "ETH";
}
