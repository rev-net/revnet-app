// https://github.com/rev-net/revnet-core/blob/main/script/Deploy.s.sol
import { USDC_ADDRESSES, USDC_DECIMALS } from "@/app/constants";
import {
  CashOutTaxRate,
  ETH_CURRENCY_ID,
  JB_CHAINS,
  JBChainId,
  jbContractAddress,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  revDeployerAbi,
  SPLITS_TOTAL_PERCENT,
  USD_CURRENCY_ID,
  WeightCutPercent,
} from "juice-sdk-core";
import { Address, ContractFunctionParameters, parseUnits, zeroAddress } from "viem";
import { RevnetFormData } from "../types";

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
  let baseCurrency, tokenAddress, tokenDecimals;
  const swapTerminal = jbContractAddress[5].JBSwapTerminalRegistry[extra.chainId];
  if (formData.reserveAsset === "USDC") {
    tokenAddress = USDC_ADDRESSES[extra.chainId];
    tokenDecimals = USDC_DECIMALS;
    baseCurrency = USD_CURRENCY_ID(5);
  } else {
    tokenAddress = NATIVE_TOKEN;
    tokenDecimals = NATIVE_TOKEN_DECIMALS;
    baseCurrency = ETH_CURRENCY_ID;
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
      terminal: jbContractAddress[5].JBMultiTerminal[extra?.chainId as JBChainId] as Address,
    },
  ];

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
      loans: jbContractAddress["5"]["REVLoans"][extra.chainId],
      loanSources,
    },
    [
      {
        terminal: jbContractAddress[5].JBMultiTerminal[extra.chainId],
        accountingContextsToAccept,
      },
      {
        terminal: swapTerminal,
        accountingContextsToAccept,
      },
    ],
    {
      dataHook: jbContractAddress[5].JBBuybackHookRegistry[extra.chainId],
      hookToConfigure: jbContractAddress[5].JBBuybackHook[extra.chainId],
      poolConfigurations: [
        {
          token: tokenAddress,
          fee: 10_000,
          twapWindow: 2 * 60 * 60 * 24,
        },
      ],
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
          prices: jbContractAddress[5].JBPrices[extra.chainId],
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
