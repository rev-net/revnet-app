import { Hash, parseEther } from "viem";

export const MAX_DISCOUNT_RATE = 1_000_000_000n;
export const MAX_REDEMPTION_RATE = 10_000n;
export const MAX_RESERVED_RATE = 10_000n;
export const ONE_ETHER = parseEther("1");
// contracts/libraries/JBTokens.sol
export const ETHER_ADDRESS =
  "0x000000000000000000000000000000000000eeee" as Hash;
export const JB_CURRENCIES = {
  ETH: 1n,
  USD: 2n,
};
export const PV2 = "2";
