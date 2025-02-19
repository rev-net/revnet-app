import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
} from "viem/chains";

export const SUBGRAPH_URLS = {
  [sepolia.id]: process.env.NEXT_PUBLIC_SEPOLIA_SUBGRAPH_URL,
  [optimismSepolia.id]: process.env.NEXT_PUBLIC_OPTIMISM_SEPOLIA_SUBGRAPH_URL,
  [baseSepolia.id]: process.env.NEXT_PUBLIC_BASE_SEPOLIA_SUBGRAPH_URL,
  [arbitrumSepolia.id]: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_SUBGRAPH_URL,
  [mainnet.id]: process.env.NEXT_PUBLIC_MAINNET_SUBGRAPH_URL,
  [optimism.id]: process.env.NEXT_PUBLIC_OPTIMISM_SUBGRAPH_URL,
  [arbitrum.id]: process.env.NEXT_PUBLIC_ARBITRUM_SUBGRAPH_URL,
  [base.id]: process.env.NEXT_PUBLIC_BASE_SUBGRAPH_URL,
};
