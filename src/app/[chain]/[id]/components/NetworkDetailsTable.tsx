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
  useJBTokenContext
} from "juice-sdk-react";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import { SectionTooltip } from "./NetworkDashboard/sections/SectionTooltip";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { formatTokenSymbol } from "@/lib/utils";

export function NetworkDetailsTable() {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  const {
    projectId,
    contracts: { controller },
  } = useJBContractContext();

  const { token } = useJBTokenContext();

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
      <SectionTooltip name="Rules" info="">
      <div className="max-w-md space-y-4 p-2">
        <h3 className="font-medium text-black-500">Stages</h3>
        <p className="text-sm text-black-300">
          This revnet’s rules change automatically in sequential stages. It's stages are permanent once the revnet is deployed. 
        </p>
      
        <div className="space-y-2">
        <div className="space-y-1">
          <h3 className="font-medium text-black-500">Timing</h3>
          <p className="text-sm text-black-300">Determines when a stage becomes active, and how long it lasts before the next stage takes effect.</p>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-black-500">Issuance</h3>
          <p className="text-sm text-black-300">Determines how many {formatTokenSymbol(token)} are created when this revnet receives funds during a stage.</p>
          <p className="text-sm text-black-400 italic">
            Note: If an AMM exists that is offering a better rate for $BAN than this stage's issuance, inbound payments will be used to buyback from this market instead of being absorbed by the revnet. Splits will still apply to bought back {formatTokenSymbol(token)}.
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-black-500">Split</h3>
          <p className="text-sm text-black-300">Determines how much of {formatTokenSymbol(token)} issuance is set aside to be split among recipients defined by the split operator during a stage.</p>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-black-500">Split operator</h3>
          <p className="text-sm text-black-300">The account that can change the split recipients, within the permanent split amount of a stage.</p>
          <p className="text-sm text-black-400 italic">
            Note:  The operator is not bound by stages. The operator can hand off this responsibility to another address at any time, or relinquish it altogether.
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-black-500">Automint</h3>
          <p className="text-sm text-black-300">Determines the amount that can be minted on demand to chosen recipients once the stage starts.</p>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-black-500">Cash out tax</h3>
          <p className="text-sm text-black-300">Determines how much of this revnet’s funds can be withdrawn by burning {formatTokenSymbol(token)} during a stage.</p>
          <p className="text-sm text-black-400 italic">
            Note: This works on a bonding curve with the formula `y = (ax/s) * ((1-r) + xr/s)` where: `r` is the cash out tax rate (from 0 to 1) `a` is the amount in the revnet, `s` is the current token supply of $BAN, `x` is the amount of {formatTokenSymbol(token)} being cashed out. The higher the tax, the more is left to share between remaining {formatTokenSymbol(token)} holders who cash out later. A tax rate of 0 means {formatTokenSymbol(token)} can be cashed out for a proportional amount of the revnet’s funds.
          </p>
        </div>

      </div>

    </div>
      </SectionTooltip>
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
      <div className="grid sm:grid-cols-2 gap-x-8 overflow-x-scroll">
        <div className="py-1 sm:col-span-1 sm:px-0 grid grid-cols-1">
          <dt className="text-sm font-medium leading-6 text-zinc-900">
            Timing
          </dt>
          <dd className="text-sm leading-6 text-zinc-700 whitespace-nowrap">
            Starts {formatDate(
              new Date(Number(selectedStage.start) * 1000),
              "MMM dd, yyyy 'at' h:mm a"
            )}, lasting {selectedStage.duration / 86400} days
          </dd>
        </div>
        <div className="py-1 sm:col-span-1 sm:px-0 grid grid-cols-1">
          <dt className="text-sm font-medium leading-6 text-zinc-900">
            Issuance 
          </dt>
          <dd className="text-sm leading-6 text-zinc-700 whitespace-nowrap">
            {issuance}, decreasing {selectedStage.decayPercent.formatPercentage()}% every{" "}
            {(selectedStage.duration / 86400).toString()} days
          </dd>
        </div>
        <div className="py-1 sm:col-span-1 sm:px-0 grid grid-cols-1">
          <dt className="text-sm font-medium leading-6 text-zinc-900">
            Split 
          </dt>
          {selectedStageBoost ? (
            <dd className="text-sm leading-6 text-zinc-700">
              {reservedPercent?.formatPercentage()}% {selectedStageBoost?.beneficiary ? (
              <> operated by <EthereumAddress
                withEnsName
                short
                address={selectedStageBoost.beneficiary}
              />
              </>
            ) : (
              "Not set"
            )} 
            </dd>
          ) : null}
        </div>
        <div className="py-1 sm:col-span-1 sm:px-0 grid grid-cols-1">
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
        <div className="py-1 sm:col-span-1 sm:px-0 grid grid-cols-1">
          <dt className="text-sm font-medium leading-6 text-zinc-900">
            Automint
          </dt>
          <dd className="text-sm leading-6 text-zinc-700">
            ~todo~
          </dd>
        </div>
      </div>
    </div>
  );
}
