import { formatDuration, intervalToDuration } from "date-fns";
import { Chain, mainnet } from "wagmi";
import {
  MAX_DISCOUNT_RATE,
  MAX_REDEMPTION_RATE,
  MAX_RESERVED_RATE,
  ONE_ETHER,
} from "./constants";

export const bigIntToPercent = (bigInt: bigint, max: bigint) => {
  return Number((bigInt * 100n) / (max / 100n)) / 100;
};

/**
 * Return a quote for token mints for a given [payAmount].
 * Returned quote contains:
 * - total tokens that will be minted (JB funding cycle `weight`).
 * - tokens reserved for project.
 * - tokens minted for the payer.
 */
export const getPaymentQuoteTokens = (
  ethAmount: bigint, // wei
  cycleParams: { weight: bigint; reservedRate: bigint }
) => {
  const { weight, reservedRate } = cycleParams;

  const totalTokens = (weight * ethAmount) / ONE_ETHER;
  const reservedTokens =
    (weight * reservedRate * ethAmount) / MAX_RESERVED_RATE / ONE_ETHER;
  const payerTokens = totalTokens - reservedTokens;

  return {
    ethAmount,
    payerTokens,
    reservedTokens,
    totalTokens,
  };
};

/**
 * Return the ETH cost to mint a given [tokensAmount] to the payer.
 * @param tokensAmount
 * @param cycleParams
 * @returns
 */
export const getPaymentQuoteEth = (
  tokensAmount: bigint, // wei
  cycleParams: { weight: bigint; reservedRate: bigint }
) => {
  const { payerTokens } = getPaymentQuoteTokens(tokensAmount, cycleParams);
  return (ONE_ETHER * ONE_ETHER) / payerTokens;
};

export const formatDiscountRate = (discountRate: bigint) => {
  if (discountRate === 0n) return 0;

  const discountRatePercentage = bigIntToPercent(
    discountRate,
    MAX_DISCOUNT_RATE
  );
  return discountRatePercentage;
};

export const formatRedemptionRate = (redemptionRate: bigint) => {
  if (redemptionRate === 0n) return 0;

  const redemptionRatePercentage = bigIntToPercent(
    redemptionRate,
    MAX_REDEMPTION_RATE
  );
  return redemptionRatePercentage;
};

export const formatReservedRate = (reservedRate: bigint) => {
  if (reservedRate === 0n) return 0;

  const reservedRatePercentage = bigIntToPercent(
    reservedRate,
    MAX_RESERVED_RATE
  );
  return reservedRatePercentage;
};

export function formatSeconds(seconds: number) {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 }); // convert seconds to milliseconds
  return formatDuration(duration, {
    format: ["days", "hours", "minutes", "seconds"],
    delimiter: ", ",
  });
}

/**
 * Returns the ETH value (in wei) that a given [tokensAmount] can be redeemed for.
 * Formula: https://www.desmos.com/calculator/sp9ru6zbpk
 *
 * y = ox/s * ( r + (x(1 - r)/s) )
 *
 * Where:
 * y = redeemable amount
 *
 * o = overflow (primaryTerminalCurrentOverflow)
 * x = tokenAmount
 * s = total supply of token (realTotalTokenSupply)
 * r = redemptionRate
 *
 * @returns amount in ETH
 */
export const getTokenRedemptionQuoteEth = (
  tokensAmount: bigint,
  {
    overflowWei,
    totalSupply,
    redemptionRate,
    tokensReserved,
  }: {
    overflowWei: bigint;
    totalSupply: bigint;
    redemptionRate: bigint;
    tokensReserved: bigint;
  }
) => {
  const realTotalSupply = totalSupply + tokensReserved;
  // base = ox/s
  const base = (overflowWei * tokensAmount) / realTotalSupply;

  // numerator = r + (x(1 - r)/s)
  const numerator =
    redemptionRate +
    (tokensAmount * (MAX_REDEMPTION_RATE - redemptionRate)) / realTotalSupply;

  // y = base * numerator ==> ox/s * ( r + (x(1 - r)/s) )
  const y = (base * numerator) / MAX_REDEMPTION_RATE;

  return y;
};

export function getNextCycleWeight(currentCycle: {
  weight: bigint;
  discountRate: bigint;
}) {
  const nextCycleWeight =
    (currentCycle.weight * (MAX_DISCOUNT_RATE - currentCycle.discountRate)) /
    MAX_DISCOUNT_RATE;

  return nextCycleWeight;
}

export function etherscanLink(
  addressOrTxHash: string,
  opts: {
    type: "address" | "tx";
    chain?: Chain;
  }
) {
  const { type, chain = mainnet } = opts;

  const baseUrl = `https://${
    chain.name === "mainnet" ? "" : `${chain.name}.`
  }etherscan.io`;

  switch (type) {
    case "address":
      return `${baseUrl}/address/${addressOrTxHash}`;
    case "tx":
      return `${baseUrl}/tx/${addressOrTxHash}`;
  }
}

export function formatEthAddress(
  address: string,
  {
    truncateTo = 4,
  }: {
    truncateTo?: number;
  }
) {
  const frontTruncate = truncateTo + 2; // account for 0x
  return (
    address.substring(0, frontTruncate) +
    "..." +
    address.substring(address.length - truncateTo, address.length)
  );
}
