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
import { Badge } from "@/components/ui/badge";
import { ForwardIcon } from "@heroicons/react/24/solid";
import { EthereumAddress } from "@/components/EthereumAddress";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import EtherscanLink from "@/components/EtherscanLink";
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
  const boostRecipient = useBoostRecipient();
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
    <>
    <div className="flex space-y-4 pb-0 sm:pb-2">
      <p className="text-md text-black font-light italic">
        Splits can be adjusted by the <Badge variant="secondary">
                <ForwardIcon className="w-4 h-4 mr-1 inline-block" />
                <span className="non-italic">Operator</span>
              </Badge> at any time.
      </p>
    </div>
      {suckers?.length > 1 && (
        <div className="mt-2 mb-4">
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
    <div className="flex gap-1 pb-2 pt-2 text-md font-medium border-l border-zinc-100 pl-3"><Badge variant="secondary">
                <ForwardIcon className="w-4 h-4 mr-1 inline-block" />
                <span className="non-italic">Operator</span>
              </Badge> is <EtherscanLink
                      value={boostRecipient}
                      type="address"
                      chain={chainId ? ChainIdToChain[chainId] : undefined}
                      truncateTo={6}
                    /></div>
    <div className="max-h-96 overflow-auto bg-zinc-50 rounded-tr-md rounded-bl-md rounded-br-md  border-zinc-100 border mb-4">
    <div className="flex flex-col p-2">
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
    </div>
    </>
  )
}
