import { RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";
import { ChainLogo } from "@/components/ChainLogo";
import { EthereumAddress } from "@/components/EthereumAddress";
import EtherscanLink from "@/components/EtherscanLink";
import { Badge } from "@/components/ui/badge";
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
import { formatTokenSymbol } from "@/lib/utils";
import { ForwardIcon } from "@heroicons/react/24/solid";
import {
  JB_CHAINS,
  SuckerPair,
  formatUnits,
  jbProjectDeploymentAddresses,
} from "juice-sdk-core";
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
import { Address } from "viem";

export function SplitsSection() {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();
  const { ruleset } = useJBRulesetContext();
  const { token } = useJBTokenContext();
  const boostRecipient = useBoostRecipient();
  const [selectedSucker, setSelectedSucker] = useState<SuckerPair>();
  const suckersQuery = useSuckers();
  const suckers = suckersQuery.data;
  const { data: reservedTokenSplits, isLoading } = useReadJbSplitsSplitsOf({
    chainId: selectedSucker?.peerChainId as JBChainId | undefined,
    args:
      ruleset && ruleset?.data
        ? [projectId, BigInt(ruleset.data.id), RESERVED_TOKEN_SPLIT_GROUP_ID]
        : undefined,
  });
  const { data: pendingReserveTokenBalance } =
    useReadJbControllerPendingReservedTokenBalanceOf({
      chainId: selectedSucker?.peerChainId,
      address: selectedSucker?.peerChainId
        ? (jbProjectDeploymentAddresses.JBController[
            selectedSucker.peerChainId as JBChainId
          ] as Address)
        : undefined,
      args: ruleset && ruleset?.data ? [projectId] : undefined,
    });
  console.log("reserveToken", pendingReserveTokenBalance);
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
          Splits can be adjusted by the Operator at any time, within the permanent split limit of a stage.
        </p>
      </div>
      {suckers && suckers.length > 1 && (
        <div className="mt-2 mb-4">
          <div className="text-sm text-zinc-500">See splits on</div>
          <Select
            onValueChange={(v) => setSelectedSucker(suckers[parseInt(v)])}
            value={
              selectedSucker
                ? String(suckers.indexOf(selectedSucker))
                : undefined
            }
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
        </div>
      )}
      <div className="flex gap-1 pb-2 pt-2 text-md font-medium border-l border-zinc-200 pl-3">
        Operator is{" "}
        <EtherscanLink
          value={boostRecipient}
          type="address"
          chain={chainId ? JB_CHAINS[chainId].chain : undefined}
          truncateTo={6}
        />
      </div>
      <div className="max-h-96 overflow-auto bg-zinc-50 rounded-tr-md rounded-br-md  border-zinc-200 border mb-4">
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                reservedTokenSplits?.map(
                  (split: { beneficiary: Address; percent: number }) => (
                    <TableRow key={split.beneficiary}>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row text-sm">
                          <EthereumAddress
                            address={split.beneficiary}
                            chain={
                              selectedSucker
                                ? JB_CHAINS[
                                    selectedSucker.peerChainId as JBChainId
                                  ].chain
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
                                ? JB_CHAINS[
                                    selectedSucker.peerChainId as JBChainId
                                  ].chain
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
                        {formatUnits(BigInt(split.percent), 7)} %
                      </TableCell>
                      <TableCell>
                        {pendingReserveTokenBalance
                          ? `
                          ${formatUnits(
                            (pendingReserveTokenBalance *
                              BigInt(split.percent)) /
                              BigInt(10 ** 9),
                            18
                          )}
                          ${formatTokenSymbol(token.data?.symbol)}
                        `
                          : "?"}
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
