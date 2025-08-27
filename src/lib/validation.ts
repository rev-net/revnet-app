import { Address } from "viem";
import { PoolState } from "./uniswap";

// Validation utilities
export function validateAmount(
  amount: string,
  balance: bigint,
  decimals: number
): string | null {
  if (!amount || amount === "0") {
    return "Amount is required";
  }

  const amountFloat = parseFloat(amount);
  if (isNaN(amountFloat) || amountFloat <= 0) {
    return "Amount must be a positive number";
  }

  const balanceFloat = Number(balance) / 10 ** decimals;
  if (amountFloat > balanceFloat) {
    return `Insufficient balance. You have ${balanceFloat.toFixed(6)}`;
  }

  return null;
}

export function validateLiquidityRange(
  minPrice: number,
  maxPrice: number,
  currentPrice: number
): string | null {
  if (minPrice <= 0 || maxPrice <= 0) {
    return "Price range must be positive";
  }

  if (minPrice >= maxPrice) {
    return "Minimum price must be less than maximum price";
  }

  if (currentPrice && !isPriceInRange(currentPrice, minPrice, maxPrice)) {
    return "Current price is outside the specified range";
  }

  return null;
}

export function validatePoolState(poolState: PoolState): string | null {
  if (!poolState.exists) {
    return "Pool does not exist";
  }

  if (!poolState.hasInitialPrice) {
    return "Pool is not initialized";
  }

  if (!poolState.hasLiquidity) {
    return "Pool has no liquidity";
  }

  return null;
}

export function validateAddress(address: string): string | null {
  if (!address) {
    return "Address is required";
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return "Invalid address format";
  }

  return null;
}

export function validateChainId(chainId: number): string | null {
  if (!chainId || chainId <= 0) {
    return "Invalid chain ID";
  }

  return null;
}

export function validateFeeTier(fee: number): string | null {
  const validFees = [500, 3000, 10000]; // 0.05%, 0.3%, 1%
  
  if (!validFees.includes(fee)) {
    return `Invalid fee tier. Must be one of: ${validFees.join(", ")}`;
  }

  return null;
}

export function validateTickRange(
  tickLower: number,
  tickUpper: number,
  fee: number
): string | null {
  if (tickLower >= tickUpper) {
    return "Lower tick must be less than upper tick";
  }

  // Check tick spacing
  const spacing = getTickSpacing(fee);
  if (tickLower % spacing !== 0 || tickUpper % spacing !== 0) {
    return `Ticks must be multiples of ${spacing} for fee tier ${fee}`;
  }

  return null;
}

export function validateSlippage(slippage: number): string | null {
  if (slippage < 0 || slippage > 50) {
    return "Slippage must be between 0% and 50%";
  }

  return null;
}

export function validateDeadline(deadline: number): string | null {
  const now = Math.floor(Date.now() / 1000);
  
  if (deadline <= now) {
    return "Deadline must be in the future";
  }

  if (deadline > now + 3600) { // 1 hour
    return "Deadline should be within 1 hour";
  }

  return null;
}

// Helper functions
function isPriceInRange(
  price: number,
  minPrice: number,
  maxPrice: number
): boolean {
  return price >= minPrice && price <= maxPrice;
}

function getTickSpacing(fee: number): number {
  const spacingMap: Record<number, number> = {
    500: 10,
    3000: 60,
    10000: 200
  };
  
  return spacingMap[fee] || 60;
}

// Composite validators
export function validateMarketSellParams(params: {
  amount: string;
  balance: bigint;
  decimals: number;
  poolState: PoolState;
  slippage: number;
  deadline: number;
}): string | null {
  const { amount, balance, decimals, poolState, slippage, deadline } = params;

  // Validate amount
  const amountError = validateAmount(amount, balance, decimals);
  if (amountError) return amountError;

  // Validate pool state
  const poolError = validatePoolState(poolState);
  if (poolError) return poolError;

  // Validate slippage
  const slippageError = validateSlippage(slippage);
  if (slippageError) return slippageError;

  // Validate deadline
  const deadlineError = validateDeadline(deadline);
  if (deadlineError) return deadlineError;

  return null;
}

export function validateLimitOrderParams(params: {
  amount: string;
  balance: bigint;
  decimals: number;
  limitPrice: number;
  tickLower: number;
  tickUpper: number;
  fee: number;
  slippage: number;
  deadline: number;
}): string | null {
  const { amount, balance, decimals, limitPrice, tickLower, tickUpper, fee, slippage, deadline } = params;

  // Validate amount
  const amountError = validateAmount(amount, balance, decimals);
  if (amountError) return amountError;

  // Validate limit price
  if (limitPrice <= 0) {
    return "Limit price must be positive";
  }

  // Validate tick range
  const tickError = validateTickRange(tickLower, tickUpper, fee);
  if (tickError) return tickError;

  // Validate fee tier
  const feeError = validateFeeTier(fee);
  if (feeError) return feeError;

  // Validate slippage
  const slippageError = validateSlippage(slippage);
  if (slippageError) return slippageError;

  // Validate deadline
  const deadlineError = validateDeadline(deadline);
  if (deadlineError) return deadlineError;

  return null;
}

export function validateLiquidityParams(params: {
  amount0: string;
  amount1: string;
  balance0: bigint;
  balance1: bigint;
  decimals0: number;
  decimals1: number;
  tickLower: number;
  tickUpper: number;
  fee: number;
  slippage: number;
  deadline: number;
}): string | null {
  const { amount0, amount1, balance0, balance1, decimals0, decimals1, tickLower, tickUpper, fee, slippage, deadline } = params;

  // Validate amounts
  const amount0Error = validateAmount(amount0, balance0, decimals0);
  if (amount0Error) return amount0Error;

  const amount1Error = validateAmount(amount1, balance1, decimals1);
  if (amount1Error) return amount1Error;

  // Validate tick range
  const tickError = validateTickRange(tickLower, tickUpper, fee);
  if (tickError) return tickError;

  // Validate fee tier
  const feeError = validateFeeTier(fee);
  if (feeError) return feeError;

  // Validate slippage
  const slippageError = validateSlippage(slippage);
  if (slippageError) return slippageError;

  // Validate deadline
  const deadlineError = validateDeadline(deadline);
  if (deadlineError) return deadlineError;

  return null;
}
