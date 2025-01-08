import { RevnetFormData, StageData } from "./types";

export const defaultStageData: StageData = {
  initialOperator: "",
  initialIssuance: "",

  priceCeilingIncreasePercentage: "",
  priceCeilingIncreaseFrequency: "",
  priceFloorTaxIntensity: "",

  autoIssuance: [{
    amount: "",
    beneficiary: "",
  }],

  splitRate: "",
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
};

export const EXIT_TAX_HIGH = "80";
export const EXIT_TAX_MID = "50";
export const EXIT_TAX_LOW = "20";
export const EXIT_TAX_NONE = "0";


export const TEST_FORM_DATA: RevnetFormData = {
  name: "Test Revnet",
  description:
    "This is a test revnet for development purposes. It demonstrates various features and configurations available in the revnet system.",
  logoUri: "", // Leave empty or add an IPFS URI if needed

  tokenName: "Test Token",
  tokenSymbol: "TEST",

  stages: [
    {
      initialOperator: "0x1234567890123456789012345678901234567890", // Example operator address
      initialIssuance: "100",
      priceCeilingIncreasePercentage: "50", // 50% decrease (doubles price)
      priceCeilingIncreaseFrequency: "30", // 30 days
      priceFloorTaxIntensity: "20", // 20% tax (LOW)
      splitRate: "10", // 10% split
      autoIssuance: [
        {
          amount: "100",
          beneficiary: "0x1234567890123456789012345678901234567890", // Example beneficiary address
        },
        {
          amount: "500",
          beneficiary: "0x0987654321098765432109876543210987654321", // Different example beneficiary address
        },
      ],
      boostDuration: "90", // 90 days
    },
    {
      initialIssuance: "50",
      priceCeilingIncreasePercentage: "25",
      priceCeilingIncreaseFrequency: "15",
      priceFloorTaxIntensity: "50", // 50% tax (MID)
      splitRate: "5",
      autoIssuance: [
        {
          amount: "10",
          beneficiary: "0x1234567890123456789012345678901234567890", // Example beneficiary address
        },
        {
          amount: "50",
          beneficiary: "0x0987654321098765432109876543210987654321", // Different example beneficiary address
        },
      ],
      boostDuration: "60",
    },
    {
      initialIssuance: "25",
      priceCeilingIncreasePercentage: "10",
      priceCeilingIncreaseFrequency: "7",
      priceFloorTaxIntensity: "80", // 80% tax (HIGH)
      splitRate: "2",
      autoIssuance: [
        {
          amount: "1",
          beneficiary: "0x1234567890123456789012345678901234567890", // Example beneficiary address
        },
        {
          amount: "5",
          beneficiary: "0x0987654321098765432109876543210987654321", // Different example beneficiary address
        },
      ],
      boostDuration: "", // Empty for indefinite duration
    },
  ],
  chainIds: [11155111, 11155420, 84532, 421614],
} as const;
