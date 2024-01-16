"use client";

import { Ether } from "@/components/Ether";
import EtherscanLink from "@/components/EtherscanLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Html } from "@/components/ui/html";
import { useParticipantsQuery } from "@/generated/graphql";
import { useProjectMetadata } from "@/hooks/juicebox/useProjectMetadata";
import { useCountdownToDate } from "@/hooks/useCountdownToDate";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import {
  useJbControllerLatestQueuedRulesetOf,
  useJbControllerMetadataOf,
  useJbControllerPendingReservedTokenBalanceOf,
  useJbMultiTerminalCurrentSurplusOf,
  useJbSplitsSplitsOf,
  useJbTokensTotalBalanceOf,
  useJbTokensTotalSupplyOf,
} from "@/lib/juicebox/hooks/contract";
import { formatSeconds } from "@/lib/utils";
import { ClockIcon } from "@heroicons/react/24/outline";
import { FixedInt } from "fpnum";
import {
  JBToken,
  SplitGroup,
  getTokenBPrice,
  getTokenRedemptionQuoteEth,
} from "juice-sdk-core";
import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useJBContractContext } from "../contexts/JBContractContext/JBContractContext";
import { useJBRulesetContext } from "../contexts/JBRulesetContext/JBRulesetContext";
import { useJBTokenContext } from "../contexts/JBTokenContext/JBTokenContext";
import { NATIVE_TOKEN } from "../contexts/datatypes";
import { ParticipantsPieChart } from "./ParticipantsPieChart";
import { ParticipantsTable } from "./ParticipantsTable";
import StepChart from "./StepChart";
import { ActivityFeed } from "./activity/ActivityFeed";
import { PayForm } from "./pay/PayForm";
import { RedeemDialog } from "./redeem/RedeemDialog";

const RESERVED_TOKEN_SPLIT_GROUP_ID = 1n;

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

  const [
    latestConfiguredRulesetData,
    latestConfiguredRulesetMetadata,
    latestConfiguredRulesetApprovalStatus,
  ] = latestConfiguredRuleset ?? [];
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
    address: primaryNativeTerminal.data,
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

  const { data: reservedTokenSplits } = useJbSplitsSplitsOf({
    args:
      ruleset && ruleset?.data
        ? [projectId, ruleset.data.id, RESERVED_TOKEN_SPLIT_GROUP_ID]
        : undefined,
  });

  const boost = reservedTokenSplits?.[0];
  const boostRecipient = boost?.beneficiary;
  // const { data: projectCreateEvent } = useProjectCreateEventQuery({
  //   variables: { where: { projectId: Number(projectId), pv: PV2 } },
  // });
  // const projectCreateEventTxHash =
  //   projectCreateEvent?.projectEvents[0].projectCreateEvent?.txHash;

  // set title
  // TODO, hacky, probably eventually a next-idiomatic way to do this.
  useEffect(() => {
    if (!token?.data?.symbol) return;
    document.title = `$${token?.data?.symbol} | REVNET`;
  }, [token?.data?.symbol]);

  // const { data: projects } = useProjectsQuery({
  //   variables: {
  //     where: {
  //       projectId: Number(projectId),
  //       pv: PV2,
  //     },
  //     first: 1,
  //   },
  // });
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

  // const { metadataUri, contributorsCount, createdAt } =
  //   projects?.projects?.[0] ?? {};
  const { data: metadataUri } = useJbControllerMetadataOf({
    args: [projectId],
  });
  const { data: projectMetadata } = useProjectMetadata(metadataUri);
  const { name: projectName, projectTagline, logoUri } = projectMetadata ?? {};
  const { data: creditBalance } = useJbTokensTotalBalanceOf({
    args: userAddress ? [userAddress, projectId] : undefined,
    select(data) {
      return new JBToken(data);
    },
  });

  const creditBalanceRedemptionQuote =
    overflowEth && totalTokenSupply && tokensReserved && rulesetMetadata?.data
      ? new FixedInt(
          getTokenRedemptionQuoteEth(creditBalance?.val ?? 0n, {
            overflowWei: overflowEth,
            totalSupply: totalTokenSupply,
            redemptionRate: rulesetMetadata.data.redemptionRate.val,
            tokensReserved,
          }),
          tokenA.decimals
        )
      : null;

  const entryTax = ruleset?.data?.decayRate;
  const exitTax = rulesetMetadata?.data?.redemptionRate;
  const devTax = rulesetMetadata?.data?.reservedRate;

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
            redemptionRate: rulesetMetadata?.data?.redemptionRate.val,
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

  const timeLeft = useCountdownToDate(
    new Date(
      Number(
        ((ruleset?.data?.start ?? 0n) + (ruleset?.data?.duration ?? 0n)) * 1000n
      )
    )
  );

  return (
    <div>
      <div className="flex gap-10 container py-10">
        {/* Column 1 */}
        <div className="flex-1">
          <header className="mb-7 border-b border-zinc-100 pb-7">
            <div className="flex justify-between md:items-center md:flex-row flex-col gap-5 ">
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  {logoUri && (
                    <img
                      src={ipfsUriToGatewayUrl(logoUri)}
                      className="rounded-md overflow-hidden h-20 h-20 block"
                      alt={token?.data?.symbol}
                    />
                  )}
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {projectName}
                  </h1>
                  {token?.data ? (
                    <EtherscanLink
                      value={token.data.address}
                      className="text-zinc-500"
                    >
                      ${token.data.symbol}
                    </EtherscanLink>
                  ) : null}
                </div>
                <div className="flex gap-4">
                  {typeof overflowEth !== "undefined" ? (
                    <span className="text-zinc-500">
                      <span className="font-medium">
                        <Ether wei={overflowEth} />
                      </span>{" "}
                      TVL
                    </span>
                  ) : null}
                </div>

                {/* <div className="text-zinc-500 text-lg">{projectTagline}</div> */}
                {/* <div className="text-zinc-500">
                  <span>{projectTagline}</span>
                </div> */}
                {/* <div className="mb-1">
              <span className="text-4xl font-bold mr-2">
                <Ether wei={ethQuote} />
              </span>
              <span className="text-sm"> / ${token?.data?.symbol}</span>
            </div> */}
                {/* {exitFloorPrice ? (
              <div className="text-sm">
                <span className="font-medium">
                  <Ether wei={exitFloorPrice} />
                </span>{" "}
                / {exitFloorPriceUnit} {token?.data?.symbol} current floor
              </div>
            ) : null} */}
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="mb-2">
                <span className="text-2xl font-medium">
                  {currentTokenBPrice?.format(4)} {tokenA.symbol}
                </span>
                <span className="text-base leading-tight">
                  {" "}
                  / {token?.data?.symbol}
                </span>
              </div>
              <div className="text-zinc-500 text-sm flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span>
                    +
                    <span className="font-medium">
                      {entryTax?.formatPercentage()}%
                    </span>{" "}
                    every{" "}
                    <span className="font-medium">
                      {ruleset?.data?.duration === 86400n
                        ? "day"
                        : formatSeconds(Number(ruleset?.data?.duration ?? 0))}
                    </span>
                  </span>
                </div>
                {timeLeft ? (
                  <Badge
                    variant="destructive"
                    className="bg-orange-100 flex gap-1 items-center text-orange-900 hover:bg-orange-100"
                  >
                    <ClockIcon className="h-3 w-3" /> Price increase in{" "}
                    {formatSeconds(timeLeft)}
                  </Badge>
                ) : null}
              </div>
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

            {/* <div className="flex gap-10">
              <Stat label="Exit curve">{exitTax?.formatPercentage()}%</Stat>
            </div> */}

            {/* {exitFloorPrice ? (
              <Stat label="Exit value">
                {formatEther(exitFloorPrice)} / {exitFloorPriceUnit}{" "}
                {token?.data?.symbol}
              </Stat>
            ) : null} */}

            {/* <HistoricalExitValueChart
            projectId={projectId}
            redemptionRate={exitTax.val}
            reservedRate={devTax.val}
          /> */}

            <div className="mb-10">
              <div className="mb-5">
                <h2 className="text-2xl font-medium mb-1">
                  About {projectMetadata?.name}
                </h2>
                {/* {createdAt && projectCreateEventTxHash ? (
                  <EtherscanLink
                    value={projectCreateEventTxHash}
                    type="tx"
                    className="text-zinc-500 text-sm block"
                  >
                    Since {format(createdAt * 1000, "yyyy-mm-dd")}
                  </EtherscanLink>
                ) : null} */}
              </div>
              {projectMetadata?.description ? (
                <Html source={projectMetadata?.description} />
              ) : null}
            </div>

            {/* <NetworkDetailsTable boost={boost} /> */}

            <div className="mb-10">
              <h2 className="text-2xl font-medium mb-1">Participants</h2>

              {token?.data &&
              participantsData &&
              participantsData.participants.length > 0 ? (
                <>
                  <ParticipantsTable
                    participants={participantsData}
                    token={token?.data}
                    totalSupply={totalOutstandingTokens}
                    boostRecipient={boostRecipient}
                  />
                  <ParticipantsPieChart
                    participants={participantsData}
                    totalSupply={totalOutstandingTokens}
                    token={token?.data}
                  />
                </>
              ) : (
                <span className="text-zinc-500">No participants yet.</span>
              )}
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
        <div className="md:w-[340px] hidden md:block">
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
                <Button variant="outline" disabled={creditBalance.val === 0n}>
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
