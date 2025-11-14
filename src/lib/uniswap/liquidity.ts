import { Token } from "../token";

export function calculateLiquidityInBaseToken(
  sqrtPriceX96: bigint,
  liquidity: bigint,
  tokenIn: Pick<Token, "address" | "decimals">,
  tokenOut: Pick<Token, "address" | "decimals">,
): bigint {
  if (sqrtPriceX96 === 0n || liquidity === 0n) return 0n;

  const Q96 = BigInt(2 ** 96);
  const amount0 = (liquidity * Q96) / sqrtPriceX96;
  const amount1 = (liquidity * sqrtPriceX96) / Q96;

  // Uniswap V3 pools are always token0/token1, tokens are sorted alphabetically
  if (tokenIn.address.toLowerCase() < tokenOut.address.toLowerCase()) {
    // tokenIn = token0, tokenOut = token1
    const amount1InBase = (amount1 * Q96) / sqrtPriceX96;
    const amount1Adjusted = amount1InBase / BigInt(10 ** (tokenOut.decimals - tokenIn.decimals));
    return (amount0 + amount1Adjusted) * 2n;
  } else {
    // tokenIn = token1, tokenOut = token0
    const amount0InBase = (amount0 * sqrtPriceX96) / Q96;
    const amount0Adjusted = amount0InBase / BigInt(10 ** (tokenOut.decimals - tokenIn.decimals));
    return (amount0Adjusted + amount1) * 2n;
  }
}
