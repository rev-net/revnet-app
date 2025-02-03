import { useFormikContext, FieldArray } from "formik";
import type { RevnetFormData, StageData } from "../types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import { formatTokenSymbol, sortChains } from "@/lib/utils";
import { ChainSelector } from "@/components/ChainSelector";
import { formatEthAddress, JBChainId } from "juice-sdk-core";

interface ChainAutoIssuanceProps {
  disabled?: boolean;
}

export function ChainAutoIssuance({ disabled = false }: ChainAutoIssuanceProps) {
  const { values, setFieldValue } = useFormikContext<RevnetFormData>();
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);
  const initChainId = sortChains(values.chainIds)[0]
  const revnetTokenSymbol = formatTokenSymbol(values.tokenSymbol);
  const currentStage = values.stages[selectedStageIdx];

  const initializeAutoIssuance = (chainId: JBChainId): void => {
    const currentAutoIssuances = currentStage.autoIssuance ?? [];
    console.log("setting auto issuance for chainId", chainId);
    if (!currentAutoIssuances.find(a => a.chainId === chainId)) {
      setFieldValue(
        `stages.${selectedStageIdx}.autoIssuance`,
        [
          ...currentAutoIssuances,
          {
            chainId,
            amount: "0",
            beneficiary: ""
          }
        ]
      );
    }
  };

  const handleAutoIssuanceChange = (
    issuanceIndex: number,
    chainId: JBChainId,
    value: string
  ): void => {
    const issuance = currentStage.autoIssuance?.[issuanceIndex];

    if (!issuance) {
      initializeAutoIssuance(initChainId);
      return;
    }

    setFieldValue(
      `stages.${selectedStageIdx}.autoIssuance.${issuanceIndex}`,
      {
        ...issuance,
        chainId,
        beneficiary: value
      }
    );
  };

  const handleStageChange = (idx: number): void => {
    console.log(`Stage ${idx + 1} auto issuance:`, values.stages[idx].autoIssuance);
    setSelectedStageIdx(idx);
  };

  const getStagesWithAutoIssuance = () => {
    return values.stages.filter(stage => 
      Array.isArray(stage.autoIssuance) && stage.autoIssuance.length > 0
    );
  };

  if (!currentStage) return null;

  const stagesWithAutoIssuance = getStagesWithAutoIssuance();
  const hasAutoIssuance = stagesWithAutoIssuance.length > 0;

  if (!hasAutoIssuance) return null;

  return (
    <div className="mb-10">
      <h2 className="text-left text-black-500 mb-4 font-semibold">
        Auto issuance
      </h2>
      <div className="text-sm text-zinc-500 mb-4">
        Confirm the chain where each auto issuance will occur.
      </div>
      <FieldArray
        name="stages"
        render={() => (
          <div>
            <div className="flex gap-4 mb-4">
              {values.stages.map((stage, idx) => (
                stage.autoIssuance?.length > 0 && (
                  <Button
                    key={idx}
                    variant={selectedStageIdx === idx ? "tab-selected" : "bottomline"}
                    className={twJoin(
                      "text-md text-zinc-400",
                      selectedStageIdx === idx && "text-inherit"
                    )}
                    onClick={() => handleStageChange(idx)}
                    type="button"
                  >
                    Stage {idx + 1}
                  </Button>
                )
              ))}
            </div>

            <div className="space-y-6">
              {currentStage.autoIssuance?.map((issuance, index) => (
                <div
                  key={`${index}-${issuance.chainId}`}
                  className="flex items-center text-md text-zinc-600"
                >
                  <div className="w-full">
                    <div className="flex items-center text-sm font-semibold">
                      <div className="text-zinc-500 text-md mb-2">
                        {issuance.amount || "0"} {revnetTokenSymbol}
                        {issuance.beneficiary && (
                          <> to {formatEthAddress(issuance.beneficiary)} on: </>
                        )}
                      </div>
                    </div>

                    <ChainSelector
                      disabled={disabled}
                      value={issuance.chainId ?? initChainId}
                      onChange={(chainId) => {
                        handleAutoIssuanceChange(
                          index,
                          chainId,
                          issuance.beneficiary
                        );
                      }}
                      options={values.chainIds}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      />
    </div>
  );
}
