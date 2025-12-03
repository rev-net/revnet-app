"use client";

import { RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAutoIssuances } from "@/hooks/useAutoIssuances";
import { useTokenA } from "@/hooks/useTokenA";
import { commaNumber } from "@/lib/number";
import { formatTokenSymbol } from "@/lib/utils";
import { differenceInDays, formatDate } from "date-fns";
import { FixedInt } from "fpnum";
import {
  CashOutTaxRate,
  getTokenAToBQuote,
  jbControllerAbi,
  JBCoreContracts,
  jbSplitsAbi,
  ReservedPercent,
  RulesetWeight,
} from "juice-sdk-core";
import { useJBChainId, useJBContractContext, useJBTokenContext } from "juice-sdk-react";
import { formatUnits, parseUnits } from "viem";
import { useReadContracts } from "wagmi";
import type { Ruleset } from "../getRulesets";

interface Props {
  rulesets: Ruleset[];
}

export function StagesTable({ rulesets }: Props) {
  const {
    projectId,
    contracts: { controller },
    contractAddress,
  } = useJBContractContext();
  const chainId = useJBChainId();
  const { token } = useJBTokenContext();
  const tokenA = useTokenA();
  const autoIssuances = useAutoIssuances();

  const metadataResults = useReadContracts({
    contracts: rulesets.map((ruleset) => ({
      abi: jbControllerAbi,
      functionName: "getRulesetOf" as const,
      chainId,
      address: controller.data ?? undefined,
      args: [projectId, BigInt(ruleset.id)] as const,
    })),
    query: { enabled: rulesets.length > 0 && !!controller.data },
  });

  const splitsResults = useReadContracts({
    contracts: rulesets.map((ruleset) => ({
      abi: jbSplitsAbi,
      functionName: "splitsOf" as const,
      chainId,
      address: contractAddress(JBCoreContracts.JBSplits),
      args: [projectId, BigInt(ruleset.id), RESERVED_TOKEN_SPLIT_GROUP_ID] as const,
    })),
    query: { enabled: rulesets.length > 0 },
  });

  if (!rulesets.length || !token?.data) return null;

  const now = Date.now() / 1000;
  const currentIdx = rulesets.findIndex((r, i) => {
    const end = rulesets[i + 1]?.start ?? Infinity;
    return now >= r.start && now < end;
  });

  const stages = rulesets.map((ruleset, idx) => {
    const next = rulesets[idx + 1];
    const startDate = new Date(ruleset.start * 1000);
    const endDate = next ? new Date(next.start * 1000) : null;

    const quote = getTokenAToBQuote(
      new FixedInt(parseUnits("1", tokenA.decimals), tokenA.decimals),
      {
        weight: new RulesetWeight(BigInt(ruleset.weight)),
        reservedPercent: new ReservedPercent(0),
      },
    );
    const amount = Number(formatUnits(quote.payerTokens, 18));
    const issuanceRate = `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)} ${formatTokenSymbol(token)} / ${tokenA.symbol}`;

    const meta = metadataResults.data?.[idx];
    const metadata =
      meta?.status === "success"
        ? (meta.result as unknown as { reservedPercent: string; cashOutTaxRate: string }[])
        : null;
    const reservedPercent = metadata?.[1]
      ? new ReservedPercent(Number(metadata[1].reservedPercent))
      : null;
    const cashOutTaxRate = metadata?.[1]
      ? new CashOutTaxRate(Number(metadata[1].cashOutTaxRate))
      : null;

    const splitsResult = splitsResults.data?.[idx];
    const splits = splitsResult?.status === "success" ? splitsResult.result : null;
    const hasSplits = splits && splits.length > 0;

    const stageAutoIssuances = autoIssuances?.filter((a) => Number(a.stageId) === ruleset.id);
    const autoIssuanceTotal =
      stageAutoIssuances?.reduce((acc, curr) => acc + BigInt(curr.count), 0n) ?? 0n;
    const autoIssuanceNum = Number(formatUnits(autoIssuanceTotal, token?.data?.decimals || 18));

    return {
      id: ruleset.id,
      stageNumber: idx + 1,
      startDate,
      endDate,
      durationDays: endDate ? differenceInDays(endDate, startDate) : null,
      issuanceRate,
      cutPercent: (ruleset.weightCutPercent * 100).toFixed(2),
      cutFrequencyDays: ruleset.duration / 86400,
      splitLimit: hasSplits && reservedPercent ? `${reservedPercent.formatPercentage()}%` : null,
      autoIssuance: commaNumber(
        autoIssuanceNum.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      ),
      cashOutTaxRate: cashOutTaxRate?.format() ?? "0",
      isCurrent: idx === currentIdx,
    };
  });

  return (
    <div className="mt-8 border border-zinc-200 min-w-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50 hover:bg-zinc-50">
            <TableHead className="whitespace-nowrap font-medium px-2 first:pl-3">Stage</TableHead>
            <TableHead className="whitespace-nowrap font-medium px-2">Period</TableHead>
            <TableHead className="whitespace-nowrap font-medium px-2">
              <TooltipLabel
                label="Issuance"
                tooltip={
                  <p>
                    Amount of {formatTokenSymbol(token)} created per {tokenA.symbol} received
                  </p>
                }
              />
            </TableHead>
            <TableHead className="whitespace-nowrap font-medium px-2">
              <TooltipLabel
                label="Cut"
                tooltip={<p>Percentage reduction in issuance rate applied at regular intervals</p>}
              />
            </TableHead>
            <TableHead className="whitespace-nowrap font-medium px-2">
              <TooltipLabel
                label="Split limit"
                tooltip={<p>Percentage of issuance set aside for split recipients</p>}
              />
            </TableHead>
            <TableHead className="whitespace-nowrap font-medium px-2">
              <TooltipLabel
                label="Auto issuance"
                tooltip={<p>Tokens automatically minted when the stage starts</p>}
              />
            </TableHead>
            <TableHead className="whitespace-nowrap font-medium px-2 last:pr-3">
              <TooltipLabel
                label="Cash out tax"
                tooltip={
                  <p>
                    Tax applied when cashing out tokens
                    <br /> (0 = no tax, 1 = maximum tax)
                  </p>
                }
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stages.map((stage) => (
            <TableRow
              key={stage.id}
              className={stage.isCurrent ? "bg-orange-50/50 hover:bg-orange-50/50" : ""}
            >
              <TableCell className="font-medium whitespace-nowrap px-2 py-3 first:pl-3">
                <div className="flex items-center gap-2">
                  <span>Stage {stage.stageNumber}</span>
                  {stage.isCurrent && (
                    <span className="rounded-full h-2 w-2 bg-orange-400 border-[2px] border-orange-200" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-zinc-600 whitespace-nowrap px-2 py-3">
                <div className="flex flex-col">
                  <span>
                    {formatDate(stage.startDate, "MMM d, yyyy")}
                    {stage.endDate
                      ? ` – ${formatDate(stage.endDate, "MMM d, yyyy")}`
                      : " – forever"}
                  </span>
                  {stage.durationDays !== null && stage.durationDays > 0 && (
                    <span className="text-xs text-zinc-400">{stage.durationDays} days</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="tabular-nums whitespace-nowrap px-2 py-3">
                {stage.issuanceRate}
              </TableCell>
              <TableCell className="text-zinc-600 whitespace-nowrap px-2 py-3">
                <div className="flex flex-col">
                  <span>{stage.cutPercent}%</span>
                  <span className="text-xs text-zinc-400">every {stage.cutFrequencyDays} days</span>
                </div>
              </TableCell>
              <TableCell className="text-zinc-600 whitespace-nowrap px-2 py-3">
                {stage.splitLimit ?? "—"}
              </TableCell>
              <TableCell className="tabular-nums whitespace-nowrap px-2 py-3">
                {stage.autoIssuance !== "0" ? (
                  <span>
                    {stage.autoIssuance} {formatTokenSymbol(token)}
                  </span>
                ) : (
                  <span className="text-zinc-400">—</span>
                )}
              </TableCell>
              <TableCell className="tabular-nums whitespace-nowrap px-2 py-3 last:pr-3">
                {stage.cashOutTaxRate}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TooltipLabel({ label, tooltip }: { label: string; tooltip: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger className="cursor-help border-b border-dotted border-zinc-400 hover:border-zinc-600 transition-colors">
        {label}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs whitespace-normal font-normal">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
