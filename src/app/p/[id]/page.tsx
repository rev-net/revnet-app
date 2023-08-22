"use client";

import {
  useJbController3_1CurrentFundingCycleOf,
  useJbProjectsOwnerOf,
  useJbTokenStoreTokenOf,
} from "juice-hooks";
import { useToken } from "wagmi";

export const MAX_DISCOUNT_RATE = 1_000_000_000n;
export const MAX_REDEMPTION_RATE = 10_000n;
export const MAX_RESERVED_RATE = 10_000n;

const bigIntToPercent = (bigInt: bigint, max: bigint) => {
  return Number((bigInt * 100n) / (max / 100n)) / 100;
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

  if (!cycleData || !cycleMetadata) return null;

  const entryTax = cycleData.discountRate;
  const exitTax = cycleMetadata.redemptionRate;
  const devTax = cycleMetadata.reservedRate;

  return (
    <div>
      <h1>Project {projectId.toString()}</h1>
      <div>{address && <span>Owned by {address}</span>}</div>
      <div>entry tax: {formatDiscountRate(entryTax)}%</div>
      <div>exit tax: {formatRedemptionRate(exitTax)}%</div>
      <div>dev tax: {formatReservedRate(devTax)}%</div>
      <div>
        token: {token?.symbol}
        <div>
          {parseFloat(token?.totalSupply.formatted ?? "0").toFixed(2)}{" "}
          {token?.symbol} in circulation
        </div>
      </div>
    </div>
  );
}
