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

export const MAINNET_SUBGRAPH_URLS = {
  [mainnet.id]: process.env.NEXT_PUBLIC_MAINNET_SUBGRAPH_URL,
  [optimism.id]: process.env.NEXT_PUBLIC_OPTIMISM_SUBGRAPH_URL,
  [arbitrum.id]: process.env.NEXT_PUBLIC_ARBITRUM_SUBGRAPH_URL,
  [base.id]: process.env.NEXT_PUBLIC_BASE_SUBGRAPH_URL,
};

export const TESTNET_SUBGRAPH_URLS = {
  [sepolia.id]: process.env.NEXT_PUBLIC_SEPOLIA_SUBGRAPH_URL,
  [optimismSepolia.id]: process.env.NEXT_PUBLIC_OPTIMISM_SEPOLIA_SUBGRAPH_URL,
  [baseSepolia.id]: process.env.NEXT_PUBLIC_BASE_SEPOLIA_SUBGRAPH_URL,
  [arbitrumSepolia.id]: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_SUBGRAPH_URL,
};

export const SUBGRAPH_URLS = {
  ...MAINNET_SUBGRAPH_URLS,
  ...TESTNET_SUBGRAPH_URLS,
};

const bendystrawUrl = `${process.env.NEXT_PUBLIC_BENDYSTRAW_URL}`;
const testnetBendystrawUrl = `${process.env.NEXT_PUBLIC_TESTNET_BENDYSTRAW_URL}`;

export function getBendystrawUrl(chainId: number): string {
  const isMainnet = [mainnet, base, arbitrum, optimism].some((c) => c.id === chainId);

  return isMainnet ? bendystrawUrl : testnetBendystrawUrl;
}
