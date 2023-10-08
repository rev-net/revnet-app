"use client";

import { Button } from "@/components/ui/button";
import { basicRevnetDeployerABI } from "@/lib/revnet/hooks/contract";
import { useDeployRevnet } from "@/lib/revnet/hooks/useDeployRevnet";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
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
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { zeroAddress } from "viem";
import { Address, UsePrepareContractWriteConfig } from "wagmi";

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
      <div className="relative">
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
        The Revnet's token represents a member's ownership. It's an ERC-20 token
        and can be traded on any exchange.
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
      />
    </div>
  );
}

function BoostPage() {
  return (
    <div>
      <h2 className="text-2xl font-medium mb-2">Add a Boost</h2>
      <p className="text-zinc-600 text-sm mb-7">
        Send a portion of tokens purchases (a Boost) to a Boost Operator. It
        could be a core team, airdrop stockpile, staking rewards contract, or
        something else. Boosts are locked, forever.
      </p>

      <div className="mb-7">
        <FieldGroup
          id="boostOperator"
          name="boostOperator"
          label="Boost Operator"
        />
        <FieldGroup
          id="premintTokenAmount"
          name="premintTokenAmount"
          label="Premint amount"
          description="Premint some tokens to Boost Operator. This only happens once."
        />
      </div>

      <h3 className="text-lg font-medium mb-2">Boost</h3>

      {/* TODO eventually, multiple boosts */}
      <FieldGroup
        id="boostPercentage"
        name="boostPercentage"
        label="Percentage"
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
  return (
    <div>
      <h2 className="text-2xl font-medium mb-7">Review and deploy</h2>
    </div>
  );
}

const pages = [
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
      {pages.map((page, i) => (
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

function CreatePage({
  onFormChange,
  isLoading,
}: {
  onFormChange: (data: typeof DEFAULT_FORM_DATA) => void;
  isLoading: boolean;
}) {
  const [page, setPage] = useState(0);
  const CurrentPage = pages[page].component;
  const prevPage = pages[page - 1];
  const nextPage = pages[page + 1];

  const { values } = useFormikContext<typeof DEFAULT_FORM_DATA>();
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
  const metadataCid = await fetch("/api/ipfs/pinJson", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  }).then((res) => res.json());

  return metadataCid;
}

export default function Page() {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const deployRevnet = useDeployRevnet();

  async function deployProject() {
    // Upload metadata
    const metadataCid = await pinProjectMetadata({
      name: formData.name,
      projectTagline: formData.tagline,
      description: "",
      logoUri: "",
    });

    const deployData = parseDeployData(formData, {
      metadataCid,
    });

    // Deploy onchain
    deployRevnet?.(deployData);
  }

  return (
    <Formik
      initialValues={DEFAULT_FORM_DATA}
      onSubmit={() => {
        console.log("submit");
        setIsLoading(true);
        deployProject?.();
      }}
    >
      <CreatePage onFormChange={setFormData} isLoading={isLoading} />
    </Formik>
  );
}
