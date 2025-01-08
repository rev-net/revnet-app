import { useState } from "react";
import {
  Form,
  Formik,
  useFormikContext,
  Field as FormikField,
  FieldArray
} from "formik";
import { RevnetFormData, StageData } from "../types";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  defaultStageData,
  EXIT_TAX_HIGH,
  EXIT_TAX_LOW,
  EXIT_TAX_MID,
  EXIT_TAX_NONE
} from "../constants";
import { Field, FieldGroup } from "./Fields";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@heroicons/react/24/outline";

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
                            Decreasing 50% means to double the price – a
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
                        </ul>
                      </div>
                    </NotesSection>
                  </div>
                </div>

                <div className="pb-10">
                  <div className="block text-md font-semibold leading-6">
                    2. Split
                  </div>
                  <p className="text-zinc-600 text-md pb-3 mt-1">
                    Split a portion of new token issuance and buybacks to an
                    operator.
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
                    <label htmlFor="priceCeilingIncreasePercentage">
                      ... operated by
                    </label>
                    <Field
                      id="initialOperator"
                      name="initialOperator"
                      className=""
                      placeholder={
                        stageIdx > 0 ? values.stages[0].initialOperator : "0x"
                      }
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
                          The operator can change the distribution of the split
                          to new destinations at any time.
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

                <div className="pb-8">
                  <FieldArray
                    name={`stages.${stageIdx}.autoIssuance`}
                    render={(arrayHelpers) => (
                      <div>
                        <div className="block text-md font-semibold leading-6">
                          3. Auto issuance
                        </div>
                        <p className="text-md text-zinc-500 mt-3">
                          Mint {revnetTokenSymbol} to specific addresses when the
                          stage starts.
                        </p>
                        {values.stages?.[stageIdx]?.autoIssuance?.map((item, index) => (
                          <div key={index} className="flex gap-2 items-center text-md text-zinc-600 mt-4">
                            <label htmlFor={`autoIssuance.${index}.amount`}>Mint</label>
                            <Field
                              id={`autoIssuance.${index}.amount`}
                              name={`autoIssuance.${index}.amount`}
                              type="number"
                              min="0"
                              className="h-9"
                              suffix={`${revnetTokenSymbol}`}
                              required
                            />
                            <label htmlFor={`autoIssuance.${index}.beneficiary`}>to</label>
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
                              className="h-9"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          onClick={() => {
                            console.log(values)
                            arrayHelpers.push({ amount: "", beneficiary: "" })
                          }}
                          className="h-9"
                        >
                          +
                        </Button>
                      </div>
                    )}
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
                    All {revnetTokenSymbol} holders can access revenue by
                    cashing out or taking out a loan against their{" "}
                    {revnetTokenSymbol}. A tax can be added that makes cashing
                    out and taking out loans more expensive, while rewarding{" "}
                    {revnetTokenSymbol} holders who stick around as others cash
                    out.
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
                          The higher the tax, the less that can be accessed by
                          cashing out or taking out a loan at any given time,
                          and the more that is left to share between remaining
                          holders who cash out later.
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
                <div className="pb-7">
                  <FieldGroup
                    id="boostDuration"
                    name="boostDuration"
                    label="5. Duration"
                    suffix="days"
                    min="0"
                    type="number"
                    description="How long will this stage last? Leave blank to make this the last stage that lasts forever."
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

                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    Save stage
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
