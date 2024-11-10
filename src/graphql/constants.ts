import {
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
  sepolia,
} from "viem/chains";

export const SUBGRAPH_URLS = {
  [sepolia.id]: process.env.NEXT_PUBLIC_SEPOLIA_SUBGRAPH_URL,
  [optimismSepolia.id]: process.env.NEXT_PUBLIC_OPTIMISM_SEPOLIA_SUBGRAPH_URL,
  [baseSepolia.id]: process.env.NEXT_PUBLIC_BASE_SEPOLIA_SUBGRAPH_URL,
  [arbitrumSepolia.id]: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_SUBGRAPH_URL,
};
