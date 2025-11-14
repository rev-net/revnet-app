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

// Uniswap V3 SwapRouter02 addresses per chain (newer version)
// Source: https://docs.uniswap.org/contracts/v3/reference/deployments
export const UNISWAP_V3_SWAP_ROUTER_ADDRESSES: Partial<Record<JBChainId, `0x${string}`>> = {
  [1]: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // SwapRouter02
  [8453]: "0x2626664c2603336E57B271c5C0b26F421741e481", // SwapRouter02
  [10]: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // SwapRouter02
  [42161]: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // SwapRouter02
  [11155111]: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E", // SwapRouter02
};
