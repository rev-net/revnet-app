import { RevnetFormData, StageData } from "./types";

export const defaultStageData: StageData = {
  initialOperator: "",
  initialIssuance: "10000",

  priceCeilingIncreasePercentage: "10",
  priceCeilingIncreaseFrequency: "30",
  priceFloorTaxIntensity: "20",

  autoIssuance: [],

  splits: [],
  stageStart: "30",
};

export const DEFAULT_FORM_DATA: RevnetFormData = {
  name: "",
  // tagline: "",
  description: "",
  logoUri: "",
  reserveAsset: "ETH",

  tokenName: "",
  tokenSymbol: "TOKEN",

  stages: [],
  chainIds: [],
  operator: [],
};

export const TEST_FORM_DATA: RevnetFormData = {
  name: "Test Revnet",
  description:
    "This is a test revnet for development purposes. It demonstrates various features and configurations available in the revnet system.",
  logoUri: "",

  tokenName: "Test Token",
  tokenSymbol: "TEST",
  reserveAsset: "ETH",

  stages: [
    {
      initialOperator: "0x1234567890123456789012345678901234567890",
      initialIssuance: "100",
      priceCeilingIncreasePercentage: "50",
      priceCeilingIncreaseFrequency: "30",
      priceFloorTaxIntensity: "20",
      splits: [
        {
          percentage: "6",
          defaultBeneficiary: "0x1234567890123456789012345678901234567890",
          beneficiary: [
            {
              chainId: 11155111,
              address: "0x1234567890123456789012345678901234567890",
            },
            {
              chainId: 11155420,
              address: "0x1234567890123456789012345678901234567890",
            },
            {
              chainId: 84532,
              address: "0x1234567890123456789012345678901234567890",
            },
            {
              chainId: 421614,
              address: "0x1234567890123456789012345678901234567890",
            },
          ],
        },
        {
          percentage: "4",
          defaultBeneficiary: "0x0987654321098765432109876543210987654321",
          beneficiary: [
            {
              chainId: 11155111,
              address: "0x0987654321098765432109876543210987654321",
            },
            {
              chainId: 11155420,
              address: "0x0987654321098765432109876543210987654321",
            },
            {
              chainId: 84532,
              address: "0x0987654321098765432109876543210987654321",
            },
            {
              chainId: 421614,
              address: "0x0987654321098765432109876543210987654321",
            },
          ],
        },
      ],
      autoIssuance: [
        {
          amount: "100",
          beneficiary: "0x1234567890123456789012345678901234567890",
          chainId: 11155111,
        },
        {
          amount: "500",
          beneficiary: "0x0987654321098765432109876543210987654321",
          chainId: 11155420,
        },
      ],
      stageStart: "0",
    },
    {
      initialIssuance: "50",
      priceCeilingIncreasePercentage: "25",
      priceCeilingIncreaseFrequency: "15",
      priceFloorTaxIntensity: "50",
      splits: [
        {
          percentage: "10",
          defaultBeneficiary: "0x1234567890123456789012345678901234567890",
          beneficiary: [
            {
              chainId: 11155111,
              address: "0x1234567890123456789012345678901234567890",
            },
            {
              chainId: 11155420,
              address: "0x1234567890123456789012345678901234567890",
            },
            {
              chainId: 84532,
              address: "0x1234567890123456789012345678901234567890",
            },
            {
              chainId: 421614,
              address: "0x1234567890123456789012345678901234567890",
            },
          ],
        },
      ],
      autoIssuance: [
        {
          amount: "10",
          beneficiary: "0x1234567890123456789012345678901234567890",
          chainId: 11155111,
        },
        {
          amount: "50",
          beneficiary: "0x0987654321098765432109876543210987654321",
          chainId: 11155420,
        },
      ],
      stageStart: "60",
    },
    {
      initialIssuance: "25",
      priceCeilingIncreasePercentage: "10",
      priceCeilingIncreaseFrequency: "7",
      priceFloorTaxIntensity: "80",
      splits: [
        {
          percentage: "5",
          defaultBeneficiary: "0x1234567890123456789012345678901234567890",
          beneficiary: [
            {
              chainId: 11155111,
              address: "0x1234567890123456789012345678901234567890",
            },
            {
              chainId: 11155420,
              address: "0x1234567890123456789012345678901234567890",
            },
            {
              chainId: 84532,
              address: "0x1234567890123456789012345678901234567890",
            },
            {
              chainId: 421614,
              address: "0x1234567890123456789012345678901234567890",
            },
          ],
        },
        {
          percentage: "5",
          defaultBeneficiary: "0x0987654321098765432109876543210987654321",
          beneficiary: [
            {
              chainId: 11155111,
              address: "0x0987654321098765432109876543210987654321",
            },
            {
              chainId: 11155420,
              address: "0x0987654321098765432109876543210987654321",
            },
            {
              chainId: 84532,
              address: "0x0987654321098765432109876543210987654321",
            },
            {
              chainId: 421614,
              address: "0x0987654321098765432109876543210987654321",
            },
          ],
        },
      ],
      autoIssuance: [
        {
          amount: "1",
          beneficiary: "0x1234567890123456789012345678901234567890",
          chainId: 11155111,
        },
        {
          amount: "5",
          beneficiary: "0x0987654321098765432109876543210987654321",
          chainId: 11155420,
        },
      ],
      stageStart: "100",
    },
  ],
  chainIds: [11155111, 11155420, 84532, 421614],
  operator: [
    {
      chainId: "11155111",
      address: "0x1234567890123456789012345678901234567890",
    },
    {
      chainId: "11155420",
      address: "0x0987654321098765432109876543210987654321",
    },
    {
      chainId: "84532",
      address: "0xabcdef0123456789abcdef0123456789abcdef01",
    },
    {
      chainId: "421614",
      address: "0xfedcba9876543210fedcba9876543210fedcba98",
    },
  ],
} as const;

export const SHORTER_TEST_FORM_DATA: RevnetFormData = {
  name: "Donuts",
  description: "Donuts are delicious",
  logoUri: "",
  tokenName: "Donuts",
  tokenSymbol: "DONUTS",
  reserveAsset: "ETH",
  stages: [
    {
      initialOperator: "0xDf087B724174A3E4eD2338C0798193932E851F1b",
      initialIssuance: "50",
      priceCeilingIncreasePercentage: "5",
      priceCeilingIncreaseFrequency: "0.01",
      priceFloorTaxIntensity: "20",
      autoIssuance: [
        {
          amount: "100",
          beneficiary: "0xDf087B724174A3E4eD2338C0798193932E851F1b",
          chainId: 11155111,
        },
      ],
      splits: [
        {
          percentage: "25",
          defaultBeneficiary: "0x8b80755C441d355405CA7571443Bb9247B77Ec16",
        },
        {
          percentage: "25",
          defaultBeneficiary: "0xDf087B724174A3E4eD2338C0798193932E851F1b",
        },
      ],
      stageStart: "0",
    },
  ],
  chainIds: [],
  operator: [],
} as const;
