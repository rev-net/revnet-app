import { Address, parseEther } from "viem";

export const MAX_DISCOUNT_RATE = 1_000_000_000n;
export const MAX_REDEMPTION_RATE = 10_000n;
export const MAX_RESERVED_RATE = 10_000n;
export const ONE_ETHER = parseEther("1");
// contracts/libraries/JBTokens.sol
export const ETHER_ADDRESS =
  "0x000000000000000000000000000000000000eeee" as Address;
export const JB_CURRENCIES = {
  ETH: 1n,
  USD: 2n,
};
export const PV2 = "2";
export const DEFAULT_MEMO = "";
export const DEFAULT_METADATA = "0x0";
export const DEFAULT_MIN_RETURNED_TOKENS = 0;
export const DEFAULT_ALLOW_OVERSPENDING = true;
export const DEFAULT_JB_721_TIER_CATEGORY = 1;
