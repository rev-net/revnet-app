"use client";

import { EthereumAddress } from "@/components/EthereumAddress";
import EtherscanLink from "@/components/EtherscanLink";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  basicRevnetDeployerABI,
  useBasicRevnetDeployerScheduleNextBoostOf,
  usePrepareBasicRevnetDeployerScheduleNextBoostOf,
} from "@/lib/revnet/hooks/contract";
import { useDeployRevnet } from "@/lib/revnet/hooks/useDeployRevnet";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import {
  FieldAttributes,
  Form,
  Formik,
  Field as FormikField,
  useFormikContext,
} from "formik";
import {
  DiscountRate,
  JBProjectMetadata,
  RedemptionRate,
  ReservedRate,
} from "juice-hooks";
import Link from "next/link";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { zeroAddress } from "viem";
import {
  Address,
  UsePrepareContractWriteConfig,
  useWaitForTransaction,
} from "wagmi";

const DEFAULT_FORM_DATA = {
  name: "",
  tagline: "",

  tokenName: "",
  tokenSymbol: "",

  priceCeilingIncreasePercentage: "",
  priceCeilingIncreaseFrequency: "",
  priceFloorTaxIntensity: "",
  premintTokenAmount: "",

  boostOperator: "",
  boostPercentage: "",
  boostDuration: "",
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
  return (
    <div>
      <h2 className="text-2xl font-medium mb-7">Name the Revnet</h2>

      <FieldGroup id="name" name="name" label="Name" />
      <FieldGroup id="tagline" name="tagline" label="Tagline" />
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

function ConfigPage() {
  return (
    <div>
      <h2 className="text-2xl font-medium mb-2">Configure the Revnet</h2>
      <p className="text-zinc-600 text-sm mb-7">
        A Revnet's settings influence how it will grow and evolve. Settings are
        locked, forever. Choose wisely!
      </p>

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
          />
          <label htmlFor="priceCeilingIncreaseFrequency">every</label>
          <Field
            id="priceCeilingIncreaseFrequency"
            name="priceCeilingIncreaseFrequency"
            className="h-9"
            type="number"
          />
          days.
        </div>
      </div>
      <FieldGroup
        id="priceFloorTaxIntensity"
        name="priceFloorTaxIntensity"
        label="Exit Tax intensity"
        suffix="%"
      />
    </div>
  );
}

function BoostPage() {
  return (
    <div>
      <h2 className="text-2xl font-medium mb-2">Add a Boost</h2>
      <p className="text-zinc-600 text-sm mb-7">
        Send a portion of new token purchases to a Boost Operator. It could be a
        core team, airdrop stockpile, staking rewards contract, or something
        else. Boosts are locked, forever.
      </p>

      <div className="mb-7">
        <FieldGroup
          id="boostOperator"
          name="boostOperator"
          label="Boost Operator"
          placeholder="0x"
        />
        <FieldGroup
          id="premintTokenAmount"
          name="premintTokenAmount"
          label="Premint amount"
          description="Premint some tokens to the Boost Operator. This only happens once."
          suffix="tokens"
        />
      </div>

      <h3 className="text-lg font-medium mb-2">Boost</h3>

      {/* TODO eventually, multiple boosts */}
      <FieldGroup
        id="boostPercentage"
        name="boostPercentage"
        label="Percentage"
        suffix="%"
      />
      <FieldGroup
        id="boostDuration"
        name="boostDuration"
        label="Duration"
        suffix="days"
        type="number"
      />
    </div>
  );
}

function ReviewPage() {
  const { values } = useFormikContext<typeof DEFAULT_FORM_DATA>();

  return (
    <div>
      <h2 className="text-2xl font-medium mb-7">Review and deploy</h2>

      <div className="mb-5">
        <div className="px-4 sm:px-0">
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            General
          </h3>
        </div>

        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Revnet name
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {values.name}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Revnet tagline
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {values.tagline}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Token
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {values.tokenName} (${values.tokenSymbol})
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mb-5">
        <div className="px-4 sm:px-0">
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            Configuration
          </h3>
        </div>

        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Raise ceiling by
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {values.priceCeilingIncreasePercentage}% every{" "}
                {values.priceCeilingIncreaseFrequency} days
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Exit tax
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {values.priceFloorTaxIntensity}%
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <div className="px-4 sm:px-0">
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            Boost
          </h3>
        </div>

        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Boost operator
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 overflow-ellipsis">
                <EthereumAddress address={values.boostOperator} />
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Premint
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 overflow-ellipsis">
                {values.premintTokenAmount} {values.tokenSymbol}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Boost amount
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {values.boostPercentage}%
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Boost duration
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {values.boostDuration} days
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

const steps = [
  { name: "Details", component: DetailsPage },
  { name: "Token", component: TokensPage },
  { name: "Configure", component: ConfigPage },
  { name: "Boost", component: BoostPage },
  { name: "Review", component: ReviewPage },
];

function CreateNav({
  currentPage,
  onChange,
}: {
  currentPage: number;
  onChange: (page: number) => void;
}) {
  return (
    <ol className="flex gap-4">
      {steps.map((page, i) => (
        <li
          key={i}
          className={cn(currentPage === i && "font-medium", "hover:underline")}
          role="button"
          onClick={() => onChange(i)}
        >
          {page.name}
        </li>
      ))}
    </ol>
  );
}

function ScheduleBoostStep() {}

function DeploySuccessStep() {}

function CreateRevnetWizard({
  onFormChange,
  isLoading,
}: {
  onFormChange: (data: typeof DEFAULT_FORM_DATA) => void;
  isLoading: boolean;
}) {
  const [page, setPage] = useState(0);
  const CurrentPage = steps[page].component;
  const prevPage = steps[page - 1];
  const nextPage = steps[page + 1];

  const { values } = useFormikContext<typeof DEFAULT_FORM_DATA>();
  useEffect(() => {
    onFormChange(values);
  }, [values, onFormChange]);

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

function prepareDeployPayload(
  formData: typeof DEFAULT_FORM_DATA,
  extra: {
    metadataCid: string;
  }
): UsePrepareContractWriteConfig<
  typeof basicRevnetDeployerABI,
  "deployRevnetFor"
>["args"] {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return [
    (formData.boostOperator as Address) ?? zeroAddress,
    {
      content: extra.metadataCid,
      domain: 0n,
    },
    formData.tokenName,
    formData.tokenSymbol,
    {
      priceCeilingIncreasePercentage:
        DiscountRate.parse(formData.priceCeilingIncreasePercentage, 9).val /
        100n,
      priceCeilingIncreaseFrequency:
        BigInt(formData.priceCeilingIncreaseFrequency) * 86400n, // seconds
      priceFloorTaxIntensity:
        RedemptionRate.parse(formData.priceFloorTaxIntensity, 4).val / 100n, //
      initialIssuanceRate: 1n, // 1 token per eth
      premintTokenAmount: BigInt(formData.premintTokenAmount),
      boosts: [
        // Start the first boost straight away
        {
          rate: ReservedRate.parse(formData.boostPercentage, 4).val / 100n,
          startsAtOrAfter: 1n, // seconds
        },
        // Start a second boost with 0-rate when the user wants the first one to end.
        // This effectively ends the first boost.
        {
          rate: 0n,
          startsAtOrAfter: BigInt(formData.boostDuration) * 86400n + now, // seconds
        },
      ],
    },
    [
      "0xd89Ed8008961F68Aab849f49e122f9a1266240Db", // latest eth terminal goerli
    ],
    {
      hook: zeroAddress,
      pools: [
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

  /**
   * Deploy tx prep
   */
  const { write: deployRevnet, data: deployRevnetData } = useDeployRevnet();
  const { data: deployRevnetTxData, isSuccess: isDeploySuccess } =
    useWaitForTransaction({
      hash: deployRevnetData?.hash,
    });
  const projectIdHex = deployRevnetTxData?.logs?.[0]?.topics[3];
  const projectId = projectIdHex
    ? BigInt(BigInt(projectIdHex).toString(10))
    : null;

  /**
   * Schedule boost tx prep
   */
  const { config: scheduleNextBoostConfig } =
    usePrepareBasicRevnetDeployerScheduleNextBoostOf({
      args: projectId ? [projectId] : undefined,
    });
  const { write: scheduleNextBoost, data: scheduleNextBoostData, error } =
    useBasicRevnetDeployerScheduleNextBoostOf(scheduleNextBoostConfig);
  const {
    data: scheduleNextBoostTxData,
    isSuccess: isScheduleNextBoostSuccess,
    isLoading: isScheduleNextBoostLoading,
  } = useWaitForTransaction({
    hash: scheduleNextBoostData?.hash,
  });
  console.error(error)

  async function deployProject() {
    // Upload metadata
    const metadataCid = await pinProjectMetadata({
      name: formData.name,
      projectTagline: formData.tagline,
      description: "",
      logoUri: "",
    });

    const deployPayload = prepareDeployPayload(formData, {
      metadataCid,
    });

    console.log("deployPayload::", deployPayload);

    // Deploy onchain
    deployRevnet?.(deployPayload);
  }

  if (isDeploySuccess && deployRevnetTxData) {
    console.log("useDeployRevnet::tx success", deployRevnetTxData.logs);
    if (!projectIdHex) {
      console.warn("useDeployRevnet::fail::no project id");

      return (
        <div className="container">
          <div className="max-w-lg rounded-lg shadow-lg my-24 p-10 mx-auto border border-zinc-100">
            Something went wrong.{" "}
            <EtherscanLink type="tx" value={deployRevnetData?.hash}>
              Check the transaction on Etherscan
            </EtherscanLink>
            .
          </div>
        </div>
      );
    }

    console.warn("useDeployRevnet::success::project id", projectId);

    if (isScheduleNextBoostSuccess && scheduleNextBoostTxData) {
      console.log(
        "useScheduleNextBoost::tx success",
        scheduleNextBoostTxData.logs
      );
      const projectIdHex = scheduleNextBoostTxData.logs[0].topics[3];
      if (!projectIdHex) {
        console.warn("useScheduleNextBoost::fail::no project id");

        return (
          <div className="container">
            <div className="max-w-lg rounded-lg shadow-lg my-24 p-10 mx-auto border border-zinc-100">
              Something went wrong.{" "}
              <EtherscanLink type="tx" value={scheduleNextBoostData?.hash}>
                Check the transaction on Etherscan
              </EtherscanLink>
              .
            </div>
          </div>
        );
      }

      console.warn("useScheduleNextBoost::success::project id", projectId);

      return (
        <div className="container">
          <div className="max-w-lg rounded-lg shadow-lg my-24 p-10 mx-auto border border-zinc-100 flex flex-col items-center">
            <CheckCircleIcon className="h-9 w-9 text-green-600 mb-4" />
            <h2 className="text-4xl mb-10">Your Revnet is Live</h2>
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
      <div className="container">
        <div className="max-w-lg rounded-lg shadow-lg my-24 p-10 mx-auto border border-zinc-100 flex flex-col items-center">
          <CheckCircleIcon className="h-9 w-9 text-green-600 mb-4" />
          <h2 className="text-2xl font-medium mb-7">
            Last step – lock in your boost
          </h2>

          <Button
            onClick={() => {
              console.log("here");
              scheduleNextBoost?.();
            }}
            loading={isScheduleNextBoostLoading}
            disabled={!!scheduleNextBoost}
            size="lg"
          >
            Confirm boost
          </Button>
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
      <CreateRevnetWizard onFormChange={setFormData} isLoading={isLoading} />
    </Formik>
  );
}
