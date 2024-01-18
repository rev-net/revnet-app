import { optimismSepolia } from "viem/chains";
import { sepolia, useNetwork } from "wagmi";

export function useNativeTokenSymbol() {
  const symbols: { [k: number]: string } = {
    [sepolia.id]: "SepETH",
    [optimismSepolia.id]: "OPSepETH",
  };

  const { chain } = useNetwork();
  return symbols[chain?.id ?? 0] ?? "ETH";
}
