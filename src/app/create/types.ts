import { JBChainId } from "juice-sdk-core";

export type StageData = {
  initialOperator?: string; // only one operator (technically per chain) not per stage
  initialIssuance: string;
  pickUpFromPrevious?: boolean;

  priceCeilingIncreasePercentage: string;
  priceCeilingIncreaseFrequency: string;
  priceFloorTaxIntensity: string;

  autoIssuance: {
    amount: string;
    beneficiary: string;
    chainId: JBChainId;
  }[];

  splits: {
    percentage: string;
    defaultBeneficiary: string;
    beneficiary?: {
      chainId: JBChainId;
      address: string;
    }[];
  }[];
  stageStart: string;
  stageStartCuts?: string;
};

export type RevnetFormData = {
  name: string;
  // tagline: string;
  description: string;
  logoUri?: string;

  tokenSymbol: string;

  stages: StageData[];
  chainIds: JBChainId[];
  operator: {
    chainId: string;
    address: string;
  }[];
  reserveAsset: "ETH" | "USDC"; // Added field for reserve asset choice
};
