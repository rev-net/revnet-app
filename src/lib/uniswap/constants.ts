import { V3_CORE_FACTORY_ADDRESSES } from "@uniswap/sdk-core";
import { JBChainId } from "juice-sdk-core";

export const UNISWAP_V3_FACTORY_ADDRESSES: Partial<Record<JBChainId, `0x${string}`>> = {
  [1]: V3_CORE_FACTORY_ADDRESSES[1] as `0x${string}`,
  [8453]: V3_CORE_FACTORY_ADDRESSES[8453] as `0x${string}`,
  [10]: V3_CORE_FACTORY_ADDRESSES[10] as `0x${string}`,
  [42161]: V3_CORE_FACTORY_ADDRESSES[42161] as `0x${string}`,
  [11155111]: V3_CORE_FACTORY_ADDRESSES[11155111] as `0x${string}`,
};

// Uniswap V3 QuoterV2 addresses per chain
// Source: https://docs.uniswap.org/contracts/v3/reference/deployments
export const UNISWAP_V3_QUOTER_V2_ADDRESSES: Partial<Record<JBChainId, `0x${string}`>> = {
  [1]: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
  [8453]: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
  [10]: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
  [42161]: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
  [11155111]: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3",
};
