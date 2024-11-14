import {
  useJBChainId,
  useJBContractContext,
  useJBRulesetContext,
  useReadJbSplitsSplitsOf
} from "juice-sdk-react";
import { ChainIdToChain, RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";
import { EthereumAddress } from "@/components/EthereumAddress";
import {
    Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatUnits } from "juice-sdk-core";

export function SplitsSection() {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();
  const { ruleset } = useJBRulesetContext();
  const { data: reservedTokenSplits } = useReadJbSplitsSplitsOf({
    chainId,
    args:
      ruleset && ruleset?.data
        ? [projectId, BigInt(ruleset.data.id), RESERVED_TOKEN_SPLIT_GROUP_ID]
        : undefined,
  });

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-auto md:w-1/2">Account</TableHead>
            <TableHead>Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservedTokenSplits?.map((split) => (
            <TableRow key={split.beneficiary}>
              <TableCell>
                <div className="flex flex-col sm:flex-row text-sm">
                  <EthereumAddress
                    address={split.beneficiary}
                    chain={chainId ? ChainIdToChain[chainId] : undefined}
                    short
                    withEnsAvatar
                    withEnsName
                    className="hidden sm:block"
                  />
                  <EthereumAddress
                    address={split.beneficiary}
                    chain={chainId ? ChainIdToChain[chainId] : undefined}
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
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
