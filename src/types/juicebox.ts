export interface JBProjectMetadata {
  name: string;
  description: string;
  logoUri: string;
  projectTagline: string;
}

export type JBSplit = {
  beneficiary: string | undefined; // address
  percent: number;
  preferClaimed: boolean | undefined;
  lockedUntil: number | undefined;
  projectId: string | undefined;
  allocator: string | undefined; // address, If an allocator is specified, funds will be sent to the allocator contract along with the projectId, beneficiary, preferClaimed properties.
  totalValue?: bigint;
};

// Splits as they are given to transactions such as reconfigureFundingCyclesOf
// Used when interpreting data from Gnosis Safe transactions
export type JBSplitParams = {
  beneficiary: string | undefined; // address
  percent: bigint;
  preferClaimed: boolean | undefined;
  lockedUntil: number | undefined;
  projectId: string | undefined;
  allocator: string | undefined;
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
