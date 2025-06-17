import { Address } from "viem";

// Chain IDs
export const CHAIN_IDS = {
  // Mainnets
  ETHEREUM: 1,
  BASE: 8453,
  ARBITRUM: 42161,
  OPTIMISM: 10,

  // Testnets
  SEPOLIA: 11155111,
  BASE_SEPOLIA: 84532,
  ARBITRUM_SEPOLIA: 421614,
  OPTIMISM_SEPOLIA: 11155420,
} as const;

// Uniswap V3 Factory addresses for different chains
export const UNISWAP_V3_FACTORY_ADDRESSES: Record<number, Address> = {
  // Mainnets
  [CHAIN_IDS.ETHEREUM]: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Ethereum Mainnet
  [CHAIN_IDS.BASE]: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD', // Base
  [CHAIN_IDS.ARBITRUM]: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Arbitrum
  [CHAIN_IDS.OPTIMISM]: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Optimism

  // Testnets
  [CHAIN_IDS.SEPOLIA]: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c', // Sepolia
  [CHAIN_IDS.BASE_SEPOLIA]: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD', // Base Sepolia
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Arbitrum Sepolia
  [CHAIN_IDS.OPTIMISM_SEPOLIA]: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Optimism Sepolia
} as const;

// WETH addresses for different chains from https://docs.uniswap.org/contracts/v3/reference/deployments/ethereum-deployments
export const WETH_ADDRESSES: Record<number, Address> = {
  [CHAIN_IDS.BASE_SEPOLIA]: '0x4200000000000000000000000000000000000006', // Base Sepolia
  [CHAIN_IDS.SEPOLIA]: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', // Sepolia
} as const;

// Position Manager addresses for different chains
export const POSITION_MANAGER_ADDRESSES: Record<number, Address> = {
  [CHAIN_IDS.BASE_SEPOLIA]: '0x03a520b7C8bF7E5bA7735De796b7D7d6B469f9Fc', // Base Sepolia
  [CHAIN_IDS.SEPOLIA]: '0x1238536071E1c677A632429e3655c799b22cDA52', // Sepolia
} as const; 