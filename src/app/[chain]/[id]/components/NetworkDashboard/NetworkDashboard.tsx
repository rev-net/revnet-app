"use client";

import { formatTokenSymbol } from "@/lib/utils";
import {
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { notFound } from "next/navigation";
import { useEffect } from "react";
import { zeroAddress } from "viem";
import { ActivityFeed } from "../ActivityFeed";
import { DistributeReservedTokensButton } from "../DistributeReservedTokensButton";
import { NetworkDetailsTable } from "../NetworkDetailsTable";
import { PayCard } from "../PayCard/PayCard";
import { Header } from "./Header/Header";
import { DescriptionSection } from "./sections/DescriptionSection/DescriptionSection";
import { HoldersSection } from "./sections/HoldersSection/HoldersSection";

export function NetworkDashboard() {
  const { contracts, projectId } = useJBContractContext();
  const { token } = useJBTokenContext();
  const { metadata } = useJBProjectMetadataContext();

  // set title
  // TODO, hacky, probably eventually a next-idiomatic way to do this.
  useEffect(() => {
    if (!token?.data?.symbol) return;
    document.title = `${formatTokenSymbol(token)} | REVNET`;
  }, [token]);

  const pageLoading = metadata.isLoading && contracts.controller.isLoading;
  if (pageLoading) {
    return null;
  }

  if (contracts.controller.data === zeroAddress) {
    notFound();
  }

  const payAndActivityBar = (
    <>
      <div className="mb-14">
        <PayCard />
      </div>
      <ActivityFeed />
    </>
  );

  return (
    <>
      <div className="w-full px-4 sm:container py-3">
      <Header />
      </div>
      <div className="flex gap-10 w-full px-4 sm:container pb-5 md:flex-nowrap flex-wrap mb-10">
        {/* Column 2, hide on mobile */}
        <aside className="hidden md:w-[400px] md:block">
          {payAndActivityBar}
        </aside>
      {/* Column 1 */}
      <div className="flex-1">
        {/* Render Pay and activity after header on mobile */}
        <div className="sm:hidden mb-10">{payAndActivityBar}</div>

        <div className="max-w-4xl mx-auto">
          <section className="mb-10">
            <div className="mb-8">
              <NetworkDetailsTable />
            </div>

            <div className="mb-8">
              <HoldersSection />
            </div>

            <div className="mb-8">
              <DescriptionSection />
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
    </div>
  </>
  );
}
