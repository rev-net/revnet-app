"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuckerPairs } from "juice-sdk-core";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "juice-sdk-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect } from "react";
import { zeroAddress } from "viem";
import {
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
  sepolia,
} from "viem/chains";
import { useChainId, useConfig } from "wagmi";
import { ActivityFeed } from "../ActivityFeed";
import { DistributeReservedTokensButton } from "../DistributeReservedTokensButton";
import { NetworkDetailsTable } from "../NetworkDetailsTable";
import { PayCard } from "../PayCard/PayCard";
import { UserTokenBalanceCard } from "../UserTokenBalanceCard/UserTokenBalanceCard";
import { Header } from "./Header/Header";
import { ChartSection } from "./sections/ChartSection/ChartSection";
import { DescriptionSection } from "./sections/DescriptionSection/DescriptionSection";
import { HoldersSection } from "./sections/HoldersSection/HoldersSection";
import { chainNameMap, chainNames } from "@/app/constants";

export function NetworkDashboard() {
  const { contracts, projectId } = useJBContractContext();
  const { token } = useJBTokenContext();
  const { metadata } = useJBProjectMetadataContext();
  const { name } = metadata?.data ?? {};
  const config = useConfig();
  const chainId = useJBChainId();
  const suckerPairs = useQuery({
    queryKey: ["suckerPairs", projectId.toString(), chainId?.toString()],
    queryFn: async () => {
      if (!chainId) return;
      const data = await getSuckerPairs({
        projectId,
        chainId,
        config,
      });

      return data;
    },
  });

  // set title
  // TODO, hacky, probably eventually a next-idiomatic way to do this.
  useEffect(() => {
    if (!token?.data?.symbol) return;
    document.title = `$${token?.data?.symbol} | REVNET`;
  }, [token?.data?.symbol]);

  const pageLoading = metadata.isLoading && contracts.controller.isLoading;
  if (pageLoading) {
    return null;
  }

  if (contracts.controller.data === zeroAddress) {
    notFound();
  }

  return (
    <div className="flex gap-10 container py-10 md:flex-nowrap flex-wrap mb-10">
      {/* Column 1 */}
      <div className="flex-1">
        <Header />

        <div className="max-w-4xl mx-auto">
          <section className="mb-10">
            <ChartSection />
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-1">About {name}</h2>
            <div className="flex gap-3">
              {suckerPairs.data?.map((pair) => {
                const networkName =
                  chainNameMap[pair?.peerChainId as JBChainId];
                return (
                  <Link
                    className="underline"
                    key={networkName}
                    href={`/${networkName}/net/${pair?.projectId}`}
                  >
                    {chainNames[pair?.peerChainId as JBChainId]}
                  </Link>
                );
              })}
            </div>
            <DescriptionSection />
          </section>

          <section>
            <NetworkDetailsTable />
            <div className="mt-4">
              <DistributeReservedTokensButton />
            </div>
          </section>

          {/* 
        <div>
          {totalTokenSupply && tokensReserved && token ? (
            <div>
              {formatUnits(totalTokenSupply, token.decimals)} {token.symbol} in
              circulation (+ {formatUnits(tokensReserved, token.decimals)}{" "}
              reserved)
            </div>
          ) : null}
        </div> */}

          {/* <div>
          Gen {(cycleData.number + 1n).toString()} buy price:{" "}
          {formatEther(nextCycleEthQuote)} ETH / {token?.data?.symbol} (+
          {formatEther(nextCycleEthQuote - ethQuote)} ETH)
        </div> */}
        </div>
      </div>

      {/* Column 2 */}
      <aside className="md:w-[340px] md:block">
        <div className="mb-10">
          <PayCard />
        </div>

        <UserTokenBalanceCard />

        <ActivityFeed />
      </aside>
    </div>
  );
}
