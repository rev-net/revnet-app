"use client";

import EtherscanLink from "@/components/EtherscanLink";
import { Nav } from "@/components/layout/Nav";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { ipfsUri, ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { revBasicDeployerABI } from "@/lib/revnet/hooks/contract";
import { useDeployRevnet } from "@/lib/revnet/hooks/useDeployRevnet";
import {
  ExclamationCircleIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, PlusIcon } from "@heroicons/react/24/solid";
import {
  FieldArray,
  FieldAttributes,
  Form,
  Formik,
  Field as FormikField,
  useFormikContext,
} from "formik";
import {
  DecayRate,
  JBProjectMetadata,
  NATIVE_TOKEN,
  RedemptionRate,
  ReservedRate,
  jbMultiTerminalAddress,
} from "juice-sdk-core";
import { FastForwardIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Chain, parseUnits, zeroAddress } from "viem";
import { optimismSepolia } from "viem/chains";
import {
  Address,
  UsePrepareContractWriteConfig,
  sepolia,
  useNetwork,
  useWaitForTransaction,
} from "wagmi";
import { MAX_RULESET_COUNT } from "../constants";
import { IpfsImageUploader } from "./IpfsFileUploader";

const defaultStageData = {
  initialIssuance: "",

  priceCeilingIncreasePercentage: "",
  priceCeilingIncreaseFrequency: "",
  priceFloorTaxIntensity: "",

  boostPercentage: "",
  boostDuration: "",
};

type RevnetFormData = {
  name: string;
  // tagline: string;
  description: string;
  logoUri?: string;

  tokenName: string;
  tokenSymbol: string;

  premintTokenAmount: string;
  initialOperator: string;
  stages: (typeof defaultStageData)[];
};

const DEFAULT_FORM_DATA: RevnetFormData = {
  name: "",
  // tagline: "",
  description: "",
  logoUri: "",

  tokenName: "",
  tokenSymbol: "",

  premintTokenAmount: "",
  initialOperator: "",

  stages: [],
};

function Field(props: FieldAttributes<any>) {
  if (props.suffix || props.prefix) {
    return (
      <div className="relative w-full">
        {props.prefix ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-zinc-500 sm:text-sm">{props.prefix}</span>
          </div>
        ) : null}
        <FormikField
          {...props}
          className={twMerge(
            "flex w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
            props.prefix ? "pl-6" : "",
            props.className
          )}
        />
        {props.suffix ? (
          <div
            className={twMerge(
              "pointer-events-none absolute inset-y-0 right-0 flex items-center",
              props.type === "number" ? "pr-9" : "pr-3"
            )}
          >
            <span className="text-zinc-500 sm:text-sm">{props.suffix}</span>
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <FormikField
      {...props}
      className={twMerge(
        "flex w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
        props.className
      )}
    />
  );
}

function FieldGroup(
  props: FieldAttributes<any> & {
    label: string;
    description?: string | ReactNode;
  }
) {
  return (
    <div className="mb-5">
      <label
        htmlFor={props.name}
        className="block text-sm font-medium leading-6 mb-1"
      >
        {props.label}
      </label>
      <Field {...props} />
      {props.description ? (
        <p className="text-sm text-zinc-500 mt-1">{props.description}</p>
      ) : null}
    </div>
  );
}

function DetailsPage() {
  const { setFieldValue } = useFormikContext<RevnetFormData>();

  return (
    <>
      <FieldGroup id="name" name="name" label="Name" />
      <FieldGroup
        id="tokenSymbol"
        name="tokenSymbol"
        label="Ticker"
        placeholder="MOON"
        prefix="$"
      />
      <FieldGroup
        id="description"
        name="description"
        label="Description"
        component="textarea"
        rows={5}
        placeholder="What's your Revnet for?"
      />
      <label
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        htmlFor="file_input"
      >
        Upload logo
      </label>
      <IpfsImageUploader
        onUploadSuccess={(cid) => {
          setFieldValue("logoUri", ipfsUri(cid));
        }}
      />
    </>
  );
}

function TokensPage() {
  return (
    <div>
      <h2 className="text-2xl font-medium mb-2">Name the Revnet's token</h2>
      <p className="text-zinc-600 text-sm mb-7">
        The Revnet's token represents a member's ownership. It's an{" "}
        <span className="whitespace-nowrap">ERC-20</span> token and can be
        traded on any exchange.
      </p>
      <FieldGroup id="tokenName" name="tokenName" label="Token name" />
      <FieldGroup
        id="tokenSymbol"
        name="tokenSymbol"
        label="Ticker"
        placeholder="MOON"
        prefix="$"
      />
    </div>
  );
}

function AddStageDialog({
  stageIdx,
  children,
  onSave,
  initialValues,
}: {
  stageIdx: number;
  initialValues?: typeof defaultStageData;
  children: React.ReactNode;
  onSave: (newStage: typeof defaultStageData) => void;
}) {
  const { values } = useFormikContext<RevnetFormData>();

  const [open, setOpen] = useState(false);
  const nativeTokenSymbol = useNativeTokenSymbol();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add stage</DialogTitle>
        </DialogHeader>
        <div className="my-8">
          <Formik
            initialValues={initialValues ?? defaultStageData}
            onSubmit={(newValues) => {
              onSave(newValues);
              setOpen(false);
            }}
          >
            {() => (
              <Form>
                <div className="pb-5 border-b border-zinc-200">
                  <FieldGroup
                    id="boostDuration"
                    name="boostDuration"
                    label="Stage duration"
                    suffix="days"
                    description="Leave blank to make stage indefinite."
                    type="number"
                  />
                  <FieldGroup
                    id="initialIssuance"
                    name="initialIssuance"
                    label="Starting issuance rate"
                    suffix={`${
                      values.tokenSymbol?.length > 0
                        ? `$${values.tokenSymbol}`
                        : "tokens"
                    } / ${nativeTokenSymbol}`}
                    description="How many tokens to mint when the revnet receives 1 ETH. This will decrease as the price ceiling increases over time."
                    type="number"
                  />
                </div>

                <div className="py-5 border-b border-zinc-200">
                  <h3 className="mb-1">Incentives</h3>
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">
                      Price ceiling
                    </div>
                    <div className="flex gap-2 items-center text-sm text-zinc-600 italic">
                      <label
                        htmlFor="priceCeilingIncreasePercentage"
                        className="whitespace-nowrap"
                      >
                        Raise ceiling by
                      </label>
                      <Field
                        id="priceCeilingIncreasePercentage"
                        name="priceCeilingIncreasePercentage"
                        className="h-9"
                        suffix="%"
                        required
                      />
                      <label htmlFor="priceCeilingIncreaseFrequency">
                        every
                      </label>
                      <Field
                        id="priceCeilingIncreaseFrequency"
                        name="priceCeilingIncreaseFrequency"
                        className="h-9"
                        type="number"
                        required
                      />
                      days.
                    </div>
                    <div className="text-zinc-500 text-sm mt-2">
                      <span className="italic">Days</span> must be less than
                      this stage's duration.
                    </div>
                  </div>
                  <FieldGroup
                    id="priceFloorTaxIntensity"
                    name="priceFloorTaxIntensity"
                    label="Exit tax"
                    suffix="%"
                    description={`How much revenue can be redeemed with $${values.tokenSymbol}.`}
                    required
                  />
                </div>

                <div className="pt-5">
                  <h3 className="mb-1">Token split</h3>
                  <p className="text-zinc-600 text-sm mb-3">
                    Send a portion of new token purchases to the Operator. The
                    Operator could be a core team, airdrop stockpile, staking
                    rewards contract, or something else.
                  </p>

                  <FieldGroup
                    id="initialOperator"
                    name="initialOperator"
                    label="Split Operator"
                    placeholder="0x"
                    description={
                      stageIdx === 0 ? (
                        "The person, group or contract that can receive a portion of new tokens."
                      ) : (
                        <div className="text-xs text-blue-900 mb-2 flex gap-1 p-2 bg-blue-50 rounded-md">
                          <QuestionMarkCircleIcon className="h-4 w-4" /> Set the
                          operator in the first stage.
                        </div>
                      )
                    }
                    disabled={stageIdx > 0}
                    required
                  />

                  <div className="flex gap-2 justify-between">
                    <FieldGroup
                      className="flex-1"
                      id="boostPercentage"
                      name="boostPercentage"
                      label="Split rate"
                      description="Send a percentage of new tokens to the Operator."
                      suffix="%"
                    />
                  </div>

                  {stageIdx === 0 ? (
                    <FieldGroup
                      className="flex-1"
                      id="premintTokenAmount"
                      name="premintTokenAmount"
                      label="Premint"
                      description="Premint tokens for the Operator. Only happens once."
                      suffix={"$" + values.tokenSymbol || "tokens"}
                    />
                  ) : null}
                </div>

                <DialogFooter>
                  <Button type="submit">Save stage</Button>
                </DialogFooter>
              </Form>
            )}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConfigPage() {
  const { values } = useFormikContext<RevnetFormData>();
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
          <div>
            {values.stages.length > 0 ? (
              <div className="divide-y mb-2">
                {values.stages.map((stage, index) => (
                  <div className="py-4" key={index}>
                    <div className="mb-1 flex justify-between items-center">
                      <div>Stage {index + 1}</div>
                      <div className="flex">
                        <AddStageDialog
                          stageIdx={index}
                          initialValues={stage}
                          onSave={(newStage) => {
                            arrayHelpers.replace(index, newStage);
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
                    <div className="text-xs text-zinc-500 flex gap-2 flex-wrap">
                      <div>
                        {stage.boostDuration ? (
                          <>{stage.boostDuration} days</>
                        ) : (
                          "Forever"
                        )}{" "}
                      </div>
                      •
                      <div>
                        {stage.initialIssuance} tokens / {nativeTokenSymbol}
                        {", "}+{stage.priceCeilingIncreasePercentage || 0}%
                        every {stage.priceCeilingIncreaseFrequency} days
                      </div>
                      •<div>{stage.priceFloorTaxIntensity}% exit tax</div>
                      <div>• {stage.boostPercentage || 0}% operator split</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-zinc-500 mb-4">
                Add a stage to get started
              </div>
            )}

            <AddStageDialog
              stageIdx={values.stages.length}
              onSave={(newStage) => {
                arrayHelpers.push(newStage);
              }}
            >
              <Button
                className="w-full flex gap-1 border border-dashed border-zinc-400"
                variant="secondary"
                disabled={!canAddStage}
              >
                Add stage <PlusIcon className="h-3 w-3" />
              </Button>
            </AddStageDialog>
            {maxStageReached ? (
              <div className="text-xs text-orange-900 mt-2 flex gap-1 p-2 bg-orange-50 rounded-md">
                <ExclamationCircleIcon className="h-4 w-4" /> You've added the
                maximum number of stages.
              </div>
            ) : !canAddStage ? (
              <div className="text-xs text-orange-900 mt-2 flex gap-1 p-2 bg-orange-50 rounded-md">
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

function ReviewPage() {
  const { values } = useFormikContext<RevnetFormData>();

  return (
    <div>
      <h2 className="text-2xl font-medium mb-7">3. Review and deploy</h2>

      <div className="mb-5">
        <div className="px-4 sm:px-0">
          <h3 className="font-medium">General</h3>
        </div>

        <div className="mt-6 border-t border-zinc-100">
          <dl className="divide-y divide-zinc-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-zinc-900">
                Revnet name
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.name}
              </dd>
            </div>
            {/* <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-zinc-900">
                Revnet tagline
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.tagline}
              </dd>
            </div> */}
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-zinc-900">
                Revnet description
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.description.split("\n").map((d, idx) => (
                  <p
                    className={
                      idx < values.description.length - 1 ? "" : "mb-3"
                    }
                    key={idx}
                  >
                    {d}
                  </p>
                ))}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-zinc-900">
                Logo
              </dt>

              <dd className="mt-1 text-sm leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.logoUri ? (
                  <Image
                    src={ipfsUriToGatewayUrl(values.logoUri)}
                    alt="Revnet logo"
                    width={80}
                    height={200}
                  />
                ) : (
                  "None"
                )}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-zinc-900">
                Token
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.tokenName} (${values.tokenSymbol})
              </dd>
            </div>
          </dl>
        </div>
        <div className="pt-5">
          <h3 className="mb-1 font-medium">Stages</h3>

          <dl>
            {values.stages.map((stage, idx) => {
              return (
                <div key={idx} className="py-6">
                  <div className="text-sm font-medium mb-3 uppercase flex gap-3 items-center">
                    <span className="flex-shrink-0">Stage {idx + 1}</span>
                    <span className="h-[1px] w-full bg-zinc-100"></span>
                  </div>

                  <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-zinc-900">
                      Duration
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                      {stage.boostDuration ? (
                        <>{stage.boostDuration} days</>
                      ) : (
                        "Forever"
                      )}
                    </dd>
                  </div>

                  <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-zinc-900">
                      Token price ceiling
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                      +{stage.priceCeilingIncreasePercentage || 0}% every{" "}
                      {stage.priceCeilingIncreaseFrequency} days
                    </dd>
                  </div>

                  <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-zinc-900">
                      Exit tax
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                      {stage.priceFloorTaxIntensity}%
                    </dd>
                  </div>

                  <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-zinc-900">
                      Operator split
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                      {stage.boostPercentage || 0}%{" "}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </div>
  );
}

const pages = [
  { name: "Details", component: DetailsPage },
  // { name: "Token", component: TokensPage },
  { name: "Stage", component: ConfigPage },
  { name: "Review", component: ReviewPage },
];

function CreatePage({
  onFormChange,
  isLoading,
}: {
  onFormChange: (data: RevnetFormData) => void;
  isLoading: boolean;
}) {
  return (
    <div className="grid md:grid-cols-3 max-w-6xl mx-auto my-20 gap-x-6 gap-y-6 md:gap-y-0 md:px-0 px-10">
      <h1 className="mb-16 text-2xl md:col-span-3 font-medium">
        Deploy new Revnet
      </h1>
      <div className="md:col-span-1">
        <h2 className="font-medium text-lg">Details</h2>
        <p className="text-zinc-500 text-sm">
          Add basic information about the Revnet.
        </p>
      </div>
      <div className="md:col-span-2">
        <DetailsPage />
      </div>

      <div className="h-[1px] bg-zinc-200 md:col-span-3 my-10"></div>

      <div className="md:col-span-1">
        <h2 className="font-medium text-lg">Stages</h2>
        <p className="text-zinc-500 text-sm">
          <p className="text-zinc-600 text-sm mb-7">
            Configure how your Revnet should evolve over time. Your
            configuration is locked forever and can't be changed.
          </p>
        </p>
      </div>
      <div className="md:col-span-2">
        <ConfigPage />
      </div>

      <div className="h-[1px] bg-zinc-200 md:col-span-3 my-10"></div>

      <div className="flex justify-end md:col-span-3">
        <Button type="submit" loading={isLoading} size="lg">
          Deploy Revnet <FastForwardIcon className="h-4 w-4 fill-white ml-2" />
        </Button>
      </div>
    </div>
  );
}

function parseDeployData(
  formData: RevnetFormData,
  extra: {
    metadataCid: string;
    chainId: Chain["id"] | undefined;
  }
): UsePrepareContractWriteConfig<
  typeof revBasicDeployerABI,
  "deployRevnetWith"
>["args"] {
  const now = Math.floor(Date.now() / 1000);

  let cumStart = 0;
  const stageConfigurations = formData.stages.map((stage, idx) => {
    const prevStageDuration =
      idx === 0 ? now : Number(formData.stages[idx - 1].boostDuration) * 86400; // days to seconds
    const startsAtOrAfter = cumStart + prevStageDuration;
    cumStart += prevStageDuration;

    console.log(stage);

    return {
      startsAtOrAfter,
      operatorSplitRate:
        Number(ReservedRate.parse(stage.boostPercentage, 4).value) / 100,
      initialIssuanceRate:
        stage.initialIssuance && stage.initialIssuance !== ""
          ? parseUnits(`${stage.initialIssuance}`, 18)
          : 0n,
      priceCeilingIncreaseFrequency:
        Number(stage.priceCeilingIncreaseFrequency) * 86400, // seconds
      priceCeilingIncreasePercentage:
        Number(DecayRate.parse(stage.priceCeilingIncreasePercentage, 9).value) /
        100,
      priceFloorTaxIntensity:
        Number(RedemptionRate.parse(stage.priceFloorTaxIntensity, 4).value) / 100, //
    };
  });

  return [
    formData.tokenSymbol, // token name, same as token symbol
    formData.tokenSymbol,
    extra.metadataCid,
    {
      baseCurrency: Number(BigInt(NATIVE_TOKEN)),
      initialOperator:
        (formData.initialOperator.trim() as Address) ?? zeroAddress,
      premintTokenAmount: parseUnits(formData.premintTokenAmount, 18),
      stageConfigurations,
    },
    [
      {
        terminal:
          jbMultiTerminalAddress[
            extra.chainId as typeof sepolia.id | typeof optimismSepolia.id
          ],
        tokensToAccept: [NATIVE_TOKEN],
      },
    ],
    {
      hook: zeroAddress,
      poolConfigurations: [
        // {
        //   token: zeroAddress,
        //   fee: 0,
        //   twapSlippageTolerance: 0,
        //   twapWindow: 0,
        // },
      ],
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
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [isLoadingIpfs, setIsLoadingIpfs] = useState<boolean>(false);

  const { chain } = useNetwork();
  const { write, data, isLoading } = useDeployRevnet();
  const { data: txData, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  async function deployProject() {
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

    console.log("deployData::", deployData);

    // Deploy onchain
    write?.(deployData);
  }

  if (isSuccess && txData) {
    console.log("useDeployRevnet::tx success", txData.logs);
    const projectIdHex = txData.logs[0].topics[3];
    if (!projectIdHex) {
      console.warn("useDeployRevnet::fail::no project id");

      return (
        <div className="container">
          <div className="max-w-lg rounded-lg shadow-lg my-24 p-10 mx-auto border border-zinc-100">
            Something went wrong.{" "}
            <EtherscanLink type="tx" value={data?.hash}>
              Check the transaction on Etherscan
            </EtherscanLink>
            .
          </div>
        </div>
      );
    }

    const projectId = BigInt(projectIdHex).toString(10);
    console.warn("useDeployRevnet::success::project id", projectId);

    return (
      <>
        <Nav />
        <div className="container min-h-screen">
          <div className="max-w-lg rounded-lg shadow-lg my-24 p-10 mx-auto border border-zinc-100 flex flex-col items-center">
            <CheckCircleIcon className="h-9 w-9 text-green-600 mb-4" />
            <h1 className="text-4xl mb-10">Your Revnet is Live</h1>
            <p>
              <Link href={`/net/${projectId}`}>
                <Button size="lg">Go to Revnet</Button>
              </Link>
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />

      <Formik
        initialValues={DEFAULT_FORM_DATA}
        onSubmit={() => {
          console.log("submitting");
          try {
            deployProject?.();
          } catch (e) {
            setIsLoadingIpfs(false);
            console.error(e);
          }
        }}
      >
        <CreatePage
          onFormChange={setFormData}
          isLoading={isLoading || isLoadingIpfs}
        />
      </Formik>
    </>
  );
}
