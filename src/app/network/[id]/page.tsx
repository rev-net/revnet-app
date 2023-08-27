"use client";

import EtherscanLink from "@/components/EtherscanLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stat } from "@/components/ui/stat";
import { useCountdownToDate } from "@/hooks/useCountdownToDate";
import { ETH_TOKEN_ADDRESS, ONE_ETHER } from "@/lib/juicebox/constants";
import {
  formatDiscountRate,
  formatRedemptionRate,
  formatReservedRate,
  formatSeconds,
  getNextCycleWeight,
  getPaymentQuoteEth,
  getPaymentQuoteTokens,
  getTokenRedemptionQuoteEth,
  formatEther,
  formatEthAddress,
} from "@/lib/juicebox/utils";
import {
  jbSingleTokenPaymentTerminalStoreABI,
  jbethPaymentTerminal3_1_2ABI,
  useJbController3_1CurrentFundingCycleOf,
  useJbController3_1ReservedTokenBalanceOf,
  useJbDirectoryPrimaryTerminalOf,
  useJbProjectsOwnerOf,
  useJbTokenStoreTokenOf,
  useJbTokenStoreTotalSupplyOf,
} from "juice-hooks";
import { useEffect, useMemo, useState } from "react";
import { parseEther } from "viem";
import { useContractRead, useToken } from "wagmi";

export default function Page({ params }: { params: { id: string } }) {
  const [formPayAmount, setFormPayAmount] = useState<string>("");

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
  });
  const { data: tokenAddress } = useJbTokenStoreTokenOf({
    args: [projectId],
  });
  const { data: token } = useToken({ address: tokenAddress });
  const { data: primaryTerminal } = useJbDirectoryPrimaryTerminalOf({
    args: [projectId, ETH_TOKEN_ADDRESS],
  });
  const { data: store } = useContractRead({
    address: primaryTerminal,
    abi: jbethPaymentTerminal3_1_2ABI,
    functionName: "store",
  });
  const { data: overflow } = useContractRead({
    args: primaryTerminal ? [primaryTerminal, projectId] : undefined,
    address: store,
    abi: jbSingleTokenPaymentTerminalStoreABI,
    functionName: "currentOverflowOf",
  });
  const { data: tokensReserved } = useJbController3_1ReservedTokenBalanceOf({
    args: [projectId],
  });
  const { data: totalTokenSupply } = useJbTokenStoreTotalSupplyOf({
    args: [projectId],
  });

  const [cycleData, cycleMetadata] = cycleResponse || [];

  const secondsUntilNextCycle = useCountdownToDate(
    cycleData
      ? new Date(Number(cycleData?.start + cycleData?.duration) * 1000)
      : undefined
  );

  const payAmountWei = useMemo(() => {
    if (!formPayAmount) return 0n;
    try {
      return parseEther(`${parseFloat(formPayAmount)}` as `${number}`);
    } catch {
      return 0n;
    }
  }, [formPayAmount]);

  // set title
  // TODO, hacky, probably eventually a next-idiomatic way to do this.
  useEffect(() => {
    if (!token?.symbol) return;
    document.title = `$${token?.symbol} | REVNET`;
  }, [token?.symbol]);

  if (!cycleData || !cycleMetadata) return null;

  const entryTax = cycleData.discountRate;
  const exitTax = cycleMetadata.redemptionRate;
  const devTax = cycleMetadata.reservedRate;

  const ethQuote = getPaymentQuoteEth(ONE_ETHER, {
    weight: cycleData.weight,
    reservedRate: devTax,
  });

  const formTokensQuote =
    payAmountWei &&
    getPaymentQuoteTokens(payAmountWei, {
      weight: cycleData.weight,
      reservedRate: devTax,
    });

  // get token redemption quote AS IF the payment goes through and tokens are minted.
  const formRedemptionQuote =
    formTokensQuote && token && overflow && totalTokenSupply && tokensReserved
      ? getTokenRedemptionQuoteEth(formTokensQuote.payerTokens, {
          overflowWei: overflow + formTokensQuote.ethAmount,
          totalSupply: totalTokenSupply + formTokensQuote.payerTokens,
          redemptionRate: cycleMetadata.redemptionRate,
          tokensReserved,
        })
      : undefined;

  const nextCycleWeight = getNextCycleWeight({
    weight: cycleData.weight,
    discountRate: cycleData.discountRate,
  });

  const nextCycleEthQuote = getPaymentQuoteEth(ONE_ETHER, {
    weight: nextCycleWeight,
    reservedRate: devTax,
  });

  // double the current supply
  const scenarioNewTokens =
    formTokensQuote &&
    totalTokenSupply &&
    (totalTokenSupply + formTokensQuote.payerTokens) * 2n;
  const scenarioNewEth =
    scenarioNewTokens &&
    getPaymentQuoteEth(scenarioNewTokens, {
      weight: nextCycleWeight,
      reservedRate: devTax,
    });

  return (
    <div className="">
      <header>
        <div className="container container-border-x flex justify-between items-center py-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-regular">${token?.symbol}</h1>
              {token ? (
                <Badge variant="secondary" className="font-normal">
                  <EtherscanLink value={formatEthAddress(token.address)} />
                </Badge>
              ) : null}
            </div>
            <div>
              <span className="text-4xl font-bold mr-2">
                {formatEther(ethQuote, { decimals: 4 })} ETH
              </span>
              <span className="text-sm">/DEFIFA</span>
            </div>
          </div>
          <div>
            {overflow ? (
              <Stat label="Treasury">
                {formatEther(overflow, { decimals: 4 })} ETH
              </Stat>
            ) : null}
          </div>
        </div>
      </header>

      <div className="border-y border-y-zinc-300 bg-zinc-100">
        <div className="container container-border-x py-10">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-base font-medium">Join network</h2>
            {secondsUntilNextCycle ? (
              <Badge variant="warn" className="font-normal gap-1">
                Price increase in{" "}
                <span className="font-medium">
                  {formatSeconds(secondsUntilNextCycle)}
                </span>
              </Badge>
            ) : null}
          </div>
          <form action="" className="flex justify-between gap-5">
            <Input
              onChange={(e) => {
                const value = e.target.value;
                setFormPayAmount(value);
              }}
              value={formPayAmount}
              className="max-w-sm"
            />
            <Button>Buy and Join</Button>
          </form>

          {formTokensQuote ? (
            <>
              <div>
                Recieve: {formatEther(formTokensQuote.payerTokens)}{" "}
                {token?.symbol}
              </div>
              <div>
                Boost contribution:{" "}
                {formatEther(formTokensQuote.reservedTokens)} {token?.symbol}
              </div>
            </>
          ) : null}

          {formRedemptionQuote ? (
            <div>
              Immediate redemption value: {formatEther(formRedemptionQuote)} ETH
            </div>
          ) : null}
        </div>
      </div>

      <div className="container container-border-x py-10">
        <div className="flex gap-10">
          <Stat label="Entry curve">{formatDiscountRate(entryTax)}%</Stat>
          <Stat label="Exit curve">{formatRedemptionRate(exitTax)}%</Stat>
          <Stat label="Boost">{formatReservedRate(devTax)}%</Stat>
        </div>

        <br />

        <div>
          {totalTokenSupply && tokensReserved ? (
            <div>
              {formatEther(totalTokenSupply)} {token?.symbol} in circulation (+{" "}
              {formatEther(tokensReserved)} reserved)
            </div>
          ) : null}
        </div>
        {overflow ? <div>Backed by: {formatEther(overflow)} ETH</div> : null}

        <br />

        <div>
          Gen {(cycleData.number + 1n).toString()} buy price:{" "}
          {formatEther(nextCycleEthQuote)} ETH / {token?.symbol} (+
          {formatEther(nextCycleEthQuote - ethQuote)} ETH)
        </div>
      </div>
    </div>
  );
}
