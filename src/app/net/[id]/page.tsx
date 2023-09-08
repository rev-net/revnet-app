"use client";

import { Ether } from "@/components/Ether";
import { EthereumAddress } from "@/components/EthereumAddress";
import EtherscanLink from "@/components/EtherscanLink";
import { PayInput } from "@/components/pay/PayInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import {
  OrderDirection,
  Participant_OrderBy,
  useParticipantsQuery,
  useProjectsQuery,
} from "@/generated/graphql";
import { useProjectMetadata } from "@/hooks/juicebox/useProjectMetadata";
import { useCountdownToDate } from "@/hooks/useCountdownToDate";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import {
  ETHER_ADDRESS,
  JB_CURRENCIES,
  ONE_ETHER,
  PV2,
} from "@/lib/juicebox/constants";
import {
  formatEthAddress,
  formatEther,
  formatSeconds,
  getNextCycleWeight,
  getPaymentQuoteEth,
  getPaymentQuoteTokens,
  getTokenRedemptionQuoteEth,
} from "@/lib/juicebox/utils";
import { SplitGroup } from "@/types/juicebox";
import { ClockIcon } from "@heroicons/react/24/outline";
import { ForwardIcon } from "@heroicons/react/24/solid";
import {
  jbSingleTokenPaymentTerminalStoreABI,
  jbethPaymentTerminal3_1_2ABI,
  useJbController3_1CurrentFundingCycleOf,
  useJbController3_1ReservedTokenBalanceOf,
  useJbDirectoryPrimaryTerminalOf,
  useJbProjectsOwnerOf,
  useJbSplitsStoreSplitsOf,
  useJbTokenStoreTokenOf,
  useJbTokenStoreTotalSupplyOf,
} from "juice-hooks";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DiscountRate, RedemptionRate, ReservedRate } from "superint";
import {
  etherUnits,
  formatUnits,
  parseEther,
  parseUnits,
  zeroAddress,
} from "viem";
import { useContractRead, useToken } from "wagmi";
import { ParticipantsTable } from "./ParticipantsTable";
import { PayDialog } from "./PayDialog";

export default function Page({ params }: { params: { id: string } }) {
  const [formPayAmountA, setFormPayAmountA] = useState<string>("");
  const [formPayAmountB, setFormPayAmountB] = useState<string>("");

  const projectId = BigInt(params.id);
  const { data: address } = useJbProjectsOwnerOf({
    args: [projectId],
  });

  // const {data: controllerAddress} = useJbDirectoryControllerOf({
  //   args: [projectId],
  // })

  // TODO assumes all projects are on Controller v3.1.
  // not a great assumption, will break for older projects, or projects using a newer controller in future.
  const { data: cycleResponse } = useJbController3_1CurrentFundingCycleOf({
    args: [projectId],
    select: ([fundingCycleData, fundingCycleMetadata]) => {
      return [
        {
          ...fundingCycleData,
          discountRate: new DiscountRate(fundingCycleData.discountRate),
        },
        {
          ...fundingCycleMetadata,
          redemptionRate: new RedemptionRate(
            fundingCycleMetadata.redemptionRate
          ),
          reservedRate: new ReservedRate(fundingCycleMetadata.reservedRate),
        },
      ];
    },
  });
  const { data: tokenAddress } = useJbTokenStoreTokenOf({
    args: [projectId],
  });
  const { data: token } = useToken({ address: tokenAddress });

  const { data: primaryTerminalEth } = useJbDirectoryPrimaryTerminalOf({
    args: [projectId, ETHER_ADDRESS],
  });

  const { data: store } = useContractRead({
    address: primaryTerminalEth,
    abi: jbethPaymentTerminal3_1_2ABI,
    functionName: "store",
  });
  const { data: overflowEth } = useContractRead({
    args: [projectId, BigInt(etherUnits.wei), JB_CURRENCIES.ETH],
    address: store,
    abi: jbSingleTokenPaymentTerminalStoreABI,
    functionName: "currentTotalOverflowOf",
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

  const [cycleData, cycleMetadata] = cycleResponse || [];

  const { data: reservedTokenSplits } = useJbSplitsStoreSplitsOf({
    args: cycleData
      ? [projectId, cycleData.configuration, BigInt(SplitGroup.ReservedTokens)]
      : undefined,
  });

  const boostRecipient = reservedTokenSplits?.[0]?.beneficiary;

  const secondsUntilNextCycle = useCountdownToDate(
    cycleData
      ? new Date(Number(cycleData?.start + cycleData?.duration) * 1000)
      : undefined
  );

  const payAmountAWei = useMemo(() => {
    if (!formPayAmountA) return 0n;
    try {
      return parseEther(`${parseFloat(formPayAmountA)}` as `${number}`);
    } catch {
      return 0n;
    }
  }, [formPayAmountA]);

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

  const { metadataUri, contributorsCount } = projects?.projects?.[0] ?? {};
  const { data: projectMetadata } = useProjectMetadata(metadataUri);
  const { name: projectName, projectTagline, logoUri } = projectMetadata ?? {};

  if (!cycleData || !cycleMetadata) return null;

  const entryTax = cycleData.discountRate;
  const exitTax = cycleMetadata.redemptionRate;
  const devTax = cycleMetadata.reservedRate;

  const ethQuote = getPaymentQuoteEth(ONE_ETHER, {
    weight: cycleData.weight,
    reservedRate: devTax.value,
  });

  const formTokensQuote =
    payAmountAWei &&
    getPaymentQuoteTokens(payAmountAWei, {
      weight: cycleData.weight,
      reservedRate: devTax.value,
    });

  // get token redemption quote AS IF the payment goes through and tokens are minted.
  const formRedemptionQuote =
    formTokensQuote &&
    token &&
    overflowEth &&
    totalTokenSupply &&
    tokensReserved
      ? getTokenRedemptionQuoteEth(formTokensQuote.payerTokens, {
          overflowWei: overflowEth + formTokensQuote.ethAmount,
          totalSupply: totalTokenSupply + formTokensQuote.payerTokens,
          redemptionRate: cycleMetadata.redemptionRate.value,
          tokensReserved,
        })
      : undefined;

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
    exitFloorPriceUnit
      ? getTokenRedemptionQuoteEth(
          parseUnits(exitFloorPriceUnit as `${number}`, token.decimals),
          {
            overflowWei: overflowEth,
            totalSupply: totalTokenSupply,
            redemptionRate: cycleMetadata.redemptionRate.value,
            tokensReserved,
          }
        ) * 10n
      : null;

  const nextCycleWeight = getNextCycleWeight({
    weight: cycleData.weight,
    discountRate: cycleData.discountRate.value,
  });

  const nextCycleEthQuote = getPaymentQuoteEth(ONE_ETHER, {
    weight: nextCycleWeight,
    reservedRate: devTax.value,
  });

  return (
    <div>
      <header>
        <div className="container container-border-x md:border-x flex justify-between md:items-center py-10 md:flex-row flex-col gap-5 ">
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
          <div className="flex gap-10">
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

      <div className="border-y border-y-zinc-400">
        <div className="container container-border-x md:border-x py-8 px-10 bg-zinc-100">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-medium">Join network</h2>
          </div>
          {token && primaryTerminalEth ? (
            <div className="flex justify-between flex-col md:flex-row mb-3 gap-10">
              <div className="w-full">
                <div className="flex gap-5 items-center flex-col md:flex-row mb-3">
                  <PayInput
                    label="You pay"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) {
                        setFormPayAmountA("");
                        setFormPayAmountB("");
                        return;
                      }

                      const amountWei = parseEther(
                        `${parseFloat(value)}` as `${number}`
                      );
                      const amountBQuote = getPaymentQuoteTokens(amountWei, {
                        weight: cycleData.weight,
                        reservedRate: devTax.value,
                      });

                      const amountBFormatted = formatUnits(
                        amountBQuote.payerTokens,
                        token?.decimals
                      );

                      setFormPayAmountA(value);
                      setFormPayAmountB(amountBFormatted);
                    }}
                    value={formPayAmountA}
                    currency="ETH"
                  />
                  <div>
                    <ArrowRight className="h-6 w-6 rotate-90 md:rotate-0" />
                  </div>
                  <PayInput
                    label="You receive"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) {
                        setFormPayAmountA("");
                        setFormPayAmountB("");
                        return;
                      }

                      const amountAQuote = parseEther(
                        `${
                          parseFloat(value) * parseFloat(formatEther(ethQuote))
                        }`
                      );
                      const amountAFormatted = formatEther(amountAQuote, {
                        decimals: 8,
                      });

                      setFormPayAmountA(amountAFormatted);
                      setFormPayAmountB(value);
                    }}
                    value={formPayAmountB}
                    currency={token?.symbol}
                  />
                </div>
                <div className="flex justify-between gap-3 items-center md:items-start flex-col md:flex-row">
                  <div className="flex flex-col gap-2 text-sm items-center md:items-start">
                    <div>
                      1 {token?.symbol} = <Ether wei={ethQuote} />
                    </div>

                    {secondsUntilNextCycle ? (
                      <div className="gap-1 text-orange-600 text-xs flex items-center font-medium">
                        <ClockIcon className="w-4 h-4" />
                        {entryTax.toPercentage()}% increase scheduled in{" "}
                        {formatSeconds(secondsUntilNextCycle)}
                      </div>
                    ) : null}
                  </div>
                  {devTax && boostRecipient ? (
                    <span className="text-sm inline-flex items-center gap-1">
                      <ForwardIcon className="h-4 w-4 inline-block" />
                      {devTax.toPercentage()}% boost to{" "}
                      <EthereumAddress
                        address={boostRecipient}
                        short
                        withEnsName
                      />
                    </span>
                  ) : null}
                </div>
              </div>

              <PayDialog
                payAmountWei={payAmountAWei}
                projectId={projectId}
                primaryTerminalEth={primaryTerminalEth}
                disabled={!payAmountAWei}
              >
                <Button
                  size="lg"
                  className="h-16 text-base min-w-[20%] flex items-center gap-2 hover:gap-[10px] whitespace-nowrap transition-all"
                >
                  Join now <ArrowRight className="h-4 w-4" />
                </Button>
              </PayDialog>
            </div>
          ) : null}

          {/* {formTokensQuote && token ? (
            <>
              <div>
                Boost contribution:{" "}
                {formatUnits(formTokensQuote.reservedTokens, token.decimals)}{" "}
                {token.symbol}
              </div>
            </>
          ) : null} */}

          {formRedemptionQuote ? (
            <div>
              Immediate redemption value: <Ether wei={formRedemptionQuote} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="container container-border-x md:border-x py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-10">
            <Stat label="Entry curve">{entryTax.toPercentage()}%</Stat>
            <Stat label="Exit curve">{exitTax.toPercentage()}%</Stat>
          </div>

          <br />
          <br />

          {exitFloorPrice ? (
            <Stat label="Exit value">
              {formatEther(exitFloorPrice)} / {exitFloorPriceUnit}{" "}
              {token?.symbol}
            </Stat>
          ) : null}

          {/* <HistoricalExitValueChart
            projectId={projectId}
            redemptionRate={exitTax.value}
            reservedRate={devTax.value}
          /> */}
          <br />
          <br />

          <div>
            <h2 className="font-medium uppercase text-sm mb-3">Participants</h2>

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
    </div>
  );
}
