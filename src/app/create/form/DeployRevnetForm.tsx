import { RelayrPostBundleResponse } from "juice-sdk-react";
import { useTestData } from "../helpers/useTestData";
import { ChainSelect } from "./ChainSelect";
import { Divider } from "./Divider";
import { DetailsPage } from "./ProjectDetails";
import { QuoteResponse } from "./QuoteResponse";
import { AssetsSection } from "./ReservedAssets";
import { Stages } from "./Stages";

export function DeployRevnetForm({
  relayrResponse,
  resetRelayrResponse,
}: {
  relayrResponse?: RelayrPostBundleResponse;
  resetRelayrResponse: () => void;
}) {
  // type `testdata` into console to fill form with TEST_FORM_DATA
  // can remove on mainnet deploy
  useTestData();

  const validBundle = !!relayrResponse?.bundle_uuid;

  return (
    <div className="mx-auto my-20 max-w-6xl gap-x-6 gap-y-6 px-4 sm:px-8 md:grid md:grid-cols-3 xl:gap-y-0 xl:px-0">
      <DetailsPage disabled={validBundle} />
      <Divider />
      <AssetsSection disabled={validBundle} />
      <Divider />
      <Stages disabled={validBundle} />
      <Divider />
      <ChainSelect validBundle={validBundle} disabled={validBundle} />
      {relayrResponse && (
        <QuoteResponse
          relayrResponse={relayrResponse}
          reset={resetRelayrResponse}
        />
      )}
    </div>
  );
}
