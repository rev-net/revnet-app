"use client";

import {
  ExclamationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import {
  FieldArray,
  Formik,
  useFormikContext,
} from "formik";
import { useChain } from "juice-sdk-react";
import { useState } from "react";
import { revDeployerAbi, revDeployerAddress } from "revnet-sdk";
import { encodeFunctionData } from "viem";
import { RevnetFormData } from "./types";
import { Nav } from "@/components/layout/Nav";
import { Button } from "@/components/ui/button";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { useDeployRevnetRelay } from "@/lib/relayr/hooks/useDeployRevnetRelay";
import { RelayrPostBundleResponse } from "@/lib/relayr/types";
import { MAX_RULESET_COUNT } from "../constants";
import { DEFAULT_FORM_DATA } from "./constants";
import { PayAndDeploy } from "./buttons/PayAndDeploy";
import { QuoteButton } from "./buttons/QuoteButton";
import { AddStageDialog } from "./form/AddStageDialog";
import { ChainSelect } from "./form/ChainSelect";
import { DetailsPage } from "./form/ProjectDetails";
import { BackedBySelect } from "./form/BackedBySelect";
import { Divider } from "./form/Divider";
import { isFormValid } from "./helpers/isFormValid";
import { parseDeployData } from "./helpers/parseDeployData";
import { useTestData } from "./helpers/useTestData";
import { pinProjectMetadata } from "./helpers/pinProjectMetaData";

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

  const { submitForm, values } = useFormikContext<RevnetFormData>();
  useTestData(); // type `testdata` into console to fill form with TEST_FORM_DATA

  const validBundle = !!relayrResponse?.bundle_uuid;
  const disableQuoteButton = !isFormValid(values) || validBundle;

  const revnetTokenSymbol =
    values.tokenSymbol?.length > 0 ? `$${values.tokenSymbol}` : "tokens";

  return (
    <div className="md:col-span-2">
      <ChainSelect validBundle={validBundle} />
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
  const { values } = useFormikContext<RevnetFormData>();

  const revnetTokenSymbol =
    values.tokenSymbol?.length > 0 ? `$${values.tokenSymbol}` : "tokens";

  const revnetTokenSymbolCapitalized =
    values.tokenSymbol?.length > 0 ? `$${values.tokenSymbol}` : "Token";
  const validBundle = !!relayrResponse?.bundle_uuid;
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

      <Divider />

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

      <Divider />
      <BackedBySelect
        disabled={validBundle}
        symbol={revnetTokenSymbolCapitalized}
      />
      <Divider />
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
