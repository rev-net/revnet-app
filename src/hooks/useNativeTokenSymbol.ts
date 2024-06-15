import { useChain } from "juice-sdk-react";
import { optimismSepolia } from "viem/chains";
import { sepolia } from "viem/chains";

export function useNativeTokenSymbol() {
  const symbols: { [k: number]: string } = {
    [sepolia.id]: "SepETH",
    [optimismSepolia.id]: "OPSepETH",
  };

  const chain = useChain();
  return symbols[chain?.id ?? 0] ?? "ETH";
}
