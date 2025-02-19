import { RelayrPostBundleResponse } from "@/lib/relayr/types";
import { Divider } from "./Divider";
import { DetailsPage } from "./ProjectDetails";
import { Stages } from "./Stages";
import { ChainSelect } from "./ChainSelect";
import { useTestData } from "../helpers/useTestData";

export function DeployRevnetForm({
  relayrResponse,
  isLoading,
}: {
  relayrResponse?: RelayrPostBundleResponse;
  isLoading: boolean;
}) {
  // type `testdata` into console to fill form with TEST_FORM_DATA
  // can remove on mainnet deploy
  useTestData();

  const validBundle = !!relayrResponse?.bundle_uuid;

  return (
    <div className="md:grid md:grid-cols-3 max-w-6xl mx-auto my-20 gap-x-6 gap-y-6 px-4 sm:px-8 xl:gap-y-0 xl:px-0">
      <DetailsPage disabled={validBundle} />
      <Divider />

      <Stages disabled={validBundle} />
      <Divider />

      <ChainSelect
        isLoading={isLoading}
        relayrResponse={relayrResponse}
        validBundle={validBundle}
        disabled={validBundle}
      />
    </div>
  );
}
