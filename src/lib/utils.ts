import { clsx, type ClassValue } from "clsx";
import { formatDuration, intervalToDuration } from "date-fns";
import { twMerge } from "tailwind-merge";
import { Chain, mainnet } from "wagmi";

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
