"use client";

import { Input } from "@/components/ui/input";
import { intervalToDuration } from "date-fns";
import formatDuration from "date-fns/formatDuration";
import {
  jbSingleTokenPaymentTerminalStoreABI,
  jbethPaymentTerminal3_1_2ABI,
  useJbController3_1CurrentFundingCycleOf,
  useJbDirectoryPrimaryTerminalOf,
  useJbProjectsOwnerOf,
  useJbTokenStoreTokenOf,
  useJbTokenStoreTotalSupplyOf
} from "juice-hooks";
import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useContractRead, useToken } from "wagmi";

export const MAX_DISCOUNT_RATE = 1_000_000_000n;
export const MAX_REDEMPTION_RATE = 10_000n;
export const MAX_RESERVED_RATE = 10_000n;
export const ONE_ETHER = parseEther("1");
// contracts/libraries/JBTokens.sol
export const ETH_TOKEN_ADDRESS = "0x000000000000000000000000000000000000eeee";

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

  const totalTokens = (weight * ethAmount) / ONE_ETHER;
  const reservedTokens =
    (weight * reservedRate * ethAmount) / MAX_RESERVED_RATE / ONE_ETHER;
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
  const endSeconds = date ? date.getTime() / 1000 : undefined;
  useEffect(() => {
    if (!endSeconds) return;

    const updateSecondsRemaining = () => {
      const now = Date.now() / 1000;
      const _secondsRemaining = endSeconds - now > 0 ? endSeconds - now : 0;
      setSecondsRemaining(_secondsRemaining);
    };
    updateSecondsRemaining(); // call immediately

    const timer = setInterval(updateSecondsRemaining, 1000); // update every second
    return () => clearInterval(timer);
  }, [endSeconds]);

  return secondsRemaining;
};

function formatSeconds(seconds: number) {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 }); // convert seconds to milliseconds
  return formatDuration(duration, {
    format: ["days", "hours", "minutes", "seconds"],
    delimiter: ", ",
  });
}

/**
 * Returns the ETH value (in wei) that a given [tokensAmount] can be redeemed for.
 * Formula: https://www.desmos.com/calculator/sp9ru6zbpk
 *
 * y = ox/s * ( r + (x(1 - r)/s) )
 *
 * Where:
 * y = redeemable amount
 *
 * o = overflow (primaryTerminalCurrentOverflow)
 * x = tokenAmount
 * s = total supply of token (realTotalTokenSupply)
 * r = redemptionRate
 *
 * @returns amount in ETH
 */
const getTokenRedemptionQuoteEth = (
  tokensAmount: bigint,
  {
    overflowWei,
    totalSupply,
    redemptionRate,
  }: {
    overflowWei: bigint;
    totalSupply: bigint;
    redemptionRate: bigint;
  }
) => {
  // base = ox/s
  const base = (overflowWei * tokensAmount) / totalSupply;

  // numerator = r + (x(1 - r)/s)
  const numerator =
    redemptionRate +
    (tokensAmount * (MAX_REDEMPTION_RATE - redemptionRate)) / totalSupply;

  // y = base * numerator ==> ox/s * ( r + (x(1 - r)/s) )
  return ((base * numerator) / MAX_REDEMPTION_RATE);
};

export default function Page({ params }: { params: { id: string } }) {
  const [payAmountWei, setPayAmountWei] = useState<bigint>(0n);
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

  const { data: totalTokenSupply } = useJbTokenStoreTotalSupplyOf({
    args: [projectId],
  });

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

  const ethQuote = getPaymentQuoteEth(ONE_ETHER, {
    weight: cycleData.weight,
    reservedRate: devTax,
  });

  const formTokensQuote = getPaymentQuoteTokens(payAmountWei, {
    weight: cycleData.weight,
    reservedRate: devTax,
  });

  const formRedemptionQuote =
    token && overflow && totalTokenSupply
      ? getTokenRedemptionQuoteEth(formTokensQuote.payerTokens, {
          overflowWei: overflow,
          totalSupply: totalTokenSupply,
          redemptionRate: cycleMetadata.redemptionRate,
        })
      : undefined;

  console.log(formRedemptionQuote);

  const nextCycleWeight =
    (cycleData.weight * (MAX_DISCOUNT_RATE - cycleData.discountRate)) /
    MAX_DISCOUNT_RATE;
  const nextCycleEthQuote = getPaymentQuoteEth(ONE_ETHER, {
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

      <div className="max-w-sm">
        <label htmlFor="">Pay</label>
        <Input
          type="number"
          onChange={(e) => {
            const value = e.target.value;
            if (!value) return;
            setPayAmountWei(parseEther(`${parseFloat(value)}` as `${number}`));
          }}
          value={formatEther(payAmountWei)}
        />
      </div>
      <div>
        Recieve: {formatEther(formTokensQuote.payerTokens)} {token?.symbol}
      </div>
      <div>
        Boost contribution: {formatEther(formTokensQuote.reservedTokens)}{" "}
        {token?.symbol}
      </div>
      {formRedemptionQuote ? (
        <div>
          Immediate redemption value: {formatEther(formRedemptionQuote)} ETH
        </div>
      ) : null}
    </div>
  );
}
