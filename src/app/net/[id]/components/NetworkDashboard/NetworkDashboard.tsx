"use client";

import {
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { useEffect } from "react";
import { ActivityFeed } from "../ActivityFeed";
import { DistributeReservedTokensButton } from "../DistributeReservedTokensButton";
import { NetworkDetailsTable } from "../NetworkDetailsTable";
import { PayCard } from "../PayCard/PayCard";
import { UserTokenBalanceCard } from "../UserTokenBalanceCard/UserTokenBalanceCard";
import { Header } from "./Header/Header";
import { ChartSection } from "./sections/ChartSection/ChartSection";
import { DescriptionSection } from "./sections/DescriptionSection/DescriptionSection";
import { HoldersSection } from "./sections/HoldersSection/HoldersSection";

export function NetworkDashboard() {
  const { token } = useJBTokenContext();
  const { metadata } = useJBProjectMetadataContext();
  const { name } = metadata?.data ?? {};

  // set title
  // TODO, hacky, probably eventually a next-idiomatic way to do this.
  useEffect(() => {
    if (!token?.data?.symbol) return;
    document.title = `$${token?.data?.symbol} | REVNET`;
  }, [token?.data?.symbol]);

  return (
    <div className="flex gap-10 container py-10 md:flex-nowrap flex-wrap mb-10">
      {/* Column 1 */}
      <div className="flex-1">
        <Header />

        <div className="max-w-4xl mx-auto">
          <section className="mb-14">
            <ChartSection />
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-medium mb-1">About {name}</h2>
            <DescriptionSection />
          </section>

          <section className="mb-8">
            <h3 className="text-base font-medium mb-2">Holders</h3>

            <HoldersSection />
          </section>

          <section>
            <h3 className="text-base font-medium mb-2">Configuration</h3>

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
