import { useState } from "react";
import {
  Form,
  Formik,
  useFormikContext,
  Field as FormikField,
  FieldArray,
} from "formik";
import { RevnetFormData, StageData } from "../types";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  defaultStageData } from "../constants";
import { Field, FieldGroup } from "./Fields";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@heroicons/react/24/outline";
import { commaNumber } from "@/lib/number";

function NotesSection({
  title = "[ ? ]",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
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
        <div className="font-sm">{title}</div>
        <span
          className={`transform transition-transform font-sm ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        >
          ▶
        </span>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="mt-2 pl-4 text-gray-600 text-md">{children}</div>
      )}
    </div>
  );
}

export function AddStageDialog({
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
  const { values: formikValues } = useFormikContext<RevnetFormData>();

  const [open, setOpen] = useState(false);
  const [initialIssuance, setInitialIssuance] = useState("10000");
  const nativeTokenSymbol = useNativeTokenSymbol();

  const revnetTokenSymbol =
    formikValues.tokenSymbol?.length > 0
      ? `$${formikValues.tokenSymbol}`
      : "tokens";

    const [value, setValue] = useState(20); // Default value matching your example

    // Discrete values matching your radio options
    const steps = [0, 20, 40, 60, 80];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseFloat(e.target.value);
      const closestHalfStep = Math.round(numValue * 20) / 20;
      console.log({closestHalfStep});
      setValue(closestHalfStep);
    };

    // Calculate example yield based on selected tax rate
    const calculateYield = (taxRate: number) => {
      console.log({taxRate});
      return (Number(((1-(taxRate/100))+((taxRate/100)/10))) * 10).toFixed(1);
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add stage</DialogTitle>
        </DialogHeader>
        <div className="mt-8">
          <Formik
            initialValues={{ ...(initialValues ?? defaultStageData) }}
            onSubmit={(newValues) => {
              onSave(newValues);
              setOpen(false);
            }}
          >
            {({ values }) => (
              <Form>
                <div className="pb-6">

                  <div>
                    <div className="block text-md font-semibold leading-6">
                      1. Issuance
                    </div>
                    <p className="text-md text-zinc-500 mt-3">
                      How many {revnetTokenSymbol} to issue when receiving 1 {nativeTokenSymbol}.
                    </p>
                    <div className="flex flex-wrap md:flex-nowrap gap-4 sm:gap-2 items-center text-md text-zinc-600 mt-2">
                      <div className="w-full sm:w-[200px] lg:w-[200px] xl:w-[200px]">
                        <FieldGroup
                          id="initialIssuance"
                          name="initialIssuance"
                          min="0"
                          type="number"
                          autoFocus={false}
                          value={initialIssuance}
                          onChange={(e: any) => {
                            setInitialIssuance(e.target.value);
                            values.initialIssuance = e.target.value;
                          }}
                          suffix={`${revnetTokenSymbol} / ${nativeTokenSymbol}`}
                        />
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <label
                          htmlFor="priceCeilingIncreasePercentage"
                          className="whitespace-nowrap"
                        >
                          cut by
                        </label>
                        <Field
                          id="priceCeilingIncreasePercentage"
                          name="priceCeilingIncreasePercentage"
                          type="number"
                          autoFocus={true}
                          min="0"
                          max="100"
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
                      </div>
                  <div>
                    <FieldArray
                      name="splits"
                      render={(arrayHelpers) => (
                        <div>
                          {values.splits.map((_, index) => (
                            <div
                              key={index}
                              className="flex gap-2 items-center text-md text-zinc-600 mt-4"
                            >
                              <label
                                className="whitespace-nowrap"
                                htmlFor={`splits.${index}.amount`}>
                                {index === 0 ? "Split" : "... and"}
                              </label>
                              <Field
                                id={`splits.${index}.percentage`}
                                name={`splits.${index}.percentage`}
                                type="number"
                                min="0"
                                max="100"
                                className="h-9"
                                width="w-28"
                                suffix="%"
                                required
                                placeholder="100"
                              />
                              <label htmlFor={`splits.${index}.defaultBeneficiary`}>
                                to
                              </label>
                              <Field
                                id={`splits.${index}.defaultBeneficiary`}
                                name={`splits.${index}.defaultBeneficiary`}
                                className="h-9"
                                placeholder="0x"
                                required
                                defaultValue={formikValues.stages[0]?.initialOperator || ""}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => arrayHelpers.remove(index)}
                                className="h-9 px-0 sm:px-3"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            onClick={() => arrayHelpers.push({ percentage: "", defaultBeneficiary: "" })}
                            className="h-7 mt-3 bg-zinc-100 border border-zinc-200 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                          >
                           add split +
                          </Button>
                        </div>
                      )}
                    />
                    {
                      values.splits.length > 0  && <div className="text-sm font-medium text-zinc-500 mt-4 border-l border-zinc-300 pl-2 py-1 px-1">
                        Total split limit of {values.splits.reduce((sum, split) => sum + (Number(split.percentage) || 0), 0)}%, payer always receives {100 - values.splits.reduce((sum, split) => sum + (Number(split.percentage) || 0), 0)}% of issuance.
                      </div>
                    }
                  {
                    values.splits.length > 0 && (
                  <div className="mt-4 flex gap-2 items-center text-md text-zinc-600 whitespace-nowrap">
                    <label
                    className="whitespace-nowrap"
                    htmlFor="priceCeilingIncreasePercentage">
                      ... operated by
                    </label>
                    <Field
                      id="initialOperator"
                      name="initialOperator"
                      className=""
                      placeholder={
                        stageIdx > 0
                          ? formikValues.stages[0].initialOperator
                          : "0x"
                      }
                      disabled={stageIdx > 0}
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
                  )}
                  </div>
                  <FieldArray
                    name="autoIssuance"
                    render={(arrayHelpers) => (
                      <div>
                        <p className="text-md text-zinc-500 mt-5">
                          Optionally, auto-issue {revnetTokenSymbol} when the stage starts.
                        </p>
                        {values.autoIssuance?.map((_, index) => (
                          <div
                            key={index}
                            className="flex gap-2 items-center text-md text-zinc-600 mt-4"
                          >
                            <label htmlFor={`autoIssuance.${index}.amount`}>
                              {index === 0 ? "Issue" : "...and"}
                            </label>
                            <Field
                              id={`autoIssuance.${index}.amount`}
                              name={`autoIssuance.${index}.amount`}
                              type="number"
                              min="0"
                              className="h-9"
                              suffix={`${revnetTokenSymbol}`}
                              required
                              // width="w-72" // mobile padding issue
                            />
                            <label
                              htmlFor={`autoIssuance.${index}.beneficiary`}
                            >
                              to
                            </label>
                            <Field
                              id={`autoIssuance.${index}.beneficiary`}
                              name={`autoIssuance.${index}.beneficiary`}
                              className="h-9"
                              placeholder="0x"
                              required
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => arrayHelpers.remove(index)}
                              className="h-9 px-0 sm:px-3"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          onClick={() => {
                            console.log(values);
                            arrayHelpers.push({ amount: "", beneficiary: "" });
                          }}
                          className="h-7 mt-3 bg-zinc-100 border border-zinc-200 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                        >
                          add auto issuance +
                        </Button>
                        { values.autoIssuance.length > 0 && <div className="text-sm font-medium text-zinc-500 mt-4 border-l border-zinc-300 pl-2 py-1 px-1">
                          Total auto issuance of {" "}
                          {commaNumber(values.autoIssuance?.reduce((sum, issuance) => sum + (Number(issuance.amount) || 0), 0))}
                          {" "}{revnetTokenSymbol}.
                        </div>
                        }
                      </div>
                    )}
                  />
                  <NotesSection>
                    <div className="text-zinc-600 text-md mt-4 italic">
                      <ul className="list-disc list-inside space-y-2">
                        <li className="flex">
                          <span className="mr-2">•</span>
                          Cutting issuance by 50% means to double the price – a
                          halvening effect.
                        </li>
                        <li className="flex">
                          <span className="mr-2">•</span>
                          If there's a market for {revnetTokenSymbol} /{" "}
                          {nativeTokenSymbol} offering a better price, all{" "}
                          {nativeTokenSymbol} paid in will be used to buyback
                          instead of feeding the revnet. Uniswap is used as
                          the market.
                        </li>
                        <li className="flex">
                          <span className="mr-2">•</span>
                          Splits apply to both issuance and buybacks.
                        </li>
                        <li className="flex">
                          <span className="mr-2">•</span>
                          <span>
                            You can write and deploy a custom split hook that automatically receives and processes the split {revnetTokenSymbol}. See <a className="inline underline" target="_blank" href="https://docs.juicebox.money/v4/build/hooks/split-hook/"> the docs.</a>
                          </span>
                        </li>
                        <li className="flex">
                          <span className="mr-2">•</span>
                          If there are splits, the operator can change the distribution of the split
                          limit to new destinations at any time.
                        </li>
                        <li className="flex">
                          <span className="mr-2">•</span>
                          The operator can be a multisig, a DAO, an LLC, a core
                          team, an airdrop stockpile, a staking rewards
                          contract, or some other address.
                        </li>
                        <li className="flex">
                          <span className="mr-2">•</span>
                          The operator is set once and is not bound by stages.
                          The operator can hand off this responsibility to
                          another address at any time, or relinquish it
                          altogether.
                        </li>
                      </ul>
                    </div>
                  </NotesSection>
                  </div>
                </div>

                <div className="pb-10">
                  <div
                    id="priceFloorTaxIntensity-group"
                    className="block text-md font-semibold leading-6"
                  >
                    2. Cash out tax
                  </div>
                  <p className="text-md text-zinc-500 mt-3">
                    The only way for anyone to access {revnetTokenSymbol} revenue is by cashing out or
                    taking out a loan against their {revnetTokenSymbol}.
                    A tax can be added that makes cashing
                    out and taking out loans more expensive, while rewarding{" "}
                    {revnetTokenSymbol} holders who stick around as others cash
                    out.
                  </p>
                  <div className="space-y-2 mt-6">
                    <div className="flex justify-between relative w-full">
                      {steps.map((step) => (
                        <span key={Number(step) / 100} className={ Number(step) === 0 ? "text-sm pl-1" : Number(step) === 20 ? "text-sm pl-4" : "text-sm pl-2"}>
                          {Number(step) / 100}
                        </span>
                      ))}
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={80}
                      step={10}
                      name="priceFloorTaxIntensity"
                      value={value}
                      onChange={handleChange}
                      className="w-full h-2 bg-gray-200 appearance-none cursor-pointer accent-teal-500"
                      aria-label="Exit tax percentage"
                    />
                  </div>
                  <div className="text-sm font-medium text-zinc-500 mt-4 border-l border-zinc-300 pl-2 py-1 px-1">
                    Cashing out 10% of {revnetTokenSymbol} gets {calculateYield(value)}% of the revnet's {nativeTokenSymbol}.
                  </div>
                  <NotesSection>
                    <div className="text-zinc-600 text-md mt-4 italic">
                      <ul className="list-disc list-inside space-y-2">
                        <li className="flex">
                          <span className="mr-2">•</span>
                          The higher the tax, the less that can be accessed by
                          cashing out or taking out a loan at any given time,
                          and the more that is left to share between remaining
                          holders who cash out later.
                        </li>

                        <li className="flex">
                          <span className="mr-2">•</span>
                            Loans are an automated source of revenue for {revnetTokenSymbol}. By making loans more expensive, a higher cash out tax reduces potential loan revenue.
                        </li>
                        <li className="flex">
                          <span className="mr-2">•</span>
                          Given 100 {nativeTokenSymbol} in the revnet, 100 total
                          supply of {revnetTokenSymbol}, and 10{" "}
                          {revnetTokenSymbol} being cashed out, a tax rate of 0
                          would yield a cash out value of 10 {nativeTokenSymbol}
                          , 0.2 would yield 8.2 {nativeTokenSymbol}, 0.5 would
                          yield 5.5 {nativeTokenSymbol}, and 0.8 would yield 2.8{" "}
                          {nativeTokenSymbol}.
                        </li>
                        <li className="flex">
                          <span className="mr-2">•</span>
                          The formula for the amount of {nativeTokenSymbol}{" "}
                          received when cashing out is `(ax/s) * ((1-r) + xr/s)`
                          where: `r` is the cash out tax rate, `a` is the amount
                          in the revnet being accessed, `s` is the current token
                          supply of {revnetTokenSymbol}, `x` is the amount of{" "}
                          {revnetTokenSymbol} being cashed out.
                        </li>
                      </ul>
                    </div>
                  </NotesSection>
                </div>
                {stageIdx > 0 && (
                  <div className="pb-7">
                    <FieldGroup
                      id="boostDuration"
                      name="boostDuration"
                      label="4. Start Time"
                      suffix="days"
                      min="0"
                      type="number"
                      description="How many days after the previous stage should this stage start?"
                      width="w-32"
                    />
                    <NotesSection>
                      <ul className="list-disc list-inside">
                        <li className="flex">
                          <span className="mr-2">•</span>
                          <div>
                            Days must be a multiple of this stage's issuance cut
                            rate.
                          </div>
                        </li>
                      </ul>
                    </NotesSection>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    Add stage
                  </Button>
                </DialogFooter>
              </Form>
            )}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  );
}
