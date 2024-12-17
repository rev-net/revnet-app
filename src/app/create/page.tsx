"use client";

import { Nav } from "@/components/layout/Nav";
import { Button } from "@/components/ui/button";
import { QuoteButton } from "./buttons/QuoteButton";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { createSalt } from "@/lib/number";
import {
  ExclamationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import {
  FieldArray,
  Formik,
  Field as FormikField,
  useFormikContext,
} from "formik";
import {
  WeightCutPercent,
  JBProjectMetadata,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  CashOutTaxRate,
  ReservedPercent,
  NATIVE_CURRENCY_ID,
  jbProjectDeploymentAddresses,
} from "juice-sdk-core";
import { JBChainId, useChain } from "juice-sdk-react";
import { useEffect, useState } from "react";
import { revDeployerAbi, revDeployerAddress } from "revnet-sdk";
import {
  Address,
  Chain,
  ContractFunctionParameters,
  encodeFunctionData,
  parseUnits,
  zeroAddress,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { BACKED_BY_TOKENS, chainNames, MAX_RULESET_COUNT } from "../constants";
import { useDeployRevnetRelay } from "@/lib/relayr/hooks/useDeployRevnetRelay";
import { RelayrPostBundleResponse } from "@/lib/relayr/types";
import { format } from "date-fns";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PayAndDeploy } from "./buttons/PayAndDeploy";
import { RevnetFormData } from "./types";
import { AddStageDialog } from "./form/AddStageDialog";
import { DetailsPage } from "./form/ProjectDetails";
import { DEFAULT_FORM_DATA, TEST_FORM_DATA } from "./constants";
import { isFormValid } from "./helpers/isFormValid";

function ConfigPage() {
  const { values, setFieldValue } = useFormikContext<RevnetFormData>();
  const nativeTokenSymbol = useNativeTokenSymbol();

  const hasStages = values.stages.length > 0;
  const lastStageHasDuration = Boolean(
    values.stages[values.stages.length - 1]?.boostDuration
  );

  const maxStageReached = values.stages.length >= MAX_RULESET_COUNT;
  const canAddStage = !hasStages || (lastStageHasDuration && !maxStageReached);

  return (
    <>
      <FieldArray
        name="stages"
        render={(arrayHelpers) => (
          <div className="mb-4">
            {values.stages.length > 0 ? (
              <div className="divide-y mb-2">
                {values.stages.map((stage, index) => (
                  <div className="py-4" key={index}>
                    <div className="mb-1 flex justify-between items-center">
                      <div className="font-semibold">Stage {index + 1}</div>
                      <div className="flex">
                        <AddStageDialog
                          stageIdx={index}
                          initialValues={stage}
                          onSave={(newStage) => {
                            arrayHelpers.replace(index, newStage);
                            setFieldValue(
                              "premintTokenAmount",
                              newStage.premintTokenAmount
                            );
                          }}
                        >
                          <Button variant="ghost" size="sm">
                            <PencilSquareIcon className="h-4 w-4" />
                          </Button>
                        </AddStageDialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => arrayHelpers.remove(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-md text-zinc-500 flex gap-2 flex-wrap">
                      <div>
                        {stage.boostDuration ? (
                          <>{stage.boostDuration} days</>
                        ) : (
                          "Forever"
                        )}{" "}
                      </div>
                      •
                      <div>
                        {stage.initialIssuance} {values.tokenSymbol ?? "tokens"}{" "}
                        / {nativeTokenSymbol}
                        {", "}-{stage.priceCeilingIncreasePercentage || 0}%
                        every {stage.priceCeilingIncreaseFrequency} days
                      </div>
                      •
                      <div>
                        {(Number(stage.priceFloorTaxIntensity) || 0) / 100} cash
                        out tax rate
                      </div>
                      <div>• {stage.splitRate || 0}% operator split</div>
                      <div>• {stage.premintTokenAmount || 0} auto issuance</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-left text-black-500 font-semibold mb-4">
                Add a stage to get started
              </div>
            )}

            <AddStageDialog
              stageIdx={values.stages.length}
              onSave={(newStage) => {
                arrayHelpers.push(newStage);
                setFieldValue(
                  "premintTokenAmount",
                  newStage.premintTokenAmount
                );
              }}
            >
              <Button
                className="flex gap-1 border border-dashed border-zinc-400"
                variant="secondary"
                disabled={!canAddStage}
              >
                Add stage <PlusIcon className="h-3 w-3" />
              </Button>
            </AddStageDialog>
            {maxStageReached ? (
              <div className="text-md text-orange-900 mt-2 flex gap-1 p-2 bg-orange-50">
                <ExclamationCircleIcon className="h-4 w-4" /> You've added the
                maximum number of stages.
              </div>
            ) : !canAddStage ? (
              <div className="text-md text-orange-900 mt-2 flex gap-1 p-2 bg-orange-50">
                <ExclamationCircleIcon className="h-4 w-4" /> Your last stage is
                indefinite. Set a duration to add another stage.
              </div>
            ) : null}
          </div>
        )}
      />
    </>
  );
}

function EnvironmentCheckbox({
  relayrResponse,
  reset,
  isLoading,
}: {
  relayrResponse?: RelayrPostBundleResponse;
  reset: () => void;
  isLoading: boolean;
}) {
  // State for dropdown selection
  const [environment, setEnvironment] = useState("testing");

  const { submitForm, values, setFieldValue } =
    useFormikContext<RevnetFormData>();

  const handleChainSelect = (chainId: number, checked: boolean) => {
    setFieldValue(
      "chainIds",
      checked
        ? [...values.chainIds, chainId]
        : values.chainIds.filter((id) => id !== chainId)
    );
  };

  const validBundle = !!relayrResponse?.bundle_uuid;
  const disableQuoteButton = !isFormValid(values) || validBundle;

  const revnetTokenSymbol =
    values.tokenSymbol?.length > 0 ? `$${values.tokenSymbol}` : "tokens";

  return (
    <div className="dropdown-check-array md:col-span-2">
      <div className="text-left text-black-500 mb-4 font-semibold">
        Choose your chains
      </div>
      <div className="flex flex-col gap-4">
        <div className="max-w-56">
          <Select
            onValueChange={(v) => {
              setEnvironment(v);
            }}
            defaultValue="testing"
          >
            <SelectTrigger className="col-span-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="testing" key="testing">
                Testnets
              </SelectItem>
              <SelectItem value="production" key="production" disabled>
                Production (coming soon)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Conditional Checkboxes */}
        <div className="flex flex-wrap gap-6 mt-4">
          {environment === "production" ? (
            // Production Options
            <>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value="ethereum"
                  className="form-checkbox"
                />{" "}
                Ethereum Mainnet
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value="optimism"
                  className="form-checkbox"
                />{" "}
                Optimism Mainnet
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value="arbitrum"
                  className="form-checkbox"
                />{" "}
                Arbitrum Mainnet
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" value="base" className="form-checkbox" />{" "}
                Base Mainnet
              </label>
            </>
          ) : (
            // Testnet Options (Sepolia)
            <>
              {Object.entries(chainNames).map(([id, name]) => (
                <label key={id} className="flex items-center gap-2">
                  <FormikField
                    type="checkbox"
                    name="chainIds"
                    value={id}
                    disabled={validBundle}
                    className="disabled:opacity-50"
                    checked={values.chainIds.includes(Number(id) as JBChainId)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChainSelect(Number(id), e.target.checked);
                    }}
                  />
                  {name}
                </label>
              ))}
            </>
          )}
        </div>

        <div className="flex flex-col md:col-span-3 mt-4">
          <QuoteButton
            isLoading={isLoading}
            validBundle={validBundle}
            disableQuoteButton={disableQuoteButton}
            onSubmit={submitForm}
          />
          {relayrResponse && (
            <div className="flex flex-col items-start">
              <div className="text-xs italic mt-2">
                Quote valid until{" "}
                {format(
                  relayrResponse.payment_info[0].payment_deadline,
                  "h:mm:ss aaa"
                )}
                .
                <Button
                  variant="link"
                  size="sm"
                  className="italic text-xs px-1"
                  onClick={() => reset()}
                >
                  clear quote
                </Button>
              </div>
            </div>
          )}
        </div>

        {relayrResponse && (
          <PayAndDeploy
            relayrResponse={relayrResponse}
            revnetTokenSymbol={revnetTokenSymbol}
          />
        )}
      </div>
    </div>
  );
}

function DeployRevnetForm({
  relayrResponse,
  reset,
  isLoading,
}: {
  relayrResponse?: RelayrPostBundleResponse;
  reset: () => void;
  isLoading: boolean;
}) {
  const { values, setValues } = useFormikContext<RevnetFormData>();

  // type `testdata` into console to fill form with TEST_FORM_DATA
  useEffect(() => {
    const fillTestData = () => {
      setValues(TEST_FORM_DATA);
      console.log("Test data loaded successfully! 🚀");
      console.log("Form fields populated with:");
      console.dir(TEST_FORM_DATA);
    };

    Object.defineProperty(window, "testdata", {
      get: () => {
        fillTestData();
        return "filled.";
      },
      configurable: true,
    });

    return () => {
      delete (window as any).testdata;
    };
  }, [setValues]);

  const revnetTokenSymbol =
    values.tokenSymbol?.length > 0 ? `$${values.tokenSymbol}` : "tokens";

  const revnetTokenSymbolCapitalized =
    values.tokenSymbol?.length > 0 ? `$${values.tokenSymbol}` : "Token";

  return (
    <div className="grid md:grid-cols-3 max-w-6xl mx-auto my-20 gap-x-6 gap-y-6 md:gap-y-0 md:px-0 px-5">
      <h1 className="mb-16 text-2xl md:col-span-3 font-semibold">
        Design and deploy a tokenized revnet for your project
      </h1>
      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">1. Look and feel</h2>
      </div>
      <div className="md:col-span-2">
        <DetailsPage />
      </div>

      <div className="h-[1px] bg-zinc-200 md:col-span-3 sm:my-10"></div>

      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">2. How it works</h2>
        <p className="text-zinc-600 text-lg">
          {revnetTokenSymbolCapitalized} issuance and cash out rules evolve over
          time automatically in stages.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          Staged rules can't be edited once deployed.
        </p>
      </div>
      <div className="md:col-span-2">
        <ConfigPage />
      </div>

      <div className="h-[1px] bg-zinc-200 md:col-span-3 sm:my-10"></div>
      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">3. Backed by</h2>
        <p className="text-zinc-600 text-lg">
          {revnetTokenSymbolCapitalized} are backed by the tokens you choose to
          allow in your revnet.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          If your revnet is paid in any other token, they will first be swapped
          into the tokens that you choose, before being used to back your
          revnet.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          Cash outs and loans are fulfilled from the chosen tokens.
        </p>
      </div>
      <div className="flex flex-row gap-8">
        {BACKED_BY_TOKENS.map((token) => (
          <div key={token} className="flex items-center gap-2">
            <FormikField type="checkbox" name="backedBy" value={token} />
            <span>{token}</span>
          </div>
        ))}
      </div>

      <div className="h-[1px] bg-zinc-200 md:col-span-3 sm:my-10"></div>
      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">4. Deploy</h2>
        <p className="text-zinc-600 text-lg">
          Pick which chains your revnet will accept money on and issue{" "}
          {revnetTokenSymbol} from.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          Holder of {revnetTokenSymbol} can cash out on any of the selected
          chains, and can move their {revnetTokenSymbol} between chains at any
          time.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          The Operator you set in your revnet's rules will also be able to add
          new chains to the revnet later.
        </p>
      </div>
      <EnvironmentCheckbox
        relayrResponse={relayrResponse}
        isLoading={isLoading}
        reset={reset}
      />
    </div>
  );
}

function parseDeployData(
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

async function pinProjectMetadata(metadata: JBProjectMetadata) {
  const { Hash } = await fetch("/api/ipfs/pinJson", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  }).then((res) => res.json());

  return Hash;
}

export default function Page() {
  const [isLoadingIpfs, setIsLoadingIpfs] = useState<boolean>(false);

  const chain = useChain();
  const {
    write,
    response,
    isLoading: isRelayrLoading,
    reset,
  } = useDeployRevnetRelay();

  const isLoading = isLoadingIpfs || isRelayrLoading;

  async function deployProject(formData: RevnetFormData) {
    // Upload metadata
    setIsLoadingIpfs(true);
    const metadataCid = await pinProjectMetadata({
      name: formData.name,
      // projectTagline: formData.tagline,
      description: formData.description,
      logoUri: formData.logoUri,
    });
    setIsLoadingIpfs(false);

    const deployData = parseDeployData(formData, {
      metadataCid,
      chainId: chain?.id,
    });

    const encodedData = encodeFunctionData({
      abi: revDeployerAbi, // ABI of the contract
      functionName: "deployFor",
      args: deployData,
    });

    console.log("deployData::", deployData, encodedData);
    console.log("chainIds::", formData.chainIds);
    // Send to Relayr
    write?.({
      data: encodedData,
      chainDeployer: formData.chainIds.map((chainId) => {
        return {
          chain: Number(chainId),
          deployer: revDeployerAddress[chainId],
        };
      }),
    });
  }

  return (
    <>
      <Nav />
      <Formik
        initialValues={DEFAULT_FORM_DATA}
        onSubmit={(formData: RevnetFormData) => {
          try {
            deployProject?.(formData);
          } catch (e) {
            setIsLoadingIpfs(false);
            console.error(e);
          }
        }}
      >
        <DeployRevnetForm
          relayrResponse={response}
          isLoading={isLoading}
          reset={reset}
        />
      </Formik>
    </>
  );
}
