import {
  parseUnits,
  zeroAddress,
  Address,
  Chain,
  ContractFunctionParameters,
} from "viem";
import { revDeployerAbi } from "revnet-sdk";
import { mainnet, sepolia } from "viem/chains";
import {
  jbProjectDeploymentAddresses,
  CashOutTaxRate,
  NATIVE_CURRENCY_ID,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  ReservedPercent,
  WeightCutPercent
} from "juice-sdk-core";
import { createSalt } from "@/lib/number";
import { RevnetFormData } from "../types";

export function parseDeployData(
  _formData: RevnetFormData,
  extra: {
    metadataCid: string;
    chainId: Chain["id"] | undefined;
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
  console.log("formData::");
  console.dir(formData, { depth: null });
  let cumStart = 0;
  const operator = formData?.stages[0]?.initialOperator?.trim() as Address;
  const stageConfigurations = formData.stages.map((stage, idx) => {
    const prevStageDuration =
      idx === 0 ? now : Number(formData.stages[idx - 1].boostDuration) * 86400; // days to seconds
    const startsAtOrAfter = cumStart + prevStageDuration;
    cumStart += prevStageDuration;

    return {
      startsAtOrAfter,
      /**
       * REVAutoMint[]
       *
       * @see https://github.com/rev-net/revnet-core/blob/main/src/structs/REVAutoMint.sol
       */
      autoIssuances: [
        {
          chainId: extra.chainId ?? mainnet.id,
          count: parseUnits(stage.premintTokenAmount, 18),
          beneficiary: operator,
        },
      ],
      splitPercent:
        Number(ReservedPercent.parse(stage.splitRate, 4).value) / 100,
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
  console.dir(formData, { depth: null });
  console.log(operator);
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
      splitOperator: operator,
      stageConfigurations,
      loans: zeroAddress,
      loanSources: [],
    },
    [
      {
        terminal: jbProjectDeploymentAddresses.JBMultiTerminal[
          sepolia.id
        ] as Address,
        accountingContextsToAccept: [
          {
            token: NATIVE_TOKEN,
            decimals: NATIVE_TOKEN_DECIMALS,
            currency: NATIVE_CURRENCY_ID, // ETH
          },
        ],
      },
    ],
    {
      hook: zeroAddress,
      poolConfigurations: [
        {
          token: NATIVE_TOKEN,
          fee: 0,
          twapSlippageTolerance: 0,
          twapWindow: 0,
        },
      ],
    },
    {
      deployerConfigurations: [],
      salt: createSalt(),
    },
  ];
}
