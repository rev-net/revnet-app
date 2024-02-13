import { MAX_RULESET_COUNT } from "@/app/constants";
import { EthereumAddress } from "@/components/EthereumAddress";
import {
  DecayRate,
  RedemptionRate,
  ReservedRate,
  RulesetWeight,
} from "juice-sdk-core";
import {
  useJBContractContext,
  useJBRulesetContext,
  useJbControllerGetRulesetOf,
  useJbRulesetsRulesetsOf,
} from "juice-sdk-react";
import { useState } from "react";
import { Address, formatUnits } from "viem";

export function NetworkDetailsTable({
  boost,
}: {
  boost:
    | {
        percent: bigint;
        beneficiary: `0x${string}`;
      }
    | undefined;
}) {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const {
    projectId,
    contracts: { controller },
  } = useJBContractContext();

  // TODO(perf) duplicate call, move to a new context
  const { data: rulesets } = useJbRulesetsRulesetsOf({
    args: [projectId, 0n, BigInt(MAX_RULESET_COUNT)],
    select(data) {
      return data.map((ruleset) => {
        return {
          ...ruleset,
          weight: new RulesetWeight(ruleset.weight),
          decayRate: new DecayRate(ruleset.decayRate),
        };
      });
    },
  });
  const selectedStage = rulesets?.[selectedStageIdx];
  const selectedStageMetadata = useJbControllerGetRulesetOf({
    address: controller.data ?? undefined,
    args: selectedStage?.id ? [projectId, selectedStage.id] : undefined,
    select([, rulesetMetadata]) {
      return {
        ...rulesetMetadata,
        redemptionRate: new RedemptionRate(rulesetMetadata.redemptionRate),
        reservedRate: new ReservedRate(rulesetMetadata.reservedRate),
      };
    },
  });

  if (!selectedStage) return null;

  return (
    <div className="grid grid-cols-2">
      <div className="border-t border-zinc-100 px-4 py-6 sm:col-span-1 sm:px-0 grid grid-cols-2">
        <dt className="text-sm font-medium leading-6 text-zinc-900">
          Price increase
        </dt>
        <dd className="text-sm leading-6 text-zinc-700">
          {selectedStage.decayRate.formatPercentage()}% every{" "}
          {(selectedStage.duration / 86400n).toString()} days
        </dd>
      </div>
      <div className="border-t border-zinc-100 px-4 py-6 sm:col-span-1 sm:px-0 grid grid-cols-2">
        <dt className="text-sm font-medium leading-6 text-zinc-900">
          Exit tax
        </dt>
        <dd className="text-sm leading-6 text-zinc-700">
          {selectedStageMetadata?.data?.reservedRate.formatPercentage()}%
        </dd>
      </div>
      <div className="border-t border-zinc-100 px-4 py-6 sm:col-span-1 sm:px-0 grid grid-cols-2">
        <dt className="text-sm font-medium leading-6 text-zinc-900">Boost</dt>
        {boost ? (
          <dd className="text-sm leading-6 text-zinc-700">
            {formatUnits(boost?.percent * 100n, 10)}%
          </dd>
        ) : null}
      </div>
      <div className="border-t border-zinc-100 px-4 py-6 sm:col-span-1 sm:px-0 grid grid-cols-2">
        <dt className="text-sm font-medium leading-6 text-zinc-900">
          Boost to
        </dt>
        <dd className="text-sm leading-6 text-zinc-700">
          <EthereumAddress
            withEnsName
            address={boost?.beneficiary as Address}
          />
        </dd>
      </div>
    </div>
  );
}
