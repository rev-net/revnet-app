import { RevnetFormData, StageData } from "./types";

export const EXIT_TAX_HIGH = "80";
export const EXIT_TAX_MID = "50";
export const EXIT_TAX_LOW = "20";
export const EXIT_TAX_NONE = "0";

export const defaultStageData: StageData = {
  initialOperator: "",
  initialIssuance: "",

  priceCeilingIncreasePercentage: "",
  priceCeilingIncreaseFrequency: "",
  priceFloorTaxIntensity: EXIT_TAX_LOW,

  autoIssuance: [{
    amount: "",
    beneficiary: "",
    chainId: 11155111,
  }],

  splits: [{
    percentage: "",
    defaultBeneficiary: "",
    beneficiary: [],
  }],
  boostDuration: "",
};

export const DEFAULT_FORM_DATA: RevnetFormData = {
  name: "",
  // tagline: "",
  description: "",
  logoUri: "",

  tokenName: "",
  tokenSymbol: "",

  stages: [],
  chainIds: [],
  operator: []
};

export const TEST_FORM_DATA: RevnetFormData = {
  name: "Test Revnet",
  description:
    "This is a test revnet for development purposes. It demonstrates various features and configurations available in the revnet system.",
  logoUri: "",

  tokenName: "Test Token",
  tokenSymbol: "TEST",

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
            { chainId: 11155111, address: "0x1234567890123456789012345678901234567890" },
            { chainId: 11155420, address: "0x1234567890123456789012345678901234567890" },
            { chainId: 84532, address: "0x1234567890123456789012345678901234567890" },
            { chainId: 421614, address: "0x1234567890123456789012345678901234567890" }
          ]
        },
        {
          percentage: "4",
          defaultBeneficiary: "0x0987654321098765432109876543210987654321",
          beneficiary: [
            { chainId: 11155111, address: "0x0987654321098765432109876543210987654321" },
            { chainId: 11155420, address: "0x0987654321098765432109876543210987654321" },
            { chainId: 84532, address: "0x0987654321098765432109876543210987654321" },
            { chainId: 421614, address: "0x0987654321098765432109876543210987654321" }
          ]
        }
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
      boostDuration: "0",
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
            { chainId: 11155111, address: "0x1234567890123456789012345678901234567890" },
            { chainId: 11155420, address: "0x1234567890123456789012345678901234567890" },
            { chainId: 84532, address: "0x1234567890123456789012345678901234567890" },
            { chainId: 421614, address: "0x1234567890123456789012345678901234567890" }
          ]
        }
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
      boostDuration: "60",
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
            { chainId: 11155111, address: "0x1234567890123456789012345678901234567890" },
            { chainId: 11155420, address: "0x1234567890123456789012345678901234567890" },
            { chainId: 84532, address: "0x1234567890123456789012345678901234567890" },
            { chainId: 421614, address: "0x1234567890123456789012345678901234567890" }
          ]
        },
        {
          percentage: "5",
          defaultBeneficiary: "0x0987654321098765432109876543210987654321",
          beneficiary: [
            { chainId: 11155111, address: "0x0987654321098765432109876543210987654321" },
            { chainId: 11155420, address: "0x0987654321098765432109876543210987654321" },
            { chainId: 84532, address: "0x0987654321098765432109876543210987654321" },
            { chainId: 421614, address: "0x0987654321098765432109876543210987654321" }
          ]
        }
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
      boostDuration: "100",
    },
  ],
  chainIds: [11155111, 11155420, 84532, 421614],
  operator: [
    {
      chainId: "11155111",
      address: "0x1234567890123456789012345678901234567890"
    },
    {
      chainId: "11155420",
      address: "0x0987654321098765432109876543210987654321"
    },
    {
      chainId: "84532",
      address: "0xabcdef0123456789abcdef0123456789abcdef01"
    },
    {
      chainId: "421614",
      address: "0xfedcba9876543210fedcba9876543210fedcba98"
    }
  ]
} as const;


export const SHORTER_TEST_FORM_DATA: RevnetFormData = {
  name: "Donuts",
  description: "Donuts are delicious",
  logoUri: "",
  tokenName: "Donuts",
  tokenSymbol: "DONUTS",
  stages: [
    {
      initialOperator: "0x1234567890123456789012345678901234567890",
      initialIssuance: "100",
      priceCeilingIncreasePercentage: "50",
      priceCeilingIncreaseFrequency: "30",
      priceFloorTaxIntensity: "20",
      autoIssuance: [
        {
          amount: "100",
          beneficiary: "0x1234567890123456789012345678901234567890",
          chainId: 11155111,
        },
      ],
      splits: [
        {
          percentage: "10",
          defaultBeneficiary: "0x1234567890123456789012345678901234567890",
        },
        {
          percentage: "90",
          defaultBeneficiary: "0x1234567890123456789012345678901234567890",
        },
      ],
      boostDuration: "0",
    }
  ],
  chainIds: [],
  operator: [],
} as const;
