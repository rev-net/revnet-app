import { chainIdMap } from "@/app/constants";
import { ChainLogo } from "@/components/ChainLogo";
import EtherscanLink from "@/components/EtherscanLink";
import { ProjectsDocument } from "@/generated/graphql";
import { useSubgraphQuery } from "@/graphql/useSubgraphQuery";
import { useCountdownToDate } from "@/hooks/useCountdownToDate";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { formatEther } from "juice-sdk-core";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { formatSeconds, formatTokenSymbol } from "@/lib/utils";
import { useEtherPrice } from "@/hooks/useEtherPrice";
import { ForwardIcon } from "@heroicons/react/24/solid";
import { SuckerPair } from "juice-sdk-core";
import { useSuckersTokenRedemptionQuote } from "../../UserTokenBalanceCard/useSuckersTokenRedemptionQuote";
import {
  JBChainId,
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBRulesetContext,
  useJBTokenContext,
  useSuckers,
} from "juice-sdk-react";
import Image from "next/image";
import Link from "next/link";
import { TvlDatum } from "./TvlDatum";

export function Header() {
  const { projectId } = useJBContractContext();
  const { metadata } = useJBProjectMetadataContext();
  const { token } = useJBTokenContext();
  const { data: ethPrice, isLoading: isEthLoading } = useEtherPrice();

  const { data: projects } = useSubgraphQuery(ProjectsDocument, {
    where: {
      projectId: Number(projectId),
    },
    first: 1,
  });
  const suckerPairs = useSuckers();

  const { contributorsCount } = projects?.projects?.[0] ?? {};
  const { name: projectName, logoUri } = metadata?.data ?? {};
  const issuance = useFormattedTokenIssuance();
  const { ruleset } = useJBRulesetContext();

  const redeemQuoteQuery = useSuckersTokenRedemptionQuote(1000000000000000000n);
  const loading =
    redeemQuoteQuery.isLoading || isEthLoading;

  console.log("2redeemQuery", redeemQuoteQuery)
  const redeemQuote = redeemQuoteQuery?.data ?? 0n;

  console.log("2redeemQuote", redeemQuote)
  console.log("2ethPrice", ethPrice)
  return (
    <header>
      <div className="flex sm:items-center items-end gap-4 sm:mb-6 mb-4">
        {logoUri ? (
          <>
          <div className="sm:hidden">
            <Image
              src={ipfsUriToGatewayUrl(logoUri)}
              className="rounded-md overflow-hidden block border border-zinc-200"
              alt={"revnet logo"}
              width={120}
              height={10}
            />
          </div>
          <div className="sm:block hidden">
          <Image
            src={ipfsUriToGatewayUrl(logoUri)}
            className="rounded-md overflow-hidden block border border-zinc-200"
            alt={"revnet logo"}
            width={144}
            height={144}
              />
            </div>
          </>
        ) : (
          <div className="rounded-lg bg-zinc-100 h-36 w-36 flex items-center justify-center">
            <ForwardIcon className="h-5 w-5 text-zinc-700" />
          </div>
        )}

        <div>
          <div className="flex flex-col items-baseline sm:flex-row sm:gap-2 mb-1">
          <span className="text-3xl font-bold">
              {token?.data ? (
                <EtherscanLink
                  value={token.data.address}
                  className="tracking-tight"
                >
                  {formatTokenSymbol(token)}
                </EtherscanLink>
              ) : null}
          </span>
          <div className="text-sm flex gap-2 items-baseline">
            <h1 className="text-2xl font-medium tracking-tight">{projectName}</h1>
            {(suckerPairs.data as SuckerPair[])?.map((pair) => {
              if (!pair) return null;

              const networkName = chainIdMap[pair?.peerChainId as JBChainId];
              return (
                <Link
                  className="underline"
                  key={networkName}
                  href={`/${networkName}/${pair.projectId}`}
                >
                  <ChainLogo
                    chainId={pair.peerChainId as JBChainId}
                    width={18}
                    height={18}
                  />
                </Link>
              );
            })}
          </div>
          </div>
          <div className="flex sm:flex-row flex-col sm:items-center items-leading sm:gap-4 items-start">
            <TvlDatum />
            <div className="sm:text-xl text-lg">
              <span className="font-medium text-zinc-500">
                {contributorsCount ?? 0}
              </span>{" "}
              <span className="text-zinc-500">
                {contributorsCount === 1 ? "owner" : "owners"}
              </span>
            </div>
            <div className="sm:text-xl text-lg">
            <span className="font-medium text-zinc-500">
            {!loading && ethPrice
              ? `$${(
                  Number(formatEther(redeemQuote ?? 0n)) * ethPrice
                ).toFixed(4)}`
              : "..."} 
              </span>{" "}
              <span className="text-zinc-500">cash out value</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
