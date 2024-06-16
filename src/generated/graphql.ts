/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Bytes: { input: any; output: any; }
  /**
   * 8 bytes signed integer
   *
   */
  Int8: { input: any; output: any; }
};

export type AddToBalanceEvent = {
  amount: Scalars['BigInt']['output'];
  amountUSD: Maybe<Scalars['BigInt']['output']>;
  caller: Scalars['Bytes']['output'];
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  note: Maybe<Scalars['String']['output']>;
  project: Project;
  projectId: Scalars['Int']['output'];
  terminal: Scalars['Bytes']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type AddToBalanceEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amountUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<AddToBalanceEvent_Filter>>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  note?: InputMaybe<Scalars['String']['input']>;
  note_contains?: InputMaybe<Scalars['String']['input']>;
  note_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  note_ends_with?: InputMaybe<Scalars['String']['input']>;
  note_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  note_gt?: InputMaybe<Scalars['String']['input']>;
  note_gte?: InputMaybe<Scalars['String']['input']>;
  note_in?: InputMaybe<Array<Scalars['String']['input']>>;
  note_lt?: InputMaybe<Scalars['String']['input']>;
  note_lte?: InputMaybe<Scalars['String']['input']>;
  note_not?: InputMaybe<Scalars['String']['input']>;
  note_not_contains?: InputMaybe<Scalars['String']['input']>;
  note_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  note_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  note_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  note_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  note_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  note_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  note_starts_with?: InputMaybe<Scalars['String']['input']>;
  note_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<AddToBalanceEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  terminal?: InputMaybe<Scalars['Bytes']['input']>;
  terminal_contains?: InputMaybe<Scalars['Bytes']['input']>;
  terminal_gt?: InputMaybe<Scalars['Bytes']['input']>;
  terminal_gte?: InputMaybe<Scalars['Bytes']['input']>;
  terminal_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  terminal_lt?: InputMaybe<Scalars['Bytes']['input']>;
  terminal_lte?: InputMaybe<Scalars['Bytes']['input']>;
  terminal_not?: InputMaybe<Scalars['Bytes']['input']>;
  terminal_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  terminal_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum AddToBalanceEvent_OrderBy {
  amount = 'amount',
  amountUSD = 'amountUSD',
  caller = 'caller',
  from = 'from',
  id = 'id',
  note = 'note',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  terminal = 'terminal',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export type BurnEvent = {
  amount: Scalars['BigInt']['output'];
  caller: Maybe<Scalars['Bytes']['output']>;
  erc20Amount: Scalars['BigInt']['output'];
  from: Scalars['Bytes']['output'];
  holder: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  stakedAmount: Scalars['BigInt']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type BurnEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<BurnEvent_Filter>>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  erc20Amount?: InputMaybe<Scalars['BigInt']['input']>;
  erc20Amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  erc20Amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  erc20Amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  erc20Amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  erc20Amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  erc20Amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  erc20Amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  holder?: InputMaybe<Scalars['Bytes']['input']>;
  holder_contains?: InputMaybe<Scalars['Bytes']['input']>;
  holder_gt?: InputMaybe<Scalars['Bytes']['input']>;
  holder_gte?: InputMaybe<Scalars['Bytes']['input']>;
  holder_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  holder_lt?: InputMaybe<Scalars['Bytes']['input']>;
  holder_lte?: InputMaybe<Scalars['Bytes']['input']>;
  holder_not?: InputMaybe<Scalars['Bytes']['input']>;
  holder_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  holder_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<BurnEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakedAmount?: InputMaybe<Scalars['BigInt']['input']>;
  stakedAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  stakedAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  stakedAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  stakedAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  stakedAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  stakedAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  stakedAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum BurnEvent_OrderBy {
  amount = 'amount',
  caller = 'caller',
  erc20Amount = 'erc20Amount',
  from = 'from',
  holder = 'holder',
  id = 'id',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  stakedAmount = 'stakedAmount',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type ConfigureEvent = {
  ballot: Scalars['Bytes']['output'];
  caller: Scalars['Bytes']['output'];
  configuration: Scalars['BigInt']['output'];
  discountRate: Scalars['BigInt']['output'];
  duration: Scalars['Int']['output'];
  from: Scalars['Bytes']['output'];
  fundingCycle: Maybe<FundingCycle>;
  id: Scalars['ID']['output'];
  memo: Maybe<Scalars['String']['output']>;
  mustStartAtOrAfter: Scalars['Int']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
  weight: Scalars['BigInt']['output'];
};

export type ConfigureEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ConfigureEvent_Filter>>>;
  ballot?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_contains?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_gt?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_gte?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  ballot_lt?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_lte?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_not?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  configuration?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_gt?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_gte?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  configuration_lt?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_lte?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_not?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  discountRate?: InputMaybe<Scalars['BigInt']['input']>;
  discountRate_gt?: InputMaybe<Scalars['BigInt']['input']>;
  discountRate_gte?: InputMaybe<Scalars['BigInt']['input']>;
  discountRate_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  discountRate_lt?: InputMaybe<Scalars['BigInt']['input']>;
  discountRate_lte?: InputMaybe<Scalars['BigInt']['input']>;
  discountRate_not?: InputMaybe<Scalars['BigInt']['input']>;
  discountRate_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  duration_gt?: InputMaybe<Scalars['Int']['input']>;
  duration_gte?: InputMaybe<Scalars['Int']['input']>;
  duration_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  duration_lt?: InputMaybe<Scalars['Int']['input']>;
  duration_lte?: InputMaybe<Scalars['Int']['input']>;
  duration_not?: InputMaybe<Scalars['Int']['input']>;
  duration_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  fundingCycle_?: InputMaybe<FundingCycle_Filter>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  memo?: InputMaybe<Scalars['String']['input']>;
  memo_contains?: InputMaybe<Scalars['String']['input']>;
  memo_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_ends_with?: InputMaybe<Scalars['String']['input']>;
  memo_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_gt?: InputMaybe<Scalars['String']['input']>;
  memo_gte?: InputMaybe<Scalars['String']['input']>;
  memo_in?: InputMaybe<Array<Scalars['String']['input']>>;
  memo_lt?: InputMaybe<Scalars['String']['input']>;
  memo_lte?: InputMaybe<Scalars['String']['input']>;
  memo_not?: InputMaybe<Scalars['String']['input']>;
  memo_not_contains?: InputMaybe<Scalars['String']['input']>;
  memo_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  memo_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  memo_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  memo_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_starts_with?: InputMaybe<Scalars['String']['input']>;
  memo_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  mustStartAtOrAfter?: InputMaybe<Scalars['Int']['input']>;
  mustStartAtOrAfter_gt?: InputMaybe<Scalars['Int']['input']>;
  mustStartAtOrAfter_gte?: InputMaybe<Scalars['Int']['input']>;
  mustStartAtOrAfter_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  mustStartAtOrAfter_lt?: InputMaybe<Scalars['Int']['input']>;
  mustStartAtOrAfter_lte?: InputMaybe<Scalars['Int']['input']>;
  mustStartAtOrAfter_not?: InputMaybe<Scalars['Int']['input']>;
  mustStartAtOrAfter_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<ConfigureEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  weight?: InputMaybe<Scalars['BigInt']['input']>;
  weight_gt?: InputMaybe<Scalars['BigInt']['input']>;
  weight_gte?: InputMaybe<Scalars['BigInt']['input']>;
  weight_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  weight_lt?: InputMaybe<Scalars['BigInt']['input']>;
  weight_lte?: InputMaybe<Scalars['BigInt']['input']>;
  weight_not?: InputMaybe<Scalars['BigInt']['input']>;
  weight_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum ConfigureEvent_OrderBy {
  ballot = 'ballot',
  caller = 'caller',
  configuration = 'configuration',
  discountRate = 'discountRate',
  duration = 'duration',
  from = 'from',
  fundingCycle = 'fundingCycle',
  fundingCycle__ballot = 'fundingCycle__ballot',
  fundingCycle__ballotRedemptionRate = 'fundingCycle__ballotRedemptionRate',
  fundingCycle__basedOn = 'fundingCycle__basedOn',
  fundingCycle__burnPaused = 'fundingCycle__burnPaused',
  fundingCycle__configuration = 'fundingCycle__configuration',
  fundingCycle__controllerMigrationAllowed = 'fundingCycle__controllerMigrationAllowed',
  fundingCycle__dataSource = 'fundingCycle__dataSource',
  fundingCycle__discountRate = 'fundingCycle__discountRate',
  fundingCycle__distributionsPaused = 'fundingCycle__distributionsPaused',
  fundingCycle__duration = 'fundingCycle__duration',
  fundingCycle__endTimestamp = 'fundingCycle__endTimestamp',
  fundingCycle__id = 'fundingCycle__id',
  fundingCycle__metadata = 'fundingCycle__metadata',
  fundingCycle__metametadata = 'fundingCycle__metametadata',
  fundingCycle__mintingAllowed = 'fundingCycle__mintingAllowed',
  fundingCycle__mustStartAtOrAfter = 'fundingCycle__mustStartAtOrAfter',
  fundingCycle__number = 'fundingCycle__number',
  fundingCycle__pausePay = 'fundingCycle__pausePay',
  fundingCycle__preferClaimedTokenOverride = 'fundingCycle__preferClaimedTokenOverride',
  fundingCycle__projectId = 'fundingCycle__projectId',
  fundingCycle__redeemPaused = 'fundingCycle__redeemPaused',
  fundingCycle__redemptionRate = 'fundingCycle__redemptionRate',
  fundingCycle__reservedRate = 'fundingCycle__reservedRate',
  fundingCycle__setControllerAllowed = 'fundingCycle__setControllerAllowed',
  fundingCycle__setTerminalsAllowed = 'fundingCycle__setTerminalsAllowed',
  fundingCycle__shouldHoldFees = 'fundingCycle__shouldHoldFees',
  fundingCycle__startTimestamp = 'fundingCycle__startTimestamp',
  fundingCycle__terminalMigrationAllowed = 'fundingCycle__terminalMigrationAllowed',
  fundingCycle__transfersPaused = 'fundingCycle__transfersPaused',
  fundingCycle__useDataSourceForPay = 'fundingCycle__useDataSourceForPay',
  fundingCycle__useDataSourceForRedeem = 'fundingCycle__useDataSourceForRedeem',
  fundingCycle__useTotalOverflowForRedemptions = 'fundingCycle__useTotalOverflowForRedemptions',
  fundingCycle__weight = 'fundingCycle__weight',
  fundingCycle__withdrawnAmount = 'fundingCycle__withdrawnAmount',
  id = 'id',
  memo = 'memo',
  mustStartAtOrAfter = 'mustStartAtOrAfter',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  timestamp = 'timestamp',
  txHash = 'txHash',
  weight = 'weight'
}

export type DecoratedBanny = {
  backside: Maybe<Scalars['BigInt']['output']>;
  fist: Maybe<Scalars['BigInt']['output']>;
  glasses: Maybe<Scalars['BigInt']['output']>;
  head: Maybe<Scalars['BigInt']['output']>;
  headTop: Maybe<Scalars['BigInt']['output']>;
  id: Scalars['ID']['output'];
  legs: Maybe<Scalars['BigInt']['output']>;
  mouth: Maybe<Scalars['BigInt']['output']>;
  naked: Maybe<Scalars['BigInt']['output']>;
  necklace: Maybe<Scalars['BigInt']['output']>;
  nft: Nft;
  suit: Maybe<Scalars['BigInt']['output']>;
  suitBottom: Maybe<Scalars['BigInt']['output']>;
  suitTop: Maybe<Scalars['BigInt']['output']>;
  topping: Maybe<Scalars['BigInt']['output']>;
  world: Maybe<Scalars['BigInt']['output']>;
};

export type DecoratedBanny_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DecoratedBanny_Filter>>>;
  backside?: InputMaybe<Scalars['BigInt']['input']>;
  backside_gt?: InputMaybe<Scalars['BigInt']['input']>;
  backside_gte?: InputMaybe<Scalars['BigInt']['input']>;
  backside_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  backside_lt?: InputMaybe<Scalars['BigInt']['input']>;
  backside_lte?: InputMaybe<Scalars['BigInt']['input']>;
  backside_not?: InputMaybe<Scalars['BigInt']['input']>;
  backside_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fist?: InputMaybe<Scalars['BigInt']['input']>;
  fist_gt?: InputMaybe<Scalars['BigInt']['input']>;
  fist_gte?: InputMaybe<Scalars['BigInt']['input']>;
  fist_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fist_lt?: InputMaybe<Scalars['BigInt']['input']>;
  fist_lte?: InputMaybe<Scalars['BigInt']['input']>;
  fist_not?: InputMaybe<Scalars['BigInt']['input']>;
  fist_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  glasses?: InputMaybe<Scalars['BigInt']['input']>;
  glasses_gt?: InputMaybe<Scalars['BigInt']['input']>;
  glasses_gte?: InputMaybe<Scalars['BigInt']['input']>;
  glasses_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  glasses_lt?: InputMaybe<Scalars['BigInt']['input']>;
  glasses_lte?: InputMaybe<Scalars['BigInt']['input']>;
  glasses_not?: InputMaybe<Scalars['BigInt']['input']>;
  glasses_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  head?: InputMaybe<Scalars['BigInt']['input']>;
  headTop?: InputMaybe<Scalars['BigInt']['input']>;
  headTop_gt?: InputMaybe<Scalars['BigInt']['input']>;
  headTop_gte?: InputMaybe<Scalars['BigInt']['input']>;
  headTop_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  headTop_lt?: InputMaybe<Scalars['BigInt']['input']>;
  headTop_lte?: InputMaybe<Scalars['BigInt']['input']>;
  headTop_not?: InputMaybe<Scalars['BigInt']['input']>;
  headTop_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  head_gt?: InputMaybe<Scalars['BigInt']['input']>;
  head_gte?: InputMaybe<Scalars['BigInt']['input']>;
  head_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  head_lt?: InputMaybe<Scalars['BigInt']['input']>;
  head_lte?: InputMaybe<Scalars['BigInt']['input']>;
  head_not?: InputMaybe<Scalars['BigInt']['input']>;
  head_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  legs?: InputMaybe<Scalars['BigInt']['input']>;
  legs_gt?: InputMaybe<Scalars['BigInt']['input']>;
  legs_gte?: InputMaybe<Scalars['BigInt']['input']>;
  legs_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  legs_lt?: InputMaybe<Scalars['BigInt']['input']>;
  legs_lte?: InputMaybe<Scalars['BigInt']['input']>;
  legs_not?: InputMaybe<Scalars['BigInt']['input']>;
  legs_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  mouth?: InputMaybe<Scalars['BigInt']['input']>;
  mouth_gt?: InputMaybe<Scalars['BigInt']['input']>;
  mouth_gte?: InputMaybe<Scalars['BigInt']['input']>;
  mouth_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  mouth_lt?: InputMaybe<Scalars['BigInt']['input']>;
  mouth_lte?: InputMaybe<Scalars['BigInt']['input']>;
  mouth_not?: InputMaybe<Scalars['BigInt']['input']>;
  mouth_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  naked?: InputMaybe<Scalars['BigInt']['input']>;
  naked_gt?: InputMaybe<Scalars['BigInt']['input']>;
  naked_gte?: InputMaybe<Scalars['BigInt']['input']>;
  naked_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  naked_lt?: InputMaybe<Scalars['BigInt']['input']>;
  naked_lte?: InputMaybe<Scalars['BigInt']['input']>;
  naked_not?: InputMaybe<Scalars['BigInt']['input']>;
  naked_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  necklace?: InputMaybe<Scalars['BigInt']['input']>;
  necklace_gt?: InputMaybe<Scalars['BigInt']['input']>;
  necklace_gte?: InputMaybe<Scalars['BigInt']['input']>;
  necklace_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  necklace_lt?: InputMaybe<Scalars['BigInt']['input']>;
  necklace_lte?: InputMaybe<Scalars['BigInt']['input']>;
  necklace_not?: InputMaybe<Scalars['BigInt']['input']>;
  necklace_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nft?: InputMaybe<Scalars['String']['input']>;
  nft_?: InputMaybe<Nft_Filter>;
  nft_contains?: InputMaybe<Scalars['String']['input']>;
  nft_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  nft_ends_with?: InputMaybe<Scalars['String']['input']>;
  nft_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nft_gt?: InputMaybe<Scalars['String']['input']>;
  nft_gte?: InputMaybe<Scalars['String']['input']>;
  nft_in?: InputMaybe<Array<Scalars['String']['input']>>;
  nft_lt?: InputMaybe<Scalars['String']['input']>;
  nft_lte?: InputMaybe<Scalars['String']['input']>;
  nft_not?: InputMaybe<Scalars['String']['input']>;
  nft_not_contains?: InputMaybe<Scalars['String']['input']>;
  nft_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  nft_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  nft_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nft_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  nft_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  nft_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nft_starts_with?: InputMaybe<Scalars['String']['input']>;
  nft_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<DecoratedBanny_Filter>>>;
  suit?: InputMaybe<Scalars['BigInt']['input']>;
  suitBottom?: InputMaybe<Scalars['BigInt']['input']>;
  suitBottom_gt?: InputMaybe<Scalars['BigInt']['input']>;
  suitBottom_gte?: InputMaybe<Scalars['BigInt']['input']>;
  suitBottom_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  suitBottom_lt?: InputMaybe<Scalars['BigInt']['input']>;
  suitBottom_lte?: InputMaybe<Scalars['BigInt']['input']>;
  suitBottom_not?: InputMaybe<Scalars['BigInt']['input']>;
  suitBottom_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  suitTop?: InputMaybe<Scalars['BigInt']['input']>;
  suitTop_gt?: InputMaybe<Scalars['BigInt']['input']>;
  suitTop_gte?: InputMaybe<Scalars['BigInt']['input']>;
  suitTop_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  suitTop_lt?: InputMaybe<Scalars['BigInt']['input']>;
  suitTop_lte?: InputMaybe<Scalars['BigInt']['input']>;
  suitTop_not?: InputMaybe<Scalars['BigInt']['input']>;
  suitTop_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  suit_gt?: InputMaybe<Scalars['BigInt']['input']>;
  suit_gte?: InputMaybe<Scalars['BigInt']['input']>;
  suit_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  suit_lt?: InputMaybe<Scalars['BigInt']['input']>;
  suit_lte?: InputMaybe<Scalars['BigInt']['input']>;
  suit_not?: InputMaybe<Scalars['BigInt']['input']>;
  suit_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  topping?: InputMaybe<Scalars['BigInt']['input']>;
  topping_gt?: InputMaybe<Scalars['BigInt']['input']>;
  topping_gte?: InputMaybe<Scalars['BigInt']['input']>;
  topping_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  topping_lt?: InputMaybe<Scalars['BigInt']['input']>;
  topping_lte?: InputMaybe<Scalars['BigInt']['input']>;
  topping_not?: InputMaybe<Scalars['BigInt']['input']>;
  topping_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  world?: InputMaybe<Scalars['BigInt']['input']>;
  world_gt?: InputMaybe<Scalars['BigInt']['input']>;
  world_gte?: InputMaybe<Scalars['BigInt']['input']>;
  world_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  world_lt?: InputMaybe<Scalars['BigInt']['input']>;
  world_lte?: InputMaybe<Scalars['BigInt']['input']>;
  world_not?: InputMaybe<Scalars['BigInt']['input']>;
  world_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum DecoratedBanny_OrderBy {
  backside = 'backside',
  fist = 'fist',
  glasses = 'glasses',
  head = 'head',
  headTop = 'headTop',
  id = 'id',
  legs = 'legs',
  mouth = 'mouth',
  naked = 'naked',
  necklace = 'necklace',
  nft = 'nft',
  nft__category = 'nft__category',
  nft__id = 'nft__id',
  nft__projectId = 'nft__projectId',
  nft__tokenId = 'nft__tokenId',
  nft__tokenUri = 'nft__tokenUri',
  suit = 'suit',
  suitBottom = 'suitBottom',
  suitTop = 'suitTop',
  topping = 'topping',
  world = 'world'
}

export type DeployEtherc20ProjectPayerEvent = {
  address: Scalars['Bytes']['output'];
  beneficiary: Scalars['Bytes']['output'];
  caller: Scalars['Bytes']['output'];
  directory: Scalars['Bytes']['output'];
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  memo: Maybe<Scalars['String']['output']>;
  metadata: Maybe<Scalars['Bytes']['output']>;
  owner: Scalars['Bytes']['output'];
  preferAddToBalance: Scalars['Boolean']['output'];
  preferClaimedTokens: Scalars['Boolean']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type DeployEtherc20ProjectPayerEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<DeployEtherc20ProjectPayerEvent_Filter>>>;
  beneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  beneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  directory?: InputMaybe<Scalars['Bytes']['input']>;
  directory_contains?: InputMaybe<Scalars['Bytes']['input']>;
  directory_gt?: InputMaybe<Scalars['Bytes']['input']>;
  directory_gte?: InputMaybe<Scalars['Bytes']['input']>;
  directory_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  directory_lt?: InputMaybe<Scalars['Bytes']['input']>;
  directory_lte?: InputMaybe<Scalars['Bytes']['input']>;
  directory_not?: InputMaybe<Scalars['Bytes']['input']>;
  directory_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  directory_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  memo?: InputMaybe<Scalars['String']['input']>;
  memo_contains?: InputMaybe<Scalars['String']['input']>;
  memo_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_ends_with?: InputMaybe<Scalars['String']['input']>;
  memo_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_gt?: InputMaybe<Scalars['String']['input']>;
  memo_gte?: InputMaybe<Scalars['String']['input']>;
  memo_in?: InputMaybe<Array<Scalars['String']['input']>>;
  memo_lt?: InputMaybe<Scalars['String']['input']>;
  memo_lte?: InputMaybe<Scalars['String']['input']>;
  memo_not?: InputMaybe<Scalars['String']['input']>;
  memo_not_contains?: InputMaybe<Scalars['String']['input']>;
  memo_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  memo_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  memo_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  memo_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_starts_with?: InputMaybe<Scalars['String']['input']>;
  memo_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_contains?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_gt?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_gte?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  metadata_lt?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_lte?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_not?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<DeployEtherc20ProjectPayerEvent_Filter>>>;
  owner?: InputMaybe<Scalars['Bytes']['input']>;
  owner_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  owner_lt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_lte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  preferAddToBalance?: InputMaybe<Scalars['Boolean']['input']>;
  preferAddToBalance_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  preferAddToBalance_not?: InputMaybe<Scalars['Boolean']['input']>;
  preferAddToBalance_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  preferClaimedTokens?: InputMaybe<Scalars['Boolean']['input']>;
  preferClaimedTokens_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  preferClaimedTokens_not?: InputMaybe<Scalars['Boolean']['input']>;
  preferClaimedTokens_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum DeployEtherc20ProjectPayerEvent_OrderBy {
  address = 'address',
  beneficiary = 'beneficiary',
  caller = 'caller',
  directory = 'directory',
  from = 'from',
  id = 'id',
  memo = 'memo',
  metadata = 'metadata',
  owner = 'owner',
  preferAddToBalance = 'preferAddToBalance',
  preferClaimedTokens = 'preferClaimedTokens',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type DeployEtherc20SplitsPayerEvent = {
  caller: Scalars['Bytes']['output'];
  defaultBeneficiary: Scalars['Bytes']['output'];
  defaultMemo: Scalars['String']['output'];
  defaultMetadata: Scalars['Bytes']['output'];
  defaultPreferClaimedTokens: Scalars['Boolean']['output'];
  defaultProjectId: Scalars['Int']['output'];
  defaultSplitsDomain: Scalars['BigInt']['output'];
  defaultSplitsGroup: Scalars['BigInt']['output'];
  defaultSplitsProjectId: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  owner: Scalars['Bytes']['output'];
  preferAddToBalance: Scalars['Boolean']['output'];
  splitsPayer: Scalars['Bytes']['output'];
};

export type DeployEtherc20SplitsPayerEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DeployEtherc20SplitsPayerEvent_Filter>>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  defaultBeneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  defaultBeneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  defaultMemo?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_contains?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_ends_with?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_gt?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_gte?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_in?: InputMaybe<Array<Scalars['String']['input']>>;
  defaultMemo_lt?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_lte?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not_contains?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  defaultMemo_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_starts_with?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  defaultMetadata?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_contains?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_gt?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_gte?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  defaultMetadata_lt?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_lte?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_not?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  defaultPreferClaimedTokens?: InputMaybe<Scalars['Boolean']['input']>;
  defaultPreferClaimedTokens_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  defaultPreferClaimedTokens_not?: InputMaybe<Scalars['Boolean']['input']>;
  defaultPreferClaimedTokens_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  defaultProjectId?: InputMaybe<Scalars['Int']['input']>;
  defaultProjectId_gt?: InputMaybe<Scalars['Int']['input']>;
  defaultProjectId_gte?: InputMaybe<Scalars['Int']['input']>;
  defaultProjectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  defaultProjectId_lt?: InputMaybe<Scalars['Int']['input']>;
  defaultProjectId_lte?: InputMaybe<Scalars['Int']['input']>;
  defaultProjectId_not?: InputMaybe<Scalars['Int']['input']>;
  defaultProjectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  defaultSplitsDomain?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsDomain_gt?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsDomain_gte?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsDomain_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  defaultSplitsDomain_lt?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsDomain_lte?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsDomain_not?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsDomain_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  defaultSplitsGroup?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsGroup_gt?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsGroup_gte?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsGroup_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  defaultSplitsGroup_lt?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsGroup_lte?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsGroup_not?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsGroup_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  defaultSplitsProjectId?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitsProjectId_gt?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitsProjectId_gte?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitsProjectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  defaultSplitsProjectId_lt?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitsProjectId_lte?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitsProjectId_not?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitsProjectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<DeployEtherc20SplitsPayerEvent_Filter>>>;
  owner?: InputMaybe<Scalars['Bytes']['input']>;
  owner_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  owner_lt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_lte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  preferAddToBalance?: InputMaybe<Scalars['Boolean']['input']>;
  preferAddToBalance_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  preferAddToBalance_not?: InputMaybe<Scalars['Boolean']['input']>;
  preferAddToBalance_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  splitsPayer?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_contains?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_gt?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_gte?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  splitsPayer_lt?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_lte?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_not?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum DeployEtherc20SplitsPayerEvent_OrderBy {
  caller = 'caller',
  defaultBeneficiary = 'defaultBeneficiary',
  defaultMemo = 'defaultMemo',
  defaultMetadata = 'defaultMetadata',
  defaultPreferClaimedTokens = 'defaultPreferClaimedTokens',
  defaultProjectId = 'defaultProjectId',
  defaultSplitsDomain = 'defaultSplitsDomain',
  defaultSplitsGroup = 'defaultSplitsGroup',
  defaultSplitsProjectId = 'defaultSplitsProjectId',
  id = 'id',
  owner = 'owner',
  preferAddToBalance = 'preferAddToBalance',
  splitsPayer = 'splitsPayer'
}

export type DeployedErc20Event = {
  address: Scalars['Bytes']['output'];
  caller: Scalars['Bytes']['output'];
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  symbol: Scalars['String']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type DeployedErc20Event_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<DeployedErc20Event_Filter>>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<DeployedErc20Event_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_gt?: InputMaybe<Scalars['String']['input']>;
  symbol_gte?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_lt?: InputMaybe<Scalars['String']['input']>;
  symbol_lte?: InputMaybe<Scalars['String']['input']>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum DeployedErc20Event_OrderBy {
  address = 'address',
  caller = 'caller',
  from = 'from',
  id = 'id',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  symbol = 'symbol',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type DistributePayoutsEvent = {
  amount: Scalars['BigInt']['output'];
  amountPaidOut: Scalars['BigInt']['output'];
  beneficiary: Scalars['Bytes']['output'];
  beneficiaryDistributionAmount: Scalars['BigInt']['output'];
  beneficiaryDistributionAmountUSD: Maybe<Scalars['BigInt']['output']>;
  caller: Scalars['Bytes']['output'];
  fee: Scalars['BigInt']['output'];
  feeUSD: Maybe<Scalars['BigInt']['output']>;
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  rulesetCycleNumber: Scalars['BigInt']['output'];
  rulesetId: Scalars['BigInt']['output'];
  splitDistributions: Array<DistributeToPayoutSplitEvent>;
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};


export type DistributePayoutsEventSplitDistributionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToPayoutSplitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<DistributeToPayoutSplitEvent_Filter>;
};

export type DistributePayoutsEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amountPaidOut?: InputMaybe<Scalars['BigInt']['input']>;
  amountPaidOut_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amountPaidOut_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amountPaidOut_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amountPaidOut_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amountPaidOut_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amountPaidOut_not?: InputMaybe<Scalars['BigInt']['input']>;
  amountPaidOut_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<DistributePayoutsEvent_Filter>>>;
  beneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiaryDistributionAmount?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryDistributionAmountUSD?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryDistributionAmountUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryDistributionAmountUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryDistributionAmountUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiaryDistributionAmountUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryDistributionAmountUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryDistributionAmountUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryDistributionAmountUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiaryDistributionAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryDistributionAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryDistributionAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiaryDistributionAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryDistributionAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryDistributionAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryDistributionAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  beneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  fee?: InputMaybe<Scalars['BigInt']['input']>;
  feeUSD?: InputMaybe<Scalars['BigInt']['input']>;
  feeUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fee_gt?: InputMaybe<Scalars['BigInt']['input']>;
  fee_gte?: InputMaybe<Scalars['BigInt']['input']>;
  fee_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fee_lt?: InputMaybe<Scalars['BigInt']['input']>;
  fee_lte?: InputMaybe<Scalars['BigInt']['input']>;
  fee_not?: InputMaybe<Scalars['BigInt']['input']>;
  fee_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<DistributePayoutsEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  rulesetCycleNumber?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetCycleNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetCycleNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetCycleNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  rulesetCycleNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetCycleNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetCycleNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetCycleNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  rulesetId?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  rulesetId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetId_not?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  splitDistributions_?: InputMaybe<DistributeToPayoutSplitEvent_Filter>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum DistributePayoutsEvent_OrderBy {
  amount = 'amount',
  amountPaidOut = 'amountPaidOut',
  beneficiary = 'beneficiary',
  beneficiaryDistributionAmount = 'beneficiaryDistributionAmount',
  beneficiaryDistributionAmountUSD = 'beneficiaryDistributionAmountUSD',
  caller = 'caller',
  fee = 'fee',
  feeUSD = 'feeUSD',
  from = 'from',
  id = 'id',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  rulesetCycleNumber = 'rulesetCycleNumber',
  rulesetId = 'rulesetId',
  splitDistributions = 'splitDistributions',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type DistributeReservedTokensEvent = {
  beneficiary: Scalars['Bytes']['output'];
  beneficiaryTokenCount: Scalars['BigInt']['output'];
  caller: Scalars['Bytes']['output'];
  from: Scalars['Bytes']['output'];
  fundingCycleNumber: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  splitDistributions: Array<DistributeToReservedTokenSplitEvent>;
  timestamp: Scalars['Int']['output'];
  tokenCount: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
};


export type DistributeReservedTokensEventSplitDistributionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToReservedTokenSplitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<DistributeToReservedTokenSplitEvent_Filter>;
};

export type DistributeReservedTokensEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DistributeReservedTokensEvent_Filter>>>;
  beneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiaryTokenCount?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTokenCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTokenCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTokenCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiaryTokenCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTokenCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTokenCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTokenCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  beneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  fundingCycleNumber?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  fundingCycleNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleNumber_not?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<DistributeReservedTokensEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  splitDistributions_?: InputMaybe<DistributeToReservedTokenSplitEvent_Filter>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  tokenCount?: InputMaybe<Scalars['BigInt']['input']>;
  tokenCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokenCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  tokenCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum DistributeReservedTokensEvent_OrderBy {
  beneficiary = 'beneficiary',
  beneficiaryTokenCount = 'beneficiaryTokenCount',
  caller = 'caller',
  from = 'from',
  fundingCycleNumber = 'fundingCycleNumber',
  id = 'id',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  splitDistributions = 'splitDistributions',
  timestamp = 'timestamp',
  tokenCount = 'tokenCount',
  txHash = 'txHash'
}

export type DistributeToPayoutModEvent = {
  caller: Scalars['Bytes']['output'];
  from: Scalars['Bytes']['output'];
  fundingCycleId: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  modAllocator: Scalars['Bytes']['output'];
  modBeneficiary: Scalars['Bytes']['output'];
  modCut: Scalars['BigInt']['output'];
  modCutUSD: Maybe<Scalars['BigInt']['output']>;
  modPreferUnstaked: Scalars['Boolean']['output'];
  modProjectId: Scalars['Int']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  tapEvent: TapEvent;
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type DistributeToPayoutModEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DistributeToPayoutModEvent_Filter>>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  fundingCycleId?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fundingCycleId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_not?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  modAllocator?: InputMaybe<Scalars['Bytes']['input']>;
  modAllocator_contains?: InputMaybe<Scalars['Bytes']['input']>;
  modAllocator_gt?: InputMaybe<Scalars['Bytes']['input']>;
  modAllocator_gte?: InputMaybe<Scalars['Bytes']['input']>;
  modAllocator_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  modAllocator_lt?: InputMaybe<Scalars['Bytes']['input']>;
  modAllocator_lte?: InputMaybe<Scalars['Bytes']['input']>;
  modAllocator_not?: InputMaybe<Scalars['Bytes']['input']>;
  modAllocator_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  modAllocator_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  modBeneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  modBeneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  modCut?: InputMaybe<Scalars['BigInt']['input']>;
  modCutUSD?: InputMaybe<Scalars['BigInt']['input']>;
  modCutUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  modCutUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  modCutUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  modCutUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  modCutUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  modCutUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  modCutUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  modCut_gt?: InputMaybe<Scalars['BigInt']['input']>;
  modCut_gte?: InputMaybe<Scalars['BigInt']['input']>;
  modCut_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  modCut_lt?: InputMaybe<Scalars['BigInt']['input']>;
  modCut_lte?: InputMaybe<Scalars['BigInt']['input']>;
  modCut_not?: InputMaybe<Scalars['BigInt']['input']>;
  modCut_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  modPreferUnstaked?: InputMaybe<Scalars['Boolean']['input']>;
  modPreferUnstaked_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  modPreferUnstaked_not?: InputMaybe<Scalars['Boolean']['input']>;
  modPreferUnstaked_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  modProjectId?: InputMaybe<Scalars['Int']['input']>;
  modProjectId_gt?: InputMaybe<Scalars['Int']['input']>;
  modProjectId_gte?: InputMaybe<Scalars['Int']['input']>;
  modProjectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  modProjectId_lt?: InputMaybe<Scalars['Int']['input']>;
  modProjectId_lte?: InputMaybe<Scalars['Int']['input']>;
  modProjectId_not?: InputMaybe<Scalars['Int']['input']>;
  modProjectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<DistributeToPayoutModEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tapEvent?: InputMaybe<Scalars['String']['input']>;
  tapEvent_?: InputMaybe<TapEvent_Filter>;
  tapEvent_contains?: InputMaybe<Scalars['String']['input']>;
  tapEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tapEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  tapEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tapEvent_gt?: InputMaybe<Scalars['String']['input']>;
  tapEvent_gte?: InputMaybe<Scalars['String']['input']>;
  tapEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tapEvent_lt?: InputMaybe<Scalars['String']['input']>;
  tapEvent_lte?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tapEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tapEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  tapEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum DistributeToPayoutModEvent_OrderBy {
  caller = 'caller',
  from = 'from',
  fundingCycleId = 'fundingCycleId',
  id = 'id',
  modAllocator = 'modAllocator',
  modBeneficiary = 'modBeneficiary',
  modCut = 'modCut',
  modCutUSD = 'modCutUSD',
  modPreferUnstaked = 'modPreferUnstaked',
  modProjectId = 'modProjectId',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  tapEvent = 'tapEvent',
  tapEvent__amount = 'tapEvent__amount',
  tapEvent__amountUSD = 'tapEvent__amountUSD',
  tapEvent__beneficiary = 'tapEvent__beneficiary',
  tapEvent__beneficiaryTransferAmount = 'tapEvent__beneficiaryTransferAmount',
  tapEvent__beneficiaryTransferAmountUSD = 'tapEvent__beneficiaryTransferAmountUSD',
  tapEvent__caller = 'tapEvent__caller',
  tapEvent__currency = 'tapEvent__currency',
  tapEvent__from = 'tapEvent__from',
  tapEvent__fundingCycleId = 'tapEvent__fundingCycleId',
  tapEvent__govFeeAmount = 'tapEvent__govFeeAmount',
  tapEvent__govFeeAmountUSD = 'tapEvent__govFeeAmountUSD',
  tapEvent__id = 'tapEvent__id',
  tapEvent__netTransferAmount = 'tapEvent__netTransferAmount',
  tapEvent__netTransferAmountUSD = 'tapEvent__netTransferAmountUSD',
  tapEvent__projectId = 'tapEvent__projectId',
  tapEvent__timestamp = 'tapEvent__timestamp',
  tapEvent__txHash = 'tapEvent__txHash',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type DistributeToPayoutSplitEvent = {
  amount: Scalars['BigInt']['output'];
  beneficiary: Scalars['Bytes']['output'];
  caller: Scalars['Bytes']['output'];
  distributePayoutsEvent: DistributePayoutsEvent;
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  lockedUntil: Scalars['Int']['output'];
  percent: Scalars['Int']['output'];
  preferAddToBalance: Scalars['Boolean']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  splitProjectId: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type DistributeToPayoutSplitEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<DistributeToPayoutSplitEvent_Filter>>>;
  beneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  beneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  distributePayoutsEvent?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_?: InputMaybe<DistributePayoutsEvent_Filter>;
  distributePayoutsEvent_contains?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_gt?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_gte?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributePayoutsEvent_lt?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_lte?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributePayoutsEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lockedUntil?: InputMaybe<Scalars['Int']['input']>;
  lockedUntil_gt?: InputMaybe<Scalars['Int']['input']>;
  lockedUntil_gte?: InputMaybe<Scalars['Int']['input']>;
  lockedUntil_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lockedUntil_lt?: InputMaybe<Scalars['Int']['input']>;
  lockedUntil_lte?: InputMaybe<Scalars['Int']['input']>;
  lockedUntil_not?: InputMaybe<Scalars['Int']['input']>;
  lockedUntil_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<DistributeToPayoutSplitEvent_Filter>>>;
  percent?: InputMaybe<Scalars['Int']['input']>;
  percent_gt?: InputMaybe<Scalars['Int']['input']>;
  percent_gte?: InputMaybe<Scalars['Int']['input']>;
  percent_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  percent_lt?: InputMaybe<Scalars['Int']['input']>;
  percent_lte?: InputMaybe<Scalars['Int']['input']>;
  percent_not?: InputMaybe<Scalars['Int']['input']>;
  percent_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  preferAddToBalance?: InputMaybe<Scalars['Boolean']['input']>;
  preferAddToBalance_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  preferAddToBalance_not?: InputMaybe<Scalars['Boolean']['input']>;
  preferAddToBalance_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  splitProjectId?: InputMaybe<Scalars['Int']['input']>;
  splitProjectId_gt?: InputMaybe<Scalars['Int']['input']>;
  splitProjectId_gte?: InputMaybe<Scalars['Int']['input']>;
  splitProjectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  splitProjectId_lt?: InputMaybe<Scalars['Int']['input']>;
  splitProjectId_lte?: InputMaybe<Scalars['Int']['input']>;
  splitProjectId_not?: InputMaybe<Scalars['Int']['input']>;
  splitProjectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum DistributeToPayoutSplitEvent_OrderBy {
  amount = 'amount',
  beneficiary = 'beneficiary',
  caller = 'caller',
  distributePayoutsEvent = 'distributePayoutsEvent',
  distributePayoutsEvent__amount = 'distributePayoutsEvent__amount',
  distributePayoutsEvent__amountPaidOut = 'distributePayoutsEvent__amountPaidOut',
  distributePayoutsEvent__beneficiary = 'distributePayoutsEvent__beneficiary',
  distributePayoutsEvent__beneficiaryDistributionAmount = 'distributePayoutsEvent__beneficiaryDistributionAmount',
  distributePayoutsEvent__beneficiaryDistributionAmountUSD = 'distributePayoutsEvent__beneficiaryDistributionAmountUSD',
  distributePayoutsEvent__caller = 'distributePayoutsEvent__caller',
  distributePayoutsEvent__fee = 'distributePayoutsEvent__fee',
  distributePayoutsEvent__feeUSD = 'distributePayoutsEvent__feeUSD',
  distributePayoutsEvent__from = 'distributePayoutsEvent__from',
  distributePayoutsEvent__id = 'distributePayoutsEvent__id',
  distributePayoutsEvent__projectId = 'distributePayoutsEvent__projectId',
  distributePayoutsEvent__rulesetCycleNumber = 'distributePayoutsEvent__rulesetCycleNumber',
  distributePayoutsEvent__rulesetId = 'distributePayoutsEvent__rulesetId',
  distributePayoutsEvent__timestamp = 'distributePayoutsEvent__timestamp',
  distributePayoutsEvent__txHash = 'distributePayoutsEvent__txHash',
  from = 'from',
  id = 'id',
  lockedUntil = 'lockedUntil',
  percent = 'percent',
  preferAddToBalance = 'preferAddToBalance',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  splitProjectId = 'splitProjectId',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type DistributeToReservedTokenSplitEvent = {
  beneficiary: Scalars['Bytes']['output'];
  caller: Scalars['Bytes']['output'];
  distributeReservedTokensEvent: DistributeReservedTokensEvent;
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  lockedUntil: Scalars['Int']['output'];
  percent: Scalars['Int']['output'];
  preferAddToBalance: Scalars['Boolean']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  splitProjectId: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  tokenCount: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type DistributeToReservedTokenSplitEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DistributeToReservedTokenSplitEvent_Filter>>>;
  beneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  beneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  distributeReservedTokensEvent?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_?: InputMaybe<DistributeReservedTokensEvent_Filter>;
  distributeReservedTokensEvent_contains?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_gt?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_gte?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributeReservedTokensEvent_lt?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_lte?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributeReservedTokensEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lockedUntil?: InputMaybe<Scalars['Int']['input']>;
  lockedUntil_gt?: InputMaybe<Scalars['Int']['input']>;
  lockedUntil_gte?: InputMaybe<Scalars['Int']['input']>;
  lockedUntil_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lockedUntil_lt?: InputMaybe<Scalars['Int']['input']>;
  lockedUntil_lte?: InputMaybe<Scalars['Int']['input']>;
  lockedUntil_not?: InputMaybe<Scalars['Int']['input']>;
  lockedUntil_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<DistributeToReservedTokenSplitEvent_Filter>>>;
  percent?: InputMaybe<Scalars['Int']['input']>;
  percent_gt?: InputMaybe<Scalars['Int']['input']>;
  percent_gte?: InputMaybe<Scalars['Int']['input']>;
  percent_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  percent_lt?: InputMaybe<Scalars['Int']['input']>;
  percent_lte?: InputMaybe<Scalars['Int']['input']>;
  percent_not?: InputMaybe<Scalars['Int']['input']>;
  percent_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  preferAddToBalance?: InputMaybe<Scalars['Boolean']['input']>;
  preferAddToBalance_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  preferAddToBalance_not?: InputMaybe<Scalars['Boolean']['input']>;
  preferAddToBalance_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  splitProjectId?: InputMaybe<Scalars['Int']['input']>;
  splitProjectId_gt?: InputMaybe<Scalars['Int']['input']>;
  splitProjectId_gte?: InputMaybe<Scalars['Int']['input']>;
  splitProjectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  splitProjectId_lt?: InputMaybe<Scalars['Int']['input']>;
  splitProjectId_lte?: InputMaybe<Scalars['Int']['input']>;
  splitProjectId_not?: InputMaybe<Scalars['Int']['input']>;
  splitProjectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  tokenCount?: InputMaybe<Scalars['BigInt']['input']>;
  tokenCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokenCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  tokenCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum DistributeToReservedTokenSplitEvent_OrderBy {
  beneficiary = 'beneficiary',
  caller = 'caller',
  distributeReservedTokensEvent = 'distributeReservedTokensEvent',
  distributeReservedTokensEvent__beneficiary = 'distributeReservedTokensEvent__beneficiary',
  distributeReservedTokensEvent__beneficiaryTokenCount = 'distributeReservedTokensEvent__beneficiaryTokenCount',
  distributeReservedTokensEvent__caller = 'distributeReservedTokensEvent__caller',
  distributeReservedTokensEvent__from = 'distributeReservedTokensEvent__from',
  distributeReservedTokensEvent__fundingCycleNumber = 'distributeReservedTokensEvent__fundingCycleNumber',
  distributeReservedTokensEvent__id = 'distributeReservedTokensEvent__id',
  distributeReservedTokensEvent__projectId = 'distributeReservedTokensEvent__projectId',
  distributeReservedTokensEvent__timestamp = 'distributeReservedTokensEvent__timestamp',
  distributeReservedTokensEvent__tokenCount = 'distributeReservedTokensEvent__tokenCount',
  distributeReservedTokensEvent__txHash = 'distributeReservedTokensEvent__txHash',
  from = 'from',
  id = 'id',
  lockedUntil = 'lockedUntil',
  percent = 'percent',
  preferAddToBalance = 'preferAddToBalance',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  splitProjectId = 'splitProjectId',
  timestamp = 'timestamp',
  tokenCount = 'tokenCount',
  txHash = 'txHash'
}

export type DistributeToTicketModEvent = {
  caller: Scalars['Bytes']['output'];
  from: Scalars['Bytes']['output'];
  fundingCycleId: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  modBeneficiary: Scalars['Bytes']['output'];
  modCut: Scalars['BigInt']['output'];
  modPreferUnstaked: Scalars['Boolean']['output'];
  printReservesEvent: PrintReservesEvent;
  project: Project;
  projectId: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type DistributeToTicketModEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DistributeToTicketModEvent_Filter>>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  fundingCycleId?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fundingCycleId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_not?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  modBeneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  modBeneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  modBeneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  modCut?: InputMaybe<Scalars['BigInt']['input']>;
  modCut_gt?: InputMaybe<Scalars['BigInt']['input']>;
  modCut_gte?: InputMaybe<Scalars['BigInt']['input']>;
  modCut_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  modCut_lt?: InputMaybe<Scalars['BigInt']['input']>;
  modCut_lte?: InputMaybe<Scalars['BigInt']['input']>;
  modCut_not?: InputMaybe<Scalars['BigInt']['input']>;
  modCut_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  modPreferUnstaked?: InputMaybe<Scalars['Boolean']['input']>;
  modPreferUnstaked_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  modPreferUnstaked_not?: InputMaybe<Scalars['Boolean']['input']>;
  modPreferUnstaked_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  or?: InputMaybe<Array<InputMaybe<DistributeToTicketModEvent_Filter>>>;
  printReservesEvent?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_?: InputMaybe<PrintReservesEvent_Filter>;
  printReservesEvent_contains?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_gt?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_gte?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  printReservesEvent_lt?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_lte?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  printReservesEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum DistributeToTicketModEvent_OrderBy {
  caller = 'caller',
  from = 'from',
  fundingCycleId = 'fundingCycleId',
  id = 'id',
  modBeneficiary = 'modBeneficiary',
  modCut = 'modCut',
  modPreferUnstaked = 'modPreferUnstaked',
  printReservesEvent = 'printReservesEvent',
  printReservesEvent__beneficiary = 'printReservesEvent__beneficiary',
  printReservesEvent__beneficiaryTicketAmount = 'printReservesEvent__beneficiaryTicketAmount',
  printReservesEvent__caller = 'printReservesEvent__caller',
  printReservesEvent__count = 'printReservesEvent__count',
  printReservesEvent__from = 'printReservesEvent__from',
  printReservesEvent__fundingCycleId = 'printReservesEvent__fundingCycleId',
  printReservesEvent__id = 'printReservesEvent__id',
  printReservesEvent__projectId = 'printReservesEvent__projectId',
  printReservesEvent__timestamp = 'printReservesEvent__timestamp',
  printReservesEvent__txHash = 'printReservesEvent__txHash',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type EnsNode = {
  id: Scalars['ID']['output'];
  projectId: Maybe<Scalars['Int']['output']>;
};

export type EnsNode_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<EnsNode_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<EnsNode_Filter>>>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export enum EnsNode_OrderBy {
  id = 'id',
  projectId = 'projectId'
}

export type Etherc20ProjectPayer = {
  address: Scalars['Bytes']['output'];
  beneficiary: Scalars['Bytes']['output'];
  directory: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  memo: Maybe<Scalars['String']['output']>;
  metadata: Maybe<Scalars['Bytes']['output']>;
  owner: Scalars['Bytes']['output'];
  preferAddToBalance: Scalars['Boolean']['output'];
  preferClaimedTokens: Scalars['Boolean']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
};

export type Etherc20ProjectPayer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Etherc20ProjectPayer_Filter>>>;
  beneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  beneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  directory?: InputMaybe<Scalars['Bytes']['input']>;
  directory_contains?: InputMaybe<Scalars['Bytes']['input']>;
  directory_gt?: InputMaybe<Scalars['Bytes']['input']>;
  directory_gte?: InputMaybe<Scalars['Bytes']['input']>;
  directory_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  directory_lt?: InputMaybe<Scalars['Bytes']['input']>;
  directory_lte?: InputMaybe<Scalars['Bytes']['input']>;
  directory_not?: InputMaybe<Scalars['Bytes']['input']>;
  directory_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  directory_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  memo?: InputMaybe<Scalars['String']['input']>;
  memo_contains?: InputMaybe<Scalars['String']['input']>;
  memo_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_ends_with?: InputMaybe<Scalars['String']['input']>;
  memo_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_gt?: InputMaybe<Scalars['String']['input']>;
  memo_gte?: InputMaybe<Scalars['String']['input']>;
  memo_in?: InputMaybe<Array<Scalars['String']['input']>>;
  memo_lt?: InputMaybe<Scalars['String']['input']>;
  memo_lte?: InputMaybe<Scalars['String']['input']>;
  memo_not?: InputMaybe<Scalars['String']['input']>;
  memo_not_contains?: InputMaybe<Scalars['String']['input']>;
  memo_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  memo_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  memo_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  memo_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_starts_with?: InputMaybe<Scalars['String']['input']>;
  memo_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_contains?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_gt?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_gte?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  metadata_lt?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_lte?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_not?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Etherc20ProjectPayer_Filter>>>;
  owner?: InputMaybe<Scalars['Bytes']['input']>;
  owner_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  owner_lt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_lte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  preferAddToBalance?: InputMaybe<Scalars['Boolean']['input']>;
  preferAddToBalance_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  preferAddToBalance_not?: InputMaybe<Scalars['Boolean']['input']>;
  preferAddToBalance_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  preferClaimedTokens?: InputMaybe<Scalars['Boolean']['input']>;
  preferClaimedTokens_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  preferClaimedTokens_not?: InputMaybe<Scalars['Boolean']['input']>;
  preferClaimedTokens_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum Etherc20ProjectPayer_OrderBy {
  address = 'address',
  beneficiary = 'beneficiary',
  directory = 'directory',
  id = 'id',
  memo = 'memo',
  metadata = 'metadata',
  owner = 'owner',
  preferAddToBalance = 'preferAddToBalance',
  preferClaimedTokens = 'preferClaimedTokens',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD'
}

export type Etherc20SplitsPayer = {
  defaultBeneficiary: Scalars['Bytes']['output'];
  defaultMemo: Scalars['String']['output'];
  defaultMetadata: Scalars['Bytes']['output'];
  defaultPreferClaimedTokens: Scalars['Boolean']['output'];
  defaultProjectId: Scalars['Int']['output'];
  defaultSplitsDomain: Scalars['BigInt']['output'];
  defaultSplitsGroup: Scalars['BigInt']['output'];
  defaultSplitsProjectId: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  owner: Scalars['Bytes']['output'];
  preferAddToBalance: Scalars['Boolean']['output'];
  splitsPayer: Scalars['Bytes']['output'];
};

export type Etherc20SplitsPayer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Etherc20SplitsPayer_Filter>>>;
  defaultBeneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  defaultBeneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  defaultBeneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  defaultMemo?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_contains?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_ends_with?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_gt?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_gte?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_in?: InputMaybe<Array<Scalars['String']['input']>>;
  defaultMemo_lt?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_lte?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not_contains?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  defaultMemo_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_starts_with?: InputMaybe<Scalars['String']['input']>;
  defaultMemo_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  defaultMetadata?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_contains?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_gt?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_gte?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  defaultMetadata_lt?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_lte?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_not?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  defaultMetadata_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  defaultPreferClaimedTokens?: InputMaybe<Scalars['Boolean']['input']>;
  defaultPreferClaimedTokens_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  defaultPreferClaimedTokens_not?: InputMaybe<Scalars['Boolean']['input']>;
  defaultPreferClaimedTokens_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  defaultProjectId?: InputMaybe<Scalars['Int']['input']>;
  defaultProjectId_gt?: InputMaybe<Scalars['Int']['input']>;
  defaultProjectId_gte?: InputMaybe<Scalars['Int']['input']>;
  defaultProjectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  defaultProjectId_lt?: InputMaybe<Scalars['Int']['input']>;
  defaultProjectId_lte?: InputMaybe<Scalars['Int']['input']>;
  defaultProjectId_not?: InputMaybe<Scalars['Int']['input']>;
  defaultProjectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  defaultSplitsDomain?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsDomain_gt?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsDomain_gte?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsDomain_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  defaultSplitsDomain_lt?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsDomain_lte?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsDomain_not?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsDomain_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  defaultSplitsGroup?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsGroup_gt?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsGroup_gte?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsGroup_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  defaultSplitsGroup_lt?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsGroup_lte?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsGroup_not?: InputMaybe<Scalars['BigInt']['input']>;
  defaultSplitsGroup_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  defaultSplitsProjectId?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitsProjectId_gt?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitsProjectId_gte?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitsProjectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  defaultSplitsProjectId_lt?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitsProjectId_lte?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitsProjectId_not?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitsProjectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Etherc20SplitsPayer_Filter>>>;
  owner?: InputMaybe<Scalars['Bytes']['input']>;
  owner_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  owner_lt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_lte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  preferAddToBalance?: InputMaybe<Scalars['Boolean']['input']>;
  preferAddToBalance_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  preferAddToBalance_not?: InputMaybe<Scalars['Boolean']['input']>;
  preferAddToBalance_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  splitsPayer?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_contains?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_gt?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_gte?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  splitsPayer_lt?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_lte?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_not?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  splitsPayer_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum Etherc20SplitsPayer_OrderBy {
  defaultBeneficiary = 'defaultBeneficiary',
  defaultMemo = 'defaultMemo',
  defaultMetadata = 'defaultMetadata',
  defaultPreferClaimedTokens = 'defaultPreferClaimedTokens',
  defaultProjectId = 'defaultProjectId',
  defaultSplitsDomain = 'defaultSplitsDomain',
  defaultSplitsGroup = 'defaultSplitsGroup',
  defaultSplitsProjectId = 'defaultSplitsProjectId',
  id = 'id',
  owner = 'owner',
  preferAddToBalance = 'preferAddToBalance',
  splitsPayer = 'splitsPayer'
}

export type FundingCycle = {
  ballot: Scalars['Bytes']['output'];
  ballotRedemptionRate: Scalars['Int']['output'];
  basedOn: Scalars['Int']['output'];
  burnPaused: Scalars['Boolean']['output'];
  configuration: Scalars['BigInt']['output'];
  configureEvent: Maybe<ConfigureEvent>;
  controllerMigrationAllowed: Scalars['Boolean']['output'];
  dataSource: Maybe<Scalars['Bytes']['output']>;
  discountRate: Scalars['BigInt']['output'];
  distributionsPaused: Scalars['Boolean']['output'];
  duration: Scalars['Int']['output'];
  endTimestamp: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  metadata: Scalars['BigInt']['output'];
  metametadata: Scalars['Int']['output'];
  mintingAllowed: Scalars['Boolean']['output'];
  mustStartAtOrAfter: Maybe<Scalars['Int']['output']>;
  number: Scalars['Int']['output'];
  pausePay: Scalars['Boolean']['output'];
  preferClaimedTokenOverride: Scalars['Boolean']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  redeemPaused: Scalars['Boolean']['output'];
  redemptionRate: Scalars['Int']['output'];
  reservedRate: Scalars['Int']['output'];
  setControllerAllowed: Scalars['Boolean']['output'];
  setTerminalsAllowed: Scalars['Boolean']['output'];
  shouldHoldFees: Scalars['Boolean']['output'];
  startTimestamp: Scalars['Int']['output'];
  terminalMigrationAllowed: Scalars['Boolean']['output'];
  transfersPaused: Scalars['Boolean']['output'];
  useDataSourceForPay: Scalars['Boolean']['output'];
  useDataSourceForRedeem: Scalars['Boolean']['output'];
  useTotalOverflowForRedemptions: Scalars['Boolean']['output'];
  weight: Scalars['BigInt']['output'];
  withdrawnAmount: Scalars['BigInt']['output'];
};

export type FundingCycle_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<FundingCycle_Filter>>>;
  ballot?: InputMaybe<Scalars['Bytes']['input']>;
  ballotRedemptionRate?: InputMaybe<Scalars['Int']['input']>;
  ballotRedemptionRate_gt?: InputMaybe<Scalars['Int']['input']>;
  ballotRedemptionRate_gte?: InputMaybe<Scalars['Int']['input']>;
  ballotRedemptionRate_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  ballotRedemptionRate_lt?: InputMaybe<Scalars['Int']['input']>;
  ballotRedemptionRate_lte?: InputMaybe<Scalars['Int']['input']>;
  ballotRedemptionRate_not?: InputMaybe<Scalars['Int']['input']>;
  ballotRedemptionRate_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  ballot_contains?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_gt?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_gte?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  ballot_lt?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_lte?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_not?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  basedOn?: InputMaybe<Scalars['Int']['input']>;
  basedOn_gt?: InputMaybe<Scalars['Int']['input']>;
  basedOn_gte?: InputMaybe<Scalars['Int']['input']>;
  basedOn_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  basedOn_lt?: InputMaybe<Scalars['Int']['input']>;
  basedOn_lte?: InputMaybe<Scalars['Int']['input']>;
  basedOn_not?: InputMaybe<Scalars['Int']['input']>;
  basedOn_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  burnPaused?: InputMaybe<Scalars['Boolean']['input']>;
  burnPaused_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  burnPaused_not?: InputMaybe<Scalars['Boolean']['input']>;
  burnPaused_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  configuration?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_gt?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_gte?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  configuration_lt?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_lte?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_not?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  configureEvent?: InputMaybe<Scalars['String']['input']>;
  configureEvent_?: InputMaybe<ConfigureEvent_Filter>;
  configureEvent_contains?: InputMaybe<Scalars['String']['input']>;
  configureEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  configureEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  configureEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  configureEvent_gt?: InputMaybe<Scalars['String']['input']>;
  configureEvent_gte?: InputMaybe<Scalars['String']['input']>;
  configureEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  configureEvent_lt?: InputMaybe<Scalars['String']['input']>;
  configureEvent_lte?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  configureEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  configureEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  configureEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  controllerMigrationAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  controllerMigrationAllowed_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  controllerMigrationAllowed_not?: InputMaybe<Scalars['Boolean']['input']>;
  controllerMigrationAllowed_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  dataSource?: InputMaybe<Scalars['Bytes']['input']>;
  dataSource_contains?: InputMaybe<Scalars['Bytes']['input']>;
  dataSource_gt?: InputMaybe<Scalars['Bytes']['input']>;
  dataSource_gte?: InputMaybe<Scalars['Bytes']['input']>;
  dataSource_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  dataSource_lt?: InputMaybe<Scalars['Bytes']['input']>;
  dataSource_lte?: InputMaybe<Scalars['Bytes']['input']>;
  dataSource_not?: InputMaybe<Scalars['Bytes']['input']>;
  dataSource_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  dataSource_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  discountRate?: InputMaybe<Scalars['BigInt']['input']>;
  discountRate_gt?: InputMaybe<Scalars['BigInt']['input']>;
  discountRate_gte?: InputMaybe<Scalars['BigInt']['input']>;
  discountRate_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  discountRate_lt?: InputMaybe<Scalars['BigInt']['input']>;
  discountRate_lte?: InputMaybe<Scalars['BigInt']['input']>;
  discountRate_not?: InputMaybe<Scalars['BigInt']['input']>;
  discountRate_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  distributionsPaused?: InputMaybe<Scalars['Boolean']['input']>;
  distributionsPaused_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  distributionsPaused_not?: InputMaybe<Scalars['Boolean']['input']>;
  distributionsPaused_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  duration_gt?: InputMaybe<Scalars['Int']['input']>;
  duration_gte?: InputMaybe<Scalars['Int']['input']>;
  duration_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  duration_lt?: InputMaybe<Scalars['Int']['input']>;
  duration_lte?: InputMaybe<Scalars['Int']['input']>;
  duration_not?: InputMaybe<Scalars['Int']['input']>;
  duration_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  endTimestamp?: InputMaybe<Scalars['Int']['input']>;
  endTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  endTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  endTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  endTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  endTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  endTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  endTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  metadata?: InputMaybe<Scalars['BigInt']['input']>;
  metadata_gt?: InputMaybe<Scalars['BigInt']['input']>;
  metadata_gte?: InputMaybe<Scalars['BigInt']['input']>;
  metadata_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  metadata_lt?: InputMaybe<Scalars['BigInt']['input']>;
  metadata_lte?: InputMaybe<Scalars['BigInt']['input']>;
  metadata_not?: InputMaybe<Scalars['BigInt']['input']>;
  metadata_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  metametadata?: InputMaybe<Scalars['Int']['input']>;
  metametadata_gt?: InputMaybe<Scalars['Int']['input']>;
  metametadata_gte?: InputMaybe<Scalars['Int']['input']>;
  metametadata_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  metametadata_lt?: InputMaybe<Scalars['Int']['input']>;
  metametadata_lte?: InputMaybe<Scalars['Int']['input']>;
  metametadata_not?: InputMaybe<Scalars['Int']['input']>;
  metametadata_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  mintingAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  mintingAllowed_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  mintingAllowed_not?: InputMaybe<Scalars['Boolean']['input']>;
  mintingAllowed_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  mustStartAtOrAfter?: InputMaybe<Scalars['Int']['input']>;
  mustStartAtOrAfter_gt?: InputMaybe<Scalars['Int']['input']>;
  mustStartAtOrAfter_gte?: InputMaybe<Scalars['Int']['input']>;
  mustStartAtOrAfter_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  mustStartAtOrAfter_lt?: InputMaybe<Scalars['Int']['input']>;
  mustStartAtOrAfter_lte?: InputMaybe<Scalars['Int']['input']>;
  mustStartAtOrAfter_not?: InputMaybe<Scalars['Int']['input']>;
  mustStartAtOrAfter_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gt?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
  number_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  number_lt?: InputMaybe<Scalars['Int']['input']>;
  number_lte?: InputMaybe<Scalars['Int']['input']>;
  number_not?: InputMaybe<Scalars['Int']['input']>;
  number_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<FundingCycle_Filter>>>;
  pausePay?: InputMaybe<Scalars['Boolean']['input']>;
  pausePay_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  pausePay_not?: InputMaybe<Scalars['Boolean']['input']>;
  pausePay_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  preferClaimedTokenOverride?: InputMaybe<Scalars['Boolean']['input']>;
  preferClaimedTokenOverride_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  preferClaimedTokenOverride_not?: InputMaybe<Scalars['Boolean']['input']>;
  preferClaimedTokenOverride_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  redeemPaused?: InputMaybe<Scalars['Boolean']['input']>;
  redeemPaused_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  redeemPaused_not?: InputMaybe<Scalars['Boolean']['input']>;
  redeemPaused_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  redemptionRate?: InputMaybe<Scalars['Int']['input']>;
  redemptionRate_gt?: InputMaybe<Scalars['Int']['input']>;
  redemptionRate_gte?: InputMaybe<Scalars['Int']['input']>;
  redemptionRate_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  redemptionRate_lt?: InputMaybe<Scalars['Int']['input']>;
  redemptionRate_lte?: InputMaybe<Scalars['Int']['input']>;
  redemptionRate_not?: InputMaybe<Scalars['Int']['input']>;
  redemptionRate_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  reservedRate?: InputMaybe<Scalars['Int']['input']>;
  reservedRate_gt?: InputMaybe<Scalars['Int']['input']>;
  reservedRate_gte?: InputMaybe<Scalars['Int']['input']>;
  reservedRate_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  reservedRate_lt?: InputMaybe<Scalars['Int']['input']>;
  reservedRate_lte?: InputMaybe<Scalars['Int']['input']>;
  reservedRate_not?: InputMaybe<Scalars['Int']['input']>;
  reservedRate_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  setControllerAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  setControllerAllowed_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  setControllerAllowed_not?: InputMaybe<Scalars['Boolean']['input']>;
  setControllerAllowed_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  setTerminalsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  setTerminalsAllowed_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  setTerminalsAllowed_not?: InputMaybe<Scalars['Boolean']['input']>;
  setTerminalsAllowed_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  shouldHoldFees?: InputMaybe<Scalars['Boolean']['input']>;
  shouldHoldFees_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  shouldHoldFees_not?: InputMaybe<Scalars['Boolean']['input']>;
  shouldHoldFees_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  startTimestamp?: InputMaybe<Scalars['Int']['input']>;
  startTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  startTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  startTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  startTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  startTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  startTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  startTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  terminalMigrationAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  terminalMigrationAllowed_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  terminalMigrationAllowed_not?: InputMaybe<Scalars['Boolean']['input']>;
  terminalMigrationAllowed_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  transfersPaused?: InputMaybe<Scalars['Boolean']['input']>;
  transfersPaused_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  transfersPaused_not?: InputMaybe<Scalars['Boolean']['input']>;
  transfersPaused_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  useDataSourceForPay?: InputMaybe<Scalars['Boolean']['input']>;
  useDataSourceForPay_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  useDataSourceForPay_not?: InputMaybe<Scalars['Boolean']['input']>;
  useDataSourceForPay_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  useDataSourceForRedeem?: InputMaybe<Scalars['Boolean']['input']>;
  useDataSourceForRedeem_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  useDataSourceForRedeem_not?: InputMaybe<Scalars['Boolean']['input']>;
  useDataSourceForRedeem_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  useTotalOverflowForRedemptions?: InputMaybe<Scalars['Boolean']['input']>;
  useTotalOverflowForRedemptions_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  useTotalOverflowForRedemptions_not?: InputMaybe<Scalars['Boolean']['input']>;
  useTotalOverflowForRedemptions_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  weight?: InputMaybe<Scalars['BigInt']['input']>;
  weight_gt?: InputMaybe<Scalars['BigInt']['input']>;
  weight_gte?: InputMaybe<Scalars['BigInt']['input']>;
  weight_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  weight_lt?: InputMaybe<Scalars['BigInt']['input']>;
  weight_lte?: InputMaybe<Scalars['BigInt']['input']>;
  weight_not?: InputMaybe<Scalars['BigInt']['input']>;
  weight_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  withdrawnAmount?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  withdrawnAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum FundingCycle_OrderBy {
  ballot = 'ballot',
  ballotRedemptionRate = 'ballotRedemptionRate',
  basedOn = 'basedOn',
  burnPaused = 'burnPaused',
  configuration = 'configuration',
  configureEvent = 'configureEvent',
  configureEvent__ballot = 'configureEvent__ballot',
  configureEvent__caller = 'configureEvent__caller',
  configureEvent__configuration = 'configureEvent__configuration',
  configureEvent__discountRate = 'configureEvent__discountRate',
  configureEvent__duration = 'configureEvent__duration',
  configureEvent__from = 'configureEvent__from',
  configureEvent__id = 'configureEvent__id',
  configureEvent__memo = 'configureEvent__memo',
  configureEvent__mustStartAtOrAfter = 'configureEvent__mustStartAtOrAfter',
  configureEvent__projectId = 'configureEvent__projectId',
  configureEvent__timestamp = 'configureEvent__timestamp',
  configureEvent__txHash = 'configureEvent__txHash',
  configureEvent__weight = 'configureEvent__weight',
  controllerMigrationAllowed = 'controllerMigrationAllowed',
  dataSource = 'dataSource',
  discountRate = 'discountRate',
  distributionsPaused = 'distributionsPaused',
  duration = 'duration',
  endTimestamp = 'endTimestamp',
  id = 'id',
  metadata = 'metadata',
  metametadata = 'metametadata',
  mintingAllowed = 'mintingAllowed',
  mustStartAtOrAfter = 'mustStartAtOrAfter',
  number = 'number',
  pausePay = 'pausePay',
  preferClaimedTokenOverride = 'preferClaimedTokenOverride',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  redeemPaused = 'redeemPaused',
  redemptionRate = 'redemptionRate',
  reservedRate = 'reservedRate',
  setControllerAllowed = 'setControllerAllowed',
  setTerminalsAllowed = 'setTerminalsAllowed',
  shouldHoldFees = 'shouldHoldFees',
  startTimestamp = 'startTimestamp',
  terminalMigrationAllowed = 'terminalMigrationAllowed',
  transfersPaused = 'transfersPaused',
  useDataSourceForPay = 'useDataSourceForPay',
  useDataSourceForRedeem = 'useDataSourceForRedeem',
  useTotalOverflowForRedemptions = 'useTotalOverflowForRedemptions',
  weight = 'weight',
  withdrawnAmount = 'withdrawnAmount'
}

export type InitEvent = {
  basedOn: Scalars['Int']['output'];
  configuration: Scalars['BigInt']['output'];
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type InitEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<InitEvent_Filter>>>;
  basedOn?: InputMaybe<Scalars['Int']['input']>;
  basedOn_gt?: InputMaybe<Scalars['Int']['input']>;
  basedOn_gte?: InputMaybe<Scalars['Int']['input']>;
  basedOn_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  basedOn_lt?: InputMaybe<Scalars['Int']['input']>;
  basedOn_lte?: InputMaybe<Scalars['Int']['input']>;
  basedOn_not?: InputMaybe<Scalars['Int']['input']>;
  basedOn_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  configuration?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_gt?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_gte?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  configuration_lt?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_lte?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_not?: InputMaybe<Scalars['BigInt']['input']>;
  configuration_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<InitEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum InitEvent_OrderBy {
  basedOn = 'basedOn',
  configuration = 'configuration',
  from = 'from',
  id = 'id',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type MigrateEvent = {
  amount: Scalars['BigInt']['output'];
  caller: Scalars['Bytes']['output'];
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  to: Scalars['Bytes']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type MigrateEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<MigrateEvent_Filter>>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<MigrateEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  to?: InputMaybe<Scalars['Bytes']['input']>;
  to_contains?: InputMaybe<Scalars['Bytes']['input']>;
  to_gt?: InputMaybe<Scalars['Bytes']['input']>;
  to_gte?: InputMaybe<Scalars['Bytes']['input']>;
  to_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  to_lt?: InputMaybe<Scalars['Bytes']['input']>;
  to_lte?: InputMaybe<Scalars['Bytes']['input']>;
  to_not?: InputMaybe<Scalars['Bytes']['input']>;
  to_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  to_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum MigrateEvent_OrderBy {
  amount = 'amount',
  caller = 'caller',
  from = 'from',
  id = 'id',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  timestamp = 'timestamp',
  to = 'to',
  txHash = 'txHash'
}

export type MintTokensEvent = {
  amount: Scalars['BigInt']['output'];
  beneficiary: Scalars['Bytes']['output'];
  caller: Scalars['Bytes']['output'];
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  memo: Scalars['String']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type MintTokensEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<MintTokensEvent_Filter>>>;
  beneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  beneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  memo?: InputMaybe<Scalars['String']['input']>;
  memo_contains?: InputMaybe<Scalars['String']['input']>;
  memo_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_ends_with?: InputMaybe<Scalars['String']['input']>;
  memo_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_gt?: InputMaybe<Scalars['String']['input']>;
  memo_gte?: InputMaybe<Scalars['String']['input']>;
  memo_in?: InputMaybe<Array<Scalars['String']['input']>>;
  memo_lt?: InputMaybe<Scalars['String']['input']>;
  memo_lte?: InputMaybe<Scalars['String']['input']>;
  memo_not?: InputMaybe<Scalars['String']['input']>;
  memo_not_contains?: InputMaybe<Scalars['String']['input']>;
  memo_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  memo_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  memo_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  memo_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_starts_with?: InputMaybe<Scalars['String']['input']>;
  memo_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<MintTokensEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum MintTokensEvent_OrderBy {
  amount = 'amount',
  beneficiary = 'beneficiary',
  caller = 'caller',
  from = 'from',
  id = 'id',
  memo = 'memo',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type Nft = {
  category: Scalars['BigInt']['output'];
  collection: NftCollection;
  id: Scalars['ID']['output'];
  owner: Participant;
  project: Project;
  projectId: Scalars['Int']['output'];
  tier: NftTier;
  tokenId: Scalars['BigInt']['output'];
  tokenUri: Scalars['String']['output'];
};

export type NftCollection = {
  address: Scalars['Bytes']['output'];
  createdAt: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nfts: Array<Nft>;
  project: Project;
  projectId: Scalars['Int']['output'];
  symbol: Scalars['String']['output'];
  tiers: Array<NftTier>;
};


export type NftCollectionNftsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Nft_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Nft_Filter>;
};


export type NftCollectionTiersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftTier_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<NftTier_Filter>;
};

export type NftCollection_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<NftCollection_Filter>>>;
  createdAt?: InputMaybe<Scalars['Int']['input']>;
  createdAt_gt?: InputMaybe<Scalars['Int']['input']>;
  createdAt_gte?: InputMaybe<Scalars['Int']['input']>;
  createdAt_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  createdAt_lt?: InputMaybe<Scalars['Int']['input']>;
  createdAt_lte?: InputMaybe<Scalars['Int']['input']>;
  createdAt_not?: InputMaybe<Scalars['Int']['input']>;
  createdAt_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  nfts_?: InputMaybe<Nft_Filter>;
  or?: InputMaybe<Array<InputMaybe<NftCollection_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_gt?: InputMaybe<Scalars['String']['input']>;
  symbol_gte?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_lt?: InputMaybe<Scalars['String']['input']>;
  symbol_lte?: InputMaybe<Scalars['String']['input']>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tiers_?: InputMaybe<NftTier_Filter>;
};

export enum NftCollection_OrderBy {
  address = 'address',
  createdAt = 'createdAt',
  id = 'id',
  name = 'name',
  nfts = 'nfts',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  symbol = 'symbol',
  tiers = 'tiers'
}

export type NftTier = {
  allowOwnerMint: Scalars['Boolean']['output'];
  cannotBeRemoved: Scalars['Boolean']['output'];
  category: Scalars['Int']['output'];
  collection: NftCollection;
  createdAt: Scalars['Int']['output'];
  encodedIpfsUri: Maybe<Scalars['Bytes']['output']>;
  id: Scalars['ID']['output'];
  initialSupply: Scalars['BigInt']['output'];
  nfts: Array<Nft>;
  price: Scalars['BigInt']['output'];
  remainingSupply: Scalars['BigInt']['output'];
  reserveBeneficiary: Scalars['Bytes']['output'];
  reserveFrequency: Scalars['Int']['output'];
  resolvedUri: Maybe<Scalars['String']['output']>;
  svg: Maybe<Scalars['String']['output']>;
  tierId: Scalars['Int']['output'];
  transfersPausable: Scalars['Boolean']['output'];
  votingUnits: Scalars['BigInt']['output'];
};


export type NftTierNftsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Nft_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Nft_Filter>;
};

export type NftTier_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  allowOwnerMint?: InputMaybe<Scalars['Boolean']['input']>;
  allowOwnerMint_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  allowOwnerMint_not?: InputMaybe<Scalars['Boolean']['input']>;
  allowOwnerMint_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  and?: InputMaybe<Array<InputMaybe<NftTier_Filter>>>;
  cannotBeRemoved?: InputMaybe<Scalars['Boolean']['input']>;
  cannotBeRemoved_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  cannotBeRemoved_not?: InputMaybe<Scalars['Boolean']['input']>;
  cannotBeRemoved_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  category?: InputMaybe<Scalars['Int']['input']>;
  category_gt?: InputMaybe<Scalars['Int']['input']>;
  category_gte?: InputMaybe<Scalars['Int']['input']>;
  category_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  category_lt?: InputMaybe<Scalars['Int']['input']>;
  category_lte?: InputMaybe<Scalars['Int']['input']>;
  category_not?: InputMaybe<Scalars['Int']['input']>;
  category_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  collection?: InputMaybe<Scalars['String']['input']>;
  collection_?: InputMaybe<NftCollection_Filter>;
  collection_contains?: InputMaybe<Scalars['String']['input']>;
  collection_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  collection_ends_with?: InputMaybe<Scalars['String']['input']>;
  collection_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  collection_gt?: InputMaybe<Scalars['String']['input']>;
  collection_gte?: InputMaybe<Scalars['String']['input']>;
  collection_in?: InputMaybe<Array<Scalars['String']['input']>>;
  collection_lt?: InputMaybe<Scalars['String']['input']>;
  collection_lte?: InputMaybe<Scalars['String']['input']>;
  collection_not?: InputMaybe<Scalars['String']['input']>;
  collection_not_contains?: InputMaybe<Scalars['String']['input']>;
  collection_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  collection_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  collection_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  collection_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  collection_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  collection_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  collection_starts_with?: InputMaybe<Scalars['String']['input']>;
  collection_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Int']['input']>;
  createdAt_gt?: InputMaybe<Scalars['Int']['input']>;
  createdAt_gte?: InputMaybe<Scalars['Int']['input']>;
  createdAt_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  createdAt_lt?: InputMaybe<Scalars['Int']['input']>;
  createdAt_lte?: InputMaybe<Scalars['Int']['input']>;
  createdAt_not?: InputMaybe<Scalars['Int']['input']>;
  createdAt_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  encodedIpfsUri?: InputMaybe<Scalars['Bytes']['input']>;
  encodedIpfsUri_contains?: InputMaybe<Scalars['Bytes']['input']>;
  encodedIpfsUri_gt?: InputMaybe<Scalars['Bytes']['input']>;
  encodedIpfsUri_gte?: InputMaybe<Scalars['Bytes']['input']>;
  encodedIpfsUri_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  encodedIpfsUri_lt?: InputMaybe<Scalars['Bytes']['input']>;
  encodedIpfsUri_lte?: InputMaybe<Scalars['Bytes']['input']>;
  encodedIpfsUri_not?: InputMaybe<Scalars['Bytes']['input']>;
  encodedIpfsUri_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  encodedIpfsUri_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  initialSupply?: InputMaybe<Scalars['BigInt']['input']>;
  initialSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  initialSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  initialSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  initialSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  initialSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  initialSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  initialSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nfts_?: InputMaybe<Nft_Filter>;
  or?: InputMaybe<Array<InputMaybe<NftTier_Filter>>>;
  price?: InputMaybe<Scalars['BigInt']['input']>;
  price_gt?: InputMaybe<Scalars['BigInt']['input']>;
  price_gte?: InputMaybe<Scalars['BigInt']['input']>;
  price_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  price_lt?: InputMaybe<Scalars['BigInt']['input']>;
  price_lte?: InputMaybe<Scalars['BigInt']['input']>;
  price_not?: InputMaybe<Scalars['BigInt']['input']>;
  price_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  remainingSupply?: InputMaybe<Scalars['BigInt']['input']>;
  remainingSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  remainingSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  remainingSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  remainingSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  remainingSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  remainingSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  remainingSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  reserveBeneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  reserveBeneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  reserveBeneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  reserveBeneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  reserveBeneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  reserveBeneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  reserveBeneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  reserveBeneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  reserveBeneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  reserveBeneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  reserveFrequency?: InputMaybe<Scalars['Int']['input']>;
  reserveFrequency_gt?: InputMaybe<Scalars['Int']['input']>;
  reserveFrequency_gte?: InputMaybe<Scalars['Int']['input']>;
  reserveFrequency_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  reserveFrequency_lt?: InputMaybe<Scalars['Int']['input']>;
  reserveFrequency_lte?: InputMaybe<Scalars['Int']['input']>;
  reserveFrequency_not?: InputMaybe<Scalars['Int']['input']>;
  reserveFrequency_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  resolvedUri?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_contains?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_ends_with?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_gt?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_gte?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_in?: InputMaybe<Array<Scalars['String']['input']>>;
  resolvedUri_lt?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_lte?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_not?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_not_contains?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  resolvedUri_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_starts_with?: InputMaybe<Scalars['String']['input']>;
  resolvedUri_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  svg?: InputMaybe<Scalars['String']['input']>;
  svg_contains?: InputMaybe<Scalars['String']['input']>;
  svg_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  svg_ends_with?: InputMaybe<Scalars['String']['input']>;
  svg_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  svg_gt?: InputMaybe<Scalars['String']['input']>;
  svg_gte?: InputMaybe<Scalars['String']['input']>;
  svg_in?: InputMaybe<Array<Scalars['String']['input']>>;
  svg_lt?: InputMaybe<Scalars['String']['input']>;
  svg_lte?: InputMaybe<Scalars['String']['input']>;
  svg_not?: InputMaybe<Scalars['String']['input']>;
  svg_not_contains?: InputMaybe<Scalars['String']['input']>;
  svg_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  svg_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  svg_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  svg_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  svg_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  svg_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  svg_starts_with?: InputMaybe<Scalars['String']['input']>;
  svg_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tierId?: InputMaybe<Scalars['Int']['input']>;
  tierId_gt?: InputMaybe<Scalars['Int']['input']>;
  tierId_gte?: InputMaybe<Scalars['Int']['input']>;
  tierId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  tierId_lt?: InputMaybe<Scalars['Int']['input']>;
  tierId_lte?: InputMaybe<Scalars['Int']['input']>;
  tierId_not?: InputMaybe<Scalars['Int']['input']>;
  tierId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  transfersPausable?: InputMaybe<Scalars['Boolean']['input']>;
  transfersPausable_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  transfersPausable_not?: InputMaybe<Scalars['Boolean']['input']>;
  transfersPausable_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  votingUnits?: InputMaybe<Scalars['BigInt']['input']>;
  votingUnits_gt?: InputMaybe<Scalars['BigInt']['input']>;
  votingUnits_gte?: InputMaybe<Scalars['BigInt']['input']>;
  votingUnits_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  votingUnits_lt?: InputMaybe<Scalars['BigInt']['input']>;
  votingUnits_lte?: InputMaybe<Scalars['BigInt']['input']>;
  votingUnits_not?: InputMaybe<Scalars['BigInt']['input']>;
  votingUnits_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum NftTier_OrderBy {
  allowOwnerMint = 'allowOwnerMint',
  cannotBeRemoved = 'cannotBeRemoved',
  category = 'category',
  collection = 'collection',
  collection__address = 'collection__address',
  collection__createdAt = 'collection__createdAt',
  collection__id = 'collection__id',
  collection__name = 'collection__name',
  collection__projectId = 'collection__projectId',
  collection__symbol = 'collection__symbol',
  createdAt = 'createdAt',
  encodedIpfsUri = 'encodedIpfsUri',
  id = 'id',
  initialSupply = 'initialSupply',
  nfts = 'nfts',
  price = 'price',
  remainingSupply = 'remainingSupply',
  reserveBeneficiary = 'reserveBeneficiary',
  reserveFrequency = 'reserveFrequency',
  resolvedUri = 'resolvedUri',
  svg = 'svg',
  tierId = 'tierId',
  transfersPausable = 'transfersPausable',
  votingUnits = 'votingUnits'
}

export type Nft_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Nft_Filter>>>;
  category?: InputMaybe<Scalars['BigInt']['input']>;
  category_gt?: InputMaybe<Scalars['BigInt']['input']>;
  category_gte?: InputMaybe<Scalars['BigInt']['input']>;
  category_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  category_lt?: InputMaybe<Scalars['BigInt']['input']>;
  category_lte?: InputMaybe<Scalars['BigInt']['input']>;
  category_not?: InputMaybe<Scalars['BigInt']['input']>;
  category_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  collection?: InputMaybe<Scalars['String']['input']>;
  collection_?: InputMaybe<NftCollection_Filter>;
  collection_contains?: InputMaybe<Scalars['String']['input']>;
  collection_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  collection_ends_with?: InputMaybe<Scalars['String']['input']>;
  collection_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  collection_gt?: InputMaybe<Scalars['String']['input']>;
  collection_gte?: InputMaybe<Scalars['String']['input']>;
  collection_in?: InputMaybe<Array<Scalars['String']['input']>>;
  collection_lt?: InputMaybe<Scalars['String']['input']>;
  collection_lte?: InputMaybe<Scalars['String']['input']>;
  collection_not?: InputMaybe<Scalars['String']['input']>;
  collection_not_contains?: InputMaybe<Scalars['String']['input']>;
  collection_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  collection_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  collection_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  collection_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  collection_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  collection_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  collection_starts_with?: InputMaybe<Scalars['String']['input']>;
  collection_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Nft_Filter>>>;
  owner?: InputMaybe<Scalars['String']['input']>;
  owner_?: InputMaybe<Participant_Filter>;
  owner_contains?: InputMaybe<Scalars['String']['input']>;
  owner_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_gt?: InputMaybe<Scalars['String']['input']>;
  owner_gte?: InputMaybe<Scalars['String']['input']>;
  owner_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_lt?: InputMaybe<Scalars['String']['input']>;
  owner_lte?: InputMaybe<Scalars['String']['input']>;
  owner_not?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tier?: InputMaybe<Scalars['String']['input']>;
  tier_?: InputMaybe<NftTier_Filter>;
  tier_contains?: InputMaybe<Scalars['String']['input']>;
  tier_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tier_ends_with?: InputMaybe<Scalars['String']['input']>;
  tier_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tier_gt?: InputMaybe<Scalars['String']['input']>;
  tier_gte?: InputMaybe<Scalars['String']['input']>;
  tier_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tier_lt?: InputMaybe<Scalars['String']['input']>;
  tier_lte?: InputMaybe<Scalars['String']['input']>;
  tier_not?: InputMaybe<Scalars['String']['input']>;
  tier_not_contains?: InputMaybe<Scalars['String']['input']>;
  tier_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tier_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  tier_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tier_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tier_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  tier_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tier_starts_with?: InputMaybe<Scalars['String']['input']>;
  tier_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tokenId?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokenId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_not?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokenUri?: InputMaybe<Scalars['String']['input']>;
  tokenUri_contains?: InputMaybe<Scalars['String']['input']>;
  tokenUri_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tokenUri_ends_with?: InputMaybe<Scalars['String']['input']>;
  tokenUri_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tokenUri_gt?: InputMaybe<Scalars['String']['input']>;
  tokenUri_gte?: InputMaybe<Scalars['String']['input']>;
  tokenUri_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenUri_lt?: InputMaybe<Scalars['String']['input']>;
  tokenUri_lte?: InputMaybe<Scalars['String']['input']>;
  tokenUri_not?: InputMaybe<Scalars['String']['input']>;
  tokenUri_not_contains?: InputMaybe<Scalars['String']['input']>;
  tokenUri_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tokenUri_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  tokenUri_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tokenUri_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenUri_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  tokenUri_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tokenUri_starts_with?: InputMaybe<Scalars['String']['input']>;
  tokenUri_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum Nft_OrderBy {
  category = 'category',
  collection = 'collection',
  collection__address = 'collection__address',
  collection__createdAt = 'collection__createdAt',
  collection__id = 'collection__id',
  collection__name = 'collection__name',
  collection__projectId = 'collection__projectId',
  collection__symbol = 'collection__symbol',
  id = 'id',
  owner = 'owner',
  owner__address = 'owner__address',
  owner__balance = 'owner__balance',
  owner__erc20Balance = 'owner__erc20Balance',
  owner__id = 'owner__id',
  owner__lastPaidTimestamp = 'owner__lastPaidTimestamp',
  owner__paymentsCount = 'owner__paymentsCount',
  owner__projectId = 'owner__projectId',
  owner__stakedBalance = 'owner__stakedBalance',
  owner__volume = 'owner__volume',
  owner__volumeUSD = 'owner__volumeUSD',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  tier = 'tier',
  tier__allowOwnerMint = 'tier__allowOwnerMint',
  tier__cannotBeRemoved = 'tier__cannotBeRemoved',
  tier__category = 'tier__category',
  tier__createdAt = 'tier__createdAt',
  tier__encodedIpfsUri = 'tier__encodedIpfsUri',
  tier__id = 'tier__id',
  tier__initialSupply = 'tier__initialSupply',
  tier__price = 'tier__price',
  tier__remainingSupply = 'tier__remainingSupply',
  tier__reserveBeneficiary = 'tier__reserveBeneficiary',
  tier__reserveFrequency = 'tier__reserveFrequency',
  tier__resolvedUri = 'tier__resolvedUri',
  tier__svg = 'tier__svg',
  tier__tierId = 'tier__tierId',
  tier__transfersPausable = 'tier__transfersPausable',
  tier__votingUnits = 'tier__votingUnits',
  tokenId = 'tokenId',
  tokenUri = 'tokenUri'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  asc = 'asc',
  desc = 'desc'
}

export type Participant = {
  address: Scalars['Bytes']['output'];
  balance: Scalars['BigInt']['output'];
  erc20Balance: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  jb721DelegateTokens: Array<Nft>;
  lastPaidTimestamp: Scalars['Int']['output'];
  paymentsCount: Scalars['Int']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  stakedBalance: Scalars['BigInt']['output'];
  volume: Scalars['BigInt']['output'];
  volumeUSD: Scalars['BigInt']['output'];
  wallet: Wallet;
};


export type ParticipantJb721DelegateTokensArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Nft_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Nft_Filter>;
};

export type Participant_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Participant_Filter>>>;
  balance?: InputMaybe<Scalars['BigInt']['input']>;
  balance_gt?: InputMaybe<Scalars['BigInt']['input']>;
  balance_gte?: InputMaybe<Scalars['BigInt']['input']>;
  balance_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  balance_lt?: InputMaybe<Scalars['BigInt']['input']>;
  balance_lte?: InputMaybe<Scalars['BigInt']['input']>;
  balance_not?: InputMaybe<Scalars['BigInt']['input']>;
  balance_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  erc20Balance?: InputMaybe<Scalars['BigInt']['input']>;
  erc20Balance_gt?: InputMaybe<Scalars['BigInt']['input']>;
  erc20Balance_gte?: InputMaybe<Scalars['BigInt']['input']>;
  erc20Balance_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  erc20Balance_lt?: InputMaybe<Scalars['BigInt']['input']>;
  erc20Balance_lte?: InputMaybe<Scalars['BigInt']['input']>;
  erc20Balance_not?: InputMaybe<Scalars['BigInt']['input']>;
  erc20Balance_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  jb721DelegateTokens_?: InputMaybe<Nft_Filter>;
  lastPaidTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastPaidTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastPaidTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastPaidTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastPaidTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastPaidTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastPaidTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastPaidTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Participant_Filter>>>;
  paymentsCount?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_gt?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_gte?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  paymentsCount_lt?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_lte?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_not?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakedBalance?: InputMaybe<Scalars['BigInt']['input']>;
  stakedBalance_gt?: InputMaybe<Scalars['BigInt']['input']>;
  stakedBalance_gte?: InputMaybe<Scalars['BigInt']['input']>;
  stakedBalance_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  stakedBalance_lt?: InputMaybe<Scalars['BigInt']['input']>;
  stakedBalance_lte?: InputMaybe<Scalars['BigInt']['input']>;
  stakedBalance_not?: InputMaybe<Scalars['BigInt']['input']>;
  stakedBalance_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  wallet?: InputMaybe<Scalars['String']['input']>;
  wallet_?: InputMaybe<Wallet_Filter>;
  wallet_contains?: InputMaybe<Scalars['String']['input']>;
  wallet_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  wallet_ends_with?: InputMaybe<Scalars['String']['input']>;
  wallet_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  wallet_gt?: InputMaybe<Scalars['String']['input']>;
  wallet_gte?: InputMaybe<Scalars['String']['input']>;
  wallet_in?: InputMaybe<Array<Scalars['String']['input']>>;
  wallet_lt?: InputMaybe<Scalars['String']['input']>;
  wallet_lte?: InputMaybe<Scalars['String']['input']>;
  wallet_not?: InputMaybe<Scalars['String']['input']>;
  wallet_not_contains?: InputMaybe<Scalars['String']['input']>;
  wallet_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  wallet_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  wallet_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  wallet_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  wallet_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  wallet_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  wallet_starts_with?: InputMaybe<Scalars['String']['input']>;
  wallet_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum Participant_OrderBy {
  address = 'address',
  balance = 'balance',
  erc20Balance = 'erc20Balance',
  id = 'id',
  jb721DelegateTokens = 'jb721DelegateTokens',
  lastPaidTimestamp = 'lastPaidTimestamp',
  paymentsCount = 'paymentsCount',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  stakedBalance = 'stakedBalance',
  volume = 'volume',
  volumeUSD = 'volumeUSD',
  wallet = 'wallet',
  wallet__id = 'wallet__id',
  wallet__lastPaidTimestamp = 'wallet__lastPaidTimestamp',
  wallet__volume = 'wallet__volume',
  wallet__volumeUSD = 'wallet__volumeUSD'
}

export type PayEvent = {
  amount: Scalars['BigInt']['output'];
  amountUSD: Maybe<Scalars['BigInt']['output']>;
  beneficiary: Scalars['Bytes']['output'];
  beneficiaryTokenCount: Scalars['BigInt']['output'];
  caller: Scalars['Bytes']['output'];
  distributionFromProjectId: Maybe<Scalars['Int']['output']>;
  feeFromV2Project: Maybe<Scalars['Int']['output']>;
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  note: Scalars['String']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type PayEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amountUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<PayEvent_Filter>>>;
  beneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiaryTokenCount?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTokenCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTokenCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTokenCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiaryTokenCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTokenCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTokenCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTokenCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  beneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  distributionFromProjectId?: InputMaybe<Scalars['Int']['input']>;
  distributionFromProjectId_gt?: InputMaybe<Scalars['Int']['input']>;
  distributionFromProjectId_gte?: InputMaybe<Scalars['Int']['input']>;
  distributionFromProjectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  distributionFromProjectId_lt?: InputMaybe<Scalars['Int']['input']>;
  distributionFromProjectId_lte?: InputMaybe<Scalars['Int']['input']>;
  distributionFromProjectId_not?: InputMaybe<Scalars['Int']['input']>;
  distributionFromProjectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  feeFromV2Project?: InputMaybe<Scalars['Int']['input']>;
  feeFromV2Project_gt?: InputMaybe<Scalars['Int']['input']>;
  feeFromV2Project_gte?: InputMaybe<Scalars['Int']['input']>;
  feeFromV2Project_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  feeFromV2Project_lt?: InputMaybe<Scalars['Int']['input']>;
  feeFromV2Project_lte?: InputMaybe<Scalars['Int']['input']>;
  feeFromV2Project_not?: InputMaybe<Scalars['Int']['input']>;
  feeFromV2Project_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  note?: InputMaybe<Scalars['String']['input']>;
  note_contains?: InputMaybe<Scalars['String']['input']>;
  note_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  note_ends_with?: InputMaybe<Scalars['String']['input']>;
  note_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  note_gt?: InputMaybe<Scalars['String']['input']>;
  note_gte?: InputMaybe<Scalars['String']['input']>;
  note_in?: InputMaybe<Array<Scalars['String']['input']>>;
  note_lt?: InputMaybe<Scalars['String']['input']>;
  note_lte?: InputMaybe<Scalars['String']['input']>;
  note_not?: InputMaybe<Scalars['String']['input']>;
  note_not_contains?: InputMaybe<Scalars['String']['input']>;
  note_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  note_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  note_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  note_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  note_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  note_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  note_starts_with?: InputMaybe<Scalars['String']['input']>;
  note_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<PayEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum PayEvent_OrderBy {
  amount = 'amount',
  amountUSD = 'amountUSD',
  beneficiary = 'beneficiary',
  beneficiaryTokenCount = 'beneficiaryTokenCount',
  caller = 'caller',
  distributionFromProjectId = 'distributionFromProjectId',
  feeFromV2Project = 'feeFromV2Project',
  from = 'from',
  id = 'id',
  note = 'note',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type PermissionsHolder = {
  account: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  operator: Scalars['Bytes']['output'];
  permissions: Array<Scalars['BigInt']['output']>;
  project: Project;
  projectId: Scalars['Int']['output'];
};

export type PermissionsHolder_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['Bytes']['input']>;
  account_contains?: InputMaybe<Scalars['Bytes']['input']>;
  account_gt?: InputMaybe<Scalars['Bytes']['input']>;
  account_gte?: InputMaybe<Scalars['Bytes']['input']>;
  account_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  account_lt?: InputMaybe<Scalars['Bytes']['input']>;
  account_lte?: InputMaybe<Scalars['Bytes']['input']>;
  account_not?: InputMaybe<Scalars['Bytes']['input']>;
  account_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  account_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<PermissionsHolder_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  operator?: InputMaybe<Scalars['Bytes']['input']>;
  operator_contains?: InputMaybe<Scalars['Bytes']['input']>;
  operator_gt?: InputMaybe<Scalars['Bytes']['input']>;
  operator_gte?: InputMaybe<Scalars['Bytes']['input']>;
  operator_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  operator_lt?: InputMaybe<Scalars['Bytes']['input']>;
  operator_lte?: InputMaybe<Scalars['Bytes']['input']>;
  operator_not?: InputMaybe<Scalars['Bytes']['input']>;
  operator_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  operator_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<PermissionsHolder_Filter>>>;
  permissions?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  permissions_contains?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  permissions_contains_nocase?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  permissions_not?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  permissions_not_contains?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  permissions_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum PermissionsHolder_OrderBy {
  account = 'account',
  id = 'id',
  operator = 'operator',
  permissions = 'permissions',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD'
}

export type PrintReservesEvent = {
  beneficiary: Scalars['Bytes']['output'];
  beneficiaryTicketAmount: Scalars['BigInt']['output'];
  caller: Scalars['Bytes']['output'];
  count: Scalars['BigInt']['output'];
  distributions: Array<DistributeToTicketModEvent>;
  from: Scalars['Bytes']['output'];
  fundingCycleId: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};


export type PrintReservesEventDistributionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToTicketModEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<DistributeToTicketModEvent_Filter>;
};

export type PrintReservesEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PrintReservesEvent_Filter>>>;
  beneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiaryTicketAmount?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTicketAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTicketAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTicketAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiaryTicketAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTicketAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTicketAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTicketAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  beneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  count?: InputMaybe<Scalars['BigInt']['input']>;
  count_gt?: InputMaybe<Scalars['BigInt']['input']>;
  count_gte?: InputMaybe<Scalars['BigInt']['input']>;
  count_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  count_lt?: InputMaybe<Scalars['BigInt']['input']>;
  count_lte?: InputMaybe<Scalars['BigInt']['input']>;
  count_not?: InputMaybe<Scalars['BigInt']['input']>;
  count_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  distributions_?: InputMaybe<DistributeToTicketModEvent_Filter>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  fundingCycleId?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fundingCycleId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_not?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<PrintReservesEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum PrintReservesEvent_OrderBy {
  beneficiary = 'beneficiary',
  beneficiaryTicketAmount = 'beneficiaryTicketAmount',
  caller = 'caller',
  count = 'count',
  distributions = 'distributions',
  from = 'from',
  fundingCycleId = 'fundingCycleId',
  id = 'id',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type Project = {
  addToBalanceEvents: Array<AddToBalanceEvent>;
  burnEvents: Array<BurnEvent>;
  configureEvents: Array<ConfigureEvent>;
  contributorsCount: Scalars['Int']['output'];
  createdAt: Scalars['Int']['output'];
  createdWithinTrendingWindow: Maybe<Scalars['Boolean']['output']>;
  creator: Scalars['Bytes']['output'];
  currentBalance: Scalars['BigInt']['output'];
  deployedERC20Events: Array<DeployedErc20Event>;
  deployer: Maybe<Scalars['Bytes']['output']>;
  distributePayoutsEvents: Array<DistributePayoutsEvent>;
  distributeReservedTokensEvents: Array<DistributeReservedTokensEvent>;
  distributeToPayoutModEvents: Array<DistributeToPayoutModEvent>;
  distributeToPayoutSplitEvents: Array<DistributeToPayoutSplitEvent>;
  distributeToReservedTokenSplitEvents: Array<DistributeToReservedTokenSplitEvent>;
  distributeToTicketModEvents: Array<DistributeToTicketModEvent>;
  ethErc20ProjectPayers: Array<Etherc20ProjectPayer>;
  handle: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  initEvents: Array<InitEvent>;
  jb721DelegateTokens: Array<Nft>;
  latestFundingCycle: Scalars['Int']['output'];
  metadata: Maybe<Scalars['String']['output']>;
  migrateEvents: Array<MigrateEvent>;
  mintTokensEvents: Array<MintTokensEvent>;
  nftCollections: Array<NftCollection>;
  nftsMintedCount: Scalars['Int']['output'];
  owner: Scalars['Bytes']['output'];
  participants: Array<Participant>;
  payEvents: Array<PayEvent>;
  paymentsCount: Scalars['Int']['output'];
  permissionsHolders: Array<PermissionsHolder>;
  printReservesEvents: Array<PrintReservesEvent>;
  projectEvents: Array<ProjectEvent>;
  projectId: Scalars['Int']['output'];
  redeemCount: Scalars['Int']['output'];
  redeemEvents: Array<RedeemEvent>;
  redeemVolume: Scalars['BigInt']['output'];
  redeemVolumeUSD: Scalars['BigInt']['output'];
  setFundAccessConstraintsEvents: Array<SetFundAccessConstraintsEvent>;
  tapEvents: Array<TapEvent>;
  tokenSupply: Scalars['BigInt']['output'];
  trendingPaymentsCount: Scalars['Int']['output'];
  trendingScore: Scalars['BigInt']['output'];
  trendingVolume: Scalars['BigInt']['output'];
  useAllowanceEvents: Array<UseAllowanceEvent>;
  v1ConfigureEvents: Array<V1ConfigureEvent>;
  v1InitEvents: Array<V1InitEvent>;
  volume: Scalars['BigInt']['output'];
  volumeUSD: Scalars['BigInt']['output'];
};


export type ProjectAddToBalanceEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<AddToBalanceEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<AddToBalanceEvent_Filter>;
};


export type ProjectBurnEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<BurnEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<BurnEvent_Filter>;
};


export type ProjectConfigureEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ConfigureEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<ConfigureEvent_Filter>;
};


export type ProjectDeployedErc20EventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DeployedErc20Event_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<DeployedErc20Event_Filter>;
};


export type ProjectDistributePayoutsEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributePayoutsEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<DistributePayoutsEvent_Filter>;
};


export type ProjectDistributeReservedTokensEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeReservedTokensEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<DistributeReservedTokensEvent_Filter>;
};


export type ProjectDistributeToPayoutModEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToPayoutModEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<DistributeToPayoutModEvent_Filter>;
};


export type ProjectDistributeToPayoutSplitEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToPayoutSplitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<DistributeToPayoutSplitEvent_Filter>;
};


export type ProjectDistributeToReservedTokenSplitEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToReservedTokenSplitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<DistributeToReservedTokenSplitEvent_Filter>;
};


export type ProjectDistributeToTicketModEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToTicketModEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<DistributeToTicketModEvent_Filter>;
};


export type ProjectEthErc20ProjectPayersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Etherc20ProjectPayer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Etherc20ProjectPayer_Filter>;
};


export type ProjectInitEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<InitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<InitEvent_Filter>;
};


export type ProjectJb721DelegateTokensArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Nft_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Nft_Filter>;
};


export type ProjectMigrateEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<MigrateEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<MigrateEvent_Filter>;
};


export type ProjectMintTokensEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<MintTokensEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<MintTokensEvent_Filter>;
};


export type ProjectNftCollectionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftCollection_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<NftCollection_Filter>;
};


export type ProjectParticipantsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Participant_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Participant_Filter>;
};


export type ProjectPayEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PayEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<PayEvent_Filter>;
};


export type ProjectPermissionsHoldersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PermissionsHolder_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<PermissionsHolder_Filter>;
};


export type ProjectPrintReservesEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PrintReservesEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<PrintReservesEvent_Filter>;
};


export type ProjectProjectEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProjectEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<ProjectEvent_Filter>;
};


export type ProjectRedeemEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RedeemEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<RedeemEvent_Filter>;
};


export type ProjectSetFundAccessConstraintsEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<SetFundAccessConstraintsEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<SetFundAccessConstraintsEvent_Filter>;
};


export type ProjectTapEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TapEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TapEvent_Filter>;
};


export type ProjectUseAllowanceEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UseAllowanceEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<UseAllowanceEvent_Filter>;
};


export type ProjectV1ConfigureEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<V1ConfigureEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<V1ConfigureEvent_Filter>;
};


export type ProjectV1InitEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<V1InitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<V1InitEvent_Filter>;
};

export type ProjectCreateEvent = {
  caller: Scalars['Bytes']['output'];
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type ProjectCreateEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ProjectCreateEvent_Filter>>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<ProjectCreateEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum ProjectCreateEvent_OrderBy {
  caller = 'caller',
  from = 'from',
  id = 'id',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type ProjectEvent = {
  addToBalanceEvent: Maybe<AddToBalanceEvent>;
  burnEvent: Maybe<BurnEvent>;
  caller: Maybe<Scalars['Bytes']['output']>;
  configureEvent: Maybe<ConfigureEvent>;
  deployETHERC20ProjectPayerEvent: Maybe<DeployEtherc20ProjectPayerEvent>;
  deployedERC20Event: Maybe<DeployedErc20Event>;
  distributePayoutsEvent: Maybe<DistributePayoutsEvent>;
  distributeReservedTokensEvent: Maybe<DistributeReservedTokensEvent>;
  distributeToPayoutModEvent: Maybe<DistributeToPayoutModEvent>;
  distributeToPayoutSplitEvent: Maybe<DistributeToPayoutSplitEvent>;
  distributeToReservedTokenSplitEvent: Maybe<DistributeToReservedTokenSplitEvent>;
  distributeToTicketModEvent: Maybe<DistributeToTicketModEvent>;
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  initEvent: Maybe<InitEvent>;
  migrateEvent: Maybe<MigrateEvent>;
  mintTokensEvent: Maybe<MintTokensEvent>;
  payEvent: Maybe<PayEvent>;
  printReservesEvent: Maybe<PrintReservesEvent>;
  project: Project;
  projectCreateEvent: Maybe<ProjectCreateEvent>;
  projectId: Scalars['Int']['output'];
  redeemEvent: Maybe<RedeemEvent>;
  setFundAccessConstraintsEvent: Maybe<SetFundAccessConstraintsEvent>;
  tapEvent: Maybe<TapEvent>;
  timestamp: Scalars['Int']['output'];
  useAllowanceEvent: Maybe<UseAllowanceEvent>;
  v1ConfigureEvent: Maybe<V1ConfigureEvent>;
  v1InitEvent: Maybe<V1InitEvent>;
};

export type ProjectEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  addToBalanceEvent?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_?: InputMaybe<AddToBalanceEvent_Filter>;
  addToBalanceEvent_contains?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_gt?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_gte?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  addToBalanceEvent_lt?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_lte?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_not?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  addToBalanceEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  addToBalanceEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  and?: InputMaybe<Array<InputMaybe<ProjectEvent_Filter>>>;
  burnEvent?: InputMaybe<Scalars['String']['input']>;
  burnEvent_?: InputMaybe<BurnEvent_Filter>;
  burnEvent_contains?: InputMaybe<Scalars['String']['input']>;
  burnEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  burnEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  burnEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  burnEvent_gt?: InputMaybe<Scalars['String']['input']>;
  burnEvent_gte?: InputMaybe<Scalars['String']['input']>;
  burnEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  burnEvent_lt?: InputMaybe<Scalars['String']['input']>;
  burnEvent_lte?: InputMaybe<Scalars['String']['input']>;
  burnEvent_not?: InputMaybe<Scalars['String']['input']>;
  burnEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  burnEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  burnEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  burnEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  burnEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  burnEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  burnEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  burnEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  burnEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  configureEvent?: InputMaybe<Scalars['String']['input']>;
  configureEvent_?: InputMaybe<ConfigureEvent_Filter>;
  configureEvent_contains?: InputMaybe<Scalars['String']['input']>;
  configureEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  configureEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  configureEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  configureEvent_gt?: InputMaybe<Scalars['String']['input']>;
  configureEvent_gte?: InputMaybe<Scalars['String']['input']>;
  configureEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  configureEvent_lt?: InputMaybe<Scalars['String']['input']>;
  configureEvent_lte?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  configureEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  configureEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  configureEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  configureEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_?: InputMaybe<DeployEtherc20ProjectPayerEvent_Filter>;
  deployETHERC20ProjectPayerEvent_contains?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_gt?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_gte?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  deployETHERC20ProjectPayerEvent_lt?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_lte?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_not?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  deployETHERC20ProjectPayerEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  deployETHERC20ProjectPayerEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_?: InputMaybe<DeployedErc20Event_Filter>;
  deployedERC20Event_contains?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_ends_with?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_gt?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_gte?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_in?: InputMaybe<Array<Scalars['String']['input']>>;
  deployedERC20Event_lt?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_lte?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_not?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_not_contains?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  deployedERC20Event_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_starts_with?: InputMaybe<Scalars['String']['input']>;
  deployedERC20Event_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_?: InputMaybe<DistributePayoutsEvent_Filter>;
  distributePayoutsEvent_contains?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_gt?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_gte?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributePayoutsEvent_lt?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_lte?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributePayoutsEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributePayoutsEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_?: InputMaybe<DistributeReservedTokensEvent_Filter>;
  distributeReservedTokensEvent_contains?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_gt?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_gte?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributeReservedTokensEvent_lt?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_lte?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributeReservedTokensEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributeReservedTokensEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_?: InputMaybe<DistributeToPayoutModEvent_Filter>;
  distributeToPayoutModEvent_contains?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_gt?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_gte?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributeToPayoutModEvent_lt?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_lte?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_not?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributeToPayoutModEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutModEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_?: InputMaybe<DistributeToPayoutSplitEvent_Filter>;
  distributeToPayoutSplitEvent_contains?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_gt?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_gte?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributeToPayoutSplitEvent_lt?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_lte?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_not?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributeToPayoutSplitEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributeToPayoutSplitEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_?: InputMaybe<DistributeToReservedTokenSplitEvent_Filter>;
  distributeToReservedTokenSplitEvent_contains?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_gt?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_gte?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributeToReservedTokenSplitEvent_lt?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_lte?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_not?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributeToReservedTokenSplitEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributeToReservedTokenSplitEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_?: InputMaybe<DistributeToTicketModEvent_Filter>;
  distributeToTicketModEvent_contains?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_gt?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_gte?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributeToTicketModEvent_lt?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_lte?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_not?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  distributeToTicketModEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  distributeToTicketModEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  initEvent?: InputMaybe<Scalars['String']['input']>;
  initEvent_?: InputMaybe<InitEvent_Filter>;
  initEvent_contains?: InputMaybe<Scalars['String']['input']>;
  initEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  initEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  initEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initEvent_gt?: InputMaybe<Scalars['String']['input']>;
  initEvent_gte?: InputMaybe<Scalars['String']['input']>;
  initEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  initEvent_lt?: InputMaybe<Scalars['String']['input']>;
  initEvent_lte?: InputMaybe<Scalars['String']['input']>;
  initEvent_not?: InputMaybe<Scalars['String']['input']>;
  initEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  initEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  initEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  initEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  initEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  initEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  initEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  migrateEvent?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_?: InputMaybe<MigrateEvent_Filter>;
  migrateEvent_contains?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_gt?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_gte?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  migrateEvent_lt?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_lte?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_not?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  migrateEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  migrateEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_?: InputMaybe<MintTokensEvent_Filter>;
  mintTokensEvent_contains?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_gt?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_gte?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  mintTokensEvent_lt?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_lte?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_not?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  mintTokensEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  mintTokensEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<ProjectEvent_Filter>>>;
  payEvent?: InputMaybe<Scalars['String']['input']>;
  payEvent_?: InputMaybe<PayEvent_Filter>;
  payEvent_contains?: InputMaybe<Scalars['String']['input']>;
  payEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  payEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  payEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  payEvent_gt?: InputMaybe<Scalars['String']['input']>;
  payEvent_gte?: InputMaybe<Scalars['String']['input']>;
  payEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  payEvent_lt?: InputMaybe<Scalars['String']['input']>;
  payEvent_lte?: InputMaybe<Scalars['String']['input']>;
  payEvent_not?: InputMaybe<Scalars['String']['input']>;
  payEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  payEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  payEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  payEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  payEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  payEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  payEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  payEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  payEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_?: InputMaybe<PrintReservesEvent_Filter>;
  printReservesEvent_contains?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_gt?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_gte?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  printReservesEvent_lt?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_lte?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  printReservesEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  printReservesEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_?: InputMaybe<ProjectCreateEvent_Filter>;
  projectCreateEvent_contains?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_gt?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_gte?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  projectCreateEvent_lt?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_lte?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_not?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  projectCreateEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  projectCreateEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  redeemEvent?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_?: InputMaybe<RedeemEvent_Filter>;
  redeemEvent_contains?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_gt?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_gte?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  redeemEvent_lt?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_lte?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_not?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  redeemEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  redeemEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_?: InputMaybe<SetFundAccessConstraintsEvent_Filter>;
  setFundAccessConstraintsEvent_contains?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_gt?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_gte?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  setFundAccessConstraintsEvent_lt?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_lte?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_not?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  setFundAccessConstraintsEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  setFundAccessConstraintsEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tapEvent?: InputMaybe<Scalars['String']['input']>;
  tapEvent_?: InputMaybe<TapEvent_Filter>;
  tapEvent_contains?: InputMaybe<Scalars['String']['input']>;
  tapEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tapEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  tapEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tapEvent_gt?: InputMaybe<Scalars['String']['input']>;
  tapEvent_gte?: InputMaybe<Scalars['String']['input']>;
  tapEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tapEvent_lt?: InputMaybe<Scalars['String']['input']>;
  tapEvent_lte?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tapEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  tapEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tapEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  tapEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  useAllowanceEvent?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_?: InputMaybe<UseAllowanceEvent_Filter>;
  useAllowanceEvent_contains?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_gt?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_gte?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  useAllowanceEvent_lt?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_lte?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_not?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  useAllowanceEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  useAllowanceEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_?: InputMaybe<V1ConfigureEvent_Filter>;
  v1ConfigureEvent_contains?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_gt?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_gte?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  v1ConfigureEvent_lt?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_lte?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_not?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  v1ConfigureEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  v1ConfigureEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_?: InputMaybe<V1InitEvent_Filter>;
  v1InitEvent_contains?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_gt?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_gte?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  v1InitEvent_lt?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_lte?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_not?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  v1InitEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  v1InitEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum ProjectEvent_OrderBy {
  addToBalanceEvent = 'addToBalanceEvent',
  addToBalanceEvent__amount = 'addToBalanceEvent__amount',
  addToBalanceEvent__amountUSD = 'addToBalanceEvent__amountUSD',
  addToBalanceEvent__caller = 'addToBalanceEvent__caller',
  addToBalanceEvent__from = 'addToBalanceEvent__from',
  addToBalanceEvent__id = 'addToBalanceEvent__id',
  addToBalanceEvent__note = 'addToBalanceEvent__note',
  addToBalanceEvent__projectId = 'addToBalanceEvent__projectId',
  addToBalanceEvent__terminal = 'addToBalanceEvent__terminal',
  addToBalanceEvent__timestamp = 'addToBalanceEvent__timestamp',
  addToBalanceEvent__txHash = 'addToBalanceEvent__txHash',
  burnEvent = 'burnEvent',
  burnEvent__amount = 'burnEvent__amount',
  burnEvent__caller = 'burnEvent__caller',
  burnEvent__erc20Amount = 'burnEvent__erc20Amount',
  burnEvent__from = 'burnEvent__from',
  burnEvent__holder = 'burnEvent__holder',
  burnEvent__id = 'burnEvent__id',
  burnEvent__projectId = 'burnEvent__projectId',
  burnEvent__stakedAmount = 'burnEvent__stakedAmount',
  burnEvent__timestamp = 'burnEvent__timestamp',
  burnEvent__txHash = 'burnEvent__txHash',
  caller = 'caller',
  configureEvent = 'configureEvent',
  configureEvent__ballot = 'configureEvent__ballot',
  configureEvent__caller = 'configureEvent__caller',
  configureEvent__configuration = 'configureEvent__configuration',
  configureEvent__discountRate = 'configureEvent__discountRate',
  configureEvent__duration = 'configureEvent__duration',
  configureEvent__from = 'configureEvent__from',
  configureEvent__id = 'configureEvent__id',
  configureEvent__memo = 'configureEvent__memo',
  configureEvent__mustStartAtOrAfter = 'configureEvent__mustStartAtOrAfter',
  configureEvent__projectId = 'configureEvent__projectId',
  configureEvent__timestamp = 'configureEvent__timestamp',
  configureEvent__txHash = 'configureEvent__txHash',
  configureEvent__weight = 'configureEvent__weight',
  deployETHERC20ProjectPayerEvent = 'deployETHERC20ProjectPayerEvent',
  deployETHERC20ProjectPayerEvent__address = 'deployETHERC20ProjectPayerEvent__address',
  deployETHERC20ProjectPayerEvent__beneficiary = 'deployETHERC20ProjectPayerEvent__beneficiary',
  deployETHERC20ProjectPayerEvent__caller = 'deployETHERC20ProjectPayerEvent__caller',
  deployETHERC20ProjectPayerEvent__directory = 'deployETHERC20ProjectPayerEvent__directory',
  deployETHERC20ProjectPayerEvent__from = 'deployETHERC20ProjectPayerEvent__from',
  deployETHERC20ProjectPayerEvent__id = 'deployETHERC20ProjectPayerEvent__id',
  deployETHERC20ProjectPayerEvent__memo = 'deployETHERC20ProjectPayerEvent__memo',
  deployETHERC20ProjectPayerEvent__metadata = 'deployETHERC20ProjectPayerEvent__metadata',
  deployETHERC20ProjectPayerEvent__owner = 'deployETHERC20ProjectPayerEvent__owner',
  deployETHERC20ProjectPayerEvent__preferAddToBalance = 'deployETHERC20ProjectPayerEvent__preferAddToBalance',
  deployETHERC20ProjectPayerEvent__preferClaimedTokens = 'deployETHERC20ProjectPayerEvent__preferClaimedTokens',
  deployETHERC20ProjectPayerEvent__projectId = 'deployETHERC20ProjectPayerEvent__projectId',
  deployETHERC20ProjectPayerEvent__timestamp = 'deployETHERC20ProjectPayerEvent__timestamp',
  deployETHERC20ProjectPayerEvent__txHash = 'deployETHERC20ProjectPayerEvent__txHash',
  deployedERC20Event = 'deployedERC20Event',
  deployedERC20Event__address = 'deployedERC20Event__address',
  deployedERC20Event__caller = 'deployedERC20Event__caller',
  deployedERC20Event__from = 'deployedERC20Event__from',
  deployedERC20Event__id = 'deployedERC20Event__id',
  deployedERC20Event__projectId = 'deployedERC20Event__projectId',
  deployedERC20Event__symbol = 'deployedERC20Event__symbol',
  deployedERC20Event__timestamp = 'deployedERC20Event__timestamp',
  deployedERC20Event__txHash = 'deployedERC20Event__txHash',
  distributePayoutsEvent = 'distributePayoutsEvent',
  distributePayoutsEvent__amount = 'distributePayoutsEvent__amount',
  distributePayoutsEvent__amountPaidOut = 'distributePayoutsEvent__amountPaidOut',
  distributePayoutsEvent__beneficiary = 'distributePayoutsEvent__beneficiary',
  distributePayoutsEvent__beneficiaryDistributionAmount = 'distributePayoutsEvent__beneficiaryDistributionAmount',
  distributePayoutsEvent__beneficiaryDistributionAmountUSD = 'distributePayoutsEvent__beneficiaryDistributionAmountUSD',
  distributePayoutsEvent__caller = 'distributePayoutsEvent__caller',
  distributePayoutsEvent__fee = 'distributePayoutsEvent__fee',
  distributePayoutsEvent__feeUSD = 'distributePayoutsEvent__feeUSD',
  distributePayoutsEvent__from = 'distributePayoutsEvent__from',
  distributePayoutsEvent__id = 'distributePayoutsEvent__id',
  distributePayoutsEvent__projectId = 'distributePayoutsEvent__projectId',
  distributePayoutsEvent__rulesetCycleNumber = 'distributePayoutsEvent__rulesetCycleNumber',
  distributePayoutsEvent__rulesetId = 'distributePayoutsEvent__rulesetId',
  distributePayoutsEvent__timestamp = 'distributePayoutsEvent__timestamp',
  distributePayoutsEvent__txHash = 'distributePayoutsEvent__txHash',
  distributeReservedTokensEvent = 'distributeReservedTokensEvent',
  distributeReservedTokensEvent__beneficiary = 'distributeReservedTokensEvent__beneficiary',
  distributeReservedTokensEvent__beneficiaryTokenCount = 'distributeReservedTokensEvent__beneficiaryTokenCount',
  distributeReservedTokensEvent__caller = 'distributeReservedTokensEvent__caller',
  distributeReservedTokensEvent__from = 'distributeReservedTokensEvent__from',
  distributeReservedTokensEvent__fundingCycleNumber = 'distributeReservedTokensEvent__fundingCycleNumber',
  distributeReservedTokensEvent__id = 'distributeReservedTokensEvent__id',
  distributeReservedTokensEvent__projectId = 'distributeReservedTokensEvent__projectId',
  distributeReservedTokensEvent__timestamp = 'distributeReservedTokensEvent__timestamp',
  distributeReservedTokensEvent__tokenCount = 'distributeReservedTokensEvent__tokenCount',
  distributeReservedTokensEvent__txHash = 'distributeReservedTokensEvent__txHash',
  distributeToPayoutModEvent = 'distributeToPayoutModEvent',
  distributeToPayoutModEvent__caller = 'distributeToPayoutModEvent__caller',
  distributeToPayoutModEvent__from = 'distributeToPayoutModEvent__from',
  distributeToPayoutModEvent__fundingCycleId = 'distributeToPayoutModEvent__fundingCycleId',
  distributeToPayoutModEvent__id = 'distributeToPayoutModEvent__id',
  distributeToPayoutModEvent__modAllocator = 'distributeToPayoutModEvent__modAllocator',
  distributeToPayoutModEvent__modBeneficiary = 'distributeToPayoutModEvent__modBeneficiary',
  distributeToPayoutModEvent__modCut = 'distributeToPayoutModEvent__modCut',
  distributeToPayoutModEvent__modCutUSD = 'distributeToPayoutModEvent__modCutUSD',
  distributeToPayoutModEvent__modPreferUnstaked = 'distributeToPayoutModEvent__modPreferUnstaked',
  distributeToPayoutModEvent__modProjectId = 'distributeToPayoutModEvent__modProjectId',
  distributeToPayoutModEvent__projectId = 'distributeToPayoutModEvent__projectId',
  distributeToPayoutModEvent__timestamp = 'distributeToPayoutModEvent__timestamp',
  distributeToPayoutModEvent__txHash = 'distributeToPayoutModEvent__txHash',
  distributeToPayoutSplitEvent = 'distributeToPayoutSplitEvent',
  distributeToPayoutSplitEvent__amount = 'distributeToPayoutSplitEvent__amount',
  distributeToPayoutSplitEvent__beneficiary = 'distributeToPayoutSplitEvent__beneficiary',
  distributeToPayoutSplitEvent__caller = 'distributeToPayoutSplitEvent__caller',
  distributeToPayoutSplitEvent__from = 'distributeToPayoutSplitEvent__from',
  distributeToPayoutSplitEvent__id = 'distributeToPayoutSplitEvent__id',
  distributeToPayoutSplitEvent__lockedUntil = 'distributeToPayoutSplitEvent__lockedUntil',
  distributeToPayoutSplitEvent__percent = 'distributeToPayoutSplitEvent__percent',
  distributeToPayoutSplitEvent__preferAddToBalance = 'distributeToPayoutSplitEvent__preferAddToBalance',
  distributeToPayoutSplitEvent__projectId = 'distributeToPayoutSplitEvent__projectId',
  distributeToPayoutSplitEvent__splitProjectId = 'distributeToPayoutSplitEvent__splitProjectId',
  distributeToPayoutSplitEvent__timestamp = 'distributeToPayoutSplitEvent__timestamp',
  distributeToPayoutSplitEvent__txHash = 'distributeToPayoutSplitEvent__txHash',
  distributeToReservedTokenSplitEvent = 'distributeToReservedTokenSplitEvent',
  distributeToReservedTokenSplitEvent__beneficiary = 'distributeToReservedTokenSplitEvent__beneficiary',
  distributeToReservedTokenSplitEvent__caller = 'distributeToReservedTokenSplitEvent__caller',
  distributeToReservedTokenSplitEvent__from = 'distributeToReservedTokenSplitEvent__from',
  distributeToReservedTokenSplitEvent__id = 'distributeToReservedTokenSplitEvent__id',
  distributeToReservedTokenSplitEvent__lockedUntil = 'distributeToReservedTokenSplitEvent__lockedUntil',
  distributeToReservedTokenSplitEvent__percent = 'distributeToReservedTokenSplitEvent__percent',
  distributeToReservedTokenSplitEvent__preferAddToBalance = 'distributeToReservedTokenSplitEvent__preferAddToBalance',
  distributeToReservedTokenSplitEvent__projectId = 'distributeToReservedTokenSplitEvent__projectId',
  distributeToReservedTokenSplitEvent__splitProjectId = 'distributeToReservedTokenSplitEvent__splitProjectId',
  distributeToReservedTokenSplitEvent__timestamp = 'distributeToReservedTokenSplitEvent__timestamp',
  distributeToReservedTokenSplitEvent__tokenCount = 'distributeToReservedTokenSplitEvent__tokenCount',
  distributeToReservedTokenSplitEvent__txHash = 'distributeToReservedTokenSplitEvent__txHash',
  distributeToTicketModEvent = 'distributeToTicketModEvent',
  distributeToTicketModEvent__caller = 'distributeToTicketModEvent__caller',
  distributeToTicketModEvent__from = 'distributeToTicketModEvent__from',
  distributeToTicketModEvent__fundingCycleId = 'distributeToTicketModEvent__fundingCycleId',
  distributeToTicketModEvent__id = 'distributeToTicketModEvent__id',
  distributeToTicketModEvent__modBeneficiary = 'distributeToTicketModEvent__modBeneficiary',
  distributeToTicketModEvent__modCut = 'distributeToTicketModEvent__modCut',
  distributeToTicketModEvent__modPreferUnstaked = 'distributeToTicketModEvent__modPreferUnstaked',
  distributeToTicketModEvent__projectId = 'distributeToTicketModEvent__projectId',
  distributeToTicketModEvent__timestamp = 'distributeToTicketModEvent__timestamp',
  distributeToTicketModEvent__txHash = 'distributeToTicketModEvent__txHash',
  from = 'from',
  id = 'id',
  initEvent = 'initEvent',
  initEvent__basedOn = 'initEvent__basedOn',
  initEvent__configuration = 'initEvent__configuration',
  initEvent__from = 'initEvent__from',
  initEvent__id = 'initEvent__id',
  initEvent__projectId = 'initEvent__projectId',
  initEvent__timestamp = 'initEvent__timestamp',
  initEvent__txHash = 'initEvent__txHash',
  migrateEvent = 'migrateEvent',
  migrateEvent__amount = 'migrateEvent__amount',
  migrateEvent__caller = 'migrateEvent__caller',
  migrateEvent__from = 'migrateEvent__from',
  migrateEvent__id = 'migrateEvent__id',
  migrateEvent__projectId = 'migrateEvent__projectId',
  migrateEvent__timestamp = 'migrateEvent__timestamp',
  migrateEvent__to = 'migrateEvent__to',
  migrateEvent__txHash = 'migrateEvent__txHash',
  mintTokensEvent = 'mintTokensEvent',
  mintTokensEvent__amount = 'mintTokensEvent__amount',
  mintTokensEvent__beneficiary = 'mintTokensEvent__beneficiary',
  mintTokensEvent__caller = 'mintTokensEvent__caller',
  mintTokensEvent__from = 'mintTokensEvent__from',
  mintTokensEvent__id = 'mintTokensEvent__id',
  mintTokensEvent__memo = 'mintTokensEvent__memo',
  mintTokensEvent__projectId = 'mintTokensEvent__projectId',
  mintTokensEvent__timestamp = 'mintTokensEvent__timestamp',
  mintTokensEvent__txHash = 'mintTokensEvent__txHash',
  payEvent = 'payEvent',
  payEvent__amount = 'payEvent__amount',
  payEvent__amountUSD = 'payEvent__amountUSD',
  payEvent__beneficiary = 'payEvent__beneficiary',
  payEvent__beneficiaryTokenCount = 'payEvent__beneficiaryTokenCount',
  payEvent__caller = 'payEvent__caller',
  payEvent__distributionFromProjectId = 'payEvent__distributionFromProjectId',
  payEvent__feeFromV2Project = 'payEvent__feeFromV2Project',
  payEvent__from = 'payEvent__from',
  payEvent__id = 'payEvent__id',
  payEvent__note = 'payEvent__note',
  payEvent__projectId = 'payEvent__projectId',
  payEvent__timestamp = 'payEvent__timestamp',
  payEvent__txHash = 'payEvent__txHash',
  printReservesEvent = 'printReservesEvent',
  printReservesEvent__beneficiary = 'printReservesEvent__beneficiary',
  printReservesEvent__beneficiaryTicketAmount = 'printReservesEvent__beneficiaryTicketAmount',
  printReservesEvent__caller = 'printReservesEvent__caller',
  printReservesEvent__count = 'printReservesEvent__count',
  printReservesEvent__from = 'printReservesEvent__from',
  printReservesEvent__fundingCycleId = 'printReservesEvent__fundingCycleId',
  printReservesEvent__id = 'printReservesEvent__id',
  printReservesEvent__projectId = 'printReservesEvent__projectId',
  printReservesEvent__timestamp = 'printReservesEvent__timestamp',
  printReservesEvent__txHash = 'printReservesEvent__txHash',
  project = 'project',
  projectCreateEvent = 'projectCreateEvent',
  projectCreateEvent__caller = 'projectCreateEvent__caller',
  projectCreateEvent__from = 'projectCreateEvent__from',
  projectCreateEvent__id = 'projectCreateEvent__id',
  projectCreateEvent__projectId = 'projectCreateEvent__projectId',
  projectCreateEvent__timestamp = 'projectCreateEvent__timestamp',
  projectCreateEvent__txHash = 'projectCreateEvent__txHash',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  redeemEvent = 'redeemEvent',
  redeemEvent__amount = 'redeemEvent__amount',
  redeemEvent__beneficiary = 'redeemEvent__beneficiary',
  redeemEvent__caller = 'redeemEvent__caller',
  redeemEvent__from = 'redeemEvent__from',
  redeemEvent__holder = 'redeemEvent__holder',
  redeemEvent__id = 'redeemEvent__id',
  redeemEvent__metadata = 'redeemEvent__metadata',
  redeemEvent__projectId = 'redeemEvent__projectId',
  redeemEvent__returnAmount = 'redeemEvent__returnAmount',
  redeemEvent__returnAmountUSD = 'redeemEvent__returnAmountUSD',
  redeemEvent__timestamp = 'redeemEvent__timestamp',
  redeemEvent__txHash = 'redeemEvent__txHash',
  setFundAccessConstraintsEvent = 'setFundAccessConstraintsEvent',
  setFundAccessConstraintsEvent__caller = 'setFundAccessConstraintsEvent__caller',
  setFundAccessConstraintsEvent__distributionLimit = 'setFundAccessConstraintsEvent__distributionLimit',
  setFundAccessConstraintsEvent__distributionLimitCurrency = 'setFundAccessConstraintsEvent__distributionLimitCurrency',
  setFundAccessConstraintsEvent__from = 'setFundAccessConstraintsEvent__from',
  setFundAccessConstraintsEvent__fundingCycleConfiguration = 'setFundAccessConstraintsEvent__fundingCycleConfiguration',
  setFundAccessConstraintsEvent__fundingCycleNumber = 'setFundAccessConstraintsEvent__fundingCycleNumber',
  setFundAccessConstraintsEvent__id = 'setFundAccessConstraintsEvent__id',
  setFundAccessConstraintsEvent__overflowAllowance = 'setFundAccessConstraintsEvent__overflowAllowance',
  setFundAccessConstraintsEvent__overflowAllowanceCurrency = 'setFundAccessConstraintsEvent__overflowAllowanceCurrency',
  setFundAccessConstraintsEvent__projectId = 'setFundAccessConstraintsEvent__projectId',
  setFundAccessConstraintsEvent__timestamp = 'setFundAccessConstraintsEvent__timestamp',
  setFundAccessConstraintsEvent__token = 'setFundAccessConstraintsEvent__token',
  setFundAccessConstraintsEvent__txHash = 'setFundAccessConstraintsEvent__txHash',
  tapEvent = 'tapEvent',
  tapEvent__amount = 'tapEvent__amount',
  tapEvent__amountUSD = 'tapEvent__amountUSD',
  tapEvent__beneficiary = 'tapEvent__beneficiary',
  tapEvent__beneficiaryTransferAmount = 'tapEvent__beneficiaryTransferAmount',
  tapEvent__beneficiaryTransferAmountUSD = 'tapEvent__beneficiaryTransferAmountUSD',
  tapEvent__caller = 'tapEvent__caller',
  tapEvent__currency = 'tapEvent__currency',
  tapEvent__from = 'tapEvent__from',
  tapEvent__fundingCycleId = 'tapEvent__fundingCycleId',
  tapEvent__govFeeAmount = 'tapEvent__govFeeAmount',
  tapEvent__govFeeAmountUSD = 'tapEvent__govFeeAmountUSD',
  tapEvent__id = 'tapEvent__id',
  tapEvent__netTransferAmount = 'tapEvent__netTransferAmount',
  tapEvent__netTransferAmountUSD = 'tapEvent__netTransferAmountUSD',
  tapEvent__projectId = 'tapEvent__projectId',
  tapEvent__timestamp = 'tapEvent__timestamp',
  tapEvent__txHash = 'tapEvent__txHash',
  timestamp = 'timestamp',
  useAllowanceEvent = 'useAllowanceEvent',
  useAllowanceEvent__amount = 'useAllowanceEvent__amount',
  useAllowanceEvent__amountUSD = 'useAllowanceEvent__amountUSD',
  useAllowanceEvent__beneficiary = 'useAllowanceEvent__beneficiary',
  useAllowanceEvent__caller = 'useAllowanceEvent__caller',
  useAllowanceEvent__distributedAmount = 'useAllowanceEvent__distributedAmount',
  useAllowanceEvent__distributedAmountUSD = 'useAllowanceEvent__distributedAmountUSD',
  useAllowanceEvent__from = 'useAllowanceEvent__from',
  useAllowanceEvent__id = 'useAllowanceEvent__id',
  useAllowanceEvent__memo = 'useAllowanceEvent__memo',
  useAllowanceEvent__netDistributedamount = 'useAllowanceEvent__netDistributedamount',
  useAllowanceEvent__netDistributedamountUSD = 'useAllowanceEvent__netDistributedamountUSD',
  useAllowanceEvent__projectId = 'useAllowanceEvent__projectId',
  useAllowanceEvent__rulesetCycleNumber = 'useAllowanceEvent__rulesetCycleNumber',
  useAllowanceEvent__rulesetId = 'useAllowanceEvent__rulesetId',
  useAllowanceEvent__timestamp = 'useAllowanceEvent__timestamp',
  useAllowanceEvent__txHash = 'useAllowanceEvent__txHash',
  v1ConfigureEvent = 'v1ConfigureEvent',
  v1ConfigureEvent__ballot = 'v1ConfigureEvent__ballot',
  v1ConfigureEvent__bondingCurveRate = 'v1ConfigureEvent__bondingCurveRate',
  v1ConfigureEvent__caller = 'v1ConfigureEvent__caller',
  v1ConfigureEvent__currency = 'v1ConfigureEvent__currency',
  v1ConfigureEvent__cycleLimit = 'v1ConfigureEvent__cycleLimit',
  v1ConfigureEvent__discountRate = 'v1ConfigureEvent__discountRate',
  v1ConfigureEvent__duration = 'v1ConfigureEvent__duration',
  v1ConfigureEvent__extension = 'v1ConfigureEvent__extension',
  v1ConfigureEvent__from = 'v1ConfigureEvent__from',
  v1ConfigureEvent__fundingCycleId = 'v1ConfigureEvent__fundingCycleId',
  v1ConfigureEvent__id = 'v1ConfigureEvent__id',
  v1ConfigureEvent__metadata = 'v1ConfigureEvent__metadata',
  v1ConfigureEvent__payIsPaused = 'v1ConfigureEvent__payIsPaused',
  v1ConfigureEvent__projectId = 'v1ConfigureEvent__projectId',
  v1ConfigureEvent__reconfigurationBondingCurveRate = 'v1ConfigureEvent__reconfigurationBondingCurveRate',
  v1ConfigureEvent__reconfigured = 'v1ConfigureEvent__reconfigured',
  v1ConfigureEvent__reservedRate = 'v1ConfigureEvent__reservedRate',
  v1ConfigureEvent__target = 'v1ConfigureEvent__target',
  v1ConfigureEvent__ticketPrintingIsAllowed = 'v1ConfigureEvent__ticketPrintingIsAllowed',
  v1ConfigureEvent__timestamp = 'v1ConfigureEvent__timestamp',
  v1ConfigureEvent__txHash = 'v1ConfigureEvent__txHash',
  v1ConfigureEvent__version = 'v1ConfigureEvent__version',
  v1InitEvent = 'v1InitEvent',
  v1InitEvent__from = 'v1InitEvent__from',
  v1InitEvent__fundingCycleId = 'v1InitEvent__fundingCycleId',
  v1InitEvent__id = 'v1InitEvent__id',
  v1InitEvent__number = 'v1InitEvent__number',
  v1InitEvent__previous = 'v1InitEvent__previous',
  v1InitEvent__projectId = 'v1InitEvent__projectId',
  v1InitEvent__start = 'v1InitEvent__start',
  v1InitEvent__timestamp = 'v1InitEvent__timestamp',
  v1InitEvent__txHash = 'v1InitEvent__txHash',
  v1InitEvent__weight = 'v1InitEvent__weight'
}

export type Project_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  addToBalanceEvents_?: InputMaybe<AddToBalanceEvent_Filter>;
  and?: InputMaybe<Array<InputMaybe<Project_Filter>>>;
  burnEvents_?: InputMaybe<BurnEvent_Filter>;
  configureEvents_?: InputMaybe<ConfigureEvent_Filter>;
  contributorsCount?: InputMaybe<Scalars['Int']['input']>;
  contributorsCount_gt?: InputMaybe<Scalars['Int']['input']>;
  contributorsCount_gte?: InputMaybe<Scalars['Int']['input']>;
  contributorsCount_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  contributorsCount_lt?: InputMaybe<Scalars['Int']['input']>;
  contributorsCount_lte?: InputMaybe<Scalars['Int']['input']>;
  contributorsCount_not?: InputMaybe<Scalars['Int']['input']>;
  contributorsCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  createdAt?: InputMaybe<Scalars['Int']['input']>;
  createdAt_gt?: InputMaybe<Scalars['Int']['input']>;
  createdAt_gte?: InputMaybe<Scalars['Int']['input']>;
  createdAt_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  createdAt_lt?: InputMaybe<Scalars['Int']['input']>;
  createdAt_lte?: InputMaybe<Scalars['Int']['input']>;
  createdAt_not?: InputMaybe<Scalars['Int']['input']>;
  createdAt_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  createdWithinTrendingWindow?: InputMaybe<Scalars['Boolean']['input']>;
  createdWithinTrendingWindow_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  createdWithinTrendingWindow_not?: InputMaybe<Scalars['Boolean']['input']>;
  createdWithinTrendingWindow_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  creator?: InputMaybe<Scalars['Bytes']['input']>;
  creator_contains?: InputMaybe<Scalars['Bytes']['input']>;
  creator_gt?: InputMaybe<Scalars['Bytes']['input']>;
  creator_gte?: InputMaybe<Scalars['Bytes']['input']>;
  creator_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  creator_lt?: InputMaybe<Scalars['Bytes']['input']>;
  creator_lte?: InputMaybe<Scalars['Bytes']['input']>;
  creator_not?: InputMaybe<Scalars['Bytes']['input']>;
  creator_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  creator_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  currentBalance?: InputMaybe<Scalars['BigInt']['input']>;
  currentBalance_gt?: InputMaybe<Scalars['BigInt']['input']>;
  currentBalance_gte?: InputMaybe<Scalars['BigInt']['input']>;
  currentBalance_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  currentBalance_lt?: InputMaybe<Scalars['BigInt']['input']>;
  currentBalance_lte?: InputMaybe<Scalars['BigInt']['input']>;
  currentBalance_not?: InputMaybe<Scalars['BigInt']['input']>;
  currentBalance_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  deployedERC20Events_?: InputMaybe<DeployedErc20Event_Filter>;
  deployer?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_contains?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_gt?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_gte?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  deployer_lt?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_lte?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_not?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  distributePayoutsEvents_?: InputMaybe<DistributePayoutsEvent_Filter>;
  distributeReservedTokensEvents_?: InputMaybe<DistributeReservedTokensEvent_Filter>;
  distributeToPayoutModEvents_?: InputMaybe<DistributeToPayoutModEvent_Filter>;
  distributeToPayoutSplitEvents_?: InputMaybe<DistributeToPayoutSplitEvent_Filter>;
  distributeToReservedTokenSplitEvents_?: InputMaybe<DistributeToReservedTokenSplitEvent_Filter>;
  distributeToTicketModEvents_?: InputMaybe<DistributeToTicketModEvent_Filter>;
  ethErc20ProjectPayers_?: InputMaybe<Etherc20ProjectPayer_Filter>;
  handle?: InputMaybe<Scalars['String']['input']>;
  handle_contains?: InputMaybe<Scalars['String']['input']>;
  handle_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  handle_ends_with?: InputMaybe<Scalars['String']['input']>;
  handle_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  handle_gt?: InputMaybe<Scalars['String']['input']>;
  handle_gte?: InputMaybe<Scalars['String']['input']>;
  handle_in?: InputMaybe<Array<Scalars['String']['input']>>;
  handle_lt?: InputMaybe<Scalars['String']['input']>;
  handle_lte?: InputMaybe<Scalars['String']['input']>;
  handle_not?: InputMaybe<Scalars['String']['input']>;
  handle_not_contains?: InputMaybe<Scalars['String']['input']>;
  handle_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  handle_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  handle_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  handle_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  handle_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  handle_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  handle_starts_with?: InputMaybe<Scalars['String']['input']>;
  handle_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  initEvents_?: InputMaybe<InitEvent_Filter>;
  jb721DelegateTokens_?: InputMaybe<Nft_Filter>;
  latestFundingCycle?: InputMaybe<Scalars['Int']['input']>;
  latestFundingCycle_gt?: InputMaybe<Scalars['Int']['input']>;
  latestFundingCycle_gte?: InputMaybe<Scalars['Int']['input']>;
  latestFundingCycle_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  latestFundingCycle_lt?: InputMaybe<Scalars['Int']['input']>;
  latestFundingCycle_lte?: InputMaybe<Scalars['Int']['input']>;
  latestFundingCycle_not?: InputMaybe<Scalars['Int']['input']>;
  latestFundingCycle_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  metadata_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_ends_with?: InputMaybe<Scalars['String']['input']>;
  metadata_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_gt?: InputMaybe<Scalars['String']['input']>;
  metadata_gte?: InputMaybe<Scalars['String']['input']>;
  metadata_in?: InputMaybe<Array<Scalars['String']['input']>>;
  metadata_lt?: InputMaybe<Scalars['String']['input']>;
  metadata_lte?: InputMaybe<Scalars['String']['input']>;
  metadata_not?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  metadata_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  metadata_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  metadata_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_starts_with?: InputMaybe<Scalars['String']['input']>;
  metadata_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  migrateEvents_?: InputMaybe<MigrateEvent_Filter>;
  mintTokensEvents_?: InputMaybe<MintTokensEvent_Filter>;
  nftCollections_?: InputMaybe<NftCollection_Filter>;
  nftsMintedCount?: InputMaybe<Scalars['Int']['input']>;
  nftsMintedCount_gt?: InputMaybe<Scalars['Int']['input']>;
  nftsMintedCount_gte?: InputMaybe<Scalars['Int']['input']>;
  nftsMintedCount_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  nftsMintedCount_lt?: InputMaybe<Scalars['Int']['input']>;
  nftsMintedCount_lte?: InputMaybe<Scalars['Int']['input']>;
  nftsMintedCount_not?: InputMaybe<Scalars['Int']['input']>;
  nftsMintedCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Project_Filter>>>;
  owner?: InputMaybe<Scalars['Bytes']['input']>;
  owner_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  owner_lt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_lte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  participants_?: InputMaybe<Participant_Filter>;
  payEvents_?: InputMaybe<PayEvent_Filter>;
  paymentsCount?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_gt?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_gte?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  paymentsCount_lt?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_lte?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_not?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  permissionsHolders_?: InputMaybe<PermissionsHolder_Filter>;
  printReservesEvents_?: InputMaybe<PrintReservesEvent_Filter>;
  projectEvents_?: InputMaybe<ProjectEvent_Filter>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  redeemCount?: InputMaybe<Scalars['Int']['input']>;
  redeemCount_gt?: InputMaybe<Scalars['Int']['input']>;
  redeemCount_gte?: InputMaybe<Scalars['Int']['input']>;
  redeemCount_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  redeemCount_lt?: InputMaybe<Scalars['Int']['input']>;
  redeemCount_lte?: InputMaybe<Scalars['Int']['input']>;
  redeemCount_not?: InputMaybe<Scalars['Int']['input']>;
  redeemCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  redeemEvents_?: InputMaybe<RedeemEvent_Filter>;
  redeemVolume?: InputMaybe<Scalars['BigInt']['input']>;
  redeemVolumeUSD?: InputMaybe<Scalars['BigInt']['input']>;
  redeemVolumeUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  redeemVolumeUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  redeemVolumeUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  redeemVolumeUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  redeemVolumeUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  redeemVolumeUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  redeemVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  redeemVolume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  redeemVolume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  redeemVolume_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  redeemVolume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  redeemVolume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  redeemVolume_not?: InputMaybe<Scalars['BigInt']['input']>;
  redeemVolume_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  setFundAccessConstraintsEvents_?: InputMaybe<SetFundAccessConstraintsEvent_Filter>;
  tapEvents_?: InputMaybe<TapEvent_Filter>;
  tokenSupply?: InputMaybe<Scalars['BigInt']['input']>;
  tokenSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokenSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  tokenSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  trendingPaymentsCount?: InputMaybe<Scalars['Int']['input']>;
  trendingPaymentsCount_gt?: InputMaybe<Scalars['Int']['input']>;
  trendingPaymentsCount_gte?: InputMaybe<Scalars['Int']['input']>;
  trendingPaymentsCount_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  trendingPaymentsCount_lt?: InputMaybe<Scalars['Int']['input']>;
  trendingPaymentsCount_lte?: InputMaybe<Scalars['Int']['input']>;
  trendingPaymentsCount_not?: InputMaybe<Scalars['Int']['input']>;
  trendingPaymentsCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  trendingScore?: InputMaybe<Scalars['BigInt']['input']>;
  trendingScore_gt?: InputMaybe<Scalars['BigInt']['input']>;
  trendingScore_gte?: InputMaybe<Scalars['BigInt']['input']>;
  trendingScore_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  trendingScore_lt?: InputMaybe<Scalars['BigInt']['input']>;
  trendingScore_lte?: InputMaybe<Scalars['BigInt']['input']>;
  trendingScore_not?: InputMaybe<Scalars['BigInt']['input']>;
  trendingScore_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  trendingVolume?: InputMaybe<Scalars['BigInt']['input']>;
  trendingVolume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  trendingVolume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  trendingVolume_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  trendingVolume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  trendingVolume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  trendingVolume_not?: InputMaybe<Scalars['BigInt']['input']>;
  trendingVolume_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  useAllowanceEvents_?: InputMaybe<UseAllowanceEvent_Filter>;
  v1ConfigureEvents_?: InputMaybe<V1ConfigureEvent_Filter>;
  v1InitEvents_?: InputMaybe<V1InitEvent_Filter>;
  volume?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum Project_OrderBy {
  addToBalanceEvents = 'addToBalanceEvents',
  burnEvents = 'burnEvents',
  configureEvents = 'configureEvents',
  contributorsCount = 'contributorsCount',
  createdAt = 'createdAt',
  createdWithinTrendingWindow = 'createdWithinTrendingWindow',
  creator = 'creator',
  currentBalance = 'currentBalance',
  deployedERC20Events = 'deployedERC20Events',
  deployer = 'deployer',
  distributePayoutsEvents = 'distributePayoutsEvents',
  distributeReservedTokensEvents = 'distributeReservedTokensEvents',
  distributeToPayoutModEvents = 'distributeToPayoutModEvents',
  distributeToPayoutSplitEvents = 'distributeToPayoutSplitEvents',
  distributeToReservedTokenSplitEvents = 'distributeToReservedTokenSplitEvents',
  distributeToTicketModEvents = 'distributeToTicketModEvents',
  ethErc20ProjectPayers = 'ethErc20ProjectPayers',
  handle = 'handle',
  id = 'id',
  initEvents = 'initEvents',
  jb721DelegateTokens = 'jb721DelegateTokens',
  latestFundingCycle = 'latestFundingCycle',
  metadata = 'metadata',
  migrateEvents = 'migrateEvents',
  mintTokensEvents = 'mintTokensEvents',
  nftCollections = 'nftCollections',
  nftsMintedCount = 'nftsMintedCount',
  owner = 'owner',
  participants = 'participants',
  payEvents = 'payEvents',
  paymentsCount = 'paymentsCount',
  permissionsHolders = 'permissionsHolders',
  printReservesEvents = 'printReservesEvents',
  projectEvents = 'projectEvents',
  projectId = 'projectId',
  redeemCount = 'redeemCount',
  redeemEvents = 'redeemEvents',
  redeemVolume = 'redeemVolume',
  redeemVolumeUSD = 'redeemVolumeUSD',
  setFundAccessConstraintsEvents = 'setFundAccessConstraintsEvents',
  tapEvents = 'tapEvents',
  tokenSupply = 'tokenSupply',
  trendingPaymentsCount = 'trendingPaymentsCount',
  trendingScore = 'trendingScore',
  trendingVolume = 'trendingVolume',
  useAllowanceEvents = 'useAllowanceEvents',
  v1ConfigureEvents = 'v1ConfigureEvents',
  v1InitEvents = 'v1InitEvents',
  volume = 'volume',
  volumeUSD = 'volumeUSD'
}

export type ProtocolLog = {
  erc20Count: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  oldestTrendingPayEvent: Maybe<PayEvent>;
  paymentsCount: Scalars['Int']['output'];
  projectsCount: Scalars['Int']['output'];
  redeemCount: Scalars['Int']['output'];
  trendingLastUpdatedTimestamp: Scalars['Int']['output'];
  volume: Scalars['BigInt']['output'];
  volumeRedeemed: Scalars['BigInt']['output'];
  volumeRedeemedUSD: Scalars['BigInt']['output'];
  volumeUSD: Scalars['BigInt']['output'];
};

export type ProtocolLog_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ProtocolLog_Filter>>>;
  erc20Count?: InputMaybe<Scalars['Int']['input']>;
  erc20Count_gt?: InputMaybe<Scalars['Int']['input']>;
  erc20Count_gte?: InputMaybe<Scalars['Int']['input']>;
  erc20Count_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  erc20Count_lt?: InputMaybe<Scalars['Int']['input']>;
  erc20Count_lte?: InputMaybe<Scalars['Int']['input']>;
  erc20Count_not?: InputMaybe<Scalars['Int']['input']>;
  erc20Count_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  oldestTrendingPayEvent?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_?: InputMaybe<PayEvent_Filter>;
  oldestTrendingPayEvent_contains?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_ends_with?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_gt?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_gte?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_in?: InputMaybe<Array<Scalars['String']['input']>>;
  oldestTrendingPayEvent_lt?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_lte?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_not?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_not_contains?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  oldestTrendingPayEvent_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_starts_with?: InputMaybe<Scalars['String']['input']>;
  oldestTrendingPayEvent_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<ProtocolLog_Filter>>>;
  paymentsCount?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_gt?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_gte?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  paymentsCount_lt?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_lte?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_not?: InputMaybe<Scalars['Int']['input']>;
  paymentsCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectsCount?: InputMaybe<Scalars['Int']['input']>;
  projectsCount_gt?: InputMaybe<Scalars['Int']['input']>;
  projectsCount_gte?: InputMaybe<Scalars['Int']['input']>;
  projectsCount_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectsCount_lt?: InputMaybe<Scalars['Int']['input']>;
  projectsCount_lte?: InputMaybe<Scalars['Int']['input']>;
  projectsCount_not?: InputMaybe<Scalars['Int']['input']>;
  projectsCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  redeemCount?: InputMaybe<Scalars['Int']['input']>;
  redeemCount_gt?: InputMaybe<Scalars['Int']['input']>;
  redeemCount_gte?: InputMaybe<Scalars['Int']['input']>;
  redeemCount_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  redeemCount_lt?: InputMaybe<Scalars['Int']['input']>;
  redeemCount_lte?: InputMaybe<Scalars['Int']['input']>;
  redeemCount_not?: InputMaybe<Scalars['Int']['input']>;
  redeemCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  trendingLastUpdatedTimestamp?: InputMaybe<Scalars['Int']['input']>;
  trendingLastUpdatedTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  trendingLastUpdatedTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  trendingLastUpdatedTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  trendingLastUpdatedTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  trendingLastUpdatedTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  trendingLastUpdatedTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  trendingLastUpdatedTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  volume?: InputMaybe<Scalars['BigInt']['input']>;
  volumeRedeemed?: InputMaybe<Scalars['BigInt']['input']>;
  volumeRedeemedUSD?: InputMaybe<Scalars['BigInt']['input']>;
  volumeRedeemedUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeRedeemedUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeRedeemedUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeRedeemedUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeRedeemedUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeRedeemedUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeRedeemedUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeRedeemed_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeRedeemed_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeRedeemed_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeRedeemed_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeRedeemed_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeRedeemed_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeRedeemed_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeUSD?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum ProtocolLog_OrderBy {
  erc20Count = 'erc20Count',
  id = 'id',
  oldestTrendingPayEvent = 'oldestTrendingPayEvent',
  oldestTrendingPayEvent__amount = 'oldestTrendingPayEvent__amount',
  oldestTrendingPayEvent__amountUSD = 'oldestTrendingPayEvent__amountUSD',
  oldestTrendingPayEvent__beneficiary = 'oldestTrendingPayEvent__beneficiary',
  oldestTrendingPayEvent__beneficiaryTokenCount = 'oldestTrendingPayEvent__beneficiaryTokenCount',
  oldestTrendingPayEvent__caller = 'oldestTrendingPayEvent__caller',
  oldestTrendingPayEvent__distributionFromProjectId = 'oldestTrendingPayEvent__distributionFromProjectId',
  oldestTrendingPayEvent__feeFromV2Project = 'oldestTrendingPayEvent__feeFromV2Project',
  oldestTrendingPayEvent__from = 'oldestTrendingPayEvent__from',
  oldestTrendingPayEvent__id = 'oldestTrendingPayEvent__id',
  oldestTrendingPayEvent__note = 'oldestTrendingPayEvent__note',
  oldestTrendingPayEvent__projectId = 'oldestTrendingPayEvent__projectId',
  oldestTrendingPayEvent__timestamp = 'oldestTrendingPayEvent__timestamp',
  oldestTrendingPayEvent__txHash = 'oldestTrendingPayEvent__txHash',
  paymentsCount = 'paymentsCount',
  projectsCount = 'projectsCount',
  redeemCount = 'redeemCount',
  trendingLastUpdatedTimestamp = 'trendingLastUpdatedTimestamp',
  volume = 'volume',
  volumeRedeemed = 'volumeRedeemed',
  volumeRedeemedUSD = 'volumeRedeemedUSD',
  volumeUSD = 'volumeUSD'
}

export type Query = {
  /** Access to subgraph metadata */
  _meta: Maybe<_Meta_>;
  addToBalanceEvent: Maybe<AddToBalanceEvent>;
  addToBalanceEvents: Array<AddToBalanceEvent>;
  burnEvent: Maybe<BurnEvent>;
  burnEvents: Array<BurnEvent>;
  configureEvent: Maybe<ConfigureEvent>;
  configureEvents: Array<ConfigureEvent>;
  decoratedBannies: Array<DecoratedBanny>;
  decoratedBanny: Maybe<DecoratedBanny>;
  deployETHERC20ProjectPayerEvent: Maybe<DeployEtherc20ProjectPayerEvent>;
  deployETHERC20ProjectPayerEvents: Array<DeployEtherc20ProjectPayerEvent>;
  deployETHERC20SplitsPayerEvent: Maybe<DeployEtherc20SplitsPayerEvent>;
  deployETHERC20SplitsPayerEvents: Array<DeployEtherc20SplitsPayerEvent>;
  deployedERC20Event: Maybe<DeployedErc20Event>;
  deployedERC20Events: Array<DeployedErc20Event>;
  distributePayoutsEvent: Maybe<DistributePayoutsEvent>;
  distributePayoutsEvents: Array<DistributePayoutsEvent>;
  distributeReservedTokensEvent: Maybe<DistributeReservedTokensEvent>;
  distributeReservedTokensEvents: Array<DistributeReservedTokensEvent>;
  distributeToPayoutModEvent: Maybe<DistributeToPayoutModEvent>;
  distributeToPayoutModEvents: Array<DistributeToPayoutModEvent>;
  distributeToPayoutSplitEvent: Maybe<DistributeToPayoutSplitEvent>;
  distributeToPayoutSplitEvents: Array<DistributeToPayoutSplitEvent>;
  distributeToReservedTokenSplitEvent: Maybe<DistributeToReservedTokenSplitEvent>;
  distributeToReservedTokenSplitEvents: Array<DistributeToReservedTokenSplitEvent>;
  distributeToTicketModEvent: Maybe<DistributeToTicketModEvent>;
  distributeToTicketModEvents: Array<DistributeToTicketModEvent>;
  ensnode: Maybe<EnsNode>;
  ensnodes: Array<EnsNode>;
  etherc20ProjectPayer: Maybe<Etherc20ProjectPayer>;
  etherc20ProjectPayers: Array<Etherc20ProjectPayer>;
  etherc20SplitsPayer: Maybe<Etherc20SplitsPayer>;
  etherc20SplitsPayers: Array<Etherc20SplitsPayer>;
  fundingCycle: Maybe<FundingCycle>;
  fundingCycles: Array<FundingCycle>;
  initEvent: Maybe<InitEvent>;
  initEvents: Array<InitEvent>;
  migrateEvent: Maybe<MigrateEvent>;
  migrateEvents: Array<MigrateEvent>;
  mintTokensEvent: Maybe<MintTokensEvent>;
  mintTokensEvents: Array<MintTokensEvent>;
  nft: Maybe<Nft>;
  nftcollection: Maybe<NftCollection>;
  nftcollections: Array<NftCollection>;
  nfts: Array<Nft>;
  nfttier: Maybe<NftTier>;
  nfttiers: Array<NftTier>;
  participant: Maybe<Participant>;
  participants: Array<Participant>;
  payEvent: Maybe<PayEvent>;
  payEvents: Array<PayEvent>;
  permissionsHolder: Maybe<PermissionsHolder>;
  permissionsHolders: Array<PermissionsHolder>;
  printReservesEvent: Maybe<PrintReservesEvent>;
  printReservesEvents: Array<PrintReservesEvent>;
  project: Maybe<Project>;
  projectCreateEvent: Maybe<ProjectCreateEvent>;
  projectCreateEvents: Array<ProjectCreateEvent>;
  projectEvent: Maybe<ProjectEvent>;
  projectEvents: Array<ProjectEvent>;
  projectSearch: Array<Project>;
  projects: Array<Project>;
  protocolLog: Maybe<ProtocolLog>;
  protocolLogs: Array<ProtocolLog>;
  redeemEvent: Maybe<RedeemEvent>;
  redeemEvents: Array<RedeemEvent>;
  setFundAccessConstraintsEvent: Maybe<SetFundAccessConstraintsEvent>;
  setFundAccessConstraintsEvents: Array<SetFundAccessConstraintsEvent>;
  tapEvent: Maybe<TapEvent>;
  tapEvents: Array<TapEvent>;
  useAllowanceEvent: Maybe<UseAllowanceEvent>;
  useAllowanceEvents: Array<UseAllowanceEvent>;
  v1ConfigureEvent: Maybe<V1ConfigureEvent>;
  v1ConfigureEvents: Array<V1ConfigureEvent>;
  v1InitEvent: Maybe<V1InitEvent>;
  v1InitEvents: Array<V1InitEvent>;
  wallet: Maybe<Wallet>;
  wallets: Array<Wallet>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryAddToBalanceEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAddToBalanceEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<AddToBalanceEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AddToBalanceEvent_Filter>;
};


export type QueryBurnEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryBurnEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<BurnEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<BurnEvent_Filter>;
};


export type QueryConfigureEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryConfigureEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ConfigureEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ConfigureEvent_Filter>;
};


export type QueryDecoratedBanniesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DecoratedBanny_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DecoratedBanny_Filter>;
};


export type QueryDecoratedBannyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDeployEtherc20ProjectPayerEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDeployEtherc20ProjectPayerEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DeployEtherc20ProjectPayerEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DeployEtherc20ProjectPayerEvent_Filter>;
};


export type QueryDeployEtherc20SplitsPayerEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDeployEtherc20SplitsPayerEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DeployEtherc20SplitsPayerEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DeployEtherc20SplitsPayerEvent_Filter>;
};


export type QueryDeployedErc20EventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDeployedErc20EventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DeployedErc20Event_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DeployedErc20Event_Filter>;
};


export type QueryDistributePayoutsEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDistributePayoutsEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributePayoutsEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DistributePayoutsEvent_Filter>;
};


export type QueryDistributeReservedTokensEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDistributeReservedTokensEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeReservedTokensEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DistributeReservedTokensEvent_Filter>;
};


export type QueryDistributeToPayoutModEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDistributeToPayoutModEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToPayoutModEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DistributeToPayoutModEvent_Filter>;
};


export type QueryDistributeToPayoutSplitEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDistributeToPayoutSplitEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToPayoutSplitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DistributeToPayoutSplitEvent_Filter>;
};


export type QueryDistributeToReservedTokenSplitEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDistributeToReservedTokenSplitEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToReservedTokenSplitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DistributeToReservedTokenSplitEvent_Filter>;
};


export type QueryDistributeToTicketModEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDistributeToTicketModEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToTicketModEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DistributeToTicketModEvent_Filter>;
};


export type QueryEnsnodeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryEnsnodesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<EnsNode_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EnsNode_Filter>;
};


export type QueryEtherc20ProjectPayerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryEtherc20ProjectPayersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Etherc20ProjectPayer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Etherc20ProjectPayer_Filter>;
};


export type QueryEtherc20SplitsPayerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryEtherc20SplitsPayersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Etherc20SplitsPayer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Etherc20SplitsPayer_Filter>;
};


export type QueryFundingCycleArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryFundingCyclesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<FundingCycle_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<FundingCycle_Filter>;
};


export type QueryInitEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryInitEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<InitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<InitEvent_Filter>;
};


export type QueryMigrateEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryMigrateEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<MigrateEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<MigrateEvent_Filter>;
};


export type QueryMintTokensEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryMintTokensEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<MintTokensEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<MintTokensEvent_Filter>;
};


export type QueryNftArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNftcollectionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNftcollectionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftCollection_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NftCollection_Filter>;
};


export type QueryNftsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Nft_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Nft_Filter>;
};


export type QueryNfttierArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNfttiersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftTier_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NftTier_Filter>;
};


export type QueryParticipantArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryParticipantsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Participant_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Participant_Filter>;
};


export type QueryPayEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPayEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PayEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PayEvent_Filter>;
};


export type QueryPermissionsHolderArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPermissionsHoldersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PermissionsHolder_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PermissionsHolder_Filter>;
};


export type QueryPrintReservesEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPrintReservesEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PrintReservesEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PrintReservesEvent_Filter>;
};


export type QueryProjectArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryProjectCreateEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryProjectCreateEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProjectCreateEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ProjectCreateEvent_Filter>;
};


export type QueryProjectEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryProjectEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProjectEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ProjectEvent_Filter>;
};


export type QueryProjectSearchArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  text: Scalars['String']['input'];
  where?: InputMaybe<Project_Filter>;
};


export type QueryProjectsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Project_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Project_Filter>;
};


export type QueryProtocolLogArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryProtocolLogsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProtocolLog_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ProtocolLog_Filter>;
};


export type QueryRedeemEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryRedeemEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RedeemEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RedeemEvent_Filter>;
};


export type QuerySetFundAccessConstraintsEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerySetFundAccessConstraintsEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<SetFundAccessConstraintsEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<SetFundAccessConstraintsEvent_Filter>;
};


export type QueryTapEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTapEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TapEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TapEvent_Filter>;
};


export type QueryUseAllowanceEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUseAllowanceEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UseAllowanceEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UseAllowanceEvent_Filter>;
};


export type QueryV1ConfigureEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryV1ConfigureEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<V1ConfigureEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<V1ConfigureEvent_Filter>;
};


export type QueryV1InitEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryV1InitEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<V1InitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<V1InitEvent_Filter>;
};


export type QueryWalletArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryWalletsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Wallet_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Wallet_Filter>;
};

export type RedeemEvent = {
  amount: Scalars['BigInt']['output'];
  beneficiary: Scalars['Bytes']['output'];
  caller: Scalars['Bytes']['output'];
  from: Scalars['Bytes']['output'];
  holder: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  metadata: Maybe<Scalars['Bytes']['output']>;
  project: Project;
  projectId: Scalars['Int']['output'];
  returnAmount: Scalars['BigInt']['output'];
  returnAmountUSD: Maybe<Scalars['BigInt']['output']>;
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type RedeemEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<RedeemEvent_Filter>>>;
  beneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  beneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  holder?: InputMaybe<Scalars['Bytes']['input']>;
  holder_contains?: InputMaybe<Scalars['Bytes']['input']>;
  holder_gt?: InputMaybe<Scalars['Bytes']['input']>;
  holder_gte?: InputMaybe<Scalars['Bytes']['input']>;
  holder_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  holder_lt?: InputMaybe<Scalars['Bytes']['input']>;
  holder_lte?: InputMaybe<Scalars['Bytes']['input']>;
  holder_not?: InputMaybe<Scalars['Bytes']['input']>;
  holder_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  holder_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  metadata?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_contains?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_gt?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_gte?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  metadata_lt?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_lte?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_not?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  metadata_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<RedeemEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  returnAmount?: InputMaybe<Scalars['BigInt']['input']>;
  returnAmountUSD?: InputMaybe<Scalars['BigInt']['input']>;
  returnAmountUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  returnAmountUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  returnAmountUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  returnAmountUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  returnAmountUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  returnAmountUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  returnAmountUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  returnAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  returnAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  returnAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  returnAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  returnAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  returnAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  returnAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum RedeemEvent_OrderBy {
  amount = 'amount',
  beneficiary = 'beneficiary',
  caller = 'caller',
  from = 'from',
  holder = 'holder',
  id = 'id',
  metadata = 'metadata',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  returnAmount = 'returnAmount',
  returnAmountUSD = 'returnAmountUSD',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type SetFundAccessConstraintsEvent = {
  caller: Scalars['Bytes']['output'];
  distributionLimit: Scalars['BigInt']['output'];
  distributionLimitCurrency: Scalars['Int']['output'];
  from: Scalars['Bytes']['output'];
  fundingCycleConfiguration: Scalars['BigInt']['output'];
  fundingCycleNumber: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  overflowAllowance: Scalars['BigInt']['output'];
  overflowAllowanceCurrency: Scalars['Int']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  token: Maybe<Scalars['Bytes']['output']>;
  txHash: Scalars['Bytes']['output'];
};

export type SetFundAccessConstraintsEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<SetFundAccessConstraintsEvent_Filter>>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  distributionLimit?: InputMaybe<Scalars['BigInt']['input']>;
  distributionLimitCurrency?: InputMaybe<Scalars['Int']['input']>;
  distributionLimitCurrency_gt?: InputMaybe<Scalars['Int']['input']>;
  distributionLimitCurrency_gte?: InputMaybe<Scalars['Int']['input']>;
  distributionLimitCurrency_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  distributionLimitCurrency_lt?: InputMaybe<Scalars['Int']['input']>;
  distributionLimitCurrency_lte?: InputMaybe<Scalars['Int']['input']>;
  distributionLimitCurrency_not?: InputMaybe<Scalars['Int']['input']>;
  distributionLimitCurrency_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  distributionLimit_gt?: InputMaybe<Scalars['BigInt']['input']>;
  distributionLimit_gte?: InputMaybe<Scalars['BigInt']['input']>;
  distributionLimit_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  distributionLimit_lt?: InputMaybe<Scalars['BigInt']['input']>;
  distributionLimit_lte?: InputMaybe<Scalars['BigInt']['input']>;
  distributionLimit_not?: InputMaybe<Scalars['BigInt']['input']>;
  distributionLimit_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  fundingCycleConfiguration?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleConfiguration_gt?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleConfiguration_gte?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleConfiguration_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fundingCycleConfiguration_lt?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleConfiguration_lte?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleConfiguration_not?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleConfiguration_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fundingCycleNumber?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  fundingCycleNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleNumber_not?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<SetFundAccessConstraintsEvent_Filter>>>;
  overflowAllowance?: InputMaybe<Scalars['BigInt']['input']>;
  overflowAllowanceCurrency?: InputMaybe<Scalars['Int']['input']>;
  overflowAllowanceCurrency_gt?: InputMaybe<Scalars['Int']['input']>;
  overflowAllowanceCurrency_gte?: InputMaybe<Scalars['Int']['input']>;
  overflowAllowanceCurrency_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  overflowAllowanceCurrency_lt?: InputMaybe<Scalars['Int']['input']>;
  overflowAllowanceCurrency_lte?: InputMaybe<Scalars['Int']['input']>;
  overflowAllowanceCurrency_not?: InputMaybe<Scalars['Int']['input']>;
  overflowAllowanceCurrency_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  overflowAllowance_gt?: InputMaybe<Scalars['BigInt']['input']>;
  overflowAllowance_gte?: InputMaybe<Scalars['BigInt']['input']>;
  overflowAllowance_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  overflowAllowance_lt?: InputMaybe<Scalars['BigInt']['input']>;
  overflowAllowance_lte?: InputMaybe<Scalars['BigInt']['input']>;
  overflowAllowance_not?: InputMaybe<Scalars['BigInt']['input']>;
  overflowAllowance_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  token?: InputMaybe<Scalars['Bytes']['input']>;
  token_contains?: InputMaybe<Scalars['Bytes']['input']>;
  token_gt?: InputMaybe<Scalars['Bytes']['input']>;
  token_gte?: InputMaybe<Scalars['Bytes']['input']>;
  token_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  token_lt?: InputMaybe<Scalars['Bytes']['input']>;
  token_lte?: InputMaybe<Scalars['Bytes']['input']>;
  token_not?: InputMaybe<Scalars['Bytes']['input']>;
  token_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  token_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum SetFundAccessConstraintsEvent_OrderBy {
  caller = 'caller',
  distributionLimit = 'distributionLimit',
  distributionLimitCurrency = 'distributionLimitCurrency',
  from = 'from',
  fundingCycleConfiguration = 'fundingCycleConfiguration',
  fundingCycleNumber = 'fundingCycleNumber',
  id = 'id',
  overflowAllowance = 'overflowAllowance',
  overflowAllowanceCurrency = 'overflowAllowanceCurrency',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  timestamp = 'timestamp',
  token = 'token',
  txHash = 'txHash'
}

export type Subscription = {
  /** Access to subgraph metadata */
  _meta: Maybe<_Meta_>;
  addToBalanceEvent: Maybe<AddToBalanceEvent>;
  addToBalanceEvents: Array<AddToBalanceEvent>;
  burnEvent: Maybe<BurnEvent>;
  burnEvents: Array<BurnEvent>;
  configureEvent: Maybe<ConfigureEvent>;
  configureEvents: Array<ConfigureEvent>;
  decoratedBannies: Array<DecoratedBanny>;
  decoratedBanny: Maybe<DecoratedBanny>;
  deployETHERC20ProjectPayerEvent: Maybe<DeployEtherc20ProjectPayerEvent>;
  deployETHERC20ProjectPayerEvents: Array<DeployEtherc20ProjectPayerEvent>;
  deployETHERC20SplitsPayerEvent: Maybe<DeployEtherc20SplitsPayerEvent>;
  deployETHERC20SplitsPayerEvents: Array<DeployEtherc20SplitsPayerEvent>;
  deployedERC20Event: Maybe<DeployedErc20Event>;
  deployedERC20Events: Array<DeployedErc20Event>;
  distributePayoutsEvent: Maybe<DistributePayoutsEvent>;
  distributePayoutsEvents: Array<DistributePayoutsEvent>;
  distributeReservedTokensEvent: Maybe<DistributeReservedTokensEvent>;
  distributeReservedTokensEvents: Array<DistributeReservedTokensEvent>;
  distributeToPayoutModEvent: Maybe<DistributeToPayoutModEvent>;
  distributeToPayoutModEvents: Array<DistributeToPayoutModEvent>;
  distributeToPayoutSplitEvent: Maybe<DistributeToPayoutSplitEvent>;
  distributeToPayoutSplitEvents: Array<DistributeToPayoutSplitEvent>;
  distributeToReservedTokenSplitEvent: Maybe<DistributeToReservedTokenSplitEvent>;
  distributeToReservedTokenSplitEvents: Array<DistributeToReservedTokenSplitEvent>;
  distributeToTicketModEvent: Maybe<DistributeToTicketModEvent>;
  distributeToTicketModEvents: Array<DistributeToTicketModEvent>;
  ensnode: Maybe<EnsNode>;
  ensnodes: Array<EnsNode>;
  etherc20ProjectPayer: Maybe<Etherc20ProjectPayer>;
  etherc20ProjectPayers: Array<Etherc20ProjectPayer>;
  etherc20SplitsPayer: Maybe<Etherc20SplitsPayer>;
  etherc20SplitsPayers: Array<Etherc20SplitsPayer>;
  fundingCycle: Maybe<FundingCycle>;
  fundingCycles: Array<FundingCycle>;
  initEvent: Maybe<InitEvent>;
  initEvents: Array<InitEvent>;
  migrateEvent: Maybe<MigrateEvent>;
  migrateEvents: Array<MigrateEvent>;
  mintTokensEvent: Maybe<MintTokensEvent>;
  mintTokensEvents: Array<MintTokensEvent>;
  nft: Maybe<Nft>;
  nftcollection: Maybe<NftCollection>;
  nftcollections: Array<NftCollection>;
  nfts: Array<Nft>;
  nfttier: Maybe<NftTier>;
  nfttiers: Array<NftTier>;
  participant: Maybe<Participant>;
  participants: Array<Participant>;
  payEvent: Maybe<PayEvent>;
  payEvents: Array<PayEvent>;
  permissionsHolder: Maybe<PermissionsHolder>;
  permissionsHolders: Array<PermissionsHolder>;
  printReservesEvent: Maybe<PrintReservesEvent>;
  printReservesEvents: Array<PrintReservesEvent>;
  project: Maybe<Project>;
  projectCreateEvent: Maybe<ProjectCreateEvent>;
  projectCreateEvents: Array<ProjectCreateEvent>;
  projectEvent: Maybe<ProjectEvent>;
  projectEvents: Array<ProjectEvent>;
  projects: Array<Project>;
  protocolLog: Maybe<ProtocolLog>;
  protocolLogs: Array<ProtocolLog>;
  redeemEvent: Maybe<RedeemEvent>;
  redeemEvents: Array<RedeemEvent>;
  setFundAccessConstraintsEvent: Maybe<SetFundAccessConstraintsEvent>;
  setFundAccessConstraintsEvents: Array<SetFundAccessConstraintsEvent>;
  tapEvent: Maybe<TapEvent>;
  tapEvents: Array<TapEvent>;
  useAllowanceEvent: Maybe<UseAllowanceEvent>;
  useAllowanceEvents: Array<UseAllowanceEvent>;
  v1ConfigureEvent: Maybe<V1ConfigureEvent>;
  v1ConfigureEvents: Array<V1ConfigureEvent>;
  v1InitEvent: Maybe<V1InitEvent>;
  v1InitEvents: Array<V1InitEvent>;
  wallet: Maybe<Wallet>;
  wallets: Array<Wallet>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionAddToBalanceEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAddToBalanceEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<AddToBalanceEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AddToBalanceEvent_Filter>;
};


export type SubscriptionBurnEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionBurnEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<BurnEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<BurnEvent_Filter>;
};


export type SubscriptionConfigureEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionConfigureEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ConfigureEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ConfigureEvent_Filter>;
};


export type SubscriptionDecoratedBanniesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DecoratedBanny_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DecoratedBanny_Filter>;
};


export type SubscriptionDecoratedBannyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDeployEtherc20ProjectPayerEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDeployEtherc20ProjectPayerEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DeployEtherc20ProjectPayerEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DeployEtherc20ProjectPayerEvent_Filter>;
};


export type SubscriptionDeployEtherc20SplitsPayerEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDeployEtherc20SplitsPayerEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DeployEtherc20SplitsPayerEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DeployEtherc20SplitsPayerEvent_Filter>;
};


export type SubscriptionDeployedErc20EventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDeployedErc20EventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DeployedErc20Event_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DeployedErc20Event_Filter>;
};


export type SubscriptionDistributePayoutsEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDistributePayoutsEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributePayoutsEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DistributePayoutsEvent_Filter>;
};


export type SubscriptionDistributeReservedTokensEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDistributeReservedTokensEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeReservedTokensEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DistributeReservedTokensEvent_Filter>;
};


export type SubscriptionDistributeToPayoutModEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDistributeToPayoutModEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToPayoutModEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DistributeToPayoutModEvent_Filter>;
};


export type SubscriptionDistributeToPayoutSplitEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDistributeToPayoutSplitEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToPayoutSplitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DistributeToPayoutSplitEvent_Filter>;
};


export type SubscriptionDistributeToReservedTokenSplitEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDistributeToReservedTokenSplitEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToReservedTokenSplitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DistributeToReservedTokenSplitEvent_Filter>;
};


export type SubscriptionDistributeToTicketModEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDistributeToTicketModEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToTicketModEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DistributeToTicketModEvent_Filter>;
};


export type SubscriptionEnsnodeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionEnsnodesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<EnsNode_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EnsNode_Filter>;
};


export type SubscriptionEtherc20ProjectPayerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionEtherc20ProjectPayersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Etherc20ProjectPayer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Etherc20ProjectPayer_Filter>;
};


export type SubscriptionEtherc20SplitsPayerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionEtherc20SplitsPayersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Etherc20SplitsPayer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Etherc20SplitsPayer_Filter>;
};


export type SubscriptionFundingCycleArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionFundingCyclesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<FundingCycle_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<FundingCycle_Filter>;
};


export type SubscriptionInitEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionInitEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<InitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<InitEvent_Filter>;
};


export type SubscriptionMigrateEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionMigrateEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<MigrateEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<MigrateEvent_Filter>;
};


export type SubscriptionMintTokensEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionMintTokensEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<MintTokensEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<MintTokensEvent_Filter>;
};


export type SubscriptionNftArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNftcollectionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNftcollectionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftCollection_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NftCollection_Filter>;
};


export type SubscriptionNftsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Nft_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Nft_Filter>;
};


export type SubscriptionNfttierArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNfttiersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<NftTier_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NftTier_Filter>;
};


export type SubscriptionParticipantArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionParticipantsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Participant_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Participant_Filter>;
};


export type SubscriptionPayEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionPayEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PayEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PayEvent_Filter>;
};


export type SubscriptionPermissionsHolderArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionPermissionsHoldersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PermissionsHolder_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PermissionsHolder_Filter>;
};


export type SubscriptionPrintReservesEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionPrintReservesEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PrintReservesEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PrintReservesEvent_Filter>;
};


export type SubscriptionProjectArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionProjectCreateEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionProjectCreateEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProjectCreateEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ProjectCreateEvent_Filter>;
};


export type SubscriptionProjectEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionProjectEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProjectEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ProjectEvent_Filter>;
};


export type SubscriptionProjectsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Project_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Project_Filter>;
};


export type SubscriptionProtocolLogArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionProtocolLogsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProtocolLog_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ProtocolLog_Filter>;
};


export type SubscriptionRedeemEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionRedeemEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RedeemEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RedeemEvent_Filter>;
};


export type SubscriptionSetFundAccessConstraintsEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionSetFundAccessConstraintsEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<SetFundAccessConstraintsEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<SetFundAccessConstraintsEvent_Filter>;
};


export type SubscriptionTapEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTapEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TapEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TapEvent_Filter>;
};


export type SubscriptionUseAllowanceEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUseAllowanceEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UseAllowanceEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UseAllowanceEvent_Filter>;
};


export type SubscriptionV1ConfigureEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionV1ConfigureEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<V1ConfigureEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<V1ConfigureEvent_Filter>;
};


export type SubscriptionV1InitEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionV1InitEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<V1InitEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<V1InitEvent_Filter>;
};


export type SubscriptionWalletArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionWalletsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Wallet_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Wallet_Filter>;
};

export type TapEvent = {
  amount: Scalars['BigInt']['output'];
  amountUSD: Maybe<Scalars['BigInt']['output']>;
  beneficiary: Scalars['Bytes']['output'];
  beneficiaryTransferAmount: Scalars['BigInt']['output'];
  beneficiaryTransferAmountUSD: Maybe<Scalars['BigInt']['output']>;
  caller: Scalars['Bytes']['output'];
  currency: Scalars['BigInt']['output'];
  distributions: Array<DistributeToPayoutModEvent>;
  from: Scalars['Bytes']['output'];
  fundingCycleId: Scalars['BigInt']['output'];
  govFeeAmount: Scalars['BigInt']['output'];
  govFeeAmountUSD: Maybe<Scalars['BigInt']['output']>;
  id: Scalars['ID']['output'];
  netTransferAmount: Scalars['BigInt']['output'];
  netTransferAmountUSD: Maybe<Scalars['BigInt']['output']>;
  project: Project;
  projectId: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};


export type TapEventDistributionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DistributeToPayoutModEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<DistributeToPayoutModEvent_Filter>;
};

export type TapEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amountUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<TapEvent_Filter>>>;
  beneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiaryTransferAmount?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTransferAmountUSD?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTransferAmountUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTransferAmountUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTransferAmountUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiaryTransferAmountUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTransferAmountUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTransferAmountUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTransferAmountUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiaryTransferAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTransferAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTransferAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiaryTransferAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTransferAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTransferAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  beneficiaryTransferAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  beneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  beneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  currency?: InputMaybe<Scalars['BigInt']['input']>;
  currency_gt?: InputMaybe<Scalars['BigInt']['input']>;
  currency_gte?: InputMaybe<Scalars['BigInt']['input']>;
  currency_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  currency_lt?: InputMaybe<Scalars['BigInt']['input']>;
  currency_lte?: InputMaybe<Scalars['BigInt']['input']>;
  currency_not?: InputMaybe<Scalars['BigInt']['input']>;
  currency_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  distributions_?: InputMaybe<DistributeToPayoutModEvent_Filter>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  fundingCycleId?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fundingCycleId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_not?: InputMaybe<Scalars['BigInt']['input']>;
  fundingCycleId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  govFeeAmount?: InputMaybe<Scalars['BigInt']['input']>;
  govFeeAmountUSD?: InputMaybe<Scalars['BigInt']['input']>;
  govFeeAmountUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  govFeeAmountUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  govFeeAmountUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  govFeeAmountUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  govFeeAmountUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  govFeeAmountUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  govFeeAmountUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  govFeeAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  govFeeAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  govFeeAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  govFeeAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  govFeeAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  govFeeAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  govFeeAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  netTransferAmount?: InputMaybe<Scalars['BigInt']['input']>;
  netTransferAmountUSD?: InputMaybe<Scalars['BigInt']['input']>;
  netTransferAmountUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  netTransferAmountUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  netTransferAmountUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  netTransferAmountUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  netTransferAmountUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  netTransferAmountUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  netTransferAmountUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  netTransferAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  netTransferAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  netTransferAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  netTransferAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  netTransferAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  netTransferAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  netTransferAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<TapEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum TapEvent_OrderBy {
  amount = 'amount',
  amountUSD = 'amountUSD',
  beneficiary = 'beneficiary',
  beneficiaryTransferAmount = 'beneficiaryTransferAmount',
  beneficiaryTransferAmountUSD = 'beneficiaryTransferAmountUSD',
  caller = 'caller',
  currency = 'currency',
  distributions = 'distributions',
  from = 'from',
  fundingCycleId = 'fundingCycleId',
  govFeeAmount = 'govFeeAmount',
  govFeeAmountUSD = 'govFeeAmountUSD',
  id = 'id',
  netTransferAmount = 'netTransferAmount',
  netTransferAmountUSD = 'netTransferAmountUSD',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type UseAllowanceEvent = {
  amount: Scalars['BigInt']['output'];
  amountUSD: Maybe<Scalars['BigInt']['output']>;
  beneficiary: Scalars['Bytes']['output'];
  caller: Scalars['Bytes']['output'];
  distributedAmount: Scalars['BigInt']['output'];
  distributedAmountUSD: Maybe<Scalars['BigInt']['output']>;
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  memo: Scalars['String']['output'];
  netDistributedamount: Scalars['BigInt']['output'];
  netDistributedamountUSD: Maybe<Scalars['BigInt']['output']>;
  project: Project;
  projectId: Scalars['Int']['output'];
  rulesetCycleNumber: Scalars['Int']['output'];
  rulesetId: Scalars['BigInt']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type UseAllowanceEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amountUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  amountUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<UseAllowanceEvent_Filter>>>;
  beneficiary?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_gte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  beneficiary_lt?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_lte?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  beneficiary_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  distributedAmount?: InputMaybe<Scalars['BigInt']['input']>;
  distributedAmountUSD?: InputMaybe<Scalars['BigInt']['input']>;
  distributedAmountUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  distributedAmountUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  distributedAmountUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  distributedAmountUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  distributedAmountUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  distributedAmountUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  distributedAmountUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  distributedAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  distributedAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  distributedAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  distributedAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  distributedAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  distributedAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  distributedAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  memo?: InputMaybe<Scalars['String']['input']>;
  memo_contains?: InputMaybe<Scalars['String']['input']>;
  memo_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_ends_with?: InputMaybe<Scalars['String']['input']>;
  memo_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_gt?: InputMaybe<Scalars['String']['input']>;
  memo_gte?: InputMaybe<Scalars['String']['input']>;
  memo_in?: InputMaybe<Array<Scalars['String']['input']>>;
  memo_lt?: InputMaybe<Scalars['String']['input']>;
  memo_lte?: InputMaybe<Scalars['String']['input']>;
  memo_not?: InputMaybe<Scalars['String']['input']>;
  memo_not_contains?: InputMaybe<Scalars['String']['input']>;
  memo_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  memo_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  memo_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  memo_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  memo_starts_with?: InputMaybe<Scalars['String']['input']>;
  memo_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  netDistributedamount?: InputMaybe<Scalars['BigInt']['input']>;
  netDistributedamountUSD?: InputMaybe<Scalars['BigInt']['input']>;
  netDistributedamountUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  netDistributedamountUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  netDistributedamountUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  netDistributedamountUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  netDistributedamountUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  netDistributedamountUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  netDistributedamountUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  netDistributedamount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  netDistributedamount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  netDistributedamount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  netDistributedamount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  netDistributedamount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  netDistributedamount_not?: InputMaybe<Scalars['BigInt']['input']>;
  netDistributedamount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<UseAllowanceEvent_Filter>>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  rulesetCycleNumber?: InputMaybe<Scalars['Int']['input']>;
  rulesetCycleNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  rulesetCycleNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  rulesetCycleNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  rulesetCycleNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  rulesetCycleNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  rulesetCycleNumber_not?: InputMaybe<Scalars['Int']['input']>;
  rulesetCycleNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  rulesetId?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  rulesetId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetId_not?: InputMaybe<Scalars['BigInt']['input']>;
  rulesetId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum UseAllowanceEvent_OrderBy {
  amount = 'amount',
  amountUSD = 'amountUSD',
  beneficiary = 'beneficiary',
  caller = 'caller',
  distributedAmount = 'distributedAmount',
  distributedAmountUSD = 'distributedAmountUSD',
  from = 'from',
  id = 'id',
  memo = 'memo',
  netDistributedamount = 'netDistributedamount',
  netDistributedamountUSD = 'netDistributedamountUSD',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  rulesetCycleNumber = 'rulesetCycleNumber',
  rulesetId = 'rulesetId',
  timestamp = 'timestamp',
  txHash = 'txHash'
}

export type V1ConfigureEvent = {
  ballot: Scalars['Bytes']['output'];
  bondingCurveRate: Scalars['Int']['output'];
  caller: Scalars['Bytes']['output'];
  currency: Scalars['Int']['output'];
  cycleLimit: Scalars['Int']['output'];
  discountRate: Scalars['Int']['output'];
  duration: Scalars['Int']['output'];
  extension: Maybe<Scalars['Bytes']['output']>;
  from: Scalars['Bytes']['output'];
  fundingCycleId: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  metadata: Scalars['BigInt']['output'];
  payIsPaused: Maybe<Scalars['Boolean']['output']>;
  project: Project;
  projectId: Scalars['Int']['output'];
  reconfigurationBondingCurveRate: Scalars['Int']['output'];
  reconfigured: Scalars['Int']['output'];
  reservedRate: Scalars['Int']['output'];
  target: Scalars['BigInt']['output'];
  ticketPrintingIsAllowed: Maybe<Scalars['Boolean']['output']>;
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
  version: Scalars['Int']['output'];
};

export type V1ConfigureEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<V1ConfigureEvent_Filter>>>;
  ballot?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_contains?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_gt?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_gte?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  ballot_lt?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_lte?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_not?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  ballot_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  bondingCurveRate?: InputMaybe<Scalars['Int']['input']>;
  bondingCurveRate_gt?: InputMaybe<Scalars['Int']['input']>;
  bondingCurveRate_gte?: InputMaybe<Scalars['Int']['input']>;
  bondingCurveRate_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  bondingCurveRate_lt?: InputMaybe<Scalars['Int']['input']>;
  bondingCurveRate_lte?: InputMaybe<Scalars['Int']['input']>;
  bondingCurveRate_not?: InputMaybe<Scalars['Int']['input']>;
  bondingCurveRate_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  currency?: InputMaybe<Scalars['Int']['input']>;
  currency_gt?: InputMaybe<Scalars['Int']['input']>;
  currency_gte?: InputMaybe<Scalars['Int']['input']>;
  currency_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  currency_lt?: InputMaybe<Scalars['Int']['input']>;
  currency_lte?: InputMaybe<Scalars['Int']['input']>;
  currency_not?: InputMaybe<Scalars['Int']['input']>;
  currency_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  cycleLimit?: InputMaybe<Scalars['Int']['input']>;
  cycleLimit_gt?: InputMaybe<Scalars['Int']['input']>;
  cycleLimit_gte?: InputMaybe<Scalars['Int']['input']>;
  cycleLimit_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  cycleLimit_lt?: InputMaybe<Scalars['Int']['input']>;
  cycleLimit_lte?: InputMaybe<Scalars['Int']['input']>;
  cycleLimit_not?: InputMaybe<Scalars['Int']['input']>;
  cycleLimit_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  discountRate?: InputMaybe<Scalars['Int']['input']>;
  discountRate_gt?: InputMaybe<Scalars['Int']['input']>;
  discountRate_gte?: InputMaybe<Scalars['Int']['input']>;
  discountRate_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  discountRate_lt?: InputMaybe<Scalars['Int']['input']>;
  discountRate_lte?: InputMaybe<Scalars['Int']['input']>;
  discountRate_not?: InputMaybe<Scalars['Int']['input']>;
  discountRate_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  duration_gt?: InputMaybe<Scalars['Int']['input']>;
  duration_gte?: InputMaybe<Scalars['Int']['input']>;
  duration_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  duration_lt?: InputMaybe<Scalars['Int']['input']>;
  duration_lte?: InputMaybe<Scalars['Int']['input']>;
  duration_not?: InputMaybe<Scalars['Int']['input']>;
  duration_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  extension?: InputMaybe<Scalars['Bytes']['input']>;
  extension_contains?: InputMaybe<Scalars['Bytes']['input']>;
  extension_gt?: InputMaybe<Scalars['Bytes']['input']>;
  extension_gte?: InputMaybe<Scalars['Bytes']['input']>;
  extension_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  extension_lt?: InputMaybe<Scalars['Bytes']['input']>;
  extension_lte?: InputMaybe<Scalars['Bytes']['input']>;
  extension_not?: InputMaybe<Scalars['Bytes']['input']>;
  extension_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  extension_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  fundingCycleId?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleId_gt?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleId_gte?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  fundingCycleId_lt?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleId_lte?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleId_not?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  metadata?: InputMaybe<Scalars['BigInt']['input']>;
  metadata_gt?: InputMaybe<Scalars['BigInt']['input']>;
  metadata_gte?: InputMaybe<Scalars['BigInt']['input']>;
  metadata_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  metadata_lt?: InputMaybe<Scalars['BigInt']['input']>;
  metadata_lte?: InputMaybe<Scalars['BigInt']['input']>;
  metadata_not?: InputMaybe<Scalars['BigInt']['input']>;
  metadata_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<V1ConfigureEvent_Filter>>>;
  payIsPaused?: InputMaybe<Scalars['Boolean']['input']>;
  payIsPaused_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  payIsPaused_not?: InputMaybe<Scalars['Boolean']['input']>;
  payIsPaused_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  reconfigurationBondingCurveRate?: InputMaybe<Scalars['Int']['input']>;
  reconfigurationBondingCurveRate_gt?: InputMaybe<Scalars['Int']['input']>;
  reconfigurationBondingCurveRate_gte?: InputMaybe<Scalars['Int']['input']>;
  reconfigurationBondingCurveRate_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  reconfigurationBondingCurveRate_lt?: InputMaybe<Scalars['Int']['input']>;
  reconfigurationBondingCurveRate_lte?: InputMaybe<Scalars['Int']['input']>;
  reconfigurationBondingCurveRate_not?: InputMaybe<Scalars['Int']['input']>;
  reconfigurationBondingCurveRate_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  reconfigured?: InputMaybe<Scalars['Int']['input']>;
  reconfigured_gt?: InputMaybe<Scalars['Int']['input']>;
  reconfigured_gte?: InputMaybe<Scalars['Int']['input']>;
  reconfigured_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  reconfigured_lt?: InputMaybe<Scalars['Int']['input']>;
  reconfigured_lte?: InputMaybe<Scalars['Int']['input']>;
  reconfigured_not?: InputMaybe<Scalars['Int']['input']>;
  reconfigured_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  reservedRate?: InputMaybe<Scalars['Int']['input']>;
  reservedRate_gt?: InputMaybe<Scalars['Int']['input']>;
  reservedRate_gte?: InputMaybe<Scalars['Int']['input']>;
  reservedRate_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  reservedRate_lt?: InputMaybe<Scalars['Int']['input']>;
  reservedRate_lte?: InputMaybe<Scalars['Int']['input']>;
  reservedRate_not?: InputMaybe<Scalars['Int']['input']>;
  reservedRate_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  target?: InputMaybe<Scalars['BigInt']['input']>;
  target_gt?: InputMaybe<Scalars['BigInt']['input']>;
  target_gte?: InputMaybe<Scalars['BigInt']['input']>;
  target_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  target_lt?: InputMaybe<Scalars['BigInt']['input']>;
  target_lte?: InputMaybe<Scalars['BigInt']['input']>;
  target_not?: InputMaybe<Scalars['BigInt']['input']>;
  target_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  ticketPrintingIsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  ticketPrintingIsAllowed_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  ticketPrintingIsAllowed_not?: InputMaybe<Scalars['Boolean']['input']>;
  ticketPrintingIsAllowed_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  version?: InputMaybe<Scalars['Int']['input']>;
  version_gt?: InputMaybe<Scalars['Int']['input']>;
  version_gte?: InputMaybe<Scalars['Int']['input']>;
  version_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  version_lt?: InputMaybe<Scalars['Int']['input']>;
  version_lte?: InputMaybe<Scalars['Int']['input']>;
  version_not?: InputMaybe<Scalars['Int']['input']>;
  version_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export enum V1ConfigureEvent_OrderBy {
  ballot = 'ballot',
  bondingCurveRate = 'bondingCurveRate',
  caller = 'caller',
  currency = 'currency',
  cycleLimit = 'cycleLimit',
  discountRate = 'discountRate',
  duration = 'duration',
  extension = 'extension',
  from = 'from',
  fundingCycleId = 'fundingCycleId',
  id = 'id',
  metadata = 'metadata',
  payIsPaused = 'payIsPaused',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  reconfigurationBondingCurveRate = 'reconfigurationBondingCurveRate',
  reconfigured = 'reconfigured',
  reservedRate = 'reservedRate',
  target = 'target',
  ticketPrintingIsAllowed = 'ticketPrintingIsAllowed',
  timestamp = 'timestamp',
  txHash = 'txHash',
  version = 'version'
}

export type V1InitEvent = {
  from: Scalars['Bytes']['output'];
  fundingCycleId: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  number: Scalars['Int']['output'];
  previous: Scalars['Int']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  start: Scalars['Int']['output'];
  timestamp: Scalars['Int']['output'];
  txHash: Scalars['Bytes']['output'];
  weight: Scalars['BigInt']['output'];
};

export type V1InitEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<V1InitEvent_Filter>>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  fundingCycleId?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleId_gt?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleId_gte?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  fundingCycleId_lt?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleId_lte?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleId_not?: InputMaybe<Scalars['Int']['input']>;
  fundingCycleId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gt?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
  number_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  number_lt?: InputMaybe<Scalars['Int']['input']>;
  number_lte?: InputMaybe<Scalars['Int']['input']>;
  number_not?: InputMaybe<Scalars['Int']['input']>;
  number_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<V1InitEvent_Filter>>>;
  previous?: InputMaybe<Scalars['Int']['input']>;
  previous_gt?: InputMaybe<Scalars['Int']['input']>;
  previous_gte?: InputMaybe<Scalars['Int']['input']>;
  previous_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  previous_lt?: InputMaybe<Scalars['Int']['input']>;
  previous_lte?: InputMaybe<Scalars['Int']['input']>;
  previous_not?: InputMaybe<Scalars['Int']['input']>;
  previous_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  projectId_gt?: InputMaybe<Scalars['Int']['input']>;
  projectId_gte?: InputMaybe<Scalars['Int']['input']>;
  projectId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId_lt?: InputMaybe<Scalars['Int']['input']>;
  projectId_lte?: InputMaybe<Scalars['Int']['input']>;
  projectId_not?: InputMaybe<Scalars['Int']['input']>;
  projectId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  project_?: InputMaybe<Project_Filter>;
  project_contains?: InputMaybe<Scalars['String']['input']>;
  project_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_gt?: InputMaybe<Scalars['String']['input']>;
  project_gte?: InputMaybe<Scalars['String']['input']>;
  project_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_lt?: InputMaybe<Scalars['String']['input']>;
  project_lte?: InputMaybe<Scalars['String']['input']>;
  project_not?: InputMaybe<Scalars['String']['input']>;
  project_not_contains?: InputMaybe<Scalars['String']['input']>;
  project_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  project_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  project_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  project_starts_with?: InputMaybe<Scalars['String']['input']>;
  project_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
  start_gt?: InputMaybe<Scalars['Int']['input']>;
  start_gte?: InputMaybe<Scalars['Int']['input']>;
  start_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  start_lt?: InputMaybe<Scalars['Int']['input']>;
  start_lte?: InputMaybe<Scalars['Int']['input']>;
  start_not?: InputMaybe<Scalars['Int']['input']>;
  start_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  weight?: InputMaybe<Scalars['BigInt']['input']>;
  weight_gt?: InputMaybe<Scalars['BigInt']['input']>;
  weight_gte?: InputMaybe<Scalars['BigInt']['input']>;
  weight_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  weight_lt?: InputMaybe<Scalars['BigInt']['input']>;
  weight_lte?: InputMaybe<Scalars['BigInt']['input']>;
  weight_not?: InputMaybe<Scalars['BigInt']['input']>;
  weight_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum V1InitEvent_OrderBy {
  from = 'from',
  fundingCycleId = 'fundingCycleId',
  id = 'id',
  number = 'number',
  previous = 'previous',
  project = 'project',
  projectId = 'projectId',
  project__contributorsCount = 'project__contributorsCount',
  project__createdAt = 'project__createdAt',
  project__createdWithinTrendingWindow = 'project__createdWithinTrendingWindow',
  project__creator = 'project__creator',
  project__currentBalance = 'project__currentBalance',
  project__deployer = 'project__deployer',
  project__handle = 'project__handle',
  project__id = 'project__id',
  project__latestFundingCycle = 'project__latestFundingCycle',
  project__metadata = 'project__metadata',
  project__nftsMintedCount = 'project__nftsMintedCount',
  project__owner = 'project__owner',
  project__paymentsCount = 'project__paymentsCount',
  project__projectId = 'project__projectId',
  project__redeemCount = 'project__redeemCount',
  project__redeemVolume = 'project__redeemVolume',
  project__redeemVolumeUSD = 'project__redeemVolumeUSD',
  project__tokenSupply = 'project__tokenSupply',
  project__trendingPaymentsCount = 'project__trendingPaymentsCount',
  project__trendingScore = 'project__trendingScore',
  project__trendingVolume = 'project__trendingVolume',
  project__volume = 'project__volume',
  project__volumeUSD = 'project__volumeUSD',
  start = 'start',
  timestamp = 'timestamp',
  txHash = 'txHash',
  weight = 'weight'
}

export type Wallet = {
  id: Scalars['ID']['output'];
  lastPaidTimestamp: Scalars['Int']['output'];
  participants: Array<Participant>;
  volume: Scalars['BigInt']['output'];
  volumeUSD: Scalars['BigInt']['output'];
};


export type WalletParticipantsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Participant_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Participant_Filter>;
};

export type Wallet_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Wallet_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastPaidTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastPaidTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastPaidTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastPaidTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastPaidTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastPaidTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastPaidTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastPaidTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Wallet_Filter>>>;
  participants_?: InputMaybe<Participant_Filter>;
  volume?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum Wallet_OrderBy {
  id = 'id',
  lastPaidTimestamp = 'lastPaidTimestamp',
  participants = 'participants',
  volume = 'volume',
  volumeUSD = 'volumeUSD'
}

export type _Block_ = {
  /** The hash of the block */
  hash: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp: Maybe<Scalars['Int']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  deny = 'deny'
}

export type ParticipantsQueryVariables = Exact<{
  where?: InputMaybe<Participant_Filter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Participant_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;


export type ParticipantsQuery = { participants: Array<{ volume: any, lastPaidTimestamp: number, balance: any, stakedBalance: any, id: string, wallet: { id: string } }> };

export type PayEventsQueryVariables = Exact<{
  where?: InputMaybe<PayEvent_Filter>;
  orderBy?: InputMaybe<PayEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PayEventsQuery = { payEvents: Array<{ id: string, amount: any, beneficiary: any, note: string, timestamp: number, feeFromV2Project: number | null, beneficiaryTokenCount: any, from: any, txHash: any, project: { id: string, projectId: number, handle: string | null } }> };

export type ProjectsQueryVariables = Exact<{
  where?: InputMaybe<Project_Filter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ProjectsQuery = { projects: Array<{ projectId: number, metadata: string | null, handle: string | null, contributorsCount: number, createdAt: number }> };

export type ProjectCreateEventQueryVariables = Exact<{
  where?: InputMaybe<ProjectEvent_Filter>;
}>;


export type ProjectCreateEventQuery = { projectEvents: Array<{ projectCreateEvent: { txHash: any, timestamp: number } | null }> };


export const ParticipantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Participants"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"where"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Participant_filter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Participant_orderBy"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderDirection"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderDirection"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"participants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"Variable","name":{"kind":"Name","value":"where"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderDirection"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderDirection"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"lastPaidTimestamp"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"stakedBalance"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ParticipantsQuery, ParticipantsQueryVariables>;
export const PayEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"where"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PayEvent_filter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PayEvent_orderBy"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderDirection"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderDirection"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"Variable","name":{"kind":"Name","value":"where"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderDirection"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderDirection"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"beneficiary"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"feeFromV2Project"}},{"kind":"Field","name":{"kind":"Name","value":"beneficiaryTokenCount"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"project"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}}]} as unknown as DocumentNode<PayEventsQuery, PayEventsQueryVariables>;
export const ProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Projects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"where"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Project_filter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"Variable","name":{"kind":"Name","value":"where"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"contributorsCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ProjectsQuery, ProjectsQueryVariables>;
export const ProjectCreateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectCreateEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"where"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectEvent_filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"Variable","name":{"kind":"Name","value":"where"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectCreateEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"txHash"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectCreateEventQuery, ProjectCreateEventQueryVariables>;