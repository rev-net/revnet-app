import { RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";
import {
  useJBContractContext,
  useJBRulesetContext,
  useJbSplitsSplitsOf,
} from "juice-sdk-react";

export function useBoostRecipient() {
  const { projectId } = useJBContractContext();
  const { ruleset } = useJBRulesetContext();

  const { data: reservedTokenSplits } = useJbSplitsSplitsOf({
    args:
      ruleset && ruleset?.data
        ? [projectId, ruleset.data.id, RESERVED_TOKEN_SPLIT_GROUP_ID]
        : undefined,
  });

  const boost = reservedTokenSplits?.[0];
  return boost?.beneficiary;
}
