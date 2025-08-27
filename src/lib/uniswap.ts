import { Address } from "viem";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { UNISWAP_V3_FACTORY_ADDRESSES } from "@/constants";

// Shared Uniswap V3 ABIs
export const UNISWAP_ABIS = {
  FACTORY: [
    {
      inputs: [
        { name: "tokenA", type: "address" },
        { name: "tokenB", type: "address" },
        { name: "fee", type: "uint24" }
      ],
      name: "getPool",
      outputs: [{ name: "pool", type: "address" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        { name: "tokenA", type: "address" },
        { name: "tokenB", type: "address" },
        { name: "fee", type: "uint24" }
      ],
      name: "createPool",
      outputs: [{ name: "pool", type: "address" }],
      stateMutability: "nonpayable",
      type: "function"
    }
  ] as const,

  POOL: [
    {
      inputs: [],
      name: "slot0",
      outputs: [
        { name: "sqrtPriceX96", type: "uint160" },
        { name: "tick", type: "int24" },
        { name: "observationIndex", type: "uint16" },
        { name: "observationCardinality", type: "uint16" },
        { name: "observationCardinalityNext", type: "uint16" },
        { name: "feeProtocol", type: "uint8" },
        { name: "unlocked", type: "bool" }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "liquidity",
      outputs: [{ name: "", type: "uint128" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "fee",
      outputs: [{ name: "", type: "uint24" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        { name: "sqrtPriceX96", type: "uint160" }
      ],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
  ] as const,

  POSITION_MANAGER: [
    {
      inputs: [
        {
          components: [
            { name: "token0", type: "address" },
            { name: "token1", type: "address" },
            { name: "fee", type: "uint24" },
            { name: "tickLower", type: "int24" },
            { name: "tickUpper", type: "int24" },
            { name: "amount0Desired", type: "uint256" },
            { name: "amount1Desired", type: "uint256" },
            { name: "amount0Min", type: "uint256" },
            { name: "amount1Min", type: "uint256" },
            { name: "recipient", type: "address" },
            { name: "deadline", type: "uint256" }
          ],
          name: "params",
          type: "tuple"
        }
      ],
      name: "mint",
      outputs: [
        { name: "tokenId", type: "uint256" },
        { name: "liquidity", type: "uint128" },
        { name: "amount0", type: "uint256" },
        { name: "amount1", type: "uint256" }
      ],
      stateMutability: "payable",
      type: "function"
    },
    {
      inputs: [
        { name: "tokenId", type: "uint256" },
        { name: "liquidity", type: "uint128" },
        { name: "amount0Min", type: "uint256" },
        { name: "amount1Min", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ],
      name: "decreaseLiquidity",
      outputs: [
        { name: "amount0", type: "uint256" },
        { name: "amount1", type: "uint256" }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        { name: "tokenId", type: "uint256" },
        { name: "recipient", type: "address" },
        { name: "amount0Max", type: "uint256" },
        { name: "amount1Max", type: "uint256" }
      ],
      name: "collect",
      outputs: [
        { name: "amount0", type: "uint256" },
        { name: "amount1", type: "uint256" }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ name: "tokenId", type: "uint256" }],
      name: "ownerOf",
      outputs: [{ name: "", type: "address" }],
      stateMutability: "view",
      type: "function"
    }
  ] as const,

  ERC20: [
    {
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      name: "approve",
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" }
      ],
      name: "allowance",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        { name: "account", type: "address" }
      ],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function"
    }
  ] as const,

  UNIVERSAL_ROUTER: [
    {
      inputs: [
        { name: "commands", type: "bytes" },
        { name: "inputs", type: "bytes[]" },
        { name: "deadline", type: "uint256" }
      ],
      name: "execute",
      outputs: [{ name: "amountOut", type: "uint256" }],
      stateMutability: "payable",
      type: "function"
    }
  ] as const
};

// Shared constants
export const UNISWAP_CONSTANTS = {
  FEE_TIERS: {
    LOW: 500,      // 0.05%
    MEDIUM: 3000,  // 0.3%
    HIGH: 10000    // 1%
  },
  TICK_SPACING: {
    500: 10,
    3000: 60,
    10000: 200
  },
  FALLBACK_PRICE: 0.004141, // Fallback price when pool data unavailable
  LIQUIDITY_THRESHOLD: 1000, // Arbitrary threshold for liquidity checks
  SLIPPAGE_TOLERANCE: 0.5, // 0.5% default slippage
  DEADLINE_MINUTES: 20 // 20 minutes default deadline
} as const;

// Types
export interface PoolState {
  exists: boolean;
  hasInitialPrice: boolean;
  hasLiquidity: boolean;
  address: Address | null;
}

export interface Position {
  tokenId: bigint;
  token0: Address;
  token1: Address;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
  isLimitOrder?: boolean;
  limitPrice?: number;
  currentMarketTick?: number;
  status?: "active" | "executed" | "expired";
  token0Symbol?: string;
  token1Symbol?: string;
  feeGrowthInside0LastX128?: bigint;
  feeGrowthInside1LastX128?: bigint;
}

// Utility functions
export function calculateSqrtPriceX96(price: number): bigint {
  const sqrt = Math.sqrt(price);
  return BigInt(Math.floor(sqrt * 2 ** 96));
}

export function calculatePriceFromTick(tick: number): number {
  return Math.pow(1.0001, tick);
}

export function calculateTickFromPrice(price: number): number {
  return Math.log(price) / Math.log(1.0001);
}

export function snapToTickSpacing(tick: number, fee: number): number {
  const spacing = UNISWAP_CONSTANTS.TICK_SPACING[fee as keyof typeof UNISWAP_CONSTANTS.TICK_SPACING] || 60;
  return Math.round(tick / spacing) * spacing;
}

export function getUniswapPoolUrl(chainId: number, poolAddress: string): string | null {
  const chain = JB_CHAINS[chainId as JBChainId];
  if (!chain) return null;
  
  const supportedChains = ["mainnet", "base", "optimism", "arbitrum", "polygon"];
  const chainName = chain.name.toLowerCase();
  
  if (!supportedChains.includes(chainName)) {
    return null; // Uniswap V3 not supported on this chain
  }
  
  return `https://app.uniswap.org/explore/pools/${chainName}/${poolAddress.toLowerCase()}`;
}

export function getFactoryAddress(chainId: number): Address | null {
  const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[chainId];
  return factoryAddress ? (factoryAddress as Address) : null;
}

// Helper function to encode V3 swap exact in for Universal Router
export function encodeV3SwapExactIn(params: {
  tokenIn: Address;
  tokenOut: Address;
  fee: number;
  recipient: Address;
  amountIn: bigint;
  amountOutMinimum: bigint;
  sqrtPriceLimitX96: bigint;
}): `0x${string}` {
  const tokenInBytes = params.tokenIn.slice(2).padStart(64, "0");
  const tokenOutBytes = params.tokenOut.slice(2).padStart(64, "0");
  const feeBytes = params.fee.toString(16).padStart(6, "0");
  const recipientBytes = params.recipient.slice(2).padStart(64, "0");
  const amountInBytes = params.amountIn.toString(16).padStart(64, "0");
  const amountOutMinimumBytes = params.amountOutMinimum.toString(16).padStart(64, "0");
  const sqrtPriceLimitX96Bytes = params.sqrtPriceLimitX96.toString(16).padStart(64, "0");

  return `0x${tokenInBytes}${tokenOutBytes}${feeBytes}${recipientBytes}${amountInBytes}${amountOutMinimumBytes}${sqrtPriceLimitX96Bytes}`;
}
