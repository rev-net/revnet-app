import { JBChainId, JBProjectToken } from "juice-sdk-core";
import { getContract } from "viem";
import { Quote } from "../quote";
import { Token } from "../token";
import { getViemPublicClient } from "../wagmiConfig";
import { UNISWAP_V3_QUOTER_V2_ABI } from "./abis";
import { UNISWAP_V3_QUOTER_V2_ADDRESSES } from "./constants";
import { getUniswapPool } from "./pool";

export async function getUniswapQuotes(
  tokenIn: Pick<Token, "address" | "decimals">,
  tokenOut: Pick<Token, "address" | "decimals">,
  amountIn: bigint,
  chainIds: JBChainId[],
): Promise<Quote[]> {
  const quotes = await Promise.all(
    chainIds.map(async (chainId) => getUniswapQuote(tokenIn, tokenOut, amountIn, chainId)),
  );

  return quotes.filter((q): q is Quote => q !== null);
}

export async function getUniswapQuote(
  tokenIn: Pick<Token, "address" | "decimals">,
  tokenOut: Pick<Token, "address" | "decimals">,
  amountIn: bigint,
  chainId: JBChainId,
): Promise<Quote | null> {
  try {
    if (amountIn === 0n) return null;

    const pool = await getUniswapPool(tokenIn, tokenOut, chainId);
    if (!pool) return null;

    const quoterAddress = UNISWAP_V3_QUOTER_V2_ADDRESSES[chainId];
    if (!quoterAddress) throw new Error(`No QuoterV2 contract for chain ${chainId}`);

    const client = getViemPublicClient(chainId);
    const quoter = getContract({ address: quoterAddress, abi: UNISWAP_V3_QUOTER_V2_ABI, client });

    const quote = await quoter.simulate.quoteExactInputSingle([
      {
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        amountIn,
        fee: pool.fee,
        sqrtPriceLimitX96: 0n,
      },
    ]);

    return {
      payerTokens: new JBProjectToken(quote.result[0]),
      reservedTokens: new JBProjectToken(0n),
      pool,
      type: "amm",
      chainId,
    };
  } catch (err) {
    console.error(`Error getting Uniswap quote for chain ${chainId}:`, err);
    return null;
  }
}
