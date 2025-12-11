import {
  CashOutTaxSnapshotsDocument,
  CashOutTaxSnapshotsQuery,
  SuckerGroupMomentsDocument,
  SuckerGroupMomentsQuery,
} from "@/generated/graphql";
import { getBendystrawClient } from "@/graphql/bendystrawClient";
import type { GraphQLClient } from "graphql-request";
import { JB_TOKEN_DECIMALS } from "juice-sdk-core";
import { parseUnits } from "viem";
import type { PriceDataPoint } from "./getTokenPriceChartData";

type FloorPriceOptions = {
  suckerGroupId: string;
  chainId: number;
  baseTokenDecimals: number;
  currentCashOutTax?: number;
  projectStart: number;
};

type CashOutTaxSnapshot = CashOutTaxSnapshotsQuery["cashOutTaxSnapshots"]["items"][number];
type SuckerGroupMoment = SuckerGroupMomentsQuery["suckerGroupMoments"]["items"][number];

async function fetchAllTaxSnapshots(
  client: GraphQLClient,
  suckerGroupId: string,
): Promise<CashOutTaxSnapshot[]> {
  const allItems: CashOutTaxSnapshot[] = [];
  let cursor: string | undefined;

  do {
    const result = await client.request<
      CashOutTaxSnapshotsQuery & {
        cashOutTaxSnapshots: { pageInfo: { hasNextPage: boolean; endCursor: string | null } };
      }
    >(CashOutTaxSnapshotsDocument, { suckerGroupId, after: cursor });

    allItems.push(...(result.cashOutTaxSnapshots?.items ?? []));

    const pageInfo = result.cashOutTaxSnapshots?.pageInfo;
    cursor = pageInfo?.hasNextPage ? (pageInfo.endCursor ?? undefined) : undefined;
  } while (cursor);

  return allItems;
}

async function fetchAllMoments(
  client: GraphQLClient,
  suckerGroupId: string,
): Promise<SuckerGroupMoment[]> {
  const allItems: SuckerGroupMoment[] = [];
  let cursor: string | undefined;

  do {
    const result = await client.request<
      SuckerGroupMomentsQuery & {
        suckerGroupMoments: { pageInfo: { hasNextPage: boolean; endCursor: string | null } };
      }
    >(SuckerGroupMomentsDocument, { suckerGroupId, after: cursor });

    allItems.push(...(result.suckerGroupMoments?.items ?? []));

    const pageInfo = result.suckerGroupMoments?.pageInfo;
    cursor = pageInfo?.hasNextPage ? (pageInfo.endCursor ?? undefined) : undefined;
  } while (cursor);

  return allItems;
}

export async function getFloorPriceHistory(options: FloorPriceOptions): Promise<PriceDataPoint[]> {
  const { suckerGroupId, chainId, baseTokenDecimals, currentCashOutTax, projectStart } = options;

  try {
    const client = getBendystrawClient(chainId);

    const [taxSnapshots, moments] = await Promise.all([
      fetchAllTaxSnapshots(client, suckerGroupId),
      fetchAllMoments(client, suckerGroupId),
    ]);

    const dataPoints: PriceDataPoint[] = [];

    const firstMomentTimestamp = moments.length > 0 ? moments[0].timestamp : undefined;
    if (projectStart && (!firstMomentTimestamp || firstMomentTimestamp > projectStart)) {
      dataPoints.push({ timestamp: projectStart, floorPrice: 0 });
    }

    if (moments.length === 0) {
      return dataPoints;
    }

    for (const moment of moments) {
      const cashOutTax = findApplicableTaxRate(moment.timestamp, taxSnapshots, currentCashOutTax);

      if (cashOutTax === undefined) continue;

      const floorPrice = calculateFloorPrice(
        BigInt(moment.balance),
        BigInt(moment.tokenSupply),
        cashOutTax,
        baseTokenDecimals,
      );

      dataPoints.push({
        timestamp: moment.timestamp,
        floorPrice,
        totalSupply: moment.tokenSupply,
        totalBalance: moment.balance,
        cashOutTaxRate: cashOutTax,
      });
    }

    return dataPoints;
  } catch {
    return [];
  }
}

/**
 * Formula: y = (o * x / s) * ((1 - r) + (r * x / s))
 *
 * Where:
 * - r = cash out tax rate (0 to 1)
 * - o = surplus (balance in base token smallest unit)
 * - s = total token supply
 * - x = amount of tokens to cash out
 * - y = base token returned
 */
function calculateFloorPrice(
  balance: bigint,
  tokenSupply: bigint,
  cashOutTax: number,
  baseTokenDecimals: number,
  tokenAmount = parseUnits("1", JB_TOKEN_DECIMALS),
): number {
  if (tokenSupply === 0n || balance === 0n) return 0;

  const r = cashOutTax / 10000;
  const o = Number(balance);
  const s = Number(tokenSupply);
  const x = Number(tokenAmount);

  const y = ((o * x) / s) * (1 - r + (r * x) / s);

  return y / 10 ** baseTokenDecimals;
}

function findApplicableTaxRate(
  timestamp: number,
  snapshots: CashOutTaxSnapshot[],
  fallback?: number,
): number | undefined {
  let applicableTax: number | undefined = fallback;

  for (const snapshot of snapshots) {
    const start = Number(snapshot.start);
    if (start <= timestamp) {
      applicableTax = snapshot.cashOutTax;
    } else {
      break;
    }
  }

  return applicableTax;
}
