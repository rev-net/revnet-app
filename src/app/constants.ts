import { JBChainId } from "juice-sdk-react";
import {
  Chain,
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
  sepolia,
} from "viem/chains";

export const MAX_RULESET_COUNT = 3;
export const RESERVED_TOKEN_SPLIT_GROUP_ID = 1n;

export const chainNameMap: Record<string, JBChainId> = {
  sepolia: sepolia.id,
  opsepolia: optimismSepolia.id,
  basesepolia: baseSepolia.id,
  arbsepolia: arbitrumSepolia.id,
};

// reverse of chainNameMap
export const chainIdMap = Object.fromEntries(
  Object.entries(chainNameMap).map(([k, v]) => [v, k])
);

export const chainNames: Record<JBChainId, string> = {
  [sepolia.id]: "Sepolia",
  [optimismSepolia.id]: "Optimism (Sepolia)",
  [baseSepolia.id]: "Base (Sepolia)",
  [arbitrumSepolia.id]: "Arbitrum (Sepolia)",
};

export const ChainIdToChain: Record<JBChainId, Chain> = {
  [sepolia.id]: sepolia,
  [optimismSepolia.id]: optimismSepolia,
  [baseSepolia.id]: baseSepolia,
  [arbitrumSepolia.id]: arbitrumSepolia,
}

export const ChainIdToEtherscanUrlBase: Record<JBChainId, string> = {
  [sepolia.id]: "sepolia.etherscan.io",
  [optimismSepolia.id]: "sepolia-optimism.etherscan.io",
  [baseSepolia.id]: "sepolia.basescan.org",
  [arbitrumSepolia.id]: "sepolia.arbiscan.io",
}

export const chainSortOrder = new Map<JBChainId, number>([
  [sepolia.id, 0],
  [optimismSepolia.id, 1],
  [baseSepolia.id, 2],
  [arbitrumSepolia.id, 3],
]);
