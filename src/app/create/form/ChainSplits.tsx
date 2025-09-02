import { ChainLogo } from "@/components/ChainLogo";
import { Button } from "@/components/ui/button";
import { sortChains } from "@/lib/utils";
import { FieldArray, useFormikContext } from "formik";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import type { RevnetFormData } from "../types";
import { Field } from "./Fields";

interface ChainSplitsProps {
  disabled?: boolean;
}

export function ChainSplits({ disabled = false }: ChainSplitsProps) {
  const { values, setFieldValue } = useFormikContext<RevnetFormData>();
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  const currentStage = values.stages[selectedStageIdx];

  const initializeBeneficiary = (splitIndex: number, chainId: JBChainId): void => {
    const currentBeneficiaries = currentStage.splits[splitIndex].beneficiary ?? [];
    if (!currentBeneficiaries.find((b) => b.chainId === chainId)) {
      setFieldValue(`stages.${selectedStageIdx}.splits.${splitIndex}.beneficiary`, [
        ...currentBeneficiaries,
        {
          chainId,
          address: currentStage.splits[splitIndex].defaultBeneficiary || "",
        },
      ]);
    }
  };

  const handleStageChange = (idx: number): void => {
    setSelectedStageIdx(idx);
    // console.log(`Stage ${idx} splits:`, values.stages[idx].splits);
  };

  const handleBeneficiaryChange = (splitIndex: number, chainId: JBChainId, value: string): void => {
    const split = currentStage.splits[splitIndex];
    const beneficiaryIndex = split.beneficiary?.findIndex((b) => b.chainId === chainId) ?? -1;

    if (beneficiaryIndex === -1) {
      initializeBeneficiary(splitIndex, chainId);
    }

    setFieldValue(
      `stages.${selectedStageIdx}.splits.${splitIndex}.beneficiary.${beneficiaryIndex}.address`,
      value,
    );
  };

  if (!currentStage) return null;

  return (
    <div className="mb-10">
      <h2 className="text-left text-black-500 mb-4 font-semibold">Splits</h2>
      <div className="text-sm text-zinc-500 mb-4">
        Confirm the address for each split on each chain.
      </div>
      <FieldArray
        name="stages"
        render={() => (
          <div>
            <div className="flex gap-4 mb-4">
              {values.stages.map((_, idx) => (
                <Button
                  key={idx}
                  variant={selectedStageIdx === idx ? "tab-selected" : "bottomline"}
                  className={twJoin(
                    "text-md text-zinc-400",
                    selectedStageIdx === idx && "text-inherit",
                  )}
                  onClick={() => handleStageChange(idx)}
                  type="button"
                >
                  Stage {idx + 1}
                </Button>
              ))}
            </div>

            <FieldArray
              name={`stages.${selectedStageIdx}.splits`}
              render={() => (
                <div>
                  {currentStage.splits.map((split, splitIndex) => (
                    <div key={splitIndex} className="mb-8">
                      <div className="flex items-center gap-2 mb-6 text-sm font-semibold">
                        <div className="text-zinc-500 text-md">
                          Split {splitIndex + 1} ({Number(split.percentage || 0)}%)
                        </div>
                      </div>

                      <div className="space-y-3">
                        {sortChains(values.chainIds).map((chainId) => {
                          const beneficiary = split.beneficiary?.find((b) => b.chainId === chainId);

                          return (
                            <div key={chainId} className="flex items-center text-md text-zinc-600">
                              <div className="flex gap-2 items-center w-48 text-sm">
                                <ChainLogo chainId={chainId} width={25} height={25} />
                                <div className="text-zinc-400">{JB_CHAINS[chainId].name}</div>
                              </div>

                              <Field
                                id={`split-${splitIndex}-chain-${chainId}`}
                                name={`stages.${selectedStageIdx}.splits.${splitIndex}.beneficiary.${chainId}.address`}
                                type="text"
                                className="h-9 flex-1"
                                placeholder="0x..."
                                value={beneficiary?.address ?? split.defaultBeneficiary ?? ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleBeneficiaryChange(splitIndex, chainId, e.target.value)
                                }
                                disabled={disabled}
                                required
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>
        )}
      />
    </div>
  );
}
