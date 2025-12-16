import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { commaNumber } from "@/lib/number";
import { TrashIcon } from "@heroicons/react/24/outline";
import { FieldArray, Form, Formik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { useState } from "react";
import { defaultStageData } from "../constants";
import { getResolvedIssuance } from "../helpers/calculatePickupIssuance";
import { formatFormErrors } from "../helpers/formatFormErrors";
import { stageSchema } from "../helpers/stageSchema";
import { StageData } from "../types";
import { Field } from "./Fields";
import { PickupFromPreviousStage } from "./PickupFromPreviousStage";
import { StartTimeField } from "./StartTimeField";
import { useCreateForm } from "./useCreateForm";

export function NotesSection({
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
          className={`transform transition-transform font-sm ${isOpen ? "rotate-90" : "rotate-0"}`}
        >
          ▶
        </span>
      </button>

      {/* Dropdown Content */}
      {isOpen && <div className="mt-2 pl-4 text-gray-600 text-md">{children}</div>}
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
  const {
    values: { reserveAsset, stages },
    revnetTokenSymbol,
  } = useCreateForm();

  const [open, setOpen] = useState(false);
  // const nativeTokenSymbol = useNativeTokenSymbol();

  // Move enableCut state to top level
  const [enableCut, setEnableCut] = useState(
    Boolean(
      initialValues &&
        (Number(initialValues.priceCeilingIncreasePercentage) !== 0 ||
          Number(initialValues.priceCeilingIncreaseFrequency) !== 0),
    ),
  );
  const [uiCutPercentage, setUiCutPercentage] = useState(
    initialValues && Number(initialValues.priceCeilingIncreasePercentage) !== 0
      ? Number(initialValues.priceCeilingIncreasePercentage)
      : 10,
  );
  const [uiCutFrequency, setUiCutFrequency] = useState(
    initialValues && Number(initialValues.priceCeilingIncreaseFrequency) !== 0
      ? Number(initialValues.priceCeilingIncreaseFrequency)
      : 30,
  );
  const [hasUserSetCut, setHasUserSetCut] = useState(false);

  // Discrete values matching your radio options
  const steps = ["no tax", "light", "medium", "heavy", "extreme"];

  // Calculate example yield based on selected tax rate
  const calculateYield = (taxRate: number) => {
    return (Number(1 - taxRate / 100 + taxRate / 100 / 10) * 10).toFixed(1);
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
            initialValues={initialValues ?? getDefaultStageData(stageIdx, stages)}
            validate={withZodSchema(stageSchema) as any}
            onSubmit={(newValues, { setSubmitting }) => {
              try {
                setSubmitting(true);
                // Set Formik values from UI state
                if (enableCut) {
                  newValues.priceCeilingIncreasePercentage = String(uiCutPercentage);
                  newValues.priceCeilingIncreaseFrequency = String(uiCutFrequency);
                } else {
                  newValues.priceCeilingIncreasePercentage = "0";
                  newValues.priceCeilingIncreaseFrequency = "0";
                }

                onSave(newValues);
                setOpen(false);
              } catch (e: any) {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: e.message || "Could not save stage",
                });
                console.error(e);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, isValid, errors, setFieldValue }) => {
              // Handler for checkbox toggle
              const handleCutToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
                const checked = e.target.checked;
                setEnableCut(checked);
                if (checked) {
                  if (!hasUserSetCut) {
                    setUiCutPercentage(10);
                    setUiCutFrequency(30);
                  }
                  // else: keep last user-entered values
                }
                // Do not reset values on uncheck, just hide the fields
              };

              return (
                <Form>
                  <div className="pb-10">
                    <div>
                      <div className="block text-md font-semibold leading-6">
                        1. {revnetTokenSymbol} issuance
                      </div>
                      <p className="text-md text-zinc-500 mt-3">
                        How many {revnetTokenSymbol} to issue when receiving {reserveAsset}.
                      </p>

                      <PickupFromPreviousStage
                        stageIdx={stageIdx}
                        values={values}
                        setFieldValue={setFieldValue}
                      />

                      <div className="flex flex-wrap md:flex-nowrap gap-2 sm:gap-2 items-center text-md text-zinc-600 mt-2">
                        {/* Styled number input with suffix for initialIssuance */}
                        <div className="relative w-full sm:w-[210px] lg:w-[210px] xl:w-[210px]">
                          <Field
                            id="initialIssuance"
                            name="initialIssuance"
                            min="0"
                            step="any"
                            type="number"
                            className={`h-9 w-full pr-24 px-3 text-md ${
                              values.pickUpFromPrevious
                                ? "bg-gray-50 text-gray-600 cursor-not-allowed"
                                : ""
                            }`}
                            readOnly={values.pickUpFromPrevious}
                            value={
                              values.pickUpFromPrevious
                                ? getResolvedIssuance(values, stageIdx, stages)
                                : values.initialIssuance
                            }
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-md pointer-events-none">
                            {revnetTokenSymbol} / {reserveAsset == "USDC" ? "USD" : reserveAsset}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          {!enableCut ? (
                            <>
                              <label
                                htmlFor="enableCut"
                                className="whitespace-nowrap italic text-zinc-400"
                              >
                                add automatic cuts?
                              </label>
                              <input
                                type="checkbox"
                                id="enableCut"
                                checked={enableCut}
                                onChange={handleCutToggle}
                              />
                            </>
                          ) : (
                            <>
                              <label htmlFor="uiCutPercentage" className="whitespace-nowrap">
                                cut
                              </label>
                              <input
                                type="checkbox"
                                id="enableCut"
                                checked={enableCut}
                                onChange={handleCutToggle}
                              />
                              <div className="relative">
                                <input
                                  id="uiCutPercentage"
                                  type="number"
                                  min="1"
                                  max="100"
                                  className="h-9 w-16 border-zinc-200 pr-6 pl-2"
                                  value={String(uiCutPercentage)}
                                  onChange={(e) => {
                                    setUiCutPercentage(Number(e.target.value));
                                    setHasUserSetCut(true);
                                  }}
                                  required
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                                  %
                                </span>
                              </div>
                              <label htmlFor="uiCutFrequency">every</label>
                              <div className="relative">
                                <input
                                  id="uiCutFrequency"
                                  type="number"
                                  min="1"
                                  className="h-9 border-zinc-200 pr-10 pl-2 w-24"
                                  value={String(uiCutFrequency)}
                                  onChange={(e) => {
                                    setUiCutFrequency(Number(e.target.value));
                                    setHasUserSetCut(true);
                                  }}
                                  required
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                                  days
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <FieldArray
                          name="splits"
                          render={(arrayHelpers) => (
                            <div>
                              {values.splits.map((split, index) => (
                                <div
                                  key={`${split.percentage}-${split.defaultBeneficiary}-${index}`}
                                  className="flex gap-2 items-center text-md text-zinc-600 mt-4"
                                >
                                  <label
                                    className="whitespace-nowrap"
                                    htmlFor={`splits.${index}.amount`}
                                  >
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
                                  <label htmlFor={`splits.${index}.defaultBeneficiary`}>to</label>
                                  <Field
                                    id={`splits.${index}.defaultBeneficiary`}
                                    name={`splits.${index}.defaultBeneficiary`}
                                    className="h-9"
                                    placeholder="0x"
                                    required
                                    defaultValue={stages[0]?.initialOperator || ""}
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
                                onClick={() =>
                                  arrayHelpers.push({
                                    percentage: "",
                                    defaultBeneficiary: "",
                                  })
                                }
                                className="h-7 mt-3 bg-zinc-100 border border-zinc-200 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                              >
                                add split +
                              </Button>
                            </div>
                          )}
                        />
                        {values.splits.length > 0 && (
                          <div className="text-sm font-medium text-zinc-500 mt-4 border-l border-zinc-300 pl-2 py-1 px-1">
                            Total split limit of{" "}
                            {values.splits.reduce(
                              (sum, split) => sum + (Number(split.percentage) || 0),
                              0,
                            )}
                            %, payer always receives{" "}
                            {100 -
                              values.splits.reduce(
                                (sum, split) => sum + (Number(split.percentage) || 0),
                                0,
                              )}
                            % of issuance.
                          </div>
                        )}
                        {values.splits.length == 0 && (
                          <div className="text-sm font-medium text-zinc-500 mt-4 border-l border-zinc-300 pl-2 py-1 px-1">
                            Without splits, the payer always receives 100% of issuance.
                          </div>
                        )}
                        {values.splits.length > 0 && (
                          <div className="mt-4 flex gap-2 items-center text-md text-zinc-600 whitespace-nowrap">
                            <label
                              className="whitespace-nowrap"
                              htmlFor="priceCeilingIncreasePercentage"
                            >
                              ... operated by
                            </label>
                            <Field
                              id="initialOperator"
                              name="initialOperator"
                              className=""
                              placeholder={stageIdx > 0 ? stages[0].initialOperator : "0x"}
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
                      <NotesSection>
                        <div className="text-zinc-600 text-md mt-4 italic">
                          <ul className="list-disc list-inside space-y-2">
                            <li className="flex">
                              <span className="mr-2">•</span>
                              Cutting issuance by 50% means to double the price – a halvening
                              effect.
                            </li>
                            <li className="flex">
                              <span className="mr-2">•</span>
                              If there's a market for {revnetTokenSymbol} / {reserveAsset} offering
                              a better price, all {reserveAsset} paid in will be used to buyback
                              instead of feeding the revnet. Uniswap is used as the market.
                            </li>
                            <li className="flex">
                              <span className="mr-2">•</span>
                              Splits apply to both issuance and buybacks.
                            </li>
                            <li className="flex">
                              <span className="mr-2">•</span>
                              <span>
                                You can write and deploy a custom split hook that automatically
                                receives and processes the split {revnetTokenSymbol}. See{" "}
                                <a
                                  className="inline underline"
                                  target="_blank"
                                  href="https://docs.juicebox.money/v4/build/hooks/split-hook/"
                                >
                                  {" "}
                                  the docs.
                                </a>
                              </span>
                            </li>
                            <li className="flex">
                              <span className="mr-2">•</span>
                              If there are splits, the operator can change the distribution of the
                              split limit to new destinations at any time.
                            </li>
                            <li className="flex">
                              <span className="mr-2">•</span>
                              The operator can be a multisig, a DAO, an LLC, a core team, an airdrop
                              stockpile, a staking rewards contract, or some other address.
                            </li>
                            <li className="flex">
                              <span className="mr-2">•</span>
                              The operator is set once and is not bound by stages. The operator can
                              hand off this responsibility to another address at any time, or
                              relinquish it altogether.
                            </li>
                          </ul>
                        </div>
                      </NotesSection>
                      <FieldArray
                        name="autoIssuance"
                        render={(arrayHelpers) => (
                          <div>
                            <p className="text-md text-zinc-500 mt-10">
                              Optionally, auto-issue {revnetTokenSymbol} when the stage starts.
                            </p>
                            {values.autoIssuance?.map((autoissuance, index) => (
                              <div
                                key={`${autoissuance.amount}-${autoissuance.beneficiary}-${index}`}
                                className="flex gap-2 items-center text-md text-zinc-600 mt-4"
                              >
                                <label
                                  className="whitespace-nowrap"
                                  htmlFor={`autoIssuance.${index}.amount`}
                                >
                                  {index === 0 ? "Issue" : "... and"}
                                </label>
                                <div className="relative">
                                  <Field
                                    id={`autoIssuance.${index}.amount`}
                                    name={`autoIssuance.${index}.amount`}
                                    type="number"
                                    min="0"
                                    step="any"
                                    className="h-9 w-40 pr-16 pl-2"
                                    required
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                                    {revnetTokenSymbol}
                                  </span>
                                </div>
                                <label htmlFor={`autoIssuance.${index}.beneficiary`}>to</label>
                                <Field
                                  id={`autoIssuance.${index}.beneficiary`}
                                  name={`autoIssuance.${index}.beneficiary`}
                                  className="h-9 w-full"
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
                                arrayHelpers.push({
                                  amount: "",
                                  beneficiary: "",
                                });
                              }}
                              className="h-7 mt-3 bg-zinc-100 border border-zinc-200 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                            >
                              add auto issuance +
                            </Button>
                            {values.autoIssuance.length > 0 && (
                              <div className="text-sm font-medium text-zinc-500 mt-4 border-l border-zinc-300 pl-2 py-1 px-1">
                                Total auto issuance of{" "}
                                {commaNumber(
                                  values.autoIssuance?.reduce(
                                    (sum, issuance) => sum + (Number(issuance.amount) || 0),
                                    0,
                                  ),
                                )}{" "}
                                {revnetTokenSymbol}.
                              </div>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div className="pb-10">
                    <div
                      id="priceFloorTaxIntensity-group"
                      className="block text-md font-semibold leading-6"
                    >
                      2. {revnetTokenSymbol} cash outs
                    </div>
                    <p className="text-md text-zinc-500 mt-3">
                      The only way for anyone to access the {reserveAsset} used to issue{" "}
                      {revnetTokenSymbol} is by cashing out or taking out a loan from the revnet
                      using their {revnetTokenSymbol}.
                    </p>
                    <p className="text-md text-zinc-500 mt-3">
                      A tax can be added that makes cashing out and loans more expensive, while
                      rewarding {revnetTokenSymbol} holders who stick around as others cash out.
                    </p>
                    <p className="text-md text-zinc-500 mt-3">
                      A light tax is recommended to add an incentive while maintaining liquidity.
                    </p>
                    <div className="space-y-2 mt-6">
                      <div className="flex justify-between relative w-full">
                        {steps.map((step) => (
                          <span
                            key={`${step}`}
                            className={
                              Number(step) === 0
                                ? "text-sm"
                                : Number(step) === 20
                                  ? "text-sm"
                                  : "text-sm"
                            }
                          >
                            {/* {Number(step) / 100} */}
                            {step}
                          </span>
                        ))}
                      </div>
                      {/* Styled slider for priceFloorTaxIntensity */}
                      <div className="flex flex-col justify-center w-full">
                        <Field
                          as="input"
                          type="range"
                          min={0}
                          max={80}
                          step={5}
                          name="priceFloorTaxIntensity"
                          className="w-full h-2 bg-gray-200 appearance-none cursor-pointer accent-teal-500 px-0 rounded-full"
                          aria-label="Exit tax percentage"
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-zinc-500 mt-4 border-l border-zinc-300 pl-2 py-1 px-1">
                      Cashing out 10% of {revnetTokenSymbol} gets{" "}
                      {calculateYield(Number(values.priceFloorTaxIntensity))}% of the revnet's{" "}
                      {reserveAsset}.
                    </div>
                    <NotesSection>
                      <div className="text-zinc-600 text-md mt-4 italic">
                        <ul className="list-disc list-inside space-y-2">
                          <li className="flex">
                            <span className="mr-2">•</span>
                            The heavier the tax, the less that can be accessed by cashing out or
                            taking out a loan at any given time, and the more that is left to share
                            between remaining holders who cash out later.
                          </li>

                          <li className="flex">
                            <span className="mr-2">•</span>
                            Loans are an automated source of revenue for {revnetTokenSymbol}. By
                            making loans more expensive, a heavier cash out tax reduces potential
                            loan revenue.
                          </li>
                          <li className="flex">
                            <span className="mr-2">•</span>
                            Given 100 {reserveAsset} in the revnet, 100 total supply of{" "}
                            {revnetTokenSymbol}, and 10 {revnetTokenSymbol} being cashed out, a tax
                            rate of 0 would yield a cash out value of 10 {reserveAsset}, 0.2 would
                            yield 8.2 {reserveAsset}, 0.5 would yield 5.5 {reserveAsset}, and 0.8
                            would yield 2.8 {reserveAsset}.
                          </li>
                          <li className="flex">
                            <span className="mr-2">•</span>
                            The formula for the amount of {reserveAsset} received when cashing out
                            is `(ax/s) * ((1-r) + xr/s)` where: `r` is the cash out tax rate, `a` is
                            the amount in the revnet being accessed, `s` is the current token supply
                            of {revnetTokenSymbol}, `x` is the amount of {revnetTokenSymbol} being
                            cashed out.
                          </li>
                        </ul>
                      </div>
                    </NotesSection>
                  </div>
                  <StartTimeField stageIdx={stageIdx} stages={stages} />

                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-teal-500 hover:bg-teal-600"
                      onClick={() => {
                        if (!isValid) {
                          toast({
                            variant: "destructive",
                            title: "Please fix the errors and try again.",
                            description: formatFormErrors(errors),
                          });
                          console.error(errors);
                        }
                      }}
                    >
                      Save stage
                    </Button>
                  </DialogFooter>
                </Form>
              );
            }}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultStageData(stageIdx: number, stages: StageData[]) {
  if (stageIdx === 0) return defaultStageData;

  const previousStage = stages[stageIdx - 1];
  const previousStageHasCuts = Number(previousStage.priceCeilingIncreaseFrequency) > 0;

  if (previousStageHasCuts) {
    const daysPerCut = Number(previousStage.priceCeilingIncreaseFrequency);
    return {
      ...defaultStageData,
      stageStartCuts: "3",
      stageStart: String(3 * daysPerCut), // Default 3 cuts worth of days
    };
  }

  return defaultStageData;
}
