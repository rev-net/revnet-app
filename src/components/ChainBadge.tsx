"use client";
import { Badge } from "@/components/ui/badge";
import { optimismSepolia } from "viem/chains";
import { sepolia } from "viem/chains";
import { useChain } from "juice-sdk-react";

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
