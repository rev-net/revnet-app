"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FieldAttributes, Form, Formik, Field as FormikField } from "formik";
import { useState } from "react";

const DEFAULT_FORM_DATA = {
  name: "",
  entryTax: 0,
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

      <label htmlFor="tokenSymbol">Token logo</label>
    </div>
  );
}

function ConfigPage() {
  return (
    <div>
      <label htmlFor="entryTax">Entry tax</label>
      <Field id="entryTax" name="entryTax" />
    </div>
  );
}

function BoostPage() {
  return (
    <div>
      <label htmlFor="boostOperator">Boost operator</label>
      <Field id="boostOperator" name="boostOperator" />

      {/* TODO eventually, multiple boostss */}
      <label htmlFor="boostPercentage">Boost</label>
      <Field id="boostPercentage" name="boostPercentage" />

      <label htmlFor="boostDuration">Until</label>
      <Field id="boostDuration" name="boostDuration" />
    </div>
  );
}

function ReviewPage() {
  return (
    <div>
      Review
      <Button type="submit">Deploy</Button>
    </div>
  );
}

const pages = [
  { name: "Details", component: DetailsPage },
  { name: "Token", component: TokensPage },
  { name: "Configure", component: ConfigPage },ƒ
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

function CreatePage() {
  const [page, setPage] = useState(0);
  const CurrentPage = pages[page].component;

  return (
    <div className="container">
      <h1>Create a Revnet</h1>

      <CreateNav currentPage={page} onChange={setPage} />
      <Formik
        initialValues={DEFAULT_FORM_DATA}
        onSubmit={(values) => {
          alert(JSON.stringify(values, null, 2));
        }}
      >
        <Form>
          <CurrentPage />
        </Form>
      </Formik>
    </div>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  return <CreatePage />;
}
