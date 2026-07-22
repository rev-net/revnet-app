"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPayAmount, V6PayMode, V6PayTokenOption } from "@/lib/v6/pay";
import { JB_CHAINS, JBChainId } from "@bananapus/nana-sdk-core";
import { useSuckers } from "@bananapus/nana-sdk-react";
import { Abi, Address, Hex } from "viem";
import { useAccount } from "wagmi";
import { useSelectedSucker } from "../../PayCard/SelectedSuckerContext";

export type V6PayPhase =
  | "preparing"
  | "ready"
  | "approving"
  | "simulating"
  | "signing"
  | "pending"
  | "success";

/** A fully resolved, encodable pay/add-to-balance transaction. */
export interface PreparedV6Pay {
  mode: V6PayMode;
  chainId: JBChainId;
  token: V6PayTokenOption;
  amount: bigint;
  memo: string;
  terminal: Address;
  /** True when the resolved route goes through the router registry (swap). */
  viaRouterRoute: boolean;
  /** Fresh previewed token return (null for add-to-balance). */
  expectedTokens: bigint | null;
  reservedTokens: bigint | null;
  minReturned: bigint;
  needsApproval: boolean;
  cartRows: { tierId: number; quantity: number; name: string }[];
  request: {
    address: Address;
    abi: Abi;
    functionName: string;
    args: readonly unknown[];
    value: bigint;
  };
  calldata: Hex;
}

const PHASE_LABELS: Record<Exclude<V6PayPhase, "ready" | "success">, string> = {
  preparing: "Getting a fresh quote…",
  approving: "Approving the terminal to pull your tokens…",
  simulating: "Simulating the transaction…",
  signing: "Confirm in your wallet…",
  pending: "Transaction submitted, awaiting confirmation…",
};

/**
 * The confirm-before-send dialog: a human summary of exactly what will be
 * sent, chain selection (old PayDialog style), and the wallet-aware action
 * button — connect and switch-chain prompts live HERE, not on the card.
 */
export function V6PayConfirmDialog({
  open,
  onOpenChange,
  prepared,
  phase,
  mode,
  error,
  projectTokenSymbol,
  txHash,
  onConfirm,
  onSwitchChain,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prepared: PreparedV6Pay | null;
  phase: V6PayPhase;
  mode: V6PayMode;
  error: string | null;
  projectTokenSymbol: string;
  txHash: `0x${string}` | undefined;
  onConfirm: () => void;
  onSwitchChain: (chainId: string) => void;
  onDone: () => void;
}) {
  const busy =
    phase === "approving" || phase === "simulating" || phase === "signing" || phase === "pending";
  const { address } = useAccount();
  const { selectedSucker } = useSelectedSucker();
  const chainId = prepared?.chainId ?? selectedSucker.peerChainId;
  const chainMeta = JB_CHAINS[chainId];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        if (!next && phase === "success") onDone();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {phase === "success"
              ? mode === "pay"
                ? "Payment confirmed"
                : "Added to the balance"
              : mode === "pay"
                ? "Confirm payment"
                : "Confirm add to balance"}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-left">
              {phase === "success" ? (
                <div className="py-2">
                  <p className="text-sm text-zinc-700">
                    {mode === "pay"
                      ? "Your payment went through."
                      : "The balance grew — no tokens were minted."}
                  </p>
                  {txHash && chainMeta ? (
                    <a
                      href={`https://${chainMeta.etherscanHostname}/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-900"
                    >
                      View the transaction
                    </a>
                  ) : null}
                  <div className="mt-4">
                    <Button className="bg-teal-500 text-melon-950 hover:bg-teal-600" onClick={onDone}>
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {phase === "preparing" ? (
                    <div className="py-4 text-sm text-zinc-500">
                      {address
                        ? PHASE_LABELS.preparing
                        : "Connect your wallet to get a live quote."}
                    </div>
                  ) : prepared ? (
                    <div className="flex flex-col gap-3 py-2">
                      <SummaryRow label="Send">
                        {formatPayAmount(prepared.amount, prepared.token.decimals)}{" "}
                        {prepared.token.symbol}
                      </SummaryRow>
                      <SummaryRow label="On">
                        {chainMeta?.name ?? String(prepared.chainId)}
                      </SummaryRow>
                      {prepared.mode === "pay" ? (
                        <SummaryRow
                          label={prepared.viaRouterRoute ? "You get at least" : "You get"}
                        >
                          {formatPayAmount(prepared.minReturned, 18)} {projectTokenSymbol}
                        </SummaryRow>
                      ) : (
                        <SummaryRow label="Effect">
                          Adds to the project balance — nothing else.
                        </SummaryRow>
                      )}
                      {prepared.reservedTokens != null && prepared.reservedTokens > 0n ? (
                        <SummaryRow label="Splits get">
                          {formatPayAmount(prepared.reservedTokens, 18)} {projectTokenSymbol}
                        </SummaryRow>
                      ) : null}
                      {prepared.cartRows.length > 0 ? (
                        <SummaryRow label="Items">
                          {prepared.cartRows
                            .map((row) => `${row.quantity}× ${row.name}`)
                            .join(", ")}
                        </SummaryRow>
                      ) : null}
                      {prepared.memo ? (
                        <SummaryRow label="Note">{prepared.memo}</SummaryRow>
                      ) : null}
                      {prepared.viaRouterRoute ? (
                        <p className="text-xs text-zinc-500">
                          Your {prepared.token.symbol} is swapped into the project&apos;s
                          accounting token via the router.
                        </p>
                      ) : null}
                      {prepared.needsApproval ? (
                        <p className="text-xs text-zinc-500">
                          Two wallet steps: approve {prepared.token.symbol} for the terminal, then
                          the {prepared.mode === "pay" ? "payment" : "top-up"} itself.
                        </p>
                      ) : null}

                      <details className="mt-1 rounded border border-zinc-200 bg-zinc-50 p-2 text-xs">
                        <summary className="cursor-pointer select-none text-zinc-600">
                          Transaction details
                        </summary>
                        <div className="mt-2 space-y-1 font-mono text-[11px] text-zinc-600">
                          <div className="break-all">to: {prepared.request.address}</div>
                          <div>function: {prepared.request.functionName}</div>
                          {prepared.request.args.map((arg, i) => (
                            <div key={i} className="break-all">
                              arg[{i}]: {stringifyArg(arg)}
                            </div>
                          ))}
                          <div className="break-all">
                            value: {prepared.request.value.toString()}
                          </div>
                          <div className="break-all">calldata: {prepared.calldata}</div>
                        </div>
                      </details>

                      {busy ? (
                        <p className="text-sm text-zinc-500">
                          {PHASE_LABELS[phase as keyof typeof PHASE_LABELS]}
                        </p>
                      ) : null}
                      {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    </div>
                  ) : error ? (
                    <p className="py-4 text-sm text-red-600">{error}</p>
                  ) : null}

                  <div className="flex flex-row justify-between items-end gap-3">
                    <ChainSelector
                      tokenSymbol={projectTokenSymbol}
                      chainId={chainId}
                      disabled={busy}
                      onSwitchChain={onSwitchChain}
                    />
                    <ButtonWithWallet
                      targetChainId={chainId}
                      loading={busy || (phase === "preparing" && !!address)}
                      onClick={onConfirm}
                      connectWalletText="Connect Wallet"
                      className="bg-teal-500 text-melon-950 hover:bg-teal-600"
                    >
                      {prepared?.needsApproval
                        ? "Approve and send"
                        : mode === "pay"
                          ? "Pay"
                          : "Add to balance"}
                    </ButtonWithWallet>
                  </div>
                </>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

/** Old PayDialog's chain presentation: "<SYM> is available on: [chain select]". */
function ChainSelector({
  tokenSymbol,
  chainId,
  disabled,
  onSwitchChain,
}: {
  tokenSymbol: string;
  chainId: JBChainId;
  disabled?: boolean;
  onSwitchChain: (chainId: string) => void;
}) {
  const { data: suckers } = useSuckers();
  const { selectedSucker } = useSelectedSucker();

  if (suckers && suckers.length > 1) {
    return (
      <div className="flex flex-col mt-4">
        <div className="text-sm text-zinc-500">{tokenSymbol} is available on:</div>
        <Select
          disabled={disabled}
          onValueChange={onSwitchChain}
          value={selectedSucker ? selectedSucker.peerChainId.toString() : undefined}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select chain" />
          </SelectTrigger>
          <SelectContent>
            {suckers.map((s) => (
              <SelectItem
                key={s.peerChainId}
                value={s.peerChainId.toString()}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <ChainLogo chainId={s.peerChainId} />
                  <span>{JB_CHAINS[s.peerChainId].name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-4">
      <div className="text-xs text-slate-500">{tokenSymbol} is only on:</div>
      <div className="flex flex-row items-center gap-2 pl-3 min-w-fit pr-5 py-2 border ring-offset-white">
        <ChainLogo chainId={chainId} />
        {JB_CHAINS[chainId].name}
      </div>
    </div>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="shrink-0 text-sm text-zinc-500">{label}</span>
      <span className="text-right text-sm text-zinc-900">{children}</span>
    </div>
  );
}

function stringifyArg(arg: unknown): string {
  if (typeof arg === "bigint") return arg.toString();
  if (typeof arg === "string") return arg === "" ? "\"\"" : arg;
  if (typeof arg === "boolean") return String(arg);
  try {
    return JSON.stringify(arg, (_, v) => (typeof v === "bigint" ? v.toString() : v));
  } catch {
    return String(arg);
  }
}
