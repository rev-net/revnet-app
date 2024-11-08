import { RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";
import {
  useJBChainId,
  useJBContractContext,
  useJBRulesetContext,
  useReadJbSplitsSplitsOf,
} from "juice-sdk-react";

export function useBoostRecipient() {
  const { projectId } = useJBContractContext();
  const { ruleset } = useJBRulesetContext();
  const chainId = useJBChainId();

  const { data: reservedTokenSplits } = useReadJbSplitsSplitsOf({
    chainId,
    args:
      ruleset && ruleset?.data
        ? [projectId, BigInt(ruleset.data.id), RESERVED_TOKEN_SPLIT_GROUP_ID]
        : undefined,
  });

  const boost = reservedTokenSplits?.[0];
  return boost?.beneficiary;
}
