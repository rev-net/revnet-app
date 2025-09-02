"use client";
import { Badge } from "@/components/ui/badge";
import { useChain } from "juice-sdk-react";
import { optimismSepolia, sepolia } from "viem/chains";

const NAMES: {
  [chainId: number]: string;
} = {
  [sepolia.id]: "Sepolia",
  [optimismSepolia.id]: "OP Sepolia",
};

export function ChainBadge() {
  const chain = useChain();
  const chainName = chain ? NAMES[chain.id] : undefined;
  if (!chainName) return null;

  return <Badge variant="success">{chainName}</Badge>;
}
