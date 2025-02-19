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
