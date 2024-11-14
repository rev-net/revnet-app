import EtherscanLink from "@/components/EtherscanLink";
import { NativeTokenValue } from "@/components/NativeTokenValue";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { formatSeconds } from "@/lib/utils";
import { ForwardIcon } from "@heroicons/react/24/solid";
import {
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
  useJBRulesetContext,
  JBChainId,
  useSuckers
} from "juice-sdk-react";
import Image from "next/image";
import { useNativeTokenSurplus  } from "@/hooks/useTokenASurplus";
import { useCountdownToDate } from "@/hooks/useCountdownToDate";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { ProjectsDocument } from "@/generated/graphql";
import { useSubgraphQuery } from "@/graphql/useSubgraphQuery";
import { formatTokenSymbol } from "@/lib/utils";
import { TvlDatum } from "./TvlDatum";
import { SuckerPair } from "juice-sdk-core";
import { chainIdMap } from "@/app/constants";
import { ChainLogo } from "@/components/ChainLogo";
import Link from "next/link";

export function Header() {
  const { projectId } = useJBContractContext();
  const { metadata } = useJBProjectMetadataContext();
  const { token } = useJBTokenContext();

  const { data: projects } = useSubgraphQuery(ProjectsDocument, {
    where: {
      projectId: Number(projectId),
    },
    first: 1,
  });
  const { data: nativeTokenSurplus } = useNativeTokenSurplus();
  const suckerPairs = useSuckers();


  const { contributorsCount } = projects?.projects?.[0] ?? {};
  const { name: projectName, logoUri } = metadata?.data ?? {};
  const issuance = useFormattedTokenIssuance();
  const { ruleset } = useJBRulesetContext();
  const timeLeft = useCountdownToDate(
    new Date(
      ((ruleset?.data?.start ?? 0) + (ruleset?.data?.duration ?? 0)) * 1000
    )
  ); 
  return (
    <header className="mb-8">
      <div className="flex items-center gap-4">
        {logoUri ? (
          <Image
            src={ipfsUriToGatewayUrl(logoUri)}
            className="rounded-md overflow-hidden block"
            alt={"revnet logo"}
            width={80}
            height={80}
          />
        ) : (
          <div className="rounded-lg bg-zinc-100 h-20 w-20 flex items-center justify-center">
            <ForwardIcon className="h-5 w-5 text-zinc-700" />
          </div>
        )}

        <div>
          <div className="flex flex-col sm:flex-row items-center sm:gap-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{projectName}</h1>
            {token?.data ? (
              <EtherscanLink
                value={token.data.address}
                className="text-zinc-500 tracking-tight"
              >
                {formatTokenSymbol(token)}
              </EtherscanLink>
            ) : null}
              {(suckerPairs.data as SuckerPair[])?.map((pair) => {
                if (!pair) return null

                const networkName = chainIdMap[pair?.peerChainId as JBChainId];
                return (
                  <Link
                    className="underline"
                    key={networkName}
                    href={`/${networkName}/${pair.projectId}`}
                  >
                    <ChainLogo chainId={pair.peerChainId as JBChainId} width={18} height={18} />
                  </Link>
                );
              })}
          </div>
          
          <div className="flex gap-4 items-center">
            <TvlDatum />
            <span className="text-md">
              <span className="font-medium text-zinc-500">
                {contributorsCount ?? 0}
              </span>{" "}
              <span className="text-zinc-500">
                {contributorsCount === 1 ? "owner" : "owners"}
              </span>
            </span>
            <span className="text-md text-teal-600">
              <span>
                  Next issuance cut in 
              </span>{" "}
              {timeLeft &&
                <span className="font-medium">
                    {formatSeconds(timeLeft)}
                </span>
              }
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
