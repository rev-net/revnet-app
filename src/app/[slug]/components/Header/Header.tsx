"use client";

import { ChainLogo } from "@/components/ChainLogo";
import EtherscanLink from "@/components/EtherscanLink";
import { ParticipantsDocument, Project } from "@/generated/graphql";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { Profile } from "@/lib/profile";
import { getProjectLinks } from "@/lib/projectLinks";
import { formatTokenSymbol } from "@/lib/utils";
import { JB_CHAINS } from "@bananapus/nana-sdk-core";
import {
  JBChainId,
  useBendystrawQuery,
  useJBChainId,
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
  useSuckers,
} from "@bananapus/nana-sdk-react";
import { ForwardIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { Suspense, use, useMemo } from "react";
import { TvlDatum } from "./TvlDatum";

interface Props {
  isRevnet: boolean;
  operatorPromise: Promise<Profile | null>;
  projects: Array<
    Pick<
      Project,
      "chainId" | "projectId" | "token" | "decimals" | "balance" | "suckerGroupId" | "tokenSymbol"
    >
  >;
}

export function Header(props: Props) {
  const { isRevnet, operatorPromise, projects } = props;
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
                height={120}
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
          <div className="flex h-[120px] w-[120px] items-center justify-center rounded bg-zinc-100 sm:size-36">
            <ForwardIcon className="h-5 w-5 text-black" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-col items-baseline sm:flex-row sm:gap-4">
            <span className="font-mono text-3xl font-bold">
              {tokenContext?.data ? (
                <EtherscanLink
                  value={tokenContext.data.address}
                  type="token"
                  chain={chainId ? JB_CHAINS[chainId].chain : undefined}
                  className="inline-flex min-h-11 items-center"
                >
                  {formatTokenSymbol(tokenContext)}
                </EtherscanLink>
              ) : null}
            </span>
            <h1 className="text-3xl font-medium">{projectName}</h1>
          </div>
          {!isRevnet ? (
            <p className="text-base leading-relaxed text-zinc-700">
              This project isn&apos;t a revnet. Try looking for it on{" "}
              <Link className="underline underline-offset-4" href="https://juicebox.money">
                https://juicebox.money
              </Link>
              .
            </p>
          ) : null}
          {isRevnet ? (
            <>
              <div className="flex sm:flex-row flex-col sm:items-center items-leading sm:gap-4 items-start">
                <TvlDatum projects={projects} />
                <div className="sm:text-xl text-lg">
                  <span className="font-medium text-black-500">{contributorsCount ?? 0}</span>{" "}
                  <span className="text-zinc-500">
                    {contributorsCount === 1 ? "owner" : "owners"}
                  </span>
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
                {(operator || website || suckers?.length) && (
                  <div className="mt-1.5 flex flex-wrap items-center text-[15px] text-zinc-700">
                    {operator && (
                      <span>
                        <span className="text-zinc-500">Operator:</span>{" "}
                        <EtherscanLink
                          value={operator.address}
                          className="inline-flex min-h-11 items-center font-medium text-zinc-900"
                        >
                          {operator.displayName}
                        </EtherscanLink>
                      </span>
                    )}
                    {operator && website ? (
                      <span aria-hidden className="mx-2.5 text-zinc-300">
                        |
                      </span>
                    ) : null}
                    {website && (
                      <span>
                        <span className="text-zinc-500">Site:</span>{" "}
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center font-medium text-zinc-900 hover:underline"
                        >
                          {website.url.replace(/^https?:\/\//, "")}
                        </a>
                      </span>
                    )}
                    {(operator || website) && suckers?.length ? (
                      <span aria-hidden className="mx-2.5 text-zinc-300">
                        |
                      </span>
                    ) : null}
                    {suckers?.length ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-zinc-500">On:</span>
                        {suckers.map((pair) => {
                          const networkSlug = JB_CHAINS[pair.peerChainId].slug;
                          return (
                            <Link
                              key={networkSlug}
                              href={`/v${version}:${networkSlug}:${pair.projectId}`}
                              className="inline-flex min-h-11 min-w-11 items-center justify-center transition-opacity hover:opacity-70"
                            >
                              <ChainLogo
                                chainId={pair.peerChainId as JBChainId}
                                width={18}
                                height={18}
                              />
                            </Link>
                          );
                        })}
                      </span>
                    ) : null}
                  </div>
                )}
              </Suspense>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
