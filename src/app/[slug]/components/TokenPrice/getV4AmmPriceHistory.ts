import { getBendystrawClient } from "@/graphql/bendystrawClient";
import { JBChainId, JBVersion } from "@bananapus/nana-sdk-core";
import type { PriceDataPoint } from "./getTokenPriceChartData";

const PAGE_SIZE = 1000;
const MAX_SWAPS = 3000;

const BUYBACK_POOLS_QUERY = `
  query IndexedBuybackPools($projectId: Int!, $chainId: Int!, $version: Int!) {
    buybackPoolEvents(
      where: { projectId: $projectId, chainId: $chainId, version: $version }
      orderBy: "timestamp"
      orderDirection: "desc"
      limit: 100
    ) {
      items {
        timestamp
        terminalToken
        poolId
        initialSqrtPriceX96
        projectTokenIsCurrency0
      }
    }
  }
`;

const SWAPS_QUERY = `
  query IndexedPoolSwaps(
    $projectId: Int!
    $chainId: Int!
    $version: Int!
    $limit: Int!
    $offset: Int!
  ) {
    swapEvents(
      where: { projectId: $projectId, chainId: $chainId, version: $version }
      orderBy: "timestamp"
      orderDirection: "asc"
      limit: $limit
      offset: $offset
    ) {
      items {
        timestamp
        direction
        poolId
        terminalTokenAmount
        projectTokenAmount
        sqrtPriceX96
        projectTokenIsCurrency0
      }
      totalCount
    }
  }
`;

type RawPool = {
  timestamp: number;
  terminalToken: string;
  poolId: string;
  initialSqrtPriceX96: string | null;
  projectTokenIsCurrency0: boolean | null;
};

type RawSwap = {
  timestamp: number;
  direction: string;
  poolId: string | null;
  terminalTokenAmount: string;
  projectTokenAmount: string;
  sqrtPriceX96: string | null;
  projectTokenIsCurrency0: boolean | null;
};

export function v4PriceFromSqrtPriceX96(
  sqrtPriceX96: string | bigint,
  projectTokenIsCurrency0: boolean,
  terminalDecimals: number,
  projectTokenDecimals = 18,
): number | null {
  const sqrt = Number(BigInt(sqrtPriceX96));
  if (!Number.isFinite(sqrt) || sqrt <= 0) return null;
  const ratio = sqrt / 2 ** 96;
  const currency1PerCurrency0 = ratio * ratio;
  const raw = projectTokenIsCurrency0 ? currency1PerCurrency0 : 1 / currency1PerCurrency0;
  const price = raw * 10 ** (projectTokenDecimals - terminalDecimals);
  return Number.isFinite(price) && price > 0 ? price : null;
}

export async function getV4AmmPriceHistory({
  projectId,
  chainId,
  version,
  terminalToken,
  terminalDecimals,
}: {
  projectId: string;
  chainId: JBChainId;
  version: JBVersion;
  terminalToken: string;
  terminalDecimals: number;
}): Promise<{ data: PriceDataPoint[]; hasPool: boolean }> {
  const client = getBendystrawClient(chainId);
  const variables = {
    projectId: Number(projectId),
    chainId: Number(chainId),
    version: Number(version),
  };
  const poolResult = await client.request<{
    buybackPoolEvents: { items: RawPool[] };
  }>(BUYBACK_POOLS_QUERY, variables);
  const pool = (poolResult.buybackPoolEvents?.items ?? []).find(
    (item) => item.terminalToken.toLowerCase() === terminalToken.toLowerCase(),
  );
  if (!pool) return { data: [], hasPool: false };

  const swaps: RawSwap[] = [];
  let totalCount = 0;
  while (swaps.length < MAX_SWAPS) {
    const page = await client.request<{
      swapEvents: { items: RawSwap[]; totalCount: number };
    }>(SWAPS_QUERY, {
      ...variables,
      limit: Math.min(PAGE_SIZE, MAX_SWAPS - swaps.length),
      offset: swaps.length,
    });
    const items = page.swapEvents?.items ?? [];
    totalCount = page.swapEvents?.totalCount ?? items.length;
    swaps.push(...items);
    if (items.length === 0 || swaps.length >= totalCount) break;
  }

  const data: PriceDataPoint[] = [];
  if (pool.initialSqrtPriceX96 && pool.projectTokenIsCurrency0 !== null) {
    const ammPrice = v4PriceFromSqrtPriceX96(
      pool.initialSqrtPriceX96,
      pool.projectTokenIsCurrency0,
      terminalDecimals,
    );
    if (ammPrice) data.push({ timestamp: Number(pool.timestamp), ammPrice });
  }

  for (const swap of swaps) {
    if (
      swap.direction === "mint" ||
      !swap.poolId ||
      swap.poolId.toLowerCase() !== pool.poolId.toLowerCase()
    ) {
      continue;
    }

    let ammPrice =
      swap.sqrtPriceX96 && swap.projectTokenIsCurrency0 !== null
        ? v4PriceFromSqrtPriceX96(swap.sqrtPriceX96, swap.projectTokenIsCurrency0, terminalDecimals)
        : null;
    if (!ammPrice) {
      const terminalAmount = Number(BigInt(swap.terminalTokenAmount)) / 10 ** terminalDecimals;
      const projectAmount = Number(BigInt(swap.projectTokenAmount)) / 1e18;
      ammPrice = projectAmount > 0 ? terminalAmount / projectAmount : null;
    }
    if (ammPrice && Number.isFinite(ammPrice)) {
      data.push({ timestamp: Number(swap.timestamp), ammPrice });
    }
  }

  data.sort((a, b) => a.timestamp - b.timestamp);
  return { data, hasPool: true };
}
