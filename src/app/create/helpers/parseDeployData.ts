// https://github.com/rev-net/revnet-core/blob/main/script/Deploy.s.sol
import { USDC_ADDRESSES, USDC_DECIMALS } from "@/app/constants";
import {
  CashOutTaxRate,
  ETH_CURRENCY_ID,
  JB_CHAINS,
  JBChainId,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  SPLITS_TOTAL_PERCENT,
  USD_CURRENCY_ID,
  WeightCutPercent,
} from "@bananapus/nana-sdk-core";
import {
  buildAccountingContext,
  buildDeployRevnetTx,
  buildRevnetStageConfig,
  fillSplitPercents,
} from "@bananapus/nana-sdk-core/v6";
import { Address, ContractFunctionArgs, parseUnits, zeroAddress } from "viem";
import { RevnetFormData } from "../types";

// The 4-arg `deployFor` overload (the 6-arg one adds a 721 tiers config + croptop posts,
// which the app doesn't use). The args are typed against the ABI so viem's inference
// accepts them at call sites (encodeFunctionData, estimateContractGas).
type RevDeployerAbi = ReturnType<typeof buildDeployRevnetTx>["abi"];
export type DeployForArgs = Extract<
  ContractFunctionArgs<RevDeployerAbi, "payable", "deployFor">,
  readonly [unknown, unknown, unknown, unknown]
>;
export type DeployRevnetRequest = Omit<
  Extract<
    ReturnType<typeof buildDeployRevnetTx>,
    { args: readonly [unknown, unknown, unknown, unknown] }
  >,
  "args"
> & { args: DeployForArgs };

export function parseDeployData(
  _formData: RevnetFormData,
  extra: {
    metadataCid: string;
    chainId: JBChainId;
    suckerDeployerConfig: {
      deployerConfigurations: {
        deployer: Address;
        peer: `0x${string}`;
        mappings: {
          localToken: Address;
          minGas: number;
          remoteToken: `0x${string}`;
        }[];
      }[];
    };
    timestamp: number;
    salt: `0x${string}`;
    creationFee: bigint;
  },
): DeployRevnetRequest {
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

  if (formData.reserveAsset === "USDC") {
    tokenAddress = USDC_ADDRESSES[extra.chainId];
    tokenDecimals = USDC_DECIMALS;
    baseCurrency = USD_CURRENCY_ID(6);
  } else {
    tokenAddress = NATIVE_TOKEN;
    tokenDecimals = NATIVE_TOKEN_DECIMALS;
    baseCurrency = ETH_CURRENCY_ID;
  }

  // The accounting context's token-keyed currency (uint32(uint160(token))) is computed by
  // the builder.
  const accountingContextsToAccept = [buildAccountingContext(tokenAddress, tokenDecimals)];

  const stageConfigurations = formData.stages.map((stage, idx) => {
    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~ Stage ${idx + 1} ~~~~~~~~~~~~~~~~~~~~~~~~~~`);
    const lengthSeconds = Math.floor(Number(stage.stageStart) * 86400);
    const bufferSeconds = 600;
    // Stage 0: use futureStartTimestamp if set, otherwise start in ~10 minutes
    const futureStart = Number(formData.stages[0].futureStartTimestamp);
    const startsAtOrAfter =
      idx === 0
        ? futureStart > 0
          ? futureStart
          : extra.timestamp + bufferSeconds
        : prevStart + lengthSeconds;
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
    // Scale each split to its share of the split bucket, then correct per-row rounding
    // drift so the group sums to exactly SPLITS_TOTAL_PERCENT (JBSplits reverts otherwise).
    const splitBucketPercents = fillSplitPercents(
      stage.splits.map((split) =>
        Math.round((Number(split.percentage) * 100 * SPLITS_TOTAL_PERCENT) / splitPercent),
      ),
    );
    const splits = stage.splits.map((split, splitIdx) => {
      let beneficiary = split.beneficiary?.find(
        (b) => Number(b?.chainId) === Number(extra.chainId),
      )?.address;
      if (!beneficiary) {
        beneficiary = split.defaultBeneficiary;
      }
      if (!beneficiary) throw new Error("Beneficiary not found");
      console.log(`[ SPLIT ${splitIdx + 1} ]\n\t\t${beneficiary} ${split.percentage}%`);
      return {
        preferAddToBalance: false,
        lockedUntil: 0,
        percent: splitBucketPercents[splitIdx],
        projectId: 0n,
        beneficiary: beneficiary as Address,
        hook: zeroAddress,
      };
    });
    console.log({ SPLITS_TOTAL_PERCENT, splitPercent, splits });
    console.log("----------------------------------------------------------------");

    return buildRevnetStageConfig({
      startsAtOrAfter,
      autoIssuances,
      splitPercent,
      splits,
      initialIssuance:
        stage.pickUpFromPrevious && idx > 0
          ? 1n // "Pick up from previous stage"
          : stage.initialIssuance && stage.initialIssuance !== ""
            ? parseUnits(`${stage.initialIssuance}`, 18)
            : 0n,
      issuanceCutFrequency: Math.floor(Number(stage.priceCeilingIncreaseFrequency) * 86400), // seconds
      issuanceCutPercent:
        Number(WeightCutPercent.parse(stage.priceCeilingIncreasePercentage, 9).value) / 100,
      cashOutTaxRate: Number(CashOutTaxRate.parse(stage.priceFloorTaxIntensity, 4).value) / 100,
      extraMetadata: 0,
    });
  });

  // The v6 REVDeployer bakes in the terminals, buyback hook, and loans contract; a default
  // 721 hook is deployed internally by the 4-arg `deployFor`. `buildDeployRevnetTx` sends
  // the creation fee as the transaction's value (revnetId defaults to 0n: a new revnet).
  return buildDeployRevnetTx({
    chainId: extra.chainId,
    config: {
      description: {
        name: formData.name,
        ticker: formData.tokenSymbol,
        uri: extra.metadataCid,
        salt: extra.salt,
      },
      baseCurrency: baseCurrency,
      operator: operator as Address,
      scopeCashOutsToLocalBalances: false,
      stageConfigurations,
    },
    accountingContexts: accountingContextsToAccept,
    suckerConfig: {
      deployerConfigurations: extra.suckerDeployerConfig.deployerConfigurations,
      salt: extra.salt,
    },
    creationFee: extra.creationFee,
  }) as DeployRevnetRequest;
}
