import type { Ruleset } from "@/app/[slug]/terms/getRulesets";
import { formatUnits } from "viem";

/**
 * Calculate the issuance price at a specific timestamp based on rulesets.
 * Price = 1 / weight (after applying weight cuts for elapsed cycles)
 */
export function calculatePriceAtTimestamp(
  timestamp: number,
  rulesets: Ruleset[],
): number | undefined {
  const active = rulesets.find((r, i) => {
    const end = rulesets[i + 1]?.start ?? Infinity;
    return timestamp >= r.start && timestamp < end;
  });

  if (!active) return undefined;

  const elapsed = timestamp - active.start;
  const cycles = active.duration > 0 ? Math.floor(elapsed / active.duration) : 0;
  const weight = Number(formatUnits(BigInt(active.weight), 18));

  if (weight <= 0) return undefined;

  const currentWeight = weight * Math.pow(1 - active.weightCutPercent, cycles);
  return currentWeight > 0 ? 1 / currentWeight : undefined;
}
