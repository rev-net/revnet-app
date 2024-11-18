import {
  useJBChainId,
  useJBContractContext,
  useJBRulesetContext,
  useReadJbSplitsSplitsOf,
  useSuckers
} from "juice-sdk-react";
import {
  ChainIdToChain,
  RESERVED_TOKEN_SPLIT_GROUP_ID,
  chainNames
} from "@/app/constants";
import { EthereumAddress } from "@/components/EthereumAddress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { JBChainId, formatUnits } from "juice-sdk-core";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ChainLogo } from "@/components/ChainLogo";

type Sucker = {
  peerChainId: JBChainId;
  projectId: bigint;
}

export function SplitsSection() {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();
  const { ruleset } = useJBRulesetContext();
  const [selectedSucker, setSelectedSucker] = useState<Sucker>();
  const { data: suckers } = useSuckers() as { data: Sucker[] };
  const { data: reservedTokenSplits, isLoading } = useReadJbSplitsSplitsOf({
    chainId: selectedSucker?.peerChainId,
    args:
      ruleset && ruleset?.data
        ? [projectId, BigInt(ruleset.data.id), RESERVED_TOKEN_SPLIT_GROUP_ID]
        : undefined,
  });

  useEffect(() => {
    if (chainId && suckers && !suckers.find((s) => s.peerChainId === chainId)) {
      suckers.push({ projectId, peerChainId: chainId });
    }
    if (suckers && !selectedSucker) {
      const i = suckers.findIndex((s) => s.peerChainId === chainId);
      setSelectedSucker(suckers[i])
    }
  }, [suckers, chainId, projectId, selectedSucker]);

  return (
    <div className="flex flex-col space-y-2 p-3">
      {suckers.length > 1 && (
        <div>
          <div className="text-sm text-zinc-500">
            See splits on
          </div>
          <Select
            onValueChange={(v) => setSelectedSucker(suckers[parseInt(v)])}
            value={selectedSucker ? String(suckers.indexOf(selectedSucker)) : undefined}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select chain">
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {suckers?.map((s, index) => (
                <SelectItem
                  key={s.peerChainId}
                  value={String(index)}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    <ChainLogo chainId={s.peerChainId} />
                    <span>{chainNames[s.peerChainId]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-auto md:w-1/2">Account</TableHead>
            <TableHead>Percentage</TableHead>
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
            reservedTokenSplits?.map((split) => (
              <TableRow key={split.beneficiary}>
                <TableCell>
                  <div className="flex flex-col sm:flex-row text-sm">
                    <EthereumAddress
                      address={split.beneficiary}
                      chain={selectedSucker ? ChainIdToChain[selectedSucker.peerChainId] : chainId ? ChainIdToChain[chainId] : undefined }
                      short
                      withEnsAvatar
                      withEnsName
                      className="hidden sm:block"
                    />
                    <EthereumAddress
                      address={split.beneficiary}
                      chain={selectedSucker ? ChainIdToChain[selectedSucker.peerChainId] : chainId ? ChainIdToChain[chainId] : undefined }
                      short
                      avatarProps={{size: "sm"}}
                      withEnsAvatar
                      withEnsName
                      className="block sm:hidden"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  {formatUnits(BigInt(split.percent), 7)} %
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
