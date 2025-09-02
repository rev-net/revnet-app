// https://github.com/rev-net/revnet-core/blob/main/script/Deploy.s.sol
import { JB_CURRENCY_USD, USDC_ADDRESSES, USDC_DECIMALS } from "@/app/constants";
import {
  CashOutTaxRate,
  ETH_CURRENCY_ID,
  JB_CHAINS,
  JBChainId,
  jbProjectDeploymentAddresses,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  SPLITS_TOTAL_PERCENT,
  WeightCutPercent,
} from "juice-sdk-core";
import { jbPricesAddress } from "juice-sdk-react";
import { revDeployerAbi, revLoansAddress } from "revnet-sdk";
import { Address, ContractFunctionParameters, parseUnits, zeroAddress } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
} from "viem/chains";
import { RevnetFormData } from "../types";

// ToDo: Replace with values coming from jbProjectDeploymentAddresses
const JBSwapTerminal1_1 = {
  [mainnet.id]: "0x64834ff3c2c18a715c635dd022227a9a8d9e8b73",
  [sepolia.id]: "0x4b75f7c7e9bd65807cbc56419641155c2660b65c",

  [arbitrum.id]: "0x21e6d82921fce3798a96134eddc2e7cd67c12769",
  [arbitrumSepolia.id]: "0x97e7430c4e1ee242a604d8529195ae06b121cbc6",

  [base.id]: "0xe4036d0cd05951689e1bb8667f5364874dc2fbfb",
  [baseSepolia.id]: "0xae33d0b3a5e1f2d52f50cd589458c84e2f1ea916",

  [optimism.id]: "0x817b87ab3cad4f84f8dc9c98b8f219404dca9927",
  [optimismSepolia.id]: "0x6c5debbdb7365c9ed1ef4529823c3113d47e1842",
} as const;

export function parseDeployData(
  _formData: RevnetFormData,
  extra: {
    metadataCid: string;
    chainId: JBChainId;
    suckerDeployerConfig: {
      deployerConfigurations: {
        deployer: Address;
        mappings: {
          localToken: Address;
          remoteToken: Address;
          minGas: number;
          minBridgeAmount: bigint;
        }[];
      }[];
    };
    timestamp: number;
    salt: `0x${string}`;
  },
): ContractFunctionParameters<typeof revDeployerAbi, "nonpayable", "deployWith721sFor">["args"] {
  // hack: stringfy numbers
  const formData: RevnetFormData = JSON.parse(JSON.stringify(_formData), (_, value) =>
    typeof value === "number" ? String(value) : value,
  );
  console.log("======================================================================");
  console.log(`\t\t\t\tChainId ${extra.chainId} (${JB_CHAINS[extra.chainId]?.name})`);
  console.log("======================================================================");
  let prevStart = 0;
  const operator =
    formData?.operator.find((c) => Number(c.chainId) === Number(extra.chainId))?.address ||
    formData.stages[0].initialOperator;
  console.log({ operator, extra });
  console.log(`[ Operator ] ${operator}`);

  // Determine asset settings based on reserveAsset
  let baseCurrency, tokenAddress, tokenDecimals, swapTerminal;
  if (formData.reserveAsset === "USDC") {
    tokenAddress = USDC_ADDRESSES[extra.chainId] || "0x0000000000000000000000000000000000000000";
    tokenDecimals = USDC_DECIMALS;
    baseCurrency = JB_CURRENCY_USD;
    swapTerminal = JBSwapTerminal1_1[extra.chainId];
  } else {
    tokenAddress = NATIVE_TOKEN as `0x${string}`;
    tokenDecimals = NATIVE_TOKEN_DECIMALS;
    baseCurrency = ETH_CURRENCY_ID;
    swapTerminal = jbProjectDeploymentAddresses.JBSwapTerminal[extra.chainId];
  }

  const accountingContextsToAccept = [
    {
      token: tokenAddress,
      decimals: tokenDecimals,
      currency: parseInt(tokenAddress.toLowerCase().replace(/^0x/, "").slice(-8), 16),
    },
  ];

  const loanSources = [
    {
      token: tokenAddress,
      terminal: jbProjectDeploymentAddresses.JBMultiTerminal[
        extra?.chainId as JBChainId
      ] as Address,
    },
  ];

  // No pool configurations so the operator can set it later depending on liquidity constraints
  // const poolConfigurations = [
  //   {
  //     token: tokenAddress,
  //     fee: 10_000,
  //     twapWindow: 2 * 60 * 60 * 24,
  //     twapSlippageTolerance: 9000,
  //   },
  // ];

  const stageConfigurations = formData.stages.map((stage, idx) => {
    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~ Stage ${idx + 1} ~~~~~~~~~~~~~~~~~~~~~~~~~~`);
    const lengthSeconds = Number(stage.stageStart) * 86400;
    const bufferSeconds = 600;
    const startsAtOrAfter = idx === 0 ? extra.timestamp + bufferSeconds : prevStart + lengthSeconds;
    prevStart = startsAtOrAfter;
    console.log(
      `[ startsAtOrAfter ] ${new Date(
        startsAtOrAfter * 1000,
      ).toLocaleString()} (${startsAtOrAfter})`,
    );
    const autoIssuances = stage.autoIssuance.map((autoIssuance, autoIssuanceIdx) => {
      console.log(
        `[ AUTOISSUANCE ${autoIssuanceIdx + 1} ]\n\t\t${
          autoIssuance.beneficiary
        } ${autoIssuance.amount} ${autoIssuance.chainId}`,
      );
      return {
        chainId: autoIssuance.chainId,
        count: autoIssuance.amount ? parseUnits(autoIssuance.amount, 18) : 0n,
        beneficiary: autoIssuance.beneficiary as Address,
      };
    });

    if (autoIssuances.length === 0) {
      console.log("\t\tNo auto issuance for this stage");
    }

    console.log("----------------------------------------------------------------");
    const splitPercent =
      stage.splits.reduce((sum, split) => sum + (Number(split.percentage) || 0), 0) * 100;
    const splits = stage.splits.map((split, splitIdx) => {
      let beneficiary = split.beneficiary?.find(
        (b) => Number(b?.chainId) === Number(extra.chainId),
      )?.address;
      if (!beneficiary) {
        beneficiary = split.defaultBeneficiary;
      }
      if (!beneficiary) throw new Error("Beneficiary not found");
      const percent = Math.round(
        (Number(split.percentage) * 100 * SPLITS_TOTAL_PERCENT) / splitPercent,
      );
      console.log(`[ SPLIT ${splitIdx + 1} ]\n\t\t${beneficiary} ${split.percentage}%`);
      return {
        preferAddToBalance: false,
        lockedUntil: 0,
        percent: percent,
        projectId: 0n,
        beneficiary: beneficiary as Address,
        hook: zeroAddress,
      };
    });
    console.log({ SPLITS_TOTAL_PERCENT, splitPercent, splits });
    console.log("----------------------------------------------------------------");

    return {
      startsAtOrAfter,
      autoIssuances,
      splitPercent,
      splits,
      initialIssuance:
        stage.initialIssuance && stage.initialIssuance !== ""
          ? parseUnits(`${stage.initialIssuance}`, 18)
          : 0n,
      issuanceCutFrequency: Number(stage.priceCeilingIncreaseFrequency) * 86400, // seconds
      issuanceCutPercent:
        Number(WeightCutPercent.parse(stage.priceCeilingIncreasePercentage, 9).value) / 100,
      cashOutTaxRate: Number(CashOutTaxRate.parse(stage.priceFloorTaxIntensity, 4).value) / 100, //
      extraMetadata: 0, // ??
    };
  });

  return [
    0n, // 0 for a new revnet
    {
      description: {
        name: formData.name,
        ticker: formData.tokenSymbol,
        uri: extra.metadataCid,
        salt: extra.salt,
      },
      baseCurrency: baseCurrency,
      splitOperator: operator as Address,
      stageConfigurations,
      loans: revLoansAddress[extra.chainId as JBChainId] as Address,
      loanSources,
    },
    [
      {
        terminal: jbProjectDeploymentAddresses.JBMultiTerminal[
          extra.chainId as JBChainId
        ] as Address,
        accountingContextsToAccept,
      },
      {
        terminal: swapTerminal as Address,
        accountingContextsToAccept,
      },
    ],
    {
      hook: jbProjectDeploymentAddresses.JBBuybackHook[extra.chainId as JBChainId] as Address,
      poolConfigurations: [],
    },
    {
      deployerConfigurations: extra.suckerDeployerConfig.deployerConfigurations,
      salt: extra.salt,
    },
    {
      baseline721HookConfiguration: {
        name: formData.name,
        symbol: formData.tokenSymbol,
        baseUri: "",
        tokenUriResolver: zeroAddress,
        contractUri: "",
        tiersConfig: {
          tiers: [],
          currency: baseCurrency,
          decimals: tokenDecimals,
          prices: jbPricesAddress[extra.chainId as JBChainId],
        },
        reserveBeneficiary: zeroAddress,
        flags: {
          noNewTiersWithReserves: false,
          noNewTiersWithVotes: false,
          noNewTiersWithOwnerMinting: false,
          preventOverspending: false,
        },
      },
      salt: extra.salt,
      splitOperatorCanAdjustTiers: true,
      splitOperatorCanUpdateMetadata: true,
      splitOperatorCanMint: true,
      splitOperatorCanIncreaseDiscountPercent: true,
    },
    [],
  ] satisfies ContractFunctionParameters<
    typeof revDeployerAbi,
    "nonpayable",
    "deployWith721sFor"
  >["args"];
}
