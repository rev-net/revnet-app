"use client";

import { useTokenA } from "@/hooks/useTokenA";
import { getTokenSymbolFromAddress } from "@/lib/tokenUtils";
import { formatTokenSymbol } from "@/lib/utils";
import { JBCoreContracts, jbMultiTerminalAbi } from "@bananapus/nana-sdk-core";
import { useJBChainId, useJBContractContext, useJBTokenContext } from "@bananapus/nana-sdk-react";
import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { CurrentIssuanceSection } from "../../../terms/components/CurrentIssuanceSection";
import { StagesTable } from "../../../terms/components/StagesTable";
import type { Ruleset } from "../../../terms/getRulesets";
import { IssuanceLadder } from "./IssuanceLadder";
import type { ChartStage } from "./chartUtils";

/**
 * website/-parity Terms tab for V6 projects (renderStagesSection):
 * a "Token issuance" card — current rate, next scheduled cut with live
 * countdown, % to splits, and the stepped issuance-price schedule — then the
 * per-stage terms table (period, issuance + cut cadence, split limit,
 * auto-issuance totals, cash out tax; current stage highlighted).
 */
export function V6TermsTab({ rulesets }: { rulesets: Ruleset[] }) {
  const { token } = useJBTokenContext();
  const tokenA = useTokenA();
  const { projectId, contractAddress } = useJBContractContext();
  const chainId = useJBChainId();

  // The chart's price unit comes from the terminal's on-chain accounting
  // context (authoritative for v6 — e.g. USDC, currency uint32(token)); the
  // indexer-backed base token is only a fallback.
  const { data: accountingContexts } = useReadContract({
    abi: jbMultiTerminalAbi,
    functionName: "accountingContextsOf",
    chainId,
    address: chainId ? contractAddress(JBCoreContracts.JBMultiTerminal, chainId) : undefined,
    args: [projectId],
    query: { enabled: !!chainId },
  });
  const accountingSymbol = accountingContexts?.[0]
    ? getTokenSymbolFromAddress(accountingContexts[0].token)
    : undefined;

  const symbol = formatTokenSymbol(token);
  const baseSymbol = accountingSymbol ?? tokenA?.symbol ?? "ETH";

  // getRulesets stores weightCutPercent as a fraction (WeightCutPercent.toFloat,
  // 0.38 = 38%); the chart math runs on the protocol's raw 1e9 scale.
  const stages: ChartStage[] = useMemo(
    () =>
      rulesets.map((r) => ({
        start: r.start,
        duration: r.duration,
        weight: BigInt(r.weight),
        weightCutPercent: Math.round(r.weightCutPercent * 1e9),
      })),
    [rulesets],
  );

  return (
    <div className="flex flex-col min-w-0">
      <div>
        <h3 className="mb-1 text-base font-semibold text-zinc-700">Token issuance</h3>
        <CurrentIssuanceSection />
        {stages.length > 0 && (
          <IssuanceLadder stages={stages} symbol={symbol} baseSymbol={baseSymbol} />
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-base font-semibold text-zinc-700">Stages</h3>
        {/* StagesTable carries its own top margin; tuck it under the heading. */}
        <div className="[&>div]:mt-2">
          <StagesTable rulesets={rulesets} />
        </div>
      </div>
    </div>
  );
}
