"use client";

import {
  useJbController3_1CurrentFundingCycleOf,
  useJbProjectsOwnerOf,
  useJbTokenStoreTokenOf,
} from "juice-hooks";
import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useToken } from "wagmi";
import formatDuration from "date-fns/formatDuration";
import { intervalToDuration } from "date-fns";

export const MAX_DISCOUNT_RATE = 1_000_000_000n;
export const MAX_REDEMPTION_RATE = 10_000n;
export const MAX_RESERVED_RATE = 10_000n;
export const ONE_ETHER = parseEther("1");

const bigIntToPercent = (bigInt: bigint, max: bigint) => {
  return Number((bigInt * 100n) / (max / 100n)) / 100;
};

/**
 * Return a quote for token mints for a given [payAmount].
 * Returned quote contains:
 * - total tokens that will be minted (JB funding cycle `weight`).
 * - tokens reserved for project.
 * - tokens minted for the payer.
 */
const getPaymentQuoteTokens = (
  ethAmount: bigint, // wei
  cycleParams: { weight: bigint; reservedRate: bigint }
) => {
  const { weight, reservedRate } = cycleParams;

  const totalTokens = weight;
  const reservedTokens =
    (weight * reservedRate * ONE_ETHER) / (MAX_RESERVED_RATE * ONE_ETHER);
  const payerTokens = totalTokens - reservedTokens;

  return {
    ethAmount,
    payerTokens,
    reservedTokens,
    totalTokens,
  };
};

/**
 * Return the ETH cost to mint a given [tokensAmount] to the payer.
 * @param tokensAmount
 * @param cycleParams
 * @returns
 */
const getPaymentQuoteEth = (
  tokensAmount: bigint, // wei
  cycleParams: { weight: bigint; reservedRate: bigint }
) => {
  const { payerTokens } = getPaymentQuoteTokens(tokensAmount, cycleParams);
  return (ONE_ETHER * ONE_ETHER) / payerTokens;
};

const formatDiscountRate = (discountRate: bigint) => {
  if (discountRate === 0n) return 0;

  const discountRatePercentage = bigIntToPercent(
    discountRate,
    MAX_DISCOUNT_RATE
  );
  return discountRatePercentage;
};

const formatRedemptionRate = (redemptionRate: bigint) => {
  if (redemptionRate === 0n) return 0;

  const redemptionRatePercentage = bigIntToPercent(
    redemptionRate,
    MAX_REDEMPTION_RATE
  );
  return redemptionRatePercentage;
};

const formatReservedRate = (reservedRate: bigint) => {
  if (reservedRate === 0n) return 0;

  const reservedRatePercentage = bigIntToPercent(
    reservedRate,
    MAX_RESERVED_RATE
  );
  return reservedRatePercentage;
};

export const useCountdownToDate = (date: Date | undefined) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>();

  useEffect(() => {
    if (!date) return;

    const updateSecondsRemaining = () => {
      const now = Date.now() / 1000;
      const endSeconds = date.getTime() / 1000;
      const _secondsRemaining = date.getTime() - now > 0 ? endSeconds - now : 0;
      setSecondsRemaining(_secondsRemaining);
    };
    updateSecondsRemaining(); // call immediately

    const timer = setInterval(updateSecondsRemaining, 1000); // update every second
    return () => clearInterval(timer);
  }, [date]);

  return secondsRemaining;
};

function formatSeconds(seconds: number) {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 }); // convert seconds to milliseconds
  return formatDuration(duration, {
    format: ["days", "hours", "minutes", "seconds"],
    delimiter: ", ",
  });
}

export default function Page({ params }: { params: { id: string } }) {
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

  const [cycleData, cycleMetadata] = cycleResponse || [];

  const secondsUntilNextCycle = useCountdownToDate(
    cycleData
      ? new Date(Number(cycleData?.start + cycleData?.duration) * 1000)
      : undefined
  );

  if (!cycleData || !cycleMetadata) return null;

  const entryTax = cycleData.discountRate;
  const exitTax = cycleMetadata.redemptionRate;
  const devTax = cycleMetadata.reservedRate;

  const ethQuote = getPaymentQuoteEth(1n, {
    weight: cycleData.weight,
    reservedRate: devTax,
  });

  const nextCycleWeight =
    (cycleData.weight * (MAX_DISCOUNT_RATE - cycleData.discountRate)) /
    MAX_DISCOUNT_RATE;
  const nextCycleEthQuote = getPaymentQuoteEth(1n, {
    weight: nextCycleWeight,
    reservedRate: devTax,
  });

  return (
    <div className="container">
      <h1>Project {projectId.toString()}</h1>
      <div>{address && <span>Owned by {address}</span>}</div>
      <div>entry curve: {formatDiscountRate(entryTax)}%</div>
      <div>exit curve: {formatRedemptionRate(exitTax)}%</div>
      <div>boost: {formatReservedRate(devTax)}%</div>
      <div>Generation: {cycleData.number.toString()}</div>
      {secondsUntilNextCycle ? (
        <div>
          Next generation starts in: {formatSeconds(secondsUntilNextCycle)}
        </div>
      ) : null}

      <br />

      <div>
        token: {token?.symbol}
        <div>
          {parseFloat(token?.totalSupply.formatted ?? "0").toFixed(2)}{" "}
          {token?.symbol} in circulation
        </div>
      </div>
      <br />
      <div>
        Gen {cycleData.number.toString()} buy price: {formatEther(ethQuote)} ETH
        / {token?.symbol}
      </div>
      <div>
        Gen {(cycleData.number + 1n).toString()} buy price:{" "}
        {formatEther(nextCycleEthQuote)} ETH / {token?.symbol} (+
        {formatEther(nextCycleEthQuote - ethQuote)} ETH)
      </div>
      <br />
      <div>Immediate redemption value: </div>
    </div>
  );
}
