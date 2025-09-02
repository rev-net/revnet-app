import { RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";
import { ChainLogo } from "@/components/ChainLogo";
import { EthereumAddress } from "@/components/EthereumAddress";
import EtherscanLink from "@/components/EtherscanLink";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { useFetchProjectRulesets } from "@/hooks/useFetchProjectRulesets";
import { formatTokenSymbol } from "@/lib/utils";
import { JB_CHAINS, SuckerPair, formatUnits, jbProjectDeploymentAddresses } from "juice-sdk-core";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useJBRulesetContext,
  useJBTokenContext,
  useReadJbControllerPendingReservedTokenBalanceOf,
  useReadJbSplitsSplitsOf,
  useSuckers,
} from "juice-sdk-react";
import { useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";
import { Address } from "viem";

export function SplitsSection() {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();
  const { ruleset } = useJBRulesetContext();
  const { token } = useJBTokenContext();
  const boostRecipient = useBoostRecipient();
  const [selectedSucker, setSelectedSucker] = useState<SuckerPair>();
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);
  const suckersQuery = useSuckers();
  const suckers = suckersQuery.data;
  const { suckerPairsWithRulesets, isLoading: isLoadingRuleSets } =
    useFetchProjectRulesets(suckers);
  const selectedSuckerRulesets = suckerPairsWithRulesets?.find(
    (sucker) => sucker.peerChainId === selectedSucker?.peerChainId,
  )?.rulesets;
  const nextStageIdx = Math.max(
    selectedSuckerRulesets?.findIndex((stage) => stage.start > Date.now() / 1000) ?? -1,
    1, // lower bound should be 1 (the minimum 'next stage' is 1)
  );
  const currentStageIdx = nextStageIdx - 1;
  const splitLimit =
    selectedSuckerRulesets?.[selectedStageIdx]?.metadata.reservedPercent.formatPercentage();
  const { data: reservedTokenSplits, isLoading: isLoadingSplits } = useReadJbSplitsSplitsOf({
    chainId: selectedSucker?.peerChainId as JBChainId | undefined,
    args:
      ruleset &&
      ruleset?.data &&
      selectedSucker &&
      selectedSuckerRulesets &&
      suckerPairsWithRulesets?.length > 0
        ? [
            BigInt(selectedSucker?.projectId || projectId),
            BigInt(selectedSuckerRulesets[selectedStageIdx]?.id || 0),
            RESERVED_TOKEN_SPLIT_GROUP_ID,
          ]
        : undefined,
  });
  const { data: pendingReserveTokenBalance } = useReadJbControllerPendingReservedTokenBalanceOf({
    chainId: selectedSucker?.peerChainId,
    address: selectedSucker?.peerChainId
      ? (jbProjectDeploymentAddresses.JBController[
          selectedSucker.peerChainId as JBChainId
        ] as Address)
      : undefined,
    args: ruleset && ruleset?.data ? [projectId] : undefined,
  });

  useEffect(() => {
    if (chainId && suckers && !suckers.find((s) => s.peerChainId === chainId)) {
      suckers.push({ projectId, peerChainId: chainId });
    }
    if (suckers && !selectedSucker) {
      const i = suckers.findIndex((s) => s.peerChainId === chainId);
      setSelectedSucker(suckers[i]);
    }
  }, [suckers, chainId, projectId, selectedSucker]);

  return (
    <>
      <div className="flex space-y-4 pb-0 sm:pb-2">
        <p className="text-md text-black font-light italic">
          Splits can be adjusted by the Operator at any time, within the permanent split limit of a
          stage.
        </p>
      </div>
      {suckers && suckers.length > 1 && (
        <div className="mt-2 mb-4">
          <div className="text-sm text-zinc-500">See splits on</div>
          <Select
            onValueChange={(v) => setSelectedSucker(suckers[parseInt(v)])}
            value={selectedSucker ? String(suckers.indexOf(selectedSucker)) : undefined}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select chain"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              {suckers?.map((s, index) => (
                <SelectItem
                  key={s.peerChainId}
                  value={String(index)}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    <ChainLogo chainId={s.peerChainId as JBChainId} />
                    <span>{JB_CHAINS[s.peerChainId as JBChainId].name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm font-medium text-zinc-500 mt-4 border-l border-zinc-300 pl-2 py-1 px-1">
            Operator is currently{" "}
            <EtherscanLink
              value={boostRecipient}
              type="address"
              chain={chainId ? JB_CHAINS[chainId].chain : undefined}
              truncateTo={6}
            />
          </div>
          <div className="flex gap-4 my-2">
            {selectedSuckerRulesets?.map((ruleset, idx) => {
              return (
                <Button
                  variant={selectedStageIdx === idx ? "tab-selected" : "bottomline"}
                  className={twJoin(
                    "text-md text-zinc-400",
                    selectedStageIdx === idx && "text-inherit",
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
          <div className="text-sm font-medium text-zinc-500 mt-4">
            The split limit for this stage is {splitLimit}%
          </div>
        </div>
      )}
      <div className="max-h-96 overflow-auto bg-zinc-50 border-zinc-200 border mb-4">
        <div className="flex flex-col p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-auto md:w-1/2">Account</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Pending Splits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingRuleSets || isLoadingSplits ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                reservedTokenSplits?.map((split: { beneficiary: Address; percent: number }) => (
                  <TableRow key={split.beneficiary}>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row text-sm">
                        <EthereumAddress
                          address={split.beneficiary}
                          chain={
                            selectedSucker
                              ? JB_CHAINS[selectedSucker.peerChainId as JBChainId].chain
                              : chainId
                                ? JB_CHAINS[chainId].chain
                                : undefined
                          }
                          short
                          withEnsAvatar
                          withEnsName
                          className="hidden sm:block"
                        />
                        <EthereumAddress
                          address={split.beneficiary}
                          chain={
                            selectedSucker
                              ? JB_CHAINS[selectedSucker.peerChainId as JBChainId].chain
                              : chainId
                                ? JB_CHAINS[chainId].chain
                                : undefined
                          }
                          short
                          avatarProps={{ size: "sm" }}
                          withEnsAvatar
                          withEnsName
                          className="block sm:hidden"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatUnits(BigInt((split.percent * Number(splitLimit)) / 100), 7)}%
                      <span className="text-zinc-500 ml-2">
                        ({formatUnits(BigInt(split.percent), 7)}% of limit)
                      </span>
                    </TableCell>
                    <TableCell>
                      {pendingReserveTokenBalance || pendingReserveTokenBalance === 0n
                        ? `
                          ${formatUnits(
                            (pendingReserveTokenBalance * BigInt(split.percent)) / BigInt(10 ** 9),
                            18,
                          )}
                          ${formatTokenSymbol(token.data?.symbol)}
                        `
                        : "?"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
