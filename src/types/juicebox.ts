import { DiscountRate, Ether, RedemptionRate, ReservedRate } from "fpnum";
import { Address } from "viem";

type Weight = Ether;

export interface JBProjectMetadata {
  name: string;
  description: string;
  logoUri: string;
  projectTagline: string;
}

export type JBSplit = {
  beneficiary: Address;
  percent: number;
  preferClaimed: boolean;
  lockedUntil: number;
  projectId: bigint;
  allocator: Address; // If an allocator is specified, funds will be sent to the allocator contract along with the projectId, beneficiary, preferClaimed properties.
};

// Splits as they are given to transactions such as reconfigureFundingCyclesOf
// Used when interpreting data from Gnosis Safe transactions
export type JBSplitParams = {
  beneficiary: Address;
  percent: bigint;
  preferClaimed: boolean;
  lockedUntil: number;
  projectId: bigint;
  allocator: Address;
};

export enum SplitGroup {
  ETHPayout = 1,
  ReservedTokens = 2,
}

export interface GroupedSplits<G> {
  group: G;
  splits: JBSplit[];
}

export type ETHPayoutGroupedSplits = GroupedSplits<SplitGroup.ETHPayout>;
export type ReservedTokensGroupedSplits =
  GroupedSplits<SplitGroup.ReservedTokens>;

export type JBFundingCycleMetadataGlobal = {
  allowSetController: boolean;
  allowSetTerminals: boolean;
  pauseTransfers: boolean;
};

export type JBFundingCycleMetadata = {
  global: JBFundingCycleMetadataGlobal;

  reservedRate: ReservedRate;
  redemptionRate: RedemptionRate;
  ballotRedemptionRate: RedemptionRate;

  pausePay: boolean;
  pauseDistributions: boolean;
  pauseRedeem: boolean;
  pauseBurn: boolean;
  allowMinting: boolean;
  allowTerminalMigration: boolean;
  allowControllerMigration: boolean;
  holdFees: boolean;
  preferClaimedTokenOverride?: boolean;
  useTotalOverflowForRedemptions: boolean;
  useDataSourceForPay: boolean;
  useDataSourceForRedeem: boolean;

  dataSource: Address;
  metadata?: bigint;
};

export type JBFundAccessConstraints = {
  terminal: Address;
  token: Address;
  distributionLimit: bigint;
  distributionLimitCurrency: bigint;
  overflowAllowance: bigint;
  overflowAllowanceCurrency: bigint;
};

export type JBFundingCycleData = {
  duration: bigint;

  weight: Weight;
  discountRate: DiscountRate;
  ballot: Address;
};

export type JBFundingCycle = {
  number: bigint;
  configuration: bigint;
  basedOn: bigint;
  start: bigint;

  metadata: bigint;
} & JBFundingCycleData;
