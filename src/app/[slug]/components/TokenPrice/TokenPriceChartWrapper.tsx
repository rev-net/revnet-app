"use client";

import { parseTimeRange } from "@/lib/timeRange";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { JBChainId, JBVersion } from "juice-sdk-core";
import { useSearchParams } from "next/navigation";
import { getTokenPriceChartData } from "./getTokenPriceChartData";
import { TokenPriceChart } from "./TokenPriceChart";

interface Props {
  projectId: string;
  chainId: JBChainId;
  version: JBVersion;
  suckerGroupId: string;
  token: string;
  tokenSymbol: string;
  tokenDecimals: number;
}

export function TokenPriceChartWrapper({
  projectId,
  chainId,
  version,
  suckerGroupId,
  token,
  tokenSymbol,
  tokenDecimals,
}: Props) {
  const searchParams = useSearchParams();
  const rangeParam = searchParams.get("range");
  const range = parseTimeRange(rangeParam ?? undefined);

  const { data, isLoading } = useQuery({
    queryKey: ["chartData", projectId, chainId, version, suckerGroupId, range],
    queryFn: () =>
      getTokenPriceChartData({
        projectId,
        chainId,
        version,
        range,
        suckerGroupId,
        baseToken: { address: token, symbol: tokenSymbol, decimals: tokenDecimals },
      }),
    placeholderData: keepPreviousData,
  });

  return (
    <TokenPriceChart
      data={data?.chartData ?? []}
      range={range}
      hasPool={data?.hasPool ?? false}
      baseTokenSymbol={tokenSymbol}
      baseTokenDecimals={tokenDecimals}
      isLoading={isLoading}
    />
  );
}
