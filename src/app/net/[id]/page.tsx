"use client";

import { Ether } from "@/components/Ether";
import EtherscanLink from "@/components/EtherscanLink";
import { Badge } from "@/components/ui/badge";
import { Html } from "@/components/ui/html";
import { Stat } from "@/components/ui/stat";
import {
  OrderDirection,
  Participant_OrderBy,
  useParticipantsQuery,
  useProjectsQuery,
} from "@/generated/graphql";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { useProjectMetadata } from "@/hooks/juicebox/useProjectMetadata";
import { formatSeconds } from "@/lib/utils";
import { format } from "date-fns";
import {
  JB_CURRENCIES,
  PV2,
  SplitGroup,
  formatEthAddress,
  getTokenBPrice,
  getTokenRedemptionQuoteEth,
  useJBFundingCycleContext,
  useJBProjectContext,
  useJbController3_1ReservedTokenBalanceOf,
  useJbProjectsOwnerOf,
  useJbSingleTokenPaymentTerminalStoreCurrentTotalOverflowOf,
  useJbSplitsStoreSplitsOf,
  useJbTokenStoreTokenOf,
  useJbTokenStoreTotalSupplyOf,
} from "juice-hooks";
import { useEffect } from "react";
import { etherUnits, formatUnits, parseUnits, zeroAddress } from "viem";
import { useToken } from "wagmi";
import { Providers } from "./Providers";
import { ParticipantsTable } from "./components/ParticipantsTable";
import StepChart from "./components/StepChart";
import { PayForm } from "./components/pay/PayForm";

function NetworkDashboard() {
  const {
    projectId,
    contracts: { primaryTerminalEthStore },
  } = useJBProjectContext();
  const { fundingCycleData, fundingCycleMetadata } = useJBFundingCycleContext();

  const { data: address } = useJbProjectsOwnerOf({
    args: [projectId],
  });

  // const {data: controllerAddress} = useJbDirectoryControllerOf({
  //   args: [projectId],
  // })

  const { data: tokenAddress } = useJbTokenStoreTokenOf({
    args: [projectId],
  });
  const { data: token } = useToken({ address: tokenAddress });
  const tokenA = { symbol: "ETH", decimals: 18 };

  const { data: overflowEth } =
    useJbSingleTokenPaymentTerminalStoreCurrentTotalOverflowOf({
      address: primaryTerminalEthStore?.data,
      args: [projectId, BigInt(etherUnits.wei), JB_CURRENCIES.ETH],
      watch: true,
      staleTime: 10_000, // 10 seconds
    });
  const { data: tokensReserved } = useJbController3_1ReservedTokenBalanceOf({
    args: [projectId],
  });
  const { data: totalTokenSupply } = useJbTokenStoreTotalSupplyOf({
    args: [projectId],
  });

  const totalOutstandingTokens =
    (totalTokenSupply ?? 0n) + (tokensReserved ?? 0n);

  const { data: reservedTokenSplits } = useJbSplitsStoreSplitsOf({
    args: fundingCycleData?.data
      ? [
          projectId,
          fundingCycleData.data?.configuration,
          BigInt(SplitGroup.ReservedTokens),
        ]
      : undefined,
  });

  const boost = reservedTokenSplits?.[0];
  const boostRecipient = boost?.beneficiary;

  // set title
  // TODO, hacky, probably eventually a next-idiomatic way to do this.
  useEffect(() => {
    if (!token?.symbol) return;
    document.title = `$${token?.symbol} | REVNET`;
  }, [token?.symbol]);

  const { data: projects } = useProjectsQuery({
    variables: {
      where: {
        projectId: Number(projectId),
        pv: PV2,
      },
      first: 1,
    },
  });
  const { data: participantsData } = useParticipantsQuery({
    variables: {
      orderBy: Participant_OrderBy.balance,
      orderDirection: OrderDirection.desc,
      where: {
        projectId: Number(projectId),
        pv: PV2,
        balance_gt: "0",
        wallet_not: zeroAddress,
      },
    },
    pollInterval: 10_000,
  });

  const { metadataUri, contributorsCount, createdAt } =
    projects?.projects?.[0] ?? {};
  console.log(createdAt);
  const { data: projectMetadata } = useProjectMetadata(metadataUri);
  const { name: projectName, projectTagline, logoUri } = projectMetadata ?? {};

  const entryTax = fundingCycleData?.data?.discountRate;
  const exitTax = fundingCycleMetadata?.data?.redemptionRate;
  const devTax = fundingCycleMetadata?.data?.reservedRate;

  const totalSupplyFormatted =
    totalTokenSupply && token
      ? formatUnits(totalTokenSupply, token.decimals)
      : null;

  const exitLeadingZeroes =
    totalSupplyFormatted?.split(".")[1]?.match(/^0+/)?.[0]?.length ?? 0;

  // if total supply is less than 1, use a decimal for the exit price base unit (0.1, 0.01, 0.001, etc.)
  // if total supply is greater than 1, use 1 for the exit price base unit.
  const exitFloorPriceUnit =
    totalSupplyFormatted && totalTokenSupply && token
      ? totalTokenSupply < parseUnits("1", token.decimals)
        ? `0.${"0".repeat(exitLeadingZeroes)}1`
        : "1"
      : null;

  const exitFloorPrice =
    token &&
    typeof tokensReserved !== "undefined" &&
    totalTokenSupply &&
    overflowEth &&
    exitFloorPriceUnit &&
    fundingCycleMetadata?.data
      ? getTokenRedemptionQuoteEth(
          parseUnits(exitFloorPriceUnit as `${number}`, token.decimals),
          {
            overflowWei: overflowEth,
            totalSupply: totalTokenSupply,
            redemptionRate: fundingCycleMetadata?.data?.redemptionRate.val,
            tokensReserved,
          }
        ) * 10n
      : null;
  const currentTokenBPrice =
    fundingCycleData?.data && fundingCycleMetadata?.data
      ? getTokenBPrice(tokenA.decimals, {
          weight: fundingCycleData?.data?.weight,
          reservedRate: fundingCycleMetadata?.data?.reservedRate,
        })
      : null;

  return (
    <div>
      <header className="mb-10">
        <div className="container flex justify-between md:items-center py-10 md:flex-row flex-col gap-5 ">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {logoUri && (
                <img
                  src={ipfsUriToGatewayUrl(logoUri)}
                  className="rounded-full overflow-hidden h-9 w-9 block"
                  alt={token?.symbol}
                />
              )}
              <h1 className="text-3xl font-semibold tracking-tight">
                {projectName}
              </h1>
              {token ? (
                <Badge variant="secondary" className="font-normal">
                  <EtherscanLink value={formatEthAddress(token.address)}>
                    ${token?.symbol}
                  </EtherscanLink>
                </Badge>
              ) : null}
            </div>
            <div className="text-zinc-500">
              <span>{projectTagline}</span>
            </div>
            {/* <div className="mb-1">
              <span className="text-4xl font-bold mr-2">
                <Ether wei={ethQuote} />
              </span>
              <span className="text-sm"> / ${token?.symbol}</span>
            </div> */}
            {/* {exitFloorPrice ? (
              <div className="text-sm">
                <span className="font-medium">
                  <Ether wei={exitFloorPrice} />
                </span>{" "}
                / {exitFloorPriceUnit} {token?.symbol} current floor
              </div>
            ) : null} */}
          </div>
          <div className="flex gap-12">
            {typeof overflowEth !== "undefined" ? (
              <Stat label="Backed by">
                <Ether wei={overflowEth} />
              </Stat>
            ) : null}
            {typeof contributorsCount !== "undefined" ? (
              <Stat label="Participants">{contributorsCount}</Stat>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-20 container ">
        <div className="col-span-2 order-1 md:-order-1">
          <div className="max-w-4xl mx-auto">
            <div>
              <div className="text-3xl mb-1">
                {currentTokenBPrice?.format(4)} {tokenA.symbol}
                <span className="text-base leading-tight">
                  {" "}
                  / {token?.symbol}
                </span>
              </div>
              <div className="text-zinc-500 text-sm">
                {entryTax?.formatPercentage()}% increase every{" "}
                {fundingCycleData?.data?.duration === 86400n
                  ? "day"
                  : formatSeconds(
                      Number(fundingCycleData?.data?.duration ?? 0)
                    )}
                , forever
              </div>
            </div>
            <div className="mb-24">
              <StepChart />
            </div>
            {/* <div className="flex gap-10">
              <Stat label="Exit curve">{exitTax?.formatPercentage()}%</Stat>
            </div> */}

            {/* {exitFloorPrice ? (
              <Stat label="Exit value">
                {formatEther(exitFloorPrice)} / {exitFloorPriceUnit}{" "}
                {token?.symbol}
              </Stat>
            ) : null} */}

            {/* <HistoricalExitValueChart
            projectId={projectId}
            redemptionRate={exitTax.val}
            reservedRate={devTax.val}
          /> */}

            <div className="mb-16">
              <div className="mb-5">
                <h2 className="text-2xl font-medium mb-1">
                  About {projectMetadata?.name}
                </h2>
                {createdAt ? (
                  <div className="text-zinc-500 text-sm">
                    Since {format(createdAt * 1000, "yyyy-mm-dd")}
                  </div>
                ) : null}
              </div>
              {projectMetadata?.description ? (
                <Html source={projectMetadata?.description} />
              ) : null}
            </div>

            {/* <NetworkDetailsTable boost={boost} /> */}

            <div className="mb-16">
              <h2 className="font-medium uppercase text-sm mb-3">
                Participants
              </h2>

              {token &&
              participantsData &&
              participantsData.participants.length > 0 ? (
                <ParticipantsTable
                  participants={participantsData}
                  token={token}
                  totalSupply={totalOutstandingTokens}
                  boostRecipient={boostRecipient}
                />
              ) : (
                "No participants yet."
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
          {formatEther(nextCycleEthQuote)} ETH / {token?.symbol} (+
          {formatEther(nextCycleEthQuote - ethQuote)} ETH)
        </div> */}
          </div>
        </div>
        <div>{token ? <PayForm tokenA={tokenA} tokenB={token} /> : null}</div>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  const projectId = BigInt(params.id);

  return (
    <Providers projectId={projectId}>
      <NetworkDashboard />
    </Providers>
  );
}
