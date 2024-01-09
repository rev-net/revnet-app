"use client";
import { Badge } from "@/components/ui/badge";
import { optimismSepolia } from "viem/chains";
import { sepolia, useNetwork } from "wagmi";

const NAMES: {
  [chainId: number]: string;
} = {
  [sepolia.id]: "Sepolia",
  [optimismSepolia.id]: "OP Sepolia",
};

export function ChainBadge() {
  const { chain } = useNetwork();
  const chainName = chain ? NAMES[chain.id] : undefined;
  if (!chainName) return null;

  return <Badge variant="success">{chainName}</Badge>;
}
