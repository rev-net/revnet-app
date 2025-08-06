import { JBChainId } from "juice-sdk-react";
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

export const MAX_RULESET_COUNT = 3;
export const RESERVED_TOKEN_SPLIT_GROUP_ID = 1n;

export const chainSortOrder = new Map<JBChainId, number>([
  [sepolia.id, 0],
  [optimismSepolia.id, 1],
  [baseSepolia.id, 2],
  [arbitrumSepolia.id, 3],
]);

export const chainIdToLogo = {
  [sepolia.id]: "/assets/img/logo/mainnet.svg",
  [optimismSepolia.id]: "/assets/img/logo/optimism.svg",
  [baseSepolia.id]: "/assets/img/logo/base.svg",
  [arbitrumSepolia.id]: "/assets/img/logo/arbitrum.svg",
  [mainnet.id]: "/assets/img/logo/mainnet.svg",
  [optimism.id]: "/assets/img/logo/optimism.svg",
  [base.id]: "/assets/img/logo/base.svg",
  [arbitrum.id]: "/assets/img/logo/arbitrum.svg",
};

export const BACKED_BY_TOKENS = ["ETH", "USDC"] as const;

export const JB_CURRENCY_ETH = 1;
export const JB_CURRENCY_USD = 3;

export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
  1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Ethereum
  10: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // Optimism
  421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Arbitrum sepolia
  84532: "0x036cbd53842c5426634e7929541ec2318f3dcf7e", // Base Sepolia
  11155111: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238", // Ethereum sepolia
  11155420: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7", // Optimism sepolia
};

// TODO: Remove this once the sdk is updated!
export const REV_LOANS_ADDRESSES: Record<number, `0x${string}`> = {
  42161: "0xDE1E70fAF22024559e7D94aB814abD7e42CA849B", // Arbitrum
  8453: "0xDE1E70fAF22024559e7D94aB814abD7e42CA849B", // Base
  1: "0xDE1E70fAF22024559e7D94aB814abD7e42CA849B", // Ethereum
  10: "0xDE1E70fAF22024559e7D94aB814abD7e42CA849B", // Optimism
  421614: "0xDE1E70fAF22024559e7D94aB814abD7e42CA849B", // Arbitrum sepolia
  84532: "0xDE1E70fAF22024559e7D94aB814abD7e42CA849B", // Base Sepolia
  11155111: "0xDE1E70fAF22024559e7D94aB814abD7e42CA849B", // Ethereum sepolia
  11155420: "0xDE1E70fAF22024559e7D94aB814abD7e42CA849B", // Optimism sepolia
};

// TODO: Remove this once the sdk is updated! Same for all chains at the moment.
export const primaryNativeTerminal = {data: "0xdb9644369c79c3633cde70d2df50d827d7dc7dbc"};


export const USDC_DECIMALS = 6;

export const isProduction = process.env.NODE_ENV === "production";
export const externalBaseUrl = isProduction
  ? "https://app.revnet.eth.sucks"
  : "https://147585e1f72a.ngrok.app";
