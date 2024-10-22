import { clsx, type ClassValue } from "clsx";
import { formatDuration, intervalToDuration } from "date-fns";
import { FixedInt } from "fpnum";
import { ReservedPercent, RulesetWeight, getTokenAToBQuote } from "juice-sdk-core";
import { JBTokenContextData } from "juice-sdk-react";
import { twMerge } from "tailwind-merge";
import { Chain, formatUnits, parseUnits } from "viem";
import { mainnet } from "viem/chains";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSeconds(seconds: number) {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 }); // convert seconds to milliseconds
  return formatDuration(duration, {
    format:
      seconds > 86400 // if greater than a day, only show 'days'
        ? ["days", "hours"]
        : seconds > 3600 // if greater than an hour, only show 'hours' and 'minutes'
        ? ["hours", "minutes"]
        : ["minutes", "seconds"],
    delimiter: ", ",
  });
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
    chain.id === mainnet.id ? "" : `${chain.name}.`
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
  opts: {
    truncateTo?: number;
  } = {
    truncateTo: 4,
  }
) {
  if (!opts.truncateTo) return address;

  const frontTruncate = opts.truncateTo + 2; // account for 0x
  return (
    address.substring(0, frontTruncate) +
    "..." +
    address.substring(address.length - opts.truncateTo, address.length)
  );
}

/**
 * Return percentage of numerator / denominator (e.g. 69 for 69%)
 */
export function formatPortion(numerator: bigint, denominator: bigint) {
  if (numerator === 0n || denominator === 0n) return 0;
  return parseFloat(((numerator * 1000n) / denominator).toString()) / 10;
}

/**
 * Ensure token symbol has $ in front of it
 */
export function formatTokenSymbol(token?: JBTokenContextData["token"]) {
  if (!token?.data?.symbol) return "$TOKEN";
  if (!token?.data?.symbol.includes("$")) return `$${token?.data?.symbol}`;
  return token.data.symbol;
}

/**
 * Calculate issuance rate and return a string with all information fit to print
 *
 * ex:
 * 12.345 $BAN/ETH
 */
export function formatTokenIssuance(
  tokenA: { symbol: string, decimals: number},
  tokenB: JBTokenContextData["token"],
  weight?: RulesetWeight,
  reservedPercent?: ReservedPercent
) {
  if (!weight || !reservedPercent) return;
  const quote = getTokenAToBQuote(
    new FixedInt(parseUnits("1", tokenA.decimals), tokenA.decimals), {
      weight,
      reservedPercent
    }
  );
  const amount = formatUnits(quote.payerTokens, tokenA.decimals);
  const formattedAmount = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 3
  }).format(Number(amount));
  return `${formattedAmount} ${formatTokenSymbol(tokenB)}/${tokenA.symbol}`;
}
