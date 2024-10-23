import {
  MAX_RULESET_COUNT,
  RESERVED_TOKEN_SPLIT_GROUP_ID,
} from "@/app/constants";
import { EthereumAddress } from "@/components/EthereumAddress";
import { Button } from "@/components/ui/button";
import { formatDate } from "date-fns";
import {
  ReservedPercent,
  MAX_REDEMPTION_RATE,
  RedemptionRate,
  RulesetWeight,
  DecayPercent,
} from "juice-sdk-core";
import {
  useJBContractContext,
  useReadJbControllerGetRulesetOf,
  useReadJbRulesetsAllOf,
  useReadJbSplitsSplitsOf,
} from "juice-sdk-react";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import { SectionTooltip } from "./NetworkDashboard/sections/SectionTooltip";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";

export function NetworkDetailsTable() {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  const {
    projectId,
    contracts: { controller },
  } = useJBContractContext();

  // TODO(perf) duplicate call, move to a new context
  const { data: rulesets } = useReadJbRulesetsAllOf({
    args: [projectId, 0n, BigInt(MAX_RULESET_COUNT)],
    query: {
      select(data) {
        return data
          .map((ruleset) => {
            return {
              ...ruleset,
              weight: new RulesetWeight(ruleset.weight),
              decayPercent: new DecayPercent(ruleset.decayPercent),
            };
          })
          .reverse();
      },
    },
  });

  const selectedStage = rulesets?.[selectedStageIdx];

  const selectedStageMetadata = useReadJbControllerGetRulesetOf({
    address: controller.data ?? undefined,
    args: selectedStage?.id ? [projectId, BigInt(selectedStage.id)] : undefined,
    query: {
      select([, rulesetMetadata]) {
        return {
          ...rulesetMetadata,
          redemptionRate: new RedemptionRate(rulesetMetadata.redemptionRate),
          reservedPercent: new ReservedPercent(rulesetMetadata.reservedPercent),
        };
      },
    },
  });

  const { data: selectedStateReservedTokenSplits } = useReadJbSplitsSplitsOf({
    args:
      selectedStage && selectedStage
        ? [projectId, BigInt(selectedStage.id), RESERVED_TOKEN_SPLIT_GROUP_ID]
        : undefined,
  });
  const selectedStageBoost = selectedStateReservedTokenSplits?.[0];
  const reservedPercent = selectedStageMetadata?.data?.reservedPercent;
  const stages = rulesets?.reverse();
  const nextStageIdx = Math.max(
    stages?.findIndex((stage) => stage.start > Date.now() / 1000) ?? -1,
    1 // lower bound should be 1 (the minimum 'next stage' is 1)
  );
  const currentStageIdx = nextStageIdx - 1;

  const issuance = useFormattedTokenIssuance({
    weight: selectedStage?.weight,
    reservedPercent: selectedStageMetadata?.data?.reservedPercent
  });

  if (!selectedStage) return null;

  return (
    <div>
      <SectionTooltip name="Rules" info="These are how we play the game"/>
      <div className="flex gap-4 mb-2">
        {rulesets?.map((ruleset, idx) => {
          return (
            <Button
              variant={selectedStageIdx === idx ? "tab-selected" : "bottomline"}
              className={twJoin(
                "text-sm text-zinc-400",
                selectedStageIdx === idx && "text-inherit"
              )}
              key={ruleset.id.toString() + idx}
              onClick={() => setSelectedStageIdx(idx)}
            >
              Stage {idx + 1}
              {idx === currentStageIdx && (
                <span className="rounded-full h-2 w-2 bg-orange-400 border-[2px] border-orange-200 ml-1"></span>
              )}
            </Button>
          );
        })}
      </div>
      <div className="grid sm:grid-cols-2 gap-x-8 border-b border-zinc-100 overflow-x-scroll">
        <div className="px-4 py-2 sm:col-span-1 sm:px-0 grid grid-cols-2">
          <dt className="text-sm font-medium leading-6 text-zinc-900">
            Starts at
          </dt>
          <dd className="text-sm leading-6 text-zinc-700 whitespace-nowrap">
            {formatDate(
              new Date(Number(selectedStage.start) * 1000),
              "yyyy-MM-dd h:mm a"
            )}
          </dd>
        </div>
        <div className="border-t border-zinc-100 sm:border-none px-4 py-2 sm:col-span-1 sm:px-0 grid grid-cols-2">
          <dt className="text-sm font-medium leading-6 text-zinc-900">
            Starting price
          </dt>
          <dd className="text-sm leading-6 text-zinc-700 whitespace-nowrap">
            {issuance}
          </dd>
        </div>
        <div className="border-t border-zinc-100 px-4 py-2 sm:col-span-1 sm:px-0 grid grid-cols-2">
          <dt className="text-sm font-medium leading-6 text-zinc-900">
            Issuance Decrease
          </dt>
          <dd className="text-sm leading-6 text-zinc-700">
            {selectedStage.decayPercent.formatPercentage()}% every{" "}
            {(selectedStage.duration / 86400).toString()} days
          </dd>
        </div>
        <div className="border-t border-zinc-100 px-4 py-2 sm:col-span-1 sm:px-0 grid grid-cols-2">
          <dt className="text-sm font-medium leading-6 text-zinc-900">
            Cash out tax
          </dt>
          <dd className="text-sm leading-6 text-zinc-700">
            {new RedemptionRate(
              MAX_REDEMPTION_RATE -
                Number(selectedStageMetadata?.data?.redemptionRate.value ?? 0n)
            ).format()}
          </dd>
        </div>
        <div className="border-t border-zinc-100 px-4 py-2 sm:col-span-1 sm:px-0 grid grid-cols-2">
          <dt className="text-sm font-medium leading-6 text-zinc-900">
            Operator
          </dt>
          <dd className="text-sm leading-6 text-zinc-700 overflow-hidden text-ellipsis">
            {selectedStageBoost?.beneficiary ? (
              <EthereumAddress
                withEnsName
                short
                address={selectedStageBoost.beneficiary}
              />
            ) : (
              "Not set"
            )}
          </dd>
        </div>
        <div className="border-t border-zinc-100 px-4 py-2 sm:col-span-1 sm:px-0 grid grid-cols-2">
          <dt className="text-sm font-medium leading-6 text-zinc-900">
            Operator token split
          </dt>
          {selectedStageBoost ? (
            <dd className="text-sm leading-6 text-zinc-700">
              {reservedPercent?.formatPercentage()}%
            </dd>
          ) : null}
        </div>
      </div>
    </div>
  );
}
