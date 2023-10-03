"use client";

import { Button } from "@/components/ui/button";
import { basicRevnetDeployerABI } from "@/lib/revnet/hooks/contract";
import { useDeployRevnet } from "@/lib/revnet/hooks/useDeployRevnet";
import { cn } from "@/lib/utils";
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
      className="flex h-10 w-full rounded-sm border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
    />
  );
}

function DetailsPage() {
  return (
    <div>
      <label htmlFor="name">Name</label>
      <Field id="name" name="name" />

      <label htmlFor="tagline">Tagline</label>
      <Field id="tagline" name="tagline" />
    </div>
  );
}

function TokensPage() {
  return (
    <div>
      <label htmlFor="tokenName">Token name</label>
      <Field id="tokenName" name="tokenName" />

      <label htmlFor="tokenSymbol">Token symbol</label>
      <Field id="tokenSymbol" name="tokenSymbol" />
    </div>
  );
}

function ConfigPage() {
  return (
    <div>
      <div className="mb-4">
        <div>Price ceiling</div>
        <label htmlFor="priceCeilingIncreasePercentage">
          Increase token price by
        </label>
        <Field
          id="priceCeilingIncreasePercentage"
          name="priceCeilingIncreasePercentage"
        />
        <label htmlFor="priceCeilingIncreaseFrequency">Every</label>
        <Field
          id="priceCeilingIncreaseFrequency"
          name="priceCeilingIncreaseFrequency"
        />
      </div>
      <div>
        <div>Price floor</div>
        <label htmlFor="priceFloorTaxIntensity">Intensity</label>
        <Field id="priceFloorTaxIntensity" name="priceFloorTaxIntensity" />
      </div>
    </div>
  );
}

function BoostPage() {
  return (
    <div>
      <label htmlFor="boostOperator">Boost operator</label>
      <Field id="boostOperator" name="boostOperator" />

      {/* TODO eventually, multiple boosts */}
      <label htmlFor="boostPercentage">Boost amount</label>
      <Field id="boostPercentage" name="boostPercentage" />

      <label htmlFor="boostDuration">Until</label>
      <Field id="boostDuration" name="boostDuration" />
    </div>
  );
}

function ReviewPage() {
  return (
    <div>
      <h2>Review and deploy</h2>

      <Button type="submit">Deploy Revnet</Button>
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

  const { values } = useFormikContext<typeof DEFAULT_FORM_DATA>();
  useEffect(() => {
    onFormChange(values);
  });

  return (
    <div className="container">
      <h1>Create a Revnet</h1>

      <CreateNav currentPage={page} onChange={setPage} />

      <Form>
        <CurrentPage />
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
    data.boostOperator as Address,
    {
      content: "",
      domain: 0n,
    },
    data.tokenName,
    data.tokenSymbol,
    {
      priceCeilingIncreasePercentage: DiscountRate.parse(
        data.priceCeilingIncreasePercentage,
        9
      ).val,
      priceCeilingIncreaseFrequency: BigInt(data.priceCeilingIncreaseFrequency), // seconds
      priceFloorTaxIntensity: RedemptionRate.parse(
        data.priceFloorTaxIntensity,
        4
      ).val, //
      initialIssuanceRate: ONE_ETHER,
      premintTokenAmount: 0n,
      boosts: [
        {
          rate: ReservedRate.parse(data.boostPercentage, 4).val,
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
