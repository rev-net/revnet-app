import {
  MAX_RULESET_COUNT,
  RESERVED_TOKEN_SPLIT_GROUP_ID,
} from "@/app/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { differenceInDays, formatDate } from "date-fns";
import { ForwardIcon } from "@heroicons/react/24/solid";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ReservedPercent,
  CashOutTaxRate,
  RulesetWeight,
  WeightCutPercent,
} from "juice-sdk-core";
import {
  useJBContractContext,
  useReadJbControllerGetRulesetOf,
  useReadJbRulesetsAllOf,
  useReadJbSplitsSplitsOf,
  useJBTokenContext,
  useJBChainId
} from "juice-sdk-react";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import { PriceSection } from "./NetworkDashboard/sections/PriceSection";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { formatTokenSymbol, rulesetStartDate } from "@/lib/utils";
import { useAutoIssuances } from "@/hooks/useAutoIssuances";
import { commaNumber } from "@/lib/number";
import { formatUnits } from "viem";

export function NetworkDetailsTable() {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  const {
    projectId,
    contracts: { controller },
  } = useJBContractContext();
  const chainId = useJBChainId();

  const { token } = useJBTokenContext();
  const nativeTokenSymbol = useNativeTokenSymbol();
  const [isOpen, setIsOpen] = useState(false);

  // TODO(perf) duplicate call, move to a new context
  const { data: rulesets } = useReadJbRulesetsAllOf({
    chainId,
    args: [projectId, 0n, BigInt(MAX_RULESET_COUNT)],
    query: {
      select(data) {
        return data
          .map((ruleset) => {
            return {
              ...ruleset,
              weight: new RulesetWeight(ruleset.weight),
              weightCutPercent: new WeightCutPercent(ruleset.weightCutPercent),
            };
          })
          .reverse();
      },
    },
  });

  const selectedStage = rulesets?.[selectedStageIdx];

  const selectedStageMetadata = useReadJbControllerGetRulesetOf({
    chainId,
    address: controller.data ?? undefined,
    args: selectedStage?.id ? [projectId, BigInt(selectedStage.id)] : undefined,
    query: {
      select([, rulesetMetadata]) {
        return {
          ...rulesetMetadata,
          cashOutTaxRate: new CashOutTaxRate(rulesetMetadata.cashOutTaxRate),
          reservedPercent: new ReservedPercent(rulesetMetadata.reservedPercent),
        };
      },
    },
  });

  const { data: selectedStateReservedTokenSplits } = useReadJbSplitsSplitsOf({
    chainId,
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

  const len = rulesets?.length ?? 0;
  const reverseSelectedIdx = len - selectedStageIdx - 1;
  const stageDayDiff = () => {
    const selectedRuleset = rulesets?.[reverseSelectedIdx];
    const selectedStart = rulesetStartDate(selectedRuleset);

    const nextRuleset = rulesets?.[reverseSelectedIdx - 1];
    const nextStart = rulesetStartDate(nextRuleset);
    if (!nextStart || !selectedStart) return "";

    const days = differenceInDays(nextStart, selectedStart);
    return `, ${days} days`;
  };

  const stageNextStart = () => {
    const selectedRuleset = rulesets?.[reverseSelectedIdx];
    const selectedStart = rulesetStartDate(selectedRuleset);

    const nextRuleset = rulesets?.[reverseSelectedIdx - 1];
    const nextStart = rulesetStartDate(nextRuleset);
    if (!nextStart || !selectedStart) return "forever";

    return formatDate(
      nextStart,
      "MMM dd, yyyy"
    );
  };

  const issuance = useFormattedTokenIssuance({
    weight: selectedStage?.weight,
    reservedPercent: selectedStageMetadata?.data?.reservedPercent
  });

  const autoIssuances = useAutoIssuances();
  // console.log("autoIssuances::", autoIssuances)
  const getAutoIssuancesTotalForStage = () => {
    if (!autoIssuances) return 0;
    console.log("selectedStageIdx", selectedStageIdx + 1)
    const stageautoIssuances = autoIssuances.filter((a) => a.stage === selectedStageIdx + 1);
    return commaNumber(formatUnits(
      stageautoIssuances.reduce((acc, curr) => acc + BigInt(curr.count), 0n),
      token?.data?.decimals || 18
    ))
  };
  if (!selectedStage) return null;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Dropdown Header */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-left text-black-600"
      >
        <div className="flex flex-row space-x-2">
          <h2 className="text-2xl font-semibold">Rules</h2>
        </div>
        <span
          className={`transform transition-transform font-sm ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        >
          ▶
        </span>
      </button>
      {/* Dropdown Content */}
      {isOpen &&
        <div className="mt-2 text-black text-md max-w-sm sm:max-w-full">
          <h3 className="text-md font-semibold mt-4">Overview</h3>
          <PriceSection className="mb-2" />
          <h3 className="text-md font-semibold mt-6">Specifics</h3>
          <div className="mb-2 mt-2 text-black font-light italic">{formatTokenSymbol(token)}'s issuance and cash out rules change automatically in permanent sequential stages.</div>
          <div className="mb-2">

            <div className="flex gap-4 mb-2">
              {rulesets?.map((ruleset, idx) => {
                return (
                  <Button
                    variant={selectedStageIdx === idx ? "tab-selected" : "bottomline"}
                    className={twJoin(
                      "text-md text-zinc-400",
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
            <div className="text-md text-zinc-500 mb-2">
              {formatDate(
                new Date(Number(selectedStage.start) * 1000),
                "MMM dd, yyyy"
              )} - {stageNextStart()}{stageDayDiff()}
            </div>
            <div className="grid sm:grid-cols-1 gap-x-8 overflow-x-scroll gap-1">
              <div className="sm:col-span-1 sm:px-0 grid grid-cols-2 sm:grid-cols-4">
                <dt className="text-md font-medium leading-6 text-zinc-900">
                  <Tooltip>
                    <div className="flex flex-row space-x-1">
                      <div>Paid issuance</div>
                      <TooltipTrigger className="pl-1 text-md text-zinc-500"> [ ? ]
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="max-w-md space-y-2 p-2">
                          <div className="space-y-1">
                            <h3 className="font-bold text-black-500">Paid Issuance</h3>
                            <p className="text-md text-black-400">Determines how many {formatTokenSymbol(token)} are created when this revnet receives funds during a stage.</p>

                            <div className="text-zinc-600 text-md mt-4">
                              <span className="italic">Note:
                                <ul className="list-disc list-inside pl-4 space-y-2">
                                  <li className="flex">
                                    <span className="mr-2">•</span>
                                    <div>
                                      If there's a market for {formatTokenSymbol(token)} / {nativeTokenSymbol} offering a better price, all {nativeTokenSymbol} paid
                                      in will be used to buyback instead of feeding the revnet. Uniswap is used as the market.
                                    </div>
                                  </li>
                                </ul>
                              </span>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </div>
                  </Tooltip>
                </dt>
                <dd className="text-md leading-6 text-zinc-700 whitespace-nowrap">
                  {issuance}, cut {selectedStage.weightCutPercent.formatPercentage()}% every{" "}
                  {(selectedStage.duration / 86400).toString()} days
                </dd>
              </div>
              <div className="sm:col-span-1 sm:px-0 grid grid-cols-2 sm:grid-cols-4">
                <dt className="text-md font-medium leading-6 text-zinc-900">
                  <Tooltip>
                    <div className="flex flex-row space-x-1">
                      <div>Auto issuance</div>
                      <TooltipTrigger className="pl-1 text-md text-zinc-500"> [ ? ]
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="max-w-md space-y-2 p-2">
                          <div className="space-y-1">
                            <h3 className="font-bold text-black-500">Auto issuance</h3>
                            <p className="text-md text-black-400">An amount of {formatTokenSymbol(token)} that is inflated automatically once the stage starts. See the "Owners" table for the breakdown.</p>
                          </div>
                        </div>
                      </TooltipContent>
                    </div>
                  </Tooltip>
                </dt>
                <dd className="text-md leading-6 text-zinc-700 whitespace-nowrap">
                  {getAutoIssuancesTotalForStage()} {formatTokenSymbol(token)}
                </dd>
              </div>
              <div className="sm:col-span-1 sm:px-0 grid grid-cols-2 sm:grid-cols-4">
                <dt className="text-md font-medium leading-6 text-zinc-900">
                  <Tooltip>
                    <div className="flex flex-row space-x-1">
                      <div>Split limit</div>
                      <TooltipTrigger className="pl-1 text-md text-zinc-500"> [ ? ]
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="max-w-md space-y-2 p-2">
                          <div className="space-y-1">
                            <h3 className="font-bold text-black-500">Split limit</h3>
                            <p className="text-md text-black-400">Determines how much of {formatTokenSymbol(token)} issuance is set aside to be split among recipients defined by the split operator during a stage.</p>
                            <p className="text-md text-black-400">The operator is the account that can change the split recipients, within the permanent split limit amount of a stage. See the "Owners" table for the current breakdown.</p>
                            <div className="text-zinc-600 text-md mt-4">
                              <span className="italic">Note:
                                <ul className="list-disc list-inside pl-4 space-y-2">
                                  <li className="flex">
                                    <span className="mr-2">•</span>
                                    <div>
                                      The operator can change the distribution of the split limit to new destinations at any time.
                                    </div>
                                  </li>
                                  <li className="flex">
                                    <span className="mr-2">•</span>
                                    <div>
                                      The operator can be a multisig, a DAO, an LLC, a core team, an
                                                      airdrop stockpile, a staking rewards contract, or some other
                                                      address.
                                    </div>
                                  </li>
                                  <li className="flex">
                                    <span className="mr-2">•</span>
                                    <div>
                                      The operator is set once and is not bound by stages. The operator can hand off this responsibility to another address at any time, or relinquish it altogether.
                                    </div>
                                  </li>
                                  <li className="flex">
                                    <span className="mr-2">•</span>
                                    <div>
                                      You can write and deploy a custom split hook that automatically receives and processes the split {formatTokenSymbol(token)}. See <a className="underline" target="_blank" href="https://docs.juicebox.money/v4/build/hooks/split-hook/"> the docs.</a> 
                                    </div>
                                  </li>
                                  <li className="flex">
                                    <span className="mr-2">•</span>
                                    <div>
                                      A revnet can have different split destinations on each chain it exists on, but they're all bound by the same total split limit percentage.
                                    </div>
                                  </li>
                                </ul>
                              </span>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </div>
                  </Tooltip>
                </dt>
                <dd className="text-md leading-6 text-zinc-700 whitespace-nowrap">
                  {selectedStageBoost ? (
                    <div className="text-md leading-6 text-zinc-700">
                      {reservedPercent?.formatPercentage()}% to <Badge variant="secondary" className="border border-visible">
                        <ForwardIcon className="w-4 h-4 mr-1 inline-block" />
                        Splits
                      </Badge>
                    </div>
                  ) : null}
                </dd>
              </div>
              <div className="sm:col-span-1 sm:px-0 grid grid-cols-2 sm:grid-cols-4">
                <dt className="text-md font-medium leading-6 text-zinc-900">
                  <Tooltip>
                    <div className="flex flex-row space-x-1">
                      <div>Cash out tax rate</div>
                      <TooltipTrigger className="pl-1 text-md text-zinc-500"> [ ? ]
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="max-w-md space-y-2 p-2">
                          <div className="space-y-1">
                            <h3 className="font-bold text-black-500">Cash out tax rate</h3>
                            <p className="text-md text-black-400">The only way for anyone to access {formatTokenSymbol(token)} revenue is by cashing out or taking out a loan against their {formatTokenSymbol(token)}. A tax can be added that makes the cost of cashing out and borrowing money more expensive.</p>
                            <p className="text-md text-black-400">This can be used to reward {formatTokenSymbol(token)} holders who stick around while others cash out, with the tradeoff of making loans more expensive.</p>
                            <p className="text-md text-black-400">It is expressed as a value from 0 to 1.</p>
                            <div className="text-zinc-600 text-md mt-4">
                              <span className="italic">Note:
                                <ul className="list-disc list-inside pl-4 space-y-2">
                                  <li className="flex">
                                    <span className="mr-2">•</span>
                                    <div>
                                      The higher the tax, the less that can be accessed by cashing out or taking out a loan at any given time, and the more that is left to share between remaining holders who cash out later.
                                    </div>
                                  </li>
                                  <li className="flex">
                                    <span className="mr-2">•</span>
                                    <div>
                                      Given 100 {nativeTokenSymbol} in the revnet, 100 total supply of {formatTokenSymbol(token)}, and 10 {formatTokenSymbol(token)} being cashed out, a tax rate of 0 would yield a cash out value of 10 {nativeTokenSymbol}, 0.2 would yield 8.2 {nativeTokenSymbol}, 0.5 would yield 5.5 {nativeTokenSymbol}, and 0.8 would yield 2.8 {nativeTokenSymbol}.
                                    </div>
                                  </li>
                                  <li className="flex">
                                    <span className="mr-2">•</span>
                                    <div>
                                      The formula for the amount of {nativeTokenSymbol} received when cashing out is `(ax/s) * ((1-r) + xr/s)` where: `r` is the cash out tax rate, `a` is the amount in the revnet being accessed, `s` is the current token supply of {formatTokenSymbol(token)}, `x` is the amount of {formatTokenSymbol(token)} being cashed out.
                                    </div>
                                  </li>
                                </ul>
                              </span>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </div>
                  </Tooltip>
                </dt>
                <dd className="text-md leading-6 text-zinc-700">
                  {new CashOutTaxRate(
                    Number(selectedStageMetadata?.data?.cashOutTaxRate.value ?? 0n)
                  ).format()}
                </dd>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}
