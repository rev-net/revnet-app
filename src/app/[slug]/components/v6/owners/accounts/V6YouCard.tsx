"use client";

import { ChainLogo } from "@/components/ChainLogo";
import { TableSkeleton } from "@/components/loading/LoadingSkeletons";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";
import { useBorrowableAmountFrom } from "@/hooks/useBorrowableAmountFrom";
import { useReclaimableSurplus } from "@/hooks/useReclaimableSurplus";
import { getProjectsReclaimableSurplus } from "@/lib/reclaimableSurplus";
import {
  getTokenConfigForChain,
  getTokenSymbolFromAddress,
  TokenConfig,
} from "@/lib/tokenUtils";
import { formatTokenSymbol } from "@/lib/utils";
import {
  formatUnits,
  getRevnetLoanContract,
  JB_CHAINS,
  JBCoreContracts,
  jbMultiTerminalAbi,
  jbTokensAbi,
  revOwnerAbi,
  RevnetCoreContracts,
} from "@bananapus/nana-sdk-core";
import {
  JBChainId,
  useBendystrawQuery,
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "@bananapus/nana-sdk-react";
import { useQuery } from "@tanstack/react-query";
import { ConnectKitButton } from "connectkit";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { BorrowDialog } from "../../../Value/BorrowDialog";
import { BridgeDialog } from "../../../Value/BridgeDialog";
import { RedeemDialog } from "../../../Value/RedeemDialog";
import { ProjectItem } from "../../shared";
import { CreditRow, V6ClaimCreditsDialog } from "./V6ClaimCreditsDialog";

type ChainQuote = { cashout: bigint | undefined; maxLoan: bigint | undefined };

/**
 * "You" card (website/ parity: renderYouCard + fetchYouPosition): the connected
 * wallet's per-chain position — Chain | Your balance (credits labeled) | Cash
 * out value | Max loan — plus the action buttons (Cash out, Get a loan, Move
 * between chains, Claim credits). While the revnet's cash out delay is active,
 * cash out values still compute (pure bonding-curve math) and are shown marked
 * "locked"; loans read 0 from the contract, so the would-be loan is estimated
 * by the cash out value, also marked locked.
 */
export function V6YouCard({ projects }: { projects: ProjectItem[] }) {
  const { address } = useAccount();
  const chainId = useJBChainId();
  const {
    projectId,
    contractAddress,
    version,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { token } = useJBTokenContext();
  const tokenSymbol = formatTokenSymbol(token);
  const projectTokenDecimals = token?.data?.decimals ?? 18;

  const { data: balances, isLoading: isLoadingBalances } = useSuckersUserTokenBalance();

  // Full per-chain project rows (currency/decimals/token) for quotes.
  const { data: projectData } = useBendystrawQuery(
    ProjectDocument,
    { projectId: Number(projectId), chainId: Number(chainId), version },
    { enabled: !!chainId && !!projectId },
  );
  const suckerGroupId = projectData?.project?.suckerGroupId;
  const { data: suckerGroupData } = useBendystrawQuery(
    SuckerGroupDocument,
    { id: suckerGroupId ?? "" },
    { enabled: !!suckerGroupId },
  );
  const groupProjects = useMemo(
    () => suckerGroupData?.suckerGroup?.projects?.items ?? [],
    [suckerGroupData],
  );

  // The same per-chain surpluses the server computes for the legacy Ops page —
  // RedeemDialog uses them to resolve each chain's currency id.
  const { data: surpluses } = useQuery({
    queryKey: ["v6-reclaimable-surpluses", suckerGroupId],
    enabled: groupProjects.length > 0,
    queryFn: () => getProjectsReclaimableSurplus(groupProjects),
  });

  // Unclaimed credits per chain — drives the "Credits"/"Credits & ERC-20s"
  // balance subtext and the Claim credits flow.
  const creditContracts = useMemo(
    () =>
      address && balances
        ? balances.map((b) => ({
            chainId: b.chainId,
            abi: jbTokensAbi,
            address: contractAddress(JBCoreContracts.JBTokens, b.chainId),
            functionName: "creditBalanceOf" as const,
            args: [address, b.projectId] as const,
          }))
        : [],
    [address, balances, contractAddress],
  );
  const { data: creditsData } = useReadContracts({
    contracts: creditContracts,
    query: { enabled: creditContracts.length > 0 },
  });
  const creditByChain = useMemo(() => {
    const map = new Map<number, bigint>();
    balances?.forEach((b, i) => {
      const result = creditsData?.[i]?.result;
      if (typeof result === "bigint") map.set(b.chainId, result);
    });
    return map;
  }, [balances, creditsData]);

  // Per-chain accounting contexts read on-chain from the canonical
  // JBMultiTerminal — the authoritative (token, currency, decimals) for cash
  // out and loan quotes (e.g. Artizen's USDC context: currency
  // uint32(token) = 3181390099, 6 decimals). The indexer's sucker-group rows
  // are only a fallback: quoting in anything but the accounting currency
  // reverts (no price feed) and rendered every quote as "—".
  const contextContracts = useMemo(
    () =>
      balances
        ? balances.map((b) => ({
            chainId: b.chainId,
            abi: jbMultiTerminalAbi,
            address: contractAddress(JBCoreContracts.JBMultiTerminal, b.chainId),
            functionName: "accountingContextsOf" as const,
            args: [b.projectId] as const,
          }))
        : [],
    [balances, contractAddress],
  );
  const { data: contextsData } = useReadContracts({
    contracts: contextContracts,
    query: { enabled: contextContracts.length > 0 },
  });
  const accountingContextByChain = useMemo(() => {
    const map = new Map<number, TokenConfig>();
    balances?.forEach((b, i) => {
      const contexts = contextsData?.[i]?.result as
        | readonly { token: `0x${string}`; decimals: number; currency: number }[]
        | undefined;
      if (!contexts?.length) return;
      // Projects can hold several contexts; prefer the one for the indexed
      // accounting token, else the first.
      const indexedToken = getTokenConfigForChain(suckerGroupData, b.chainId).token;
      const context =
        contexts.find((c) => c.token.toLowerCase() === indexedToken.toLowerCase()) ?? contexts[0];
      map.set(b.chainId, {
        token: context.token,
        currency: Number(context.currency),
        decimals: Number(context.decimals),
      });
    });
    return map;
  }, [balances, contextsData, suckerGroupData]);

  // The revnet's cash out delay gates BOTH direct cash outs and loans.
  const { data: cashOutDelay } = useReadContract({
    abi: revOwnerAbi,
    functionName: "cashOutDelayOf",
    chainId,
    address: contractAddress(RevnetCoreContracts.REVOwner),
    args: [projectId],
    query: { enabled: version === 6 && !!chainId },
  });
  const locked =
    cashOutDelay != null && cashOutDelay > 0n && Number(cashOutDelay) > Date.now() / 1000;

  // Per-chain quotes are read inside each row (hooks); rows report them up so
  // the footer can total.
  const [quotes, setQuotes] = useState<Record<number, ChainQuote>>({});
  const reportQuote = useCallback((rowChainId: number, quote: ChainQuote) => {
    setQuotes((prev) => {
      const existing = prev[rowChainId];
      if (existing && existing.cashout === quote.cashout && existing.maxLoan === quote.maxLoan) {
        return prev;
      }
      return { ...prev, [rowChainId]: quote };
    });
  }, []);

  const held = useMemo(() => (balances ?? []).filter((b) => b.balance.value > 0n), [balances]);
  const totalBalance = held.reduce((acc, b) => acc + b.balance.value, 0n);

  const creditRows: CreditRow[] = useMemo(
    () =>
      held.flatMap((b) => {
        const credit = creditByChain.get(b.chainId);
        return credit && credit > 0n
          ? [{ chainId: b.chainId as JBChainId, projectId: b.projectId, credit }]
          : [];
      }),
    [held, creditByChain],
  );
  const hasErc20 = !!token?.data?.symbol;

  if (!address) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-md text-black font-light italic">
          Connect a wallet to see your {tokenSymbol} across chains, their cash out value, and your
          max loan.
        </p>
        <ConnectKitButton.Custom>
          {({ isConnecting, show }) => (
            <Button variant="outline" onClick={show} loading={isConnecting}>
              Connect wallet
            </Button>
          )}
        </ConnectKitButton.Custom>
      </div>
    );
  }

  // Cross-chain monetary totals are only honest when every held chain produced
  // a value in the same accounting token.
  const heldConfigs = held.map(
    (b) => accountingContextByChain.get(b.chainId) ?? getTokenConfigForChain(suckerGroupData, b.chainId),
  );
  const homogeneous =
    heldConfigs.length > 0 &&
    heldConfigs.every(
      (c) =>
        c.decimals === heldConfigs[0].decimals &&
        getTokenSymbolFromAddress(c.token) === getTokenSymbolFromAddress(heldConfigs[0].token),
    );
  const baseSymbol = heldConfigs[0] ? getTokenSymbolFromAddress(heldConfigs[0].token) : "ETH";
  const baseDecimals = heldConfigs[0]?.decimals ?? 18;
  const cashComplete =
    homogeneous && held.every((b) => quotes[b.chainId]?.cashout !== undefined);
  const loanComplete = homogeneous && held.every((b) => quotes[b.chainId]?.maxLoan !== undefined);
  const totalCashout = held.reduce((acc, b) => acc + (quotes[b.chainId]?.cashout ?? 0n), 0n);
  const totalMaxLoan = held.reduce((acc, b) => acc + (quotes[b.chainId]?.maxLoan ?? 0n), 0n);
  const anyCredit = held.some((b) => (creditByChain.get(b.chainId) ?? 0n) > 0n);
  const anyErc20 = held.some((b) => {
    const credit = creditByChain.get(b.chainId);
    return credit != null && b.balance.value > credit;
  });

  const fmtBase = (value: bigint) =>
    `${formatUnits(value, baseDecimals, { fractionDigits: 5 })} ${baseSymbol}`;

  return (
    <div>
      {held.length === 0 ? (
        isLoadingBalances ? (
          <TableSkeleton rows={Math.max(projects.length, 2)} columns={4} />
        ) : (
          <p className="text-md text-black font-light italic">
            You don&apos;t hold any {tokenSymbol} yet.
          </p>
        )
      ) : (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chain</TableHead>
                <TableHead className="text-right">Your balance</TableHead>
                <TableHead className="text-right">Cash out value</TableHead>
                <TableHead className="text-right">Max loan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {held.map((b) => (
                <YouChainRow
                  key={b.chainId}
                  chainId={b.chainId as JBChainId}
                  chainProjectId={b.projectId}
                  balanceValue={b.balance.value}
                  credit={creditByChain.get(b.chainId)}
                  locked={locked}
                  tokenSymbol={tokenSymbol}
                  projectTokenDecimals={projectTokenDecimals}
                  accountingContext={accountingContextByChain.get(b.chainId)}
                  suckerGroupData={suckerGroupData}
                  onQuote={reportQuote}
                />
              ))}
            </TableBody>
            {held.length > 1 && (
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <CellWithSub
                      main={`${formatUnits(totalBalance, projectTokenDecimals, {
                        fractionDigits: 2,
                      })} ${tokenSymbol}`}
                      sub={subFor(anyCredit, anyErc20)}
                    />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {cashComplete ? (
                      <CellWithSub
                        main={fmtBase(totalCashout)}
                        sub={locked ? "locked" : undefined}
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {locked ? (
                      cashComplete && totalCashout > 0n ? (
                        <CellWithSub main={fmtBase(totalCashout)} sub="locked" />
                      ) : cashComplete ? (
                        "Locked"
                      ) : (
                        "—"
                      )
                    ) : loanComplete ? (
                      fmtBase(totalMaxLoan)
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      )}

      {locked && cashOutDelay != null && (
        <p className="text-sm text-zinc-500 mt-2">
          Cash outs and loans unlock {format(Number(cashOutDelay) * 1000, "MMM dd, yyyy p")}. Locked
          values estimate what you could redeem or borrow then.
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {hasErc20 && primaryNativeTerminal.data ? (
          <RedeemDialog projectId={projectId} tokenSymbol={tokenSymbol} surpluses={surpluses ?? []}>
            <Button
              variant="outline"
              disabled={totalBalance === 0n}
              className="border-teal-500 bg-teal-500 text-melon-950 hover:bg-teal-600 hover:text-melon-950"
            >
              Cash out
            </Button>
          </RedeemDialog>
        ) : null}

        {hasErc20 && primaryNativeTerminal.data ? (
          <BorrowDialog projectId={projectId} tokenSymbol={tokenSymbol}>
            <Button
              variant="outline"
              disabled={totalBalance === 0n}
              className="border-teal-500 bg-teal-500 text-melon-950 hover:bg-teal-600 hover:text-melon-950"
            >
              Get a loan
            </Button>
          </BorrowDialog>
        ) : null}

        {projects.length > 1 && (
          <BridgeDialog projects={projects}>
            <Button
              variant="outline"
              disabled={totalBalance === 0n}
              className="border-teal-500 bg-teal-500 text-melon-950 hover:bg-teal-600 hover:text-melon-950"
            >
              Move between chains
            </Button>
          </BridgeDialog>
        )}

        {hasErc20 && creditRows.length > 0 && (
          <V6ClaimCreditsDialog creditRows={creditRows} tokenSymbol={tokenSymbol}>
            <Button
              variant="outline"
              className="border-teal-500 bg-teal-500 text-melon-950 hover:bg-teal-600 hover:text-melon-950"
            >
              Claim credits
            </Button>
          </V6ClaimCreditsDialog>
        )}
      </div>
    </div>
  );
}

/** "Credits" (all unclaimed), "Credits & ERC-20s" (both), or none (all claimed). */
function subFor(hasCredit: boolean, hasErc20: boolean) {
  if (hasCredit && hasErc20) return "Credits & ERC-20s";
  if (hasCredit) return "Credits";
  return undefined;
}

function CellWithSub({ main, sub }: { main: string; sub?: string }) {
  return (
    <span className="inline-flex flex-col items-end">
      <span>{main}</span>
      {sub && <span className="text-xs text-zinc-400">{sub}</span>}
    </span>
  );
}

function YouChainRow({
  chainId,
  chainProjectId,
  balanceValue,
  credit,
  locked,
  tokenSymbol,
  projectTokenDecimals,
  accountingContext,
  suckerGroupData,
  onQuote,
}: {
  chainId: JBChainId;
  chainProjectId: bigint;
  balanceValue: bigint;
  credit: bigint | undefined;
  locked: boolean;
  tokenSymbol: string;
  projectTokenDecimals: number;
  accountingContext: TokenConfig | undefined;
  suckerGroupData: any;
  onQuote: (chainId: number, quote: ChainQuote) => void;
}) {
  const { version } = useJBContractContext();
  const config = accountingContext ?? getTokenConfigForChain(suckerGroupData, chainId);
  const baseSymbol = getTokenSymbolFromAddress(config.token);

  // v6 currentReclaimableSurplusOf takes empty (terminals, tokens) arrays,
  // meaning "across all of them"; the hook applies the protocol fees. Both
  // quotes are asked in the accounting context's own currency and decimals —
  // any other currency needs a price feed the project may not have.
  const { data: cashout } = useReclaimableSurplus({
    chainId,
    projectId: chainProjectId,
    tokenAmount: balanceValue,
    version,
    decimals: config.decimals,
    currencyId: config.currency,
  });

  // v6 borrowableAmountFrom returns a (borrowableNow, capacity) tuple; the hook
  // returns borrowableNow. Reads 0 while the cash out delay is active.
  const { data: maxLoan } = useBorrowableAmountFrom({
    address: getRevnetLoanContract(version, chainId),
    chainId,
    args: [chainProjectId, balanceValue, BigInt(config.decimals), BigInt(config.currency)],
  });

  useEffect(() => {
    onQuote(chainId, { cashout, maxLoan });
  }, [chainId, cashout, maxLoan, onQuote]);

  const fmtBase = (value: bigint) =>
    `${formatUnits(value, config.decimals, { fractionDigits: 5 })} ${baseSymbol}`;

  const loanCell = () => {
    if (maxLoan === undefined) return "—";
    if (maxLoan > 0n) return fmtBase(maxLoan);
    // While locked, the would-be loan capacity ≈ the cash out value (same
    // bonding-curve reclaim, in the accounting token).
    if (locked && cashout != null && cashout > 0n) {
      return <CellWithSub main={fmtBase(cashout)} sub="locked" />;
    }
    return locked ? "Locked" : fmtBase(0n);
  };

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-2">
          <ChainLogo chainId={chainId} width={15} height={15} />
          <span>{JB_CHAINS[chainId]?.name ?? chainId}</span>
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums whitespace-nowrap">
        <CellWithSub
          main={`${formatUnits(balanceValue, projectTokenDecimals, {
            fractionDigits: 2,
          })} ${tokenSymbol}`}
          sub={
            credit != null ? subFor(credit > 0n, balanceValue > credit) : undefined
          }
        />
      </TableCell>
      <TableCell className="text-right tabular-nums whitespace-nowrap">
        {cashout != null ? (
          <CellWithSub main={fmtBase(cashout)} sub={locked ? "locked" : undefined} />
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="text-right tabular-nums whitespace-nowrap">{loanCell()}</TableCell>
    </TableRow>
  );
}
