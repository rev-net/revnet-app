import { chainSortOrder } from "@/app/constants";
import { clsx, type ClassValue } from "clsx";
import { Duration, formatDuration, intervalToDuration } from "date-fns";
import { CashOutTaxRate, JBRulesetData, JB_CHAINS, ReservedPercent } from "juice-sdk-core";
import { JBChainId, JBTokenContextData } from "juice-sdk-react";
import { twMerge } from "tailwind-merge";
import { Address, Chain, formatEther } from "viem";
import { mainnet } from "viem/chains";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSeconds(seconds: number, precision = 2, compact = false) {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

  const fullFormat = (
    seconds > 31536000
      ? ["years", "months", "days"]
      : seconds > 2592000
        ? ["months", "days", "hours"]
        : seconds > 86400
          ? ["days", "hours", "minutes"]
          : seconds > 3600
            ? ["hours", "minutes", "seconds"]
            : ["minutes", "seconds"]
  ) as (keyof Duration)[];

  const format = fullFormat.slice(0, precision);

  return formatDuration(duration, {
    format,
    delimiter: compact ? "" : ", ",
  });
}

export function etherscanLink(
  addressOrTxHash: string,
  opts: {
    type: "address" | "tx" | "token";
    chain?: Chain;
  },
) {
  const { type, chain = mainnet } = opts;

  const chainId = chain.id as JBChainId;
  const baseUrl = chainId === 10 ? "optimistic.etherscan.io" : JB_CHAINS[chainId].etherscanHostname;

  switch (type) {
    case "address":
      return `https://${baseUrl}/address/${addressOrTxHash}`;
    case "tx":
      return `https://${baseUrl}/tx/${addressOrTxHash}`;
    case "token":
      return `https://${baseUrl}/token/${addressOrTxHash}`;
  }
}

export function formatEthAddress(
  address: string,
  opts: { truncateTo?: number } = { truncateTo: 4 },
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
  return parseFloat(((numerator * 100000n) / denominator).toString()) / 1000;
}

/**
 * Ensure token symbol has $ in front of it
 */
export function formatTokenSymbol(token?: JBTokenContextData["token"] | string) {
  if (typeof token === "string") {
    if (!token) return "tokens";
    if (!token.includes("$")) return `$${token}`;
    return token;
  }
  if (!token?.data?.symbol) return "$TOKEN";
  if (!token?.data?.symbol.includes("$")) return `$${token?.data?.symbol}`;
  return token.data.symbol;
}

/**
 * Get start date for ruleset
 */
export function rulesetStartDate(ruleset?: JBRulesetData) {
  if (!ruleset) return undefined;
  return new Date(ruleset.start * 1000);
}

/**
 * Hex formated wei from Relayr API to Ether
 */
export const formatHexEther = (hexWei: `0x${string}` | undefined, fixed = 8) => {
  if (!hexWei) return "0";
  return Number(formatEther(BigInt(hexWei))).toFixed(fixed);
};

export function sortChains(chainIds: JBChainId[]): JBChainId[] {
  return [...chainIds].sort((a, b) => {
    const aOrder = chainSortOrder.get(a) ?? 0;
    const bOrder = chainSortOrder.get(b) ?? 0;
    return aOrder - bOrder;
  });
}

/**
 * Ruleset metadata
 * @see https://github.com/Bananapus/nana-core/blob/main/src/libraries/JBRulesetMetadataResolver.sol
 */
export type RulesetMetadata = {
  reservedPercent: ReservedPercent; // bits 4-19
  cashOutTaxRate: CashOutTaxRate; // bits 20-35
  baseCurrency: number; // bits 36-67
  pausePay: boolean; // bit 68
  pauseCreditTransfers: boolean; // bit 69
  allowOwnerMinting: boolean; // bit 70
  allowSetCustomToken: boolean; // bit 71
  allowTerminalMigration: boolean; // bit 72
  allowSetTerminals: boolean; // bit 73
  allowSetController: boolean; // bit 74
  allowAddAccountingContext: boolean; // bit 75
  allowAddPriceFeed: boolean; // bit 76
  ownerMustSendPayouts: boolean; // bit 77
  holdFees: boolean; // bit 78
  useTotalSurplusForCashOuts: boolean; // bit 79
  useDataHookForPay: boolean; // bit 80
  useDataHookForCashOut: boolean; // bit 81
  dataHook: Address; // bits 82-241
  metadata: number; // bits 242-255
};

/**
 * Decodes packed ruleset metadata into its constituent parts
 * @param packed The packed uint256 metadata value
 * @returns Decoded metadata object
 * @see https://github.com/Bananapus/nana-core/blob/main/src/libraries/JBRulesetMetadataResolver.sol
 */
export function decodeRulesetMetadata(packed: bigint): RulesetMetadata {
  return {
    reservedPercent: new ReservedPercent(Number((packed >> 4n) & ((1n << 16n) - 1n))),
    cashOutTaxRate: new CashOutTaxRate(Number((packed >> 20n) & ((1n << 16n) - 1n))),
    baseCurrency: Number((packed >> 36n) & ((1n << 32n) - 1n)),

    // Boolean flags
    pausePay: Boolean((packed >> 68n) & 1n),
    pauseCreditTransfers: Boolean((packed >> 69n) & 1n),
    allowOwnerMinting: Boolean((packed >> 70n) & 1n),
    allowSetCustomToken: Boolean((packed >> 71n) & 1n),
    allowTerminalMigration: Boolean((packed >> 72n) & 1n),
    allowSetTerminals: Boolean((packed >> 73n) & 1n),
    allowSetController: Boolean((packed >> 74n) & 1n),
    allowAddAccountingContext: Boolean((packed >> 75n) & 1n),
    allowAddPriceFeed: Boolean((packed >> 76n) & 1n),
    ownerMustSendPayouts: Boolean((packed >> 77n) & 1n),
    holdFees: Boolean((packed >> 78n) & 1n),
    useTotalSurplusForCashOuts: Boolean((packed >> 79n) & 1n),
    useDataHookForPay: Boolean((packed >> 80n) & 1n),
    useDataHookForCashOut: Boolean((packed >> 81n) & 1n),

    // Address
    dataHook:
      `0x${((packed >> 82n) & ((1n << 160n) - 1n)).toString(16).padStart(40, "0")}` as Address,

    // Final metadata (14 bits)
    metadata: Number((packed >> 242n) & ((1n << 14n) - 1n)),
  };
}

/**
 * Create a beneficiary set from an address for multiple chains
 */
export function makeBeneficiarySet(addr: string, chains: number[]) {
  return chains.map((chainId) => ({ chainId, address: addr }));
}

/**
 * Create an operator set from an address for multiple chains
 */
export function makeOperatorSet(addr: string, chains: number[]) {
  return chains.map((chainId) => ({ chainId, address: addr }));
}

/**
 * Convert human-readable token amount to wei
 */
export function toWei(amount: string | number): bigint {
  return BigInt(Math.floor(Number(amount) * 1e18));
}

export function formatWalletError(error: any, defaultMessage = "Please try again") {
  if (typeof error === "string") return error;
  if (error.shortMessage)
    return (error.shortMessage as string).replace("User rejected", "You rejected");
  if (error.message) return error.message as string;
  return defaultMessage;
}
