"use client";

import EtherscanLink from "@/components/EtherscanLink";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ipfsUri, ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { revBasicDeployerABI } from "@/lib/revnet/hooks/contract";
import { useDeployRevnet } from "@/lib/revnet/hooks/useDeployRevnet";
import {
  ExclamationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
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
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  priceCeilingIncreasePercentage: "",
  priceCeilingIncreaseFrequency: "",
  priceFloorTaxIntensity: "",

  boostPercentage: "",
  boostDuration: "",
};

type RevnetFormData = {
  name: string;
  tagline: string;
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
  tagline: "",
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
            props.className
          )}
        />
        {props.suffix ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
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
  props: FieldAttributes<any> & { label: string; description?: string }
) {
  return (
    <div className="mb-3">
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
    <div>
      <h2 className="text-2xl font-medium mb-7">Name the Revnet</h2>

      <FieldGroup id="name" name="name" label="Name" />
      <FieldGroup id="tagline" name="tagline" label="Tagline" />
      <FieldGroup
        id="description"
        name="description"
        label="Description"
        component="textarea"
        rows={5}
        placeholder="Describe your revnet to participants..."
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
    </div>
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
      <FieldGroup id="tokenSymbol" name="tokenSymbol" label="Token symbol" />
    </div>
  );
}

function AddStageDialog({
  children,
  onSave,
  initialValues,
}: {
  initialValues?: typeof defaultStageData;
  children: React.ReactNode;
  onSave: (newStage: typeof defaultStageData) => void;
}) {
  const [open, setOpen] = useState(false);

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
            onSubmit={(values) => {
              onSave(values);
              setOpen(false);
            }}
          >
            {() => (
              <Form>
                <FieldGroup
                  id="boostDuration"
                  name="boostDuration"
                  label="Stage duration"
                  suffix="days"
                  description="Leave blank to make stage indefinite."
                  type="number"
                />

                <h3 className="text-lg font-medium mb-1 mt-7">Incentives</h3>

                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Price ceiling</div>
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
                    <label htmlFor="priceCeilingIncreaseFrequency">every</label>
                    <Field
                      id="priceCeilingIncreaseFrequency"
                      name="priceCeilingIncreaseFrequency"
                      className="h-9"
                      type="number"
                      required
                    />
                    days.
                  </div>
                </div>
                <FieldGroup
                  id="priceFloorTaxIntensity"
                  name="priceFloorTaxIntensity"
                  label="Exit tax"
                  suffix="%"
                  required
                />

                <div>
                  <h3 className="text-lg font-medium mb-1 mt-7">Token split</h3>
                  <p className="text-zinc-600 text-sm mb-7">
                    Send a portion of new token purchases to an Operator. The
                    Operator could be a core team, airdrop stockpile, staking
                    rewards contract, or something else.
                  </p>

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
                </div>

                <DialogFooter>
                  <Button type="submit">Add stage</Button>
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
  const { values, setFieldValue } = useFormikContext<RevnetFormData>();

  const hasStages = values.stages.length > 0;
  const lastStageHasDuration = Boolean(
    values.stages[values.stages.length - 1]?.boostDuration
  );

  const canAddStage = !hasStages || lastStageHasDuration;
  const maxStageReached = values.stages.length >= MAX_RULESET_COUNT;

  return (
    <div>
      <h2 className="text-2xl font-medium mb-2">Configure Stages</h2>
      <p className="text-zinc-600 text-sm mb-7">
        Configure how your Revnet should evolve over time. Your configuration is
        locked forever and can't be changed.
      </p>

      <div className="mb-5">
        <h3>Setup</h3>
        <FieldGroup
          id="initialOperator"
          name="initialOperator"
          label="Operator"
          placeholder="0x"
          required
        />
        <FieldGroup
          className="flex-1"
          id="premintTokenAmount"
          name="premintTokenAmount"
          label="Premint"
          description="Premint some tokens to the Boost Operator upon deployment."
          suffix="tokens"
        />
      </div>

      <FieldArray
        name="stages"
        render={(arrayHelpers) => (
          <div>
            <div className="divide-y mb-2">
              {values.stages.map((stage, index) => (
                <div className="py-4" key={index}>
                  <div className="mb-1 flex justify-between items-center">
                    <div>Stage {index + 1}</div>
                    <div className="flex gap-">
                      <AddStageDialog
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
                  <div className="text-xs text-zinc-500 flex gap-4">
                    <div>
                      {stage.boostDuration ? (
                        <>{stage.boostDuration} days</>
                      ) : (
                        "Forever"
                      )}{" "}
                    </div>
                    <div>
                      +{stage.priceCeilingIncreasePercentage || 0}% every{" "}
                      {stage.priceCeilingIncreasePercentage} days
                    </div>
                    <div>{stage.priceFloorTaxIntensity}% exit tax</div>
                    <div>{stage.boostPercentage || 0}% operator split</div>
                  </div>
                </div>
              ))}
            </div>
            <AddStageDialog
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
    </div>
  );
}

function ReviewPage() {
  const { values } = useFormikContext<RevnetFormData>();
  console.log(values);
  return (
    <div>
      <h2 className="text-2xl font-medium mb-7">Review and deploy</h2>

      <div className="mb-5">
        <div className="px-4 sm:px-0">
          <h3 className="text-base font-semibold leading-7 text-zinc-900">
            General
          </h3>
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
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-zinc-900">
                Revnet tagline
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.tagline}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-zinc-900">
                Revnet description
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.description.split("\n").map((d, idx) => (
                  <p className="mb-3" key={idx}>
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
      </div>
    </div>
  );
}

const pages = [
  { name: "Details", component: DetailsPage },
  { name: "Token", component: TokensPage },
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
  const [page, setPage] = useState(0);
  const CurrentPage = pages[page].component;
  const prevPage = pages[page - 1];
  const nextPage = pages[page + 1];

  const { values } = useFormikContext<RevnetFormData>();
  useEffect(() => {
    onFormChange(values);
  });

  return (
    <div className="container">
      <Form>
        <div className="max-w-lg rounded-lg shadow-lg my-24 p-10 mx-auto border border-zinc-100">
          <CurrentPage />
          <div className="flex justify-between mt-7">
            {prevPage ? (
              <Button
                variant="link"
                onClick={(ev) => {
                  ev.stopPropagation();
                  ev.preventDefault();
                  setPage(page - 1);
                }}
              >
                <ArrowLeftIcon className="h-3 w-3 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}
            {nextPage ? (
              <Button
                onClick={(ev) => {
                  ev.stopPropagation();
                  ev.preventDefault();
                  setPage(page + 1);
                }}
              >
                Next: {nextPage.name}
              </Button>
            ) : (
              <Button type="submit" loading={isLoading}>
                Deploy Revnet
              </Button>
            )}
          </div>
        </div>
      </Form>
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

  // 1 token per eth
  const initialIssuanceRateEth = "1"; // 1 token per eth initial weight

  let cumStart = 0;
  const stageConfigurations = formData.stages.map((stage, idx) => {
    const prevStageDuration =
      idx === 0 ? now : Number(formData.stages[idx - 1].boostDuration) * 86400; // days to seconds
    const startsAtOrAfter = cumStart + prevStageDuration;
    cumStart += prevStageDuration;

    return {
      startsAtOrAfter,
      operatorSplitRate:
        Number(ReservedRate.parse(stage.boostPercentage, 4).val) / 100,
      initialIssuanceRate:
        idx === 0 ? parseUnits(initialIssuanceRateEth, 18) : 0n, //  and 0 after the first stage (continuation)
      priceCeilingIncreaseFrequency:
        Number(stage.priceCeilingIncreaseFrequency) * 86400, // seconds
      priceCeilingIncreasePercentage:
        Number(DecayRate.parse(stage.priceCeilingIncreasePercentage, 9).val) /
        100,
      priceFloorTaxIntensity:
        Number(RedemptionRate.parse(stage.priceFloorTaxIntensity, 4).val) / 100, //
    };
  });

  return [
    formData.tokenName,
    formData.tokenSymbol,
    extra.metadataCid,
    {
      baseCurrency: Number(BigInt(NATIVE_TOKEN)),
      initialOperator: (formData.initialOperator as Address) ?? zeroAddress,
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { chain } = useNetwork();
  const { write, data } = useDeployRevnet();
  const { data: txData, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  async function deployProject() {
    // Upload metadata
    const metadataCid = await pinProjectMetadata({
      name: formData.name,
      projectTagline: formData.tagline,
      description: formData.description,
      logoUri: formData.logoUri,
    });

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
              {" "}
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
      <div className="container">
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
    );
  }

  return (
    <Formik
      initialValues={DEFAULT_FORM_DATA}
      onSubmit={() => {
        console.log("submitting");
        setIsLoading(true);
        try {
          deployProject?.();
        } catch (e) {
          setIsLoading(false);
          console.error(e);
        }
      }}
    >
      <CreatePage onFormChange={setFormData} isLoading={isLoading} />
    </Formik>
  );
}
