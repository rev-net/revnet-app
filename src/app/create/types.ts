import { JBChainId } from "juice-sdk-core";

export type StageData = {
  initialOperator?: string; // only one operator (technically per chain) not per stage
  initialIssuance: string;

  priceCeilingIncreasePercentage: string;
  priceCeilingIncreaseFrequency: string;
  priceFloorTaxIntensity: string;

  premintTokenAmount: string;

  splitRate: string;
  boostDuration: string;
};

export type RevnetFormData = {
  name: string;
  // tagline: string;
  description: string;
  logoUri?: string;

  tokenName: string;
  tokenSymbol: string;

  premintTokenAmount: string;
  stages: StageData[];
  backedBy: string[];
  chainIds: JBChainId[];
};
