"use client";

import { Field } from "@/app/create/form/Fields";
import { ChainLogo } from "@/components/ChainLogo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { TrashIcon } from "@heroicons/react/24/outline";
import { FieldArray, Form, Formik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { JB_CHAINS, JBChainId, SPLITS_TOTAL_PERCENT } from "juice-sdk-core";
import { useEffect, useMemo, useState } from "react";
import { changeSplitsSchema } from "./changeSplitsSchema";
import { useChainSplits } from "./hooks/useChainSplits";
import { useSetSplitGroups } from "./hooks/useSetSplitGroups";

export type ChainFormData = {
  chainId: JBChainId;
  projectId: bigint;
  rulesetId: bigint;
  splits: Array<{ percentage: string; beneficiary: string }>;
  selected: boolean;
};

type FormData = {
  chains: ChainFormData[];
};

type Props = {
  stageId: number;
  initialChainId: JBChainId;
};

export function ChangeSplitRecipientsDialog(props: Props) {
  const { stageId, initialChainId } = props;
  const [open, setOpen] = useState(false);

  const { hasPermission } = useUserPermissions();
  const { chainSplits, refetch } = useChainSplits(stageId);

  const { submitSplits, isSubmitting, isPending, isTxLoading } = useSetSplitGroups({
    onSuccess: (txHash) => {
      console.debug(`Transaction confirmed: ${txHash}`);
      toast({ title: "Splits updated successfully" });
      setOpen(false);
      setTimeout(refetch, 4000); // Give it some time to index data
    },
  });

  useEffect(() => {
    if (open) refetch();
  }, [open, refetch]);

  const initialValues = useMemo((): FormData => {
    const chains = chainSplits.map(
      (chainData): ChainFormData => ({
        chainId: chainData.chainId,
        projectId: BigInt(chainData.projectId),
        rulesetId: BigInt(chainData.rulesetId),
        selected: chainData.chainId === initialChainId,
        splits: chainData.splits.map((split) => ({
          percentage: ((Number(split.percent) / SPLITS_TOTAL_PERCENT) * 100).toFixed(2),
          beneficiary: split.beneficiary,
        })),
      }),
    );

    return { chains };
  }, [chainSplits, initialChainId]);

  const handleSubmit = async (values: FormData) => {
    const selectedChains = values.chains.filter((c) => c.selected);
    if (selectedChains.length === 0) {
      console.error("No chains selected");
      return;
    }
    await submitSplits(selectedChains);
  };

  if (!hasPermission("SET_SPLIT_GROUPS")) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Change split recipients</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change split recipients</DialogTitle>
          <p className="text-sm text-zinc-500 mt-2">Stage {stageId + 1}</p>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validate={withZodSchema(changeSplitsSchema) as any}
          onSubmit={handleSubmit}
          enableReinitialize={!isSubmitting && !isPending && !isTxLoading}
        >
          {({ values, setFieldValue, isValid }) => (
            <Form>
              <div className="space-y-6 mt-4">
                {values.chains.length > 1 && (
                  <div>
                    <div className="text-sm font-semibold mb-2">Select chains to update:</div>
                    <div className="flex flex-wrap gap-6">
                      {values.chains.map((chain, chainIdx) => (
                        <label key={chain.chainId} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={chain.selected}
                            onChange={(e) =>
                              setFieldValue(`chains.${chainIdx}.selected`, e.target.checked)
                            }
                          />
                          {JB_CHAINS[chain.chainId].name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <FieldArray name="chains">
                  {() => (
                    <div className="space-y-8">
                      {values.chains.map((chain, chainIdx) => {
                        if (!chain.selected) return null;

                        const totalPercentage = chain.splits.reduce(
                          (sum, s) => sum + (Number(s.percentage) || 0),
                          0,
                        );

                        return (
                          <div key={chain.chainId} className="border border-zinc-200 p-4 rounded">
                            <div className="flex items-center gap-2 mb-4">
                              <ChainLogo chainId={chain.chainId} width={24} height={24} />
                              <h3 className="text-md font-semibold">
                                {JB_CHAINS[chain.chainId].name}
                              </h3>
                            </div>

                            <FieldArray name={`chains.${chainIdx}.splits`}>
                              {(arrayHelpers) => (
                                <div className="space-y-3">
                                  {chain.splits.map((split, splitIdx) => (
                                    <div key={splitIdx} className="flex gap-2 items-start">
                                      <div className="flex-1">
                                        <label className="text-sm text-zinc-600 mb-1 block">
                                          {splitIdx === 0 ? "Split" : "... and"}
                                        </label>
                                        <div className="flex gap-2 items-start">
                                          <Field
                                            name={`chains.${chainIdx}.splits.${splitIdx}.percentage`}
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className="h-9"
                                            width="w-28"
                                            suffix="%"
                                            required
                                          />
                                          <span className="flex items-center text-zinc-600 mt-2">
                                            to
                                          </span>
                                          <Field
                                            name={`chains.${chainIdx}.splits.${splitIdx}.beneficiary`}
                                            type="text"
                                            className="h-9 flex-1"
                                            placeholder="0x..."
                                            required
                                          />
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => arrayHelpers.remove(splitIdx)}
                                        className="mt-6"
                                      >
                                        <TrashIcon className="size-4" />
                                      </Button>
                                    </div>
                                  ))}

                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                      arrayHelpers.push({
                                        percentage: chain.splits.length === 0 ? "100" : "",
                                        beneficiary: "",
                                      })
                                    }
                                    className="mt-2"
                                  >
                                    Add split +
                                  </Button>

                                  {chain.splits.length > 0 && (
                                    <div
                                      className={`text-sm py-1 ${
                                        Math.abs(totalPercentage - 100) < 0.01
                                          ? "text-zinc-500 "
                                          : "text-red-500"
                                      }`}
                                    >
                                      Total: {totalPercentage.toFixed(2)}%
                                      {Math.abs(totalPercentage - 100) >= 0.01 &&
                                        " (must equal 100%)"}
                                    </div>
                                  )}
                                </div>
                              )}
                            </FieldArray>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </FieldArray>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting || isPending || isTxLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting || isPending || isTxLoading}
                  loading={isSubmitting || isPending || isTxLoading}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  Save changes
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
