import { RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";
import { JBCoreContracts, jbSplitsAbi } from "juice-sdk-core";
import { useJBChainId, useJBContractContext, useJBRulesetContext } from "juice-sdk-react";
import { useReadContract } from "wagmi";

export function useBoostRecipient() {
  const { projectId, contractAddress } = useJBContractContext();
  const { ruleset } = useJBRulesetContext();
  const chainId = useJBChainId();

  const { data: reservedTokenSplits } = useReadContract({
    abi: jbSplitsAbi,
    functionName: "splitsOf",
    chainId,
    address: contractAddress(JBCoreContracts.JBSplits),
    args:
      ruleset && ruleset?.data
        ? [projectId, BigInt(ruleset.data.id), RESERVED_TOKEN_SPLIT_GROUP_ID]
        : undefined,
  });

  const boost = reservedTokenSplits?.[0];
  return boost?.beneficiary;
}
