import { sepolia, useNetwork } from "wagmi";

export function useNativeTokenSymbol() {
  const symbols: { [k: number]: string } = { [sepolia.id]: "SepoliaETH" };

  const { chain } = useNetwork();
  return symbols[chain?.id ?? 0] ?? "ETH";
}
