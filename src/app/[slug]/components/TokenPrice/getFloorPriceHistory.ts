import {
  CashOutTaxSnapshotsDocument,
  CashOutTaxSnapshotsQuery,
  CashOutTaxSnapshotsQueryVariables,
  SuckerGroupMomentsDocument,
  SuckerGroupMomentsQuery,
  SuckerGroupMomentsQueryVariables,
} from "@/generated/graphql";
import { getBendystrawClient } from "@/graphql/bendystrawClient";
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

export async function getFloorPriceHistory(options: FloorPriceOptions): Promise<PriceDataPoint[]> {
  const { suckerGroupId, chainId, baseTokenDecimals, currentCashOutTax, projectStart } = options;

  try {
    const client = getBendystrawClient(chainId);

    const [taxSnapshotsResult, momentsResult] = await Promise.all([
      client.request<CashOutTaxSnapshotsQuery, CashOutTaxSnapshotsQueryVariables>(
        CashOutTaxSnapshotsDocument,
        { suckerGroupId },
      ),
      client.request<SuckerGroupMomentsQuery, SuckerGroupMomentsQueryVariables>(
        SuckerGroupMomentsDocument,
        { suckerGroupId },
      ),
    ]);

    const taxSnapshots = taxSnapshotsResult.cashOutTaxSnapshots?.items ?? [];
    const moments = momentsResult.suckerGroupMoments?.items ?? [];

    const useFallbackTax = taxSnapshots.length === 0 && currentCashOutTax !== undefined;

    const dataPoints: PriceDataPoint[] = [];

    const firstMomentTimestamp = moments.length > 0 ? moments[0].timestamp : undefined;
    if (projectStart && (!firstMomentTimestamp || firstMomentTimestamp > projectStart)) {
      dataPoints.push({ timestamp: projectStart, floorPrice: 0 });
    }

    if (moments.length === 0) {
      return dataPoints;
    }

    for (const moment of moments) {
      const cashOutTax = useFallbackTax
        ? currentCashOutTax
        : findApplicableTaxRate(moment.timestamp, taxSnapshots);

      if (cashOutTax === null || cashOutTax === undefined) {
        continue;
      }

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

function findApplicableTaxRate(timestamp: number, snapshots: CashOutTaxSnapshot[]): number | null {
  for (const snapshot of snapshots) {
    const start = Number(snapshot.start);
    const duration = Number(snapshot.duration);
    const end = duration === 0 ? Infinity : start + duration;

    if (timestamp >= start && timestamp < end) {
      return snapshot.cashOutTax;
    }
  }

  return null;
}
