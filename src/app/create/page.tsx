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
  ONE_ETHER,
  RedemptionRate,
  ReservedRate,
} from "juice-hooks";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { zeroAddress } from "viem";
import {
  Address,
  UsePrepareContractWriteConfig,
  useContractWrite,
} from "wagmi";

const DEFAULT_FORM_DATA = {
  name: "",
  tagline: "",

  tokenName: "",
  tokenSymbol: "",

  priceCeilingIncreasePercentage: "",
  priceCeilingIncreaseFrequency: "",
  priceFloorTaxIntensity: "",

  boostOperator: "",
  boostPercentage: "",
  boostDuration: "",
};

function Field(props: FieldAttributes<any>) {
  return (
    <FormikField
      {...props}
      className={twMerge(
        "flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
        props.className
      )}
    />
  );
}

function FieldGroup(props: FieldAttributes<any> & { label: string }) {
  return (
    <div className="mb-3">
      <label
        htmlFor={props.name}
        className="block text-sm font-medium leading-6 mb-1"
      >
        {props.label}
      </label>
      <Field {...props} />
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
      <h2 className="text-2xl font-medium mb-2">Configure your Revnet</h2>
      <p className="text-zinc-600 text-sm mb-7">
        Your Revnet's settings influence how it will grow and evolve. Settings
        are locked, forever. Choose wisely!
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
          />
          days.
        </div>
      </div>
      <FieldGroup
        id="priceFloorTaxIntensity"
        name="priceFloorTaxIntensity"
        label="Price Floor Tax intensity"
      />
    </div>
  );
}

function BoostPage() {
  return (
    <div>
      <h2 className="text-2xl font-medium mb-2">Add a Boost</h2>
      <p className="text-zinc-600 text-sm mb-5">
        Send a portion of tokens purchases (a Boost) to a Boost Operator. It
        could be a core team, airdrop stockpile, staking rewards contract, or
        something else. Boosts are locked, forever.
      </p>

      <FieldGroup
        id="boostOperator"
        name="boostOperator"
        label="Boost Operator"
      />
      <FieldGroup
        id="boostOperator"
        name="boostOperator"
        label="Premint amount"
        className="mb-5"
      />

      <h3 className="text-lg font-medium mb-2">Boost</h3>

      {/* TODO eventually, multiple boosts */}
      <FieldGroup
        id="boostPercentage"
        name="boostPercentage"
        label="Percentage"
      />
      <FieldGroup id="boostDuration" name="boostDuration" label="Duration" />
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
}: {
  onFormChange: (data: typeof DEFAULT_FORM_DATA) => void;
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
              <Button variant="link" onClick={() => setPage(page - 1)}>
                <ArrowLeftIcon className="h-3 w-3 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}
            {nextPage ? (
              <Button onClick={() => setPage(page + 1)}>
                Next: {nextPage.name}
              </Button>
            ) : (
              <Button type="submit">Deploy Revnet</Button>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}

function parseDeployData(
  data: typeof DEFAULT_FORM_DATA
): UsePrepareContractWriteConfig<
  typeof basicRevnetDeployerABI,
  "deployRevnetFor"
>["args"] {
  return [
    (data.boostOperator as Address) ?? zeroAddress,
    {
      content: "",
      domain: 0n,
    },
    data.tokenName,
    data.tokenSymbol,
    {
      priceCeilingIncreasePercentage:
        DiscountRate.parse(data.priceCeilingIncreasePercentage, 9).val / 100n,
      priceCeilingIncreaseFrequency: BigInt(data.priceCeilingIncreaseFrequency), // seconds
      priceFloorTaxIntensity:
        RedemptionRate.parse(data.priceFloorTaxIntensity, 4).val / 100n, //
      initialIssuanceRate: ONE_ETHER,
      premintTokenAmount: 0n,
      boosts: [
        {
          rate: ReservedRate.parse(data.boostPercentage, 4).val / 100n,
          startsAtOrAfter: BigInt(data.boostDuration), // seconds
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

export default function Page() {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const { write } = useDeployRevnet(parseDeployData(formData));

  return (
    <Formik
      initialValues={DEFAULT_FORM_DATA}
      onSubmit={() => {
        write?.();
      }}
    >
      <CreatePage onFormChange={setFormData} />
    </Formik>
  );
}
