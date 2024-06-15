import { RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";
import {
  useJBContractContext,
  useJBRulesetContext,
  useReadJbSplitsSplitsOf,
} from "juice-sdk-react";

export function useBoostRecipient() {
  const { projectId } = useJBContractContext();
  const { ruleset } = useJBRulesetContext();

  const { data: reservedTokenSplits } = useReadJbSplitsSplitsOf({
    args:
      ruleset && ruleset?.data
        ? [projectId, ruleset.data.id, RESERVED_TOKEN_SPLIT_GROUP_ID]
        : undefined,
  });

  const boost = reservedTokenSplits?.[0];
  return boost?.beneficiary;
}
