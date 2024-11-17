"use client";

import { Nav } from "@/components/layout/Nav";
import { Button } from "@/components/ui/button";
import { QuoteButton } from "./QuoteButton";
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
import { createSalt } from "@/lib/number";
import {
  ExclamationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import {
  FieldArray,
  FieldAttributes,
  Form,
  Formik,
  Field as FormikField,
  useFormikContext,
} from "formik";
import {
  DecayPercent,
  JBProjectMetadata,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
  RedemptionRate,
  ReservedPercent,
} from "juice-sdk-core";
import { JBChainId, useChain } from "juice-sdk-react";
import {
  CheckCircle,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleXIcon,
} from "lucide-react";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { revDeployerAbi } from "revnet-sdk";
import { twMerge } from "tailwind-merge";
import {
  Address,
  Chain,
  ContractFunctionParameters,
  encodeFunctionData,
  parseUnits,
  zeroAddress,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { IpfsImageUploader } from "../../components/IpfsFileUploader";
import { chainNames, MAX_RULESET_COUNT } from "../constants";
import { useDeployRevnetRelay } from "@/lib/relayr/hooks/useDeployRevnetRelay";
import { RelayrPostBundleResponse } from "@/lib/relayr/types";
import { usePayRelayr } from "@/lib/relayr/hooks/usePayRelayr";
import { useGetRelayrBundle } from "@/lib/relayr/hooks/useGetRelayrBundle";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PayAndDeploy } from "./PayAndDeploy";

type StageData = {
  initialOperator?: string; // only one operator (technically per chain) not per stage
  initialIssuance: string;

  priceCeilingIncreasePercentage: string;
  priceCeilingIncreaseFrequency: string;
  priceFloorTaxIntensity: string;

  premintTokenAmount: string;

  splitRate: string;
  boostDuration: string;
};

const defaultStageData: StageData = {
  initialOperator: "",
  initialIssuance: "",

  priceCeilingIncreasePercentage: "",
  priceCeilingIncreaseFrequency: "",
  priceFloorTaxIntensity: "",

  premintTokenAmount: "",

  splitRate: "",
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
  stages: StageData[];
  chainIds: JBChainId[];
};

const DEFAULT_FORM_DATA: RevnetFormData = {
  name: "",
  // tagline: "",
  description: "",
  logoUri: "",

  tokenName: "",
  tokenSymbol: "",

  premintTokenAmount: "",

  stages: [],
  chainIds: []
};

const TEST_FORM_DATA: RevnetFormData = {
  name: "Test Revnet",
  description: "This is a test revnet for development purposes. It demonstrates various features and configurations available in the revnet system.",
  logoUri: "", // Leave empty or add an IPFS URI if needed

  tokenName: "Test Token",
  tokenSymbol: "TEST",

  premintTokenAmount: "1000",

  stages: [
    {
      initialOperator: "0x1234567890123456789012345678901234567890", // Example operator address
      initialIssuance: "100",
      priceCeilingIncreasePercentage: "50", // 50% decrease (doubles price)
      priceCeilingIncreaseFrequency: "30", // 30 days
      priceFloorTaxIntensity: "20", // 20% tax (LOW)
      splitRate: "10", // 10% split
      premintTokenAmount: "500",
      boostDuration: "90" // 90 days
    },
    {
      initialIssuance: "50",
      priceCeilingIncreasePercentage: "25",
      priceCeilingIncreaseFrequency: "15",
      priceFloorTaxIntensity: "50", // 50% tax (MID)
      splitRate: "5",
      premintTokenAmount: "250",
      boostDuration: "60"
    },
    {
      initialIssuance: "25",
      priceCeilingIncreasePercentage: "10",
      priceCeilingIncreaseFrequency: "7",
      priceFloorTaxIntensity: "80", // 80% tax (HIGH)
      splitRate: "2",
      premintTokenAmount: "100",
      boostDuration: "" // Empty for indefinite duration
    }
  ],
  chainIds: [11155111, 11155420, 84532, 421614]
} as const;

const EXIT_TAX_HIGH = "80";
const EXIT_TAX_MID = "50";
const EXIT_TAX_LOW = "20";
const EXIT_TAX_NONE = "0";
/**
 * The contract addresses to use for deployment
 * @todo not ideal to hardcode these addresses
 */
const SUPPORTED_JB_MULTITERMINAL_ADDRESS = {
  "84532": "0x4DeF0AA5B9CA095d11705284221b2878731ab4EF" as Address,
  "421614": "0x4DeF0AA5B9CA095d11705284221b2878731ab4EF" as Address,
  "11155111": "0x4DeF0AA5B9CA095d11705284221b2878731ab4EF" as Address,
  "11155420": "0x4DeF0AA5B9CA095d11705284221b2878731ab4EF" as Address,
};

const SUPPORTED_JB_CONTROLLER_ADDRESS = {
  "84532": "0x219A5cE6d1c512D5b050ad2E3d380b8746BE0Cb8" as Address,
  "421614": "0x219A5cE6d1c512D5b050ad2E3d380b8746BE0Cb8" as Address,
  "11155111": "0x219A5cE6d1c512D5b050ad2E3d380b8746BE0Cb8" as Address,
  "11155420": "0x219A5cE6d1c512D5b050ad2E3d380b8746BE0Cb8" as Address,
};

function Field(props: FieldAttributes<any>) {
  if (props.suffix || props.prefix) {
    return (
      <div className="relative w-full">
        {props.prefix ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-zinc-500 sm:text-md">{props.prefix}</span>
          </div>
        ) : null}
        <FormikField
          {...props}
          onWheel={(e: any) => e.target.blur()} // Prevents scrolling on number input
          className={twMerge(
            "flex w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-md ring-offset-white file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
            props.prefix ? "pl-6" : "",
            props.className
          )}
        />
        {props.suffix ? (
          <div
            className={twMerge(
              "pointer-events-none absolute inset-y-0 right-0 flex items-center px-3",
            )}
          >
            <span className="text-zinc-500 sm:text-md">{props.suffix}</span>
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <FormikField
      {...props}
      className={twMerge(
        "flex w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-md ring-offset-white file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
        props.className
      )}
    />
  );
}

function FieldGroup(
  props: FieldAttributes<any> & {
    label: string;
    description?: string | ReactNode;
    className?: string;
  }
) {
  return (
    <div className={twMerge("mb-5", props.className)}>
      <label
        htmlFor={props.name}
        className="block text-md font-semibold leading-6 mb-1"
      >
        {props.label}
      </label>
      {props.description ? (
        <p className="text-md text-zinc-600 mb-3">{props.description}</p>
      ) : null}
      <Field {...props} />
    </div>
  );
}

function DetailsPage() {
  const { setFieldValue, isSubmitting, isValid, initialErrors } =
    useFormikContext<RevnetFormData>();

  return (
    <>
    {/* Grid Container for Name, Ticker, and Upload Logo */}
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr] gap-6">
      <FieldGroup id="name" name="name" label="Name" />
      <FieldGroup
        id="tokenSymbol"
        name="tokenSymbol"
        label="Ticker"
        placeholder="MOON"
        prefix="$"
      />
      <div>
      <label
        className="block mb-1 text-md font-semibold text-gray-900 dark:text-white"
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
    </div>
      <FieldGroup
        id="description"
        name="description"
        label="Description"
        component="textarea"
        rows={2}
        className="max-w-lg"
        placeholder="What is your project about?"
      />
    </>
  );
}

function NotesSection({ title = "[ ? ]", children }: { title?: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-4">
      {/* Dropdown Header */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-left text-zinc-600"
      >
        <span
          className={`transform transition-transform font-sm ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        >
          ▶
        </span>
        <div className="font-sm">{title}</div>
      </button>

      {/* Dropdown Content */}
      {isOpen && <div className="mt-2 pl-4 text-gray-600 text-md">{children}</div>}
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
  initialValues?: StageData;
  children: React.ReactNode;
  onSave: (newStage: StageData) => void;
}) {
  const { values } = useFormikContext<RevnetFormData>();

  const [open, setOpen] = useState(false);
  const nativeTokenSymbol = useNativeTokenSymbol();

  const revnetTokenSymbol =
    values.tokenSymbol?.length > 0 ? `$${values.tokenSymbol}` : "tokens";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add stage</DialogTitle>
        </DialogHeader>
        <div className="my-8">
          <Formik
            initialValues={{ ...(initialValues ?? defaultStageData) }}
            onSubmit={(newValues) => {
              onSave(newValues);
              setOpen(false);
            }}
          >
            {() => (
              <Form>
                <div className="pb-10">
                  <FieldGroup
                    id="initialIssuance"
                    name="initialIssuance"
                    min="0"
                    type="number"
                    label="1. Issuance"
                    description={`How many ${revnetTokenSymbol} to mint when the revnet receives 1 ${nativeTokenSymbol}.`}
                    suffix={`${revnetTokenSymbol} / ${nativeTokenSymbol}`}
                  />

                  <div>
                    <div className="flex gap-2 items-center text-md text-zinc-600">
                      <label
                        htmlFor="priceCeilingIncreasePercentage"
                        className="whitespace-nowrap"
                      >
                        ... cut by
                      </label>
                      <Field
                        id="priceCeilingIncreasePercentage"
                        name="priceCeilingIncreasePercentage"
                        type="number"
                        min="0"
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
                        min="0"
                        required
                      />
                      days.
                    </div>

                    <NotesSection>
                      <div className="text-zinc-600 text-md mt-4 italic">
                        <ul className="list-disc list-inside space-y-2">
                          <li className="flex">
                            <span className="mr-2">•</span>
                              Decreasing 50% means to double the price – a halvening effect.
                          </li>
                          <li className="flex">
                            <span className="mr-2">•</span>
                              If there's a Uniswap pool for {revnetTokenSymbol} / {nativeTokenSymbol} offering a better price, all {nativeTokenSymbol} paid
                              in will be used to buyback instead of feeding the revnet.
                          </li>
                        </ul>
                      </div>
                    </NotesSection>
                  </div>
                </div>

                <div className="pb-10">
                  <div
                    className="block text-md font-semibold leading-6"
                  >
                    2. Split
                  </div>
                  <p className="text-zinc-600 text-md pb-3 mt-1">
                    Split a portion of new token issuance and buybacks to an operator.
                  </p>

                  <FieldGroup
                    className="flex-1"
                    id="splitRate"
                    type="number"
                    min="0"
                    name="splitRate"
                    suffix={`% of ${revnetTokenSymbol}`}
                  />
                  <div className="flex gap-2 items-center text-md text-zinc-600 whitespace-nowrap">
                    <label
                      htmlFor="priceCeilingIncreasePercentage"
                    >
                      ... operated by
                    </label>
                    <Field
                      id="initialOperator"
                      name="initialOperator"
                      className=""
                      placeholder={stageIdx > 0 ? values.stages[0].initialOperator : "0x"}
                      disabled={stageIdx > 0}
                      required
                    />
                    {stageIdx > 0 && (
                      <Tooltip>
                        <TooltipTrigger>[ ? ]</TooltipTrigger>
                        <TooltipContent side="left">
                          Set the operator in the first stage
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  <NotesSection>

                    <div className="text-zinc-600 text-md mt-4 italic">
                      <ul className="list-disc list-inside space-y-2">
                        <li className="flex">
                          <span className="mr-2">•</span>
                            The operator can change the distribution of the split to new destinations at any time.
                        </li>
                        <li className="flex">
                          <span className="mr-2">•</span>
                          The operator can be a multisig, a DAO, an LLC, a core team, an
                          airdrop stockpile, a staking rewards contract, or some other
                          address.
                        </li>
                        <li className="flex">
                          <span className="mr-2">•</span>
                          The operator is set once and is not bound by stages. The operator can hand off this responsibility to another address at any time, or relinquish it altogether.
                        </li>
                      </ul>
                    </div>
                  </NotesSection>
                </div>

                <div className="pb-8">
                  <FieldGroup
                    className="flex-1"
                    id="premintTokenAmount"
                    min="0"
                    type="number"
                    name="premintTokenAmount"
                    label="3. Automint"
                    description="Automatically mint tokens for the Operator when this stage becomes active."
                    suffix={revnetTokenSymbol || "tokens"}
                  />
                </div>
                <div className="pb-10">
                  <div
                    id="priceFloorTaxIntensity-group"
                    className="block text-md font-semibold leading-6"
                  >
                    4. Cash out tax
                  </div>
                  <p className="text-md text-zinc-500 mt-3">
                    All {revnetTokenSymbol} holders can access revenue by cashing out or taking out a loan against their {revnetTokenSymbol}. A
                    tax can be added that makes cashing out and taking out loans more expensive, while rewarding {revnetTokenSymbol} holders who stick around as others cash out.
                  </p>
                  <div
                    role="group"
                    aria-labelledby="priceFloorTaxIntensity-group"
                    className="flex gap-3 text-md mt-4"
                  >
                    <label>
                      <FormikField
                        type="radio"
                        name="priceFloorTaxIntensity"
                        value={EXIT_TAX_NONE}
                        className="mr-1"
                      />
                      None (0)
                    </label>
                    <label>
                      <FormikField
                        type="radio"
                        name="priceFloorTaxIntensity"
                        value={EXIT_TAX_LOW}
                        className="mr-1"
                      />
                      Low (0.2)
                    </label>
                    <label>
                      <FormikField
                        type="radio"
                        name="priceFloorTaxIntensity"
                        value={EXIT_TAX_MID}
                        className="mr-1"
                      />
                      Mid (0.5)
                    </label>
                    <label>
                      <FormikField
                        type="radio"
                        name="priceFloorTaxIntensity"
                        value={EXIT_TAX_HIGH}
                        className="mr-1"
                      />
                      High (0.8)
                    </label>
                </div>

                    <NotesSection>

                    <div className="text-zinc-600 text-md mt-4 italic">
                      <ul className="list-disc list-inside space-y-2">
                        <li className="flex">
                          <span className="mr-2">•</span>
                          The higher the tax, the less that can be accessed by cashing out or taking out a loan at any given time, and the more that is left to share between remaining holders who cash out later.
                        </li>
                        <li className="flex">
                          <span className="mr-2">•</span>
                          Given 100 {nativeTokenSymbol} in the revnet, 100 total supply of {revnetTokenSymbol}, and 10 {revnetTokenSymbol} being cashed out, a tax rate of 0 would yield a cash out value of 10 {nativeTokenSymbol}, 0.2 would yield 8.2 {nativeTokenSymbol}, 0.5 would yield 5.5 {nativeTokenSymbol}, and 0.8 would yield 2.8 {nativeTokenSymbol}.
                        </li>
                        <li className="flex">
                          <span className="mr-2">•</span>
                          The formula for the amount of {nativeTokenSymbol} received when cashing out is `(ax/s) * ((1-r) + xr/s)` where: `r` is the cash out tax rate, `a` is the amount in the revnet being accessed, `s` is the current token supply of {revnetTokenSymbol}, `x` is the amount of {revnetTokenSymbol} being cashed out.
                        </li>
                      </ul>
                    </div>
                    </NotesSection>
                  </div>
                <div className="pb-7">
                  <FieldGroup
                    id="boostDuration"
                    name="boostDuration"
                    label="5. Stage duration"
                    suffix="days"
                    min="0"
                    type="number"
                    description="How long will this stage last? Leave blank to make it last forever."
                  />
                    <NotesSection>

                      <ul className="list-disc list-inside">
                          <li className="flex">
                            <span className="mr-2">•</span>
                            <div>Days must be a multiple of this stage's issuance cut rate.</div>
                          </li>
                      </ul>
                    </NotesSection>
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
          <div>
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
                      •<div>{(Number(stage.priceFloorTaxIntensity) || 0)/100} cash out tax rate</div>
                      <div>• {stage.splitRate || 0}% operator split</div>
                      <div>• {stage.premintTokenAmount || 0} automint</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-left text-black-500 mb-4 font-semibold">
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
              <div className="text-md text-orange-900 mt-2 flex gap-1 p-2 bg-orange-50 rounded-md">
                <ExclamationCircleIcon className="h-4 w-4" /> You've added the
                maximum number of stages.
              </div>
            ) : !canAddStage ? (
              <div className="text-md text-orange-900 mt-2 flex gap-1 p-2 bg-orange-50 rounded-md">
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
              <dt className="text-md font-medium leading-6 text-zinc-900">
                Revnet name
              </dt>
              <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.name}
              </dd>
            </div>
            {/* <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-md font-medium leading-6 text-zinc-900">
                Revnet tagline
              </dt>
              <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                {values.tagline}
              </dd>
            </div> */}
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-md font-medium leading-6 text-zinc-900">
                Revnet description
              </dt>
              <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
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
              <dt className="text-md font-medium leading-6 text-zinc-900">
                Logo
              </dt>

              <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
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
              <dt className="text-md font-medium leading-6 text-zinc-900">
                Token
              </dt>
              <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
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
                  <div className="text-md font-medium mb-3 uppercase flex gap-3 items-center">
                    <span className="flex-shrink-0">Stage {idx + 1}</span>
                    <span className="h-[1px] w-full bg-zinc-100"></span>
                  </div>

                  <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-md font-medium leading-6 text-zinc-900">
                      Duration
                    </dt>
                    <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                      {stage.boostDuration ? (
                        <>{stage.boostDuration} days</>
                      ) : (
                        "Forever"
                      )}
                    </dd>
                  </div>

                  <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-md font-medium leading-6 text-zinc-900">
                      Token price ceiling
                    </dt>
                    <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                      +{stage.priceCeilingIncreasePercentage || 0}% every{" "}
                      {stage.priceCeilingIncreaseFrequency} days
                    </dd>
                  </div>

                  <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-md font-medium leading-6 text-zinc-900">
                      Cash out tax rate
                    </dt>
                    <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                      {stage.priceFloorTaxIntensity}%
                    </dd>
                  </div>

                  <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-md font-medium leading-6 text-zinc-900">
                      Operator split
                    </dt>
                    <dd className="mt-1 text-md leading-6 text-zinc-700 sm:col-span-2 sm:mt-0">
                      {stage.splitRate || 0}%{" "}
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

function EnvironmentCheckbox({
  relayrResponse,
  reset,
  isLoading
}:{
  relayrResponse?: RelayrPostBundleResponse,
  reset: () => void
  isLoading: boolean
}) {
  // State for dropdown selection
  const [environment, setEnvironment] = useState("testing");

  const { submitForm, values, setFieldValue } = useFormikContext<RevnetFormData>();
  const isFormValid = () => {
    if (!values.name || !values.tokenSymbol || !values.description) {
      return false;
    }

    if (!values.stages || values.stages.length === 0) {
      return false;
    }

    const isStagesValid = values.stages.every((stage) => {
      return (
        stage.initialIssuance !== undefined &&
        stage.initialIssuance !== "" &&
        stage.priceCeilingIncreasePercentage !== undefined &&
        stage.priceCeilingIncreasePercentage !== "" &&
        stage.priceCeilingIncreaseFrequency !== undefined &&
        stage.priceCeilingIncreaseFrequency !== "" &&
        stage.boostDuration !== undefined &&
        stage.boostDuration !== "" &&
        (values.stages.indexOf(stage) === 0 ? (stage.initialOperator && stage.initialOperator !== '') : true)
      );
    });

    if (!values.chainIds || values.chainIds.length === 0) {
      return false;
    }

    return isStagesValid;
  };

  const handleChainSelect = (chainId: number, checked: boolean) => {
    setFieldValue("chainIds", checked
      ? [...values.chainIds, chainId]
      : values.chainIds.filter(id => id !== chainId)
    );
  };

  const validBundle = !!relayrResponse?.bundle_uuid;
  const disableQuoteButton = !isFormValid() || validBundle;

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
          onValueChange={(v) => { setEnvironment(v) }}
          defaultValue="testing"
        >
          <SelectTrigger className="col-span-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="testing"
              key="testing"
            >
              Testnets
            </SelectItem>
            <SelectItem
              value="production"
              key="production"
            >
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
              <input type="checkbox" value="ethereum" className="form-checkbox" /> Ethereum Mainnet
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" value="optimism" className="form-checkbox" /> Optimism Mainnet
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" value="arbitrum" className="form-checkbox" /> Arbitrum Mainnet
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" value="base" className="form-checkbox" /> Base Mainnet
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
              Quote valid until {format(relayrResponse.payment_info[0].payment_deadline, "h:mm:ss aaa") }.
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
        <PayAndDeploy relayrResponse={relayrResponse} revnetTokenSymbol={revnetTokenSymbol} />
      )}
      </div>
    </div>
  );
}

function DeployRevnetForm({
  relayrResponse,
  reset,
  isLoading
}:{
  relayrResponse?: RelayrPostBundleResponse,
  reset: () => void
  isLoading: boolean
}) {
  const { values, setValues } = useFormikContext<RevnetFormData>();

  // type `testdata` into console to fill form with TEST_FORM_DATA
  useEffect(() => {
    const fillTestData = () => {
      setValues(TEST_FORM_DATA)
      console.log('Test data loaded successfully! 🚀');
      console.log('Form fields populated with:');
      console.dir(TEST_FORM_DATA);
    };

    Object.defineProperty(window, "testdata", {
      get: () => {
        fillTestData();
        return "filled."
      },
      configurable: true
    });

    return () => {
      delete (window as any).testdata;
    };

  }, [setValues]);

  const revnetTokenSymbol =
    values.tokenSymbol?.length > 0 ? `$${values.tokenSymbol}` : "tokens";

  const revnetTokenSymbolCapitalized =
    values.tokenSymbol?.length > 0 ? `$${values.tokenSymbol}` : "Tokens";

  return (
    <div className="grid md:grid-cols-3 max-w-6xl mx-auto my-20 gap-x-6 gap-y-6 md:gap-y-0 md:px-0 px-5">
      <h1 className="mb-16 text-2xl md:col-span-3 font-semibold">
        Deploy a revnet for your project
      </h1>
      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">1. Aesthetics</h2>
        <p className="text-zinc-600 text-lg">
          Your revnet's look and feel.
        </p>
      </div>
      <div className="md:col-span-2">
        <DetailsPage />
      </div>

      <div className="h-[1px] bg-zinc-200 md:col-span-3 my-10"></div>

      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">2. Rules</h2>
        <p className="text-zinc-600 text-lg">
          {revnetTokenSymbolCapitalized} issuance and cash out rules evolve over time automatically in stages.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          Staged rules
          are an onchain contract that can't be edited once deployed.
        </p>
      </div>
      <div className="md:col-span-2">
        <ConfigPage />
      </div>
      <div className="h-[1px] bg-zinc-200 md:col-span-3 my-10"></div>
      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">3. Deploy</h2>
        <p className="text-zinc-600 text-lg">
          Pick which chains your revnet will accept money on and issue {revnetTokenSymbol} from.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          Holder of {revnetTokenSymbol} can cash out on any of the selected chains, and can move their {revnetTokenSymbol} between chains at any time.
        </p>
        <p className="text-zinc-600 text-lg mt-2">
          The Operator you set in your revnet's rules will also be able to add new chains to the revnet later.
        </p>
      </div>
      <EnvironmentCheckbox relayrResponse={relayrResponse} isLoading={isLoading} reset={reset} />
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
    (_, value) => typeof value === "number" ? String(value) : value
  );
  console.log("formData::")
  console.dir(formData, {depth: null})
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
      autoMints: [
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
      issuanceDecayFrequency:
        Number(stage.priceCeilingIncreaseFrequency) * 86400, // seconds
      issuanceDecayPercent:
        Number(
          DecayPercent.parse(stage.priceCeilingIncreasePercentage, 9).value
        ) / 100,
      cashOutTaxRate:
        Number(RedemptionRate.parse(stage.priceFloorTaxIntensity, 4).value) /
        100, //
      extraMetadata: 0, // ??
    };
  });
  console.dir(formData, {depth: null})
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
      allowCrosschainSuckerExtension: true,
      loans: zeroAddress,
      loanSources: [],
    },
    [
      {
        terminal: SUPPORTED_JB_MULTITERMINAL_ADDRESS[sepolia.id],
        accountingContextsToAccept: [
          {
            token: NATIVE_TOKEN,
            decimals: NATIVE_TOKEN_DECIMALS,
            currency: Number(BigInt(NATIVE_TOKEN)), // ETH
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
  const { write, response, isLoading: isRelayrLoading, reset } = useDeployRevnetRelay();

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
          deployer: "0x25bC5D5A708c2E426eF3a5196cc18dE6b2d5A3d1" // TODO
        }
      })
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
        <DeployRevnetForm relayrResponse={response} isLoading={isLoading} reset={reset} />
      </Formik>
    </>
  );
}
