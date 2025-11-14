"use server";

import { FeeAmount } from "@uniswap/v3-sdk";
import { JBChainId } from "juice-sdk-core";
import { unstable_cache } from "next/cache";
import { Address, formatUnits, getContract, zeroAddress } from "viem";
import { Pool } from "../quote";
import { Token } from "../token";
import { getViemPublicClient } from "../wagmiConfig";
import { UNISWAP_V3_FACTORY_ABI, UNISWAP_V3_POOL_ABI } from "./abis";
import { UNISWAP_V3_FACTORY_ADDRESSES } from "./constants";
import { calculateLiquidityInBaseToken } from "./liquidity";

export async function getUniswapPool(
  tokenIn: Pick<Token, "address" | "decimals">,
  tokenOut: Pick<Token, "address" | "decimals">,
  chainId: JBChainId,
): Promise<Pool | null> {
  try {
    const address = await getUniswapPoolAddress(tokenIn.address, tokenOut.address, chainId);
    if (!address) return null;

    const client = getViemPublicClient(chainId);
    const contract = getContract({ address, abi: UNISWAP_V3_POOL_ABI, client });

    const [liquidityRaw, [sqrtPriceX96]] = await Promise.all([
      contract.read.liquidity(),
      contract.read.slot0(),
    ]);

    if (liquidityRaw <= 0n) return null;

    return {
      address,
      chainId,
      fee: FeeAmount.HIGH,
      liquidity: formatUnits(
        calculateLiquidityInBaseToken(sqrtPriceX96, liquidityRaw, tokenIn, tokenOut),
        tokenIn.decimals,
      ),
    };
  } catch (err) {
    console.error(`Error detecting Uniswap pool on chain ${chainId}:`, err);
    return null;
  }
}

const getUniswapPoolAddress = unstable_cache(
  async (tokenA: Address, tokenB: Address, chainId: JBChainId) => {
    const factoryAddress = UNISWAP_V3_FACTORY_ADDRESSES[chainId];
    if (!factoryAddress) throw new Error(`No Uniswap V3 factory for chain ${chainId}`);

    const client = getViemPublicClient(chainId);
    const factory = getContract({ address: factoryAddress, abi: UNISWAP_V3_FACTORY_ABI, client });

    // Sort tokens by address (Uniswap requires token0 < token1)
    const [token0, token1] =
      tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];

    const address = await factory.read.getPool([token0, token1, FeeAmount.HIGH]);
    return address === zeroAddress ? null : address;
  },
  ["getUniswapPoolAddress"],
  { revalidate: 300 }, // 5 minutes
);
