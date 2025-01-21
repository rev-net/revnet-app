// https://github.com/rev-net/revnet-core/blob/main/script/Deploy.s.sol
import { createSalt } from "@/lib/number";
import {
  CashOutTaxRate,
  JBChainId,
  jbProjectDeploymentAddresses,
  NATIVE_CURRENCY_ID,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  ReservedPercent,
  WeightCutPercent,
} from "juice-sdk-core";
import { revDeployerAbi, revLoansAddress } from "revnet-sdk";
import { Address, ContractFunctionParameters, parseUnits } from "viem";
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
      salt: `0x${string}`;
    };
  }
): ContractFunctionParameters<
  typeof revDeployerAbi,
  "nonpayable",
  "deployFor"
>["args"] {
  const now = Math.floor(Date.now() / 1000);
  // hack: stringfy numbers
  const formData: RevnetFormData = JSON.parse(
    JSON.stringify(_formData),
    (_, value) => (typeof value === "number" ? String(value) : value)
  );
  console.log(`formData::${extra.chainId}`);
  console.dir(formData, { depth: null });
  let prevStart = 0;
  const operator = formData?.operator.find((c) => (
    c.chainId === String(extra.chainId)
  ))?.address || formData.stages[0].initialOperator;

  const accountingContextsToAccept = [{
    token: NATIVE_TOKEN,
    decimals: NATIVE_TOKEN_DECIMALS,
    currency: NATIVE_CURRENCY_ID,
  }];

  const loanSources = [{
    token: NATIVE_TOKEN,
    terminal: jbProjectDeploymentAddresses.JBMultiTerminal[
      extra?.chainId as JBChainId
    ] as Address,
  }];

  const poolConfigurations = [{
    token: NATIVE_TOKEN,
    fee: 10_000,
    twapWindow: 2 * 60 * 60 * 24,
    twapSlippageTolerance: 9000,
  }];

  const stageConfigurations = formData.stages.map((stage, idx) => {
    const lengthSeconds = Number(stage.boostDuration) * 86400;
    const startsAtOrAfter =
      idx === 0 ? now : prevStart + lengthSeconds;
    prevStart = startsAtOrAfter
    console.log("idx", idx, startsAtOrAfter)
    const autoIssuances = stage.autoIssuance.map((autoIssuance) => ({
      chainId: extra.chainId,
      count: parseUnits(autoIssuance.amount, 18),
      beneficiary: autoIssuance.beneficiary as Address,
    }));

    return {
      startsAtOrAfter,
      /**
       * REVAutoIssuance[]
       *
       * @see https://github.com/rev-net/revnet-core/blob/main/src/structs/REVAutoIssuance.sol
       */
      autoIssuances,
      splitPercent: // to be change to array of splits
        stage.splits.reduce((sum, split) => sum + (Number(split.percentage) || 0), 0) / 100,
      initialIssuance:
        stage.initialIssuance && stage.initialIssuance !== ""
          ? parseUnits(`${stage.initialIssuance}`, 18)
          : 0n,
      issuanceCutFrequency: Number(stage.priceCeilingIncreaseFrequency) * 86400, // seconds
      issuanceCutPercent:
        Number(
          WeightCutPercent.parse(stage.priceCeilingIncreasePercentage, 9).value
        ) / 100,
      cashOutTaxRate:
        Number(CashOutTaxRate.parse(stage.priceFloorTaxIntensity, 4).value) /
        100, //
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
        salt: createSalt(),
      },
      baseCurrency: Number(BigInt(NATIVE_TOKEN)),
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
    ],
    {
      hook: jbProjectDeploymentAddresses.JBBuybackHook[
        extra.chainId as JBChainId
      ] as Address,
      poolConfigurations,
    },
    {
      deployerConfigurations: extra.suckerDeployerConfig.deployerConfigurations,
      salt: extra.suckerDeployerConfig.salt,
    },
  ];
}
