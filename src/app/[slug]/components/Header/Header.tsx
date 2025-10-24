"use client";

import { ChainLogo } from "@/components/ChainLogo";
import EtherscanLink from "@/components/EtherscanLink";
import { ParticipantsDocument, Project } from "@/generated/graphql";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { Profile } from "@/lib/profile";
import { getProjectLinks } from "@/lib/projectLinks";
import { formatTokenSymbol } from "@/lib/utils";
import { ForwardIcon } from "@heroicons/react/24/solid";
import { JB_CHAINS } from "juice-sdk-core";
import {
  JBChainId,
  useBendystrawQuery,
  useJBChainId,
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
  useSuckers,
} from "juice-sdk-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, use, useMemo } from "react";
import { TvlDatum } from "./TvlDatum";

interface Props {
  operatorPromise: Promise<Profile | null>;
  projects: Array<
    Pick<
      Project,
      "chainId" | "projectId" | "token" | "decimals" | "balance" | "suckerGroupId" | "tokenSymbol"
    >
  >;
}

export function Header(props: Props) {
  const { operatorPromise, projects } = props;
  const operator = use(operatorPromise);
  const { version } = useJBContractContext();
  const chainId = useJBChainId();
  const { metadata } = useJBProjectMetadataContext();
  const { token: tokenContext } = useJBTokenContext();

  const { data: participants } = useBendystrawQuery(ParticipantsDocument, {
    where: {
      suckerGroupId: projects[0].suckerGroupId,
      balance_gt: 0,
    },
    limit: 1000, // TODO will break once more than 1000 participants exist
  });

  const contributorsCount = useMemo(() => {
    // de-dupe participants who are on multiple chains
    const participantWallets = participants?.participants.items.reduce(
      (acc, curr) => (acc.includes(curr.address) ? acc : [...acc, curr.address]),
      [] as string[],
    );

    return participantWallets?.length;
  }, [participants?.participants]);

  const { data: suckers } = useSuckers();
  const { name: projectName, logoUri } = metadata?.data ?? {};

  // const totalSupply = useTotalOutstandingTokens();
  // const totalSupplyFormatted =
  //   totalSupply && token?.data
  //     ? formatUnits(totalSupply, token.data.decimals)
  //     : null;

  const links = getProjectLinks(metadata?.data);
  const website = links.find((link) => link.type === "infoUri");

  return (
    <header>
      <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4 sm:mb-6 mb-4">
        {logoUri ? (
          <>
            <div className="sm:hidden">
              <Image
                src={ipfsUriToGatewayUrl(logoUri)}
                className="overflow-hidden block border border-zinc-200"
                alt={`${projectName} logo`}
                width={120}
                height={10}
              />
            </div>
            <div className="sm:block hidden">
              <Image
                src={ipfsUriToGatewayUrl(logoUri)}
                className="overflow-hidden block border border-zinc-200"
                alt={`${projectName} logo`}
                width={144}
                height={144}
              />
            </div>
          </>
        ) : (
          <div className="rounded bg-zinc-100 h-36 w-36 flex items-center justify-center">
            <ForwardIcon className="h-5 w-5 text-zinc-700" />
          </div>
        )}

        <div>
          <div className="flex flex-col items-baseline sm:flex-row sm:gap-2 mb-2">
            <span className="text-3xl font-bold">
              {tokenContext?.data ? (
                <EtherscanLink
                  value={tokenContext.data.address}
                  type="token"
                  chain={chainId ? JB_CHAINS[chainId].chain : undefined}
                >
                  {formatTokenSymbol(tokenContext)}
                </EtherscanLink>
              ) : null}
            </span>
            <div className="text-sm flex gap-2 items-baseline">
              <h1 className="text-2xl font-medium">{projectName}</h1>
            </div>
            <div className="text-sm flex gap-2 items-baseline">
              {suckers?.map((pair) => {
                if (!pair) return null;

                const networkSlug = JB_CHAINS[pair?.peerChainId].slug;
                return (
                  <Link
                    className="underline"
                    key={networkSlug}
                    href={`/v${version}:${networkSlug}:${pair.projectId}`}
                  >
                    <ChainLogo chainId={pair.peerChainId as JBChainId} width={18} height={18} />
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex sm:flex-row flex-col sm:items-center items-leading sm:gap-4 items-start">
            <TvlDatum projects={projects} />
            <div className="sm:text-xl text-lg">
              <span className="font-medium text-black-500">{contributorsCount ?? 0}</span>{" "}
              <span className="text-zinc-500">{contributorsCount === 1 ? "owner" : "owners"}</span>
            </div>
            {/* <div className="sm:text-xl text-lg">
              <span className="font-medium text-black-500">
                {`${prettyNumber(totalSupplyFormatted ?? 0)}`}
              </span>{" "}
              <span className="text-zinc-500">{formatTokenSymbol(token)} outstanding</span>
            </div> */}
            {/* <div className="sm:text-xl text-lg">
              <span className="font-medium text-black-500">
                {!cashOutLoading
                  ? `$${Number(cashOutValue).toFixed(4)}`
                  : "..."}
              </span>{" "}
              <span className="text-zinc-500">cash out value</span>
            </div> */}
          </div>
          <Suspense>
            {(operator || website) && (
              <div className="text-[15px] text-zinc-500 mt-1.5 flex flex-wrap items-center gap-2">
                {operator && (
                  <span>
                    Operator:{" "}
                    <EtherscanLink value={operator.address}>{operator.displayName}</EtherscanLink>
                  </span>
                )}
                {operator && website && <span className="text-sm opacity-50"> | </span>}
                {website && (
                  <span>
                    Site:{" "}
                    <a
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {website.url.replace(/^https?:\/\//, "")}
                    </a>
                  </span>
                )}
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </header>
  );
}
