"use client";

import { RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";
import { Ether } from "@/components/Ether";
import EtherscanLink from "@/components/EtherscanLink";
import { Button } from "@/components/ui/button";
import {
  useParticipantsQuery,
  useProjectCreateEventQuery,
  useProjectsQuery,
} from "@/generated/graphql";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { ForwardIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { FixedInt } from "fpnum";
import {
  JBProjectToken,
  NATIVE_TOKEN,
  SplitGroup,
  getTokenBPrice,
  getTokenRedemptionQuoteEth,
} from "juice-sdk-core";
import {
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBRulesetContext,
  useJBTokenContext,
  useJbControllerLatestQueuedRulesetOf,
  useJbControllerPendingReservedTokenBalanceOf,
  useJbMultiTerminalCurrentSurplusOf,
  useJbSplitsSplitsOf,
  useJbTokensTotalBalanceOf,
  useJbTokensTotalSupplyOf,
} from "juice-sdk-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { DistributeReservedTokensButton } from "./DistributeReservedTokensButton";
import { NetworkDetailsTable } from "./NetworkDetailsTable";
import { ParticipantsTable } from "./ParticipantsTable";
import { PriceIncreaseCountdown } from "./PriceIncreaseCountdown";
import StepChart from "./StepChart";
import { ActivityFeed } from "./activity/ActivityFeed";
import { PayForm } from "./pay/PayForm";
import { RedeemDialog } from "./redeem/RedeemDialog";

export function NetworkDashboard() {
  const [participantsView, setParticipantsView] = useState<"table" | "pie">(
    "pie"
  );

  const {
    projectId,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { address: userAddress } = useAccount();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { data: latestConfiguredRuleset } =
    useJbControllerLatestQueuedRulesetOf({
      args: [projectId],
    });

  const nativeTokenSymbol = useNativeTokenSymbol();

  const [latestConfiguredRulesetData] = latestConfiguredRuleset ?? [];
  const { data: latestConfiguredReservedTokenSplits } = useJbSplitsSplitsOf({
    args: latestConfiguredRulesetData
      ? [
          projectId,
          latestConfiguredRulesetData.id,
          BigInt(SplitGroup.ReservedTokens),
        ]
      : undefined,
  });

  const { token } = useJBTokenContext();

  const tokenA = { symbol: nativeTokenSymbol, decimals: 18 };

  const { data: overflowEth } = useJbMultiTerminalCurrentSurplusOf({
    address: primaryNativeTerminal.data ?? undefined,
    args: [projectId, 18n, BigInt(NATIVE_TOKEN)],
    watch: true,
    staleTime: 10_000, // 10 seconds
  });

  const { data: tokensReserved } = useJbControllerPendingReservedTokenBalanceOf(
    {
      args: [projectId],
    }
  );
  const { data: totalTokenSupply } = useJbTokensTotalSupplyOf({
    args: [projectId],
  });

  const totalOutstandingTokens =
    (totalTokenSupply ?? 0n) + (tokensReserved ?? 0n);

  // TODO move to a context
  const { data: reservedTokenSplits } = useJbSplitsSplitsOf({
    args:
      ruleset && ruleset?.data
        ? [projectId, ruleset.data.id, RESERVED_TOKEN_SPLIT_GROUP_ID]
        : undefined,
  });

  const boost = reservedTokenSplits?.[0];
  const boostRecipient = boost?.beneficiary;
  const { data: projectCreateEvent } = useProjectCreateEventQuery({
    variables: { where: { projectId: Number(projectId) } },
  });
  const projectCreateEventTxHash =
    projectCreateEvent?.projectEvents[0].projectCreateEvent?.txHash;

  // set title
  // TODO, hacky, probably eventually a next-idiomatic way to do this.
  useEffect(() => {
    if (!token?.data?.symbol) return;
    document.title = `$${token?.data?.symbol} | REVNET`;
  }, [token?.data?.symbol]);

  const { data: projects } = useProjectsQuery({
    variables: {
      where: {
        projectId: Number(projectId),
      },
      first: 1,
    },
  });
  const { data: participantsData } = useParticipantsQuery({
    variables: {
      // orderBy: Participant_OrderBy.balance,
      // orderDirection: OrderDirection.desc,
      where: {
        projectId: Number(projectId),
        // balance_gt: "0", // TODO is this a subgraph bug?
        // wallet_not: zeroAddress,
      },
    },
    pollInterval: 10_000,
  });

  const { contributorsCount, createdAt } = projects?.projects?.[0] ?? {};
  const { metadata } = useJBProjectMetadataContext();
  const { name: projectName, logoUri, description } = metadata?.data ?? {};

  const { data: creditBalance } = useJbTokensTotalBalanceOf({
    args: userAddress ? [userAddress, projectId] : undefined,
    select(data) {
      return new JBProjectToken(data);
    },
  });

  const creditBalanceRedemptionQuote =
    overflowEth && totalTokenSupply && tokensReserved && rulesetMetadata?.data
      ? new FixedInt(
          getTokenRedemptionQuoteEth(creditBalance?.value ?? 0n, {
            overflowWei: overflowEth,
            totalSupply: totalTokenSupply,
            redemptionRate: rulesetMetadata.data.redemptionRate.value,
            tokensReserved,
          }),
          tokenA.decimals
        )
      : null;

  const totalSupplyFormatted =
    totalTokenSupply && token?.data
      ? formatUnits(totalTokenSupply, token.data.decimals)
      : null;

  const exitLeadingZeroes =
    totalSupplyFormatted?.split(".")[1]?.match(/^0+/)?.[0]?.length ?? 0;

  // if total supply is less than 1, use a decimal for the exit price base unit (0.1, 0.01, 0.001, etc.)
  // if total supply is greater than 1, use 1 for the exit price base unit.
  const exitFloorPriceUnit =
    totalSupplyFormatted && totalTokenSupply && token?.data
      ? totalTokenSupply < parseUnits("1", token.data.decimals)
        ? `0.${"0".repeat(exitLeadingZeroes)}1`
        : "1"
      : null;

  const exitFloorPrice =
    token?.data &&
    typeof tokensReserved !== "undefined" &&
    totalTokenSupply &&
    overflowEth &&
    exitFloorPriceUnit &&
    rulesetMetadata?.data
      ? getTokenRedemptionQuoteEth(
          parseUnits(exitFloorPriceUnit as `${number}`, token.data.decimals),
          {
            overflowWei: overflowEth,
            totalSupply: totalTokenSupply,
            redemptionRate: rulesetMetadata?.data?.redemptionRate.value,
            tokensReserved,
          }
        ) * 10n
      : null;
  const currentTokenBPrice =
    ruleset?.data && rulesetMetadata?.data
      ? getTokenBPrice(tokenA.decimals, {
          weight: ruleset?.data?.weight,
          reservedRate: rulesetMetadata?.data?.reservedRate,
        })
      : null;

  return (
    <div>
      <div className="flex gap-10 container py-10 md:flex-nowrap flex-wrap">
        {/* Column 1 */}
        <div className="flex-1">
          <header className="mb-10">
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
                <div className="flex items-baseline gap-2 mb-2">
                  <h1 className="text-3xl font-medium tracking-tight">
                    {projectName}
                  </h1>
                  {token?.data ? (
                    <EtherscanLink
                      value={token.data.address}
                      className="text-zinc-500"
                    >
                      {token.data.symbol}
                    </EtherscanLink>
                  ) : null}
                </div>
                <div className="flex gap-4">
                  {typeof overflowEth !== "undefined" ? (
                    <span className="text-sm">
                      <span className="font-medium text-zinc-500">
                        <Ether wei={overflowEth} />
                      </span>{" "}
                      <span className="text-zinc-500">TVL</span>
                    </span>
                  ) : null}
                  <span className="text-sm">
                    <span className="font-medium text-zinc-500">
                      {contributorsCount ?? 0}
                    </span>{" "}
                    <span className="text-zinc-500">
                      {contributorsCount === 1 ? "holder" : "holders"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div>
                {/* <div className="text-sm text-zinc-500">Current price</div> */}
                <span className="text-2xl">
                  {currentTokenBPrice?.format(4)} {tokenA.symbol}
                </span>
                <span className="text-base leading-tight text-zinc-500">
                  {" "}
                  / {token?.data?.symbol}
                </span>
              </div>
              <PriceIncreaseCountdown />

              {/* <div>
                {timeLeft ? (
                  <Badge
                    variant="destructive"
                    className="bg-orange-100 flex gap-1 items-center text-orange-900 hover:bg-orange-100"
                  >
                    <ArrowTrendingUpIcon className="h-3 w-3" />+
                    {entryTax?.formatPercentage()}% in {formatSeconds(timeLeft)}
                  </Badge>
                ) : null}
              </div> */}
            </div>

            <div className="mb-12">
              <StepChart />
            </div>

            {/* <div className="my-12 border-b border-zinc-100 py-10">
              <div className="flex gap-12"> */}
            {/* {typeof contributorsCount !== "undefined" ? (
                  <Stat label="Participants">
                    {contributorsCount === 0 ? 0 : contributorsCount + 1}
                  </Stat>
                ) : null} */}
            {/* </div>
            </div> */}

            <div className="mb-16">
              <div className="mb-5">
                <h2 className="text-2xl font-medium mb-1">
                  About {projectName}
                </h2>
                {createdAt && projectCreateEventTxHash ? (
                  <EtherscanLink
                    value={projectCreateEventTxHash}
                    type="tx"
                    className="text-zinc-500 text-sm block"
                  >
                    Since {format(createdAt * 1000, "yyyy-MM-dd")}
                  </EtherscanLink>
                ) : null}
              </div>
              {description
                ? description.split("\n").map((d, idx) => (
                    <p className="mb-3" key={idx}>
                      {d}
                    </p>
                  ))
                : null}
            </div>

            <div className="mb-16">
              <h3 className="text-base font-medium mb-2">Holders</h3>

              {token?.data &&
              participantsData &&
              participantsData.participants.length > 0 ? (
                <>
                  <div className="max-h-96 overflow-auto p-2 bg-zinc-50 rounded-md border-zinc-100 border">
                    <ParticipantsTable
                      participants={participantsData}
                      token={token?.data}
                      totalSupply={totalOutstandingTokens}
                      boostRecipient={boostRecipient}
                    />
                  </div>
                  {/* <ParticipantsPieChart
                    participants={participantsData}
                    totalSupply={totalOutstandingTokens}
                    token={token?.data}
                  /> */}
                </>
              ) : (
                <span className="text-zinc-500">No holders yet.</span>
              )}
            </div>

            <div className="mb-10">
              <h3 className="text-base font-medium mb-2">Configuration</h3>

              <NetworkDetailsTable />
            </div>

            <div>
              <DistributeReservedTokensButton />
            </div>

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
        <div className="md:w-[340px] md:block">
          <div className="mb-10">
            {token?.data && boostRecipient ? (
              <PayForm
                tokenA={tokenA}
                tokenB={token.data}
                boostRecipient={boostRecipient}
              />
            ) : null}
          </div>

          <div className="mb-16 bg-zinc-50 border border-zinc-200 w-full shadow-lg rounded-xl p-4 flex justify-between gap-2 flex-wrap items-center">
            <div>
              <div className="mb-1">Your tokens</div>
              <div className="text-lg overflow-auto mb-1">
                {creditBalance?.format(6) ?? 0} {token?.data?.symbol}
              </div>
              {creditBalance && creditBalanceRedemptionQuote ? (
                <div className="text-xs text-zinc-500">
                  ≈ {creditBalanceRedemptionQuote.format(8)} {tokenA.symbol}
                </div>
              ) : null}
            </div>
            {token?.data && creditBalance && primaryNativeTerminal.data ? (
              <RedeemDialog
                projectId={projectId}
                creditBalance={creditBalance}
                tokenSymbol={token.data.symbol}
                primaryTerminalEth={primaryNativeTerminal.data}
              >
                <Button variant="outline" disabled={creditBalance.value === 0n}>
                  Redeem
                </Button>
              </RedeemDialog>
            ) : null}
          </div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
