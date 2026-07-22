"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { SkeletonLines } from "@/components/ui/skeleton";
import { ChainLogo } from "@/components/ChainLogo";
import { EthereumAddress } from "@/components/EthereumAddress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { formatWalletError } from "@/lib/utils";
import {
  JBBuybackHookContracts,
  JBCoreContracts,
  JBRouterTerminalContracts,
  JB_CHAINS,
  NATIVE_TOKEN,
  RevnetCoreContracts,
  USDC_ADDRESSES,
  jbBuybackHookAbi,
  jbBuybackHookRegistryAbi,
  jbControllerAbi,
  jbDirectoryAbi,
  jbOmnichainDeployerAbi,
  jbRouterTerminalRegistryAbi,
} from "@bananapus/nana-sdk-core";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Address, isAddress, zeroAddress } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import {
  ChainProjectRow,
  ChainWrite,
  chainName,
  publicClientFor,
  runSequentialWrites,
  v6ContractAddress,
} from "./operatorLib";

type BuybackChainState = ChainProjectRow & {
  buybackRegistry: Address | undefined;
  routerRegistry: Address | undefined;
  buybackAvailable: boolean;
  routerAvailable: boolean;
  /** The project's ACTUAL buyback hook (data-hook-resolved), or null. */
  hook: Address | null;
  /** The terminal the router registry forwards into, or null. */
  terminal: Address | null;
  poolSummary: string;
};

const sameAddress = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase();

/**
 * Resolve the project's real buyback hook on a chain. hookOf/defaultHook must
 * NOT be trusted alone (the registry resolves a default even for projects that
 * don't route through it) — recognition goes through the ruleset DATA HOOK:
 * JBDirectory.controllerOf → currentRulesetOf → metadata.dataHook, unwrapping
 * the known singleton wrappers (REVOwner, the registry itself, and
 * JBOmnichainDeployer's extraDataHookOf indirection).
 */
async function resolveBuybackHook(row: ChainProjectRow): Promise<Address | null> {
  const client = publicClientFor(row.chainId);
  const directory = v6ContractAddress(JBCoreContracts.JBDirectory, row.chainId);
  const registry = v6ContractAddress(JBBuybackHookContracts.JBBuybackHookRegistry, row.chainId);
  const revOwner = v6ContractAddress(RevnetCoreContracts.REVOwner, row.chainId);
  const omni = v6ContractAddress("JBOmnichainDeployer", row.chainId);
  const concrete = v6ContractAddress(JBBuybackHookContracts.JBBuybackHook, row.chainId);
  if (!directory) return null;
  const projectId = BigInt(row.projectId);

  const controller = await client.readContract({
    address: directory,
    abi: jbDirectoryAbi,
    functionName: "controllerOf",
    args: [projectId],
  });
  if (!controller || controller === zeroAddress) return null;

  const [ruleset, metadata] = await client.readContract({
    address: controller,
    abi: jbControllerAbi,
    functionName: "currentRulesetOf",
    args: [projectId],
  });
  let dataHook: Address = metadata.dataHook;
  if (omni && sameAddress(dataHook, omni)) {
    const config = await client
      .readContract({
        address: omni,
        abi: jbOmnichainDeployerAbi,
        functionName: "extraDataHookOf",
        args: [projectId, BigInt(ruleset.id)],
      })
      .catch(() => null);
    if (!config) return null;
    dataHook = config.dataHook;
  }
  if (!dataHook || dataHook === zeroAddress) return null;
  if (sameAddress(dataHook, registry) || sameAddress(dataHook, revOwner)) {
    if (!registry) return null;
    const hook = await client
      .readContract({
        address: registry,
        abi: jbBuybackHookRegistryAbi,
        functionName: "hookOf",
        args: [projectId],
      })
      .catch(() => null);
    return hook && hook !== zeroAddress ? hook : null;
  }
  if (concrete && sameAddress(dataHook, concrete)) return dataHook;
  return null; // 721 tiers, croptop, defifa, unknown — no buyback pool.
}

/**
 * The project's router terminal: terminals are a LIST, so gate on
 * JBDirectory.isTerminalOf before trusting the registry's terminalOf (which
 * also resolves a default for non-users).
 */
async function resolveRouterTerminal(row: ChainProjectRow): Promise<Address | null> {
  const client = publicClientFor(row.chainId);
  const directory = v6ContractAddress(JBCoreContracts.JBDirectory, row.chainId);
  const registry = v6ContractAddress(
    JBRouterTerminalContracts.JBRouterTerminalRegistry,
    row.chainId,
  );
  const direct = v6ContractAddress(JBRouterTerminalContracts.JBRouterTerminal, row.chainId);
  if (!directory) return null;
  const projectId = BigInt(row.projectId);
  const isTerminal = (address?: Address) =>
    address
      ? client
          .readContract({
            address: directory,
            abi: jbDirectoryAbi,
            functionName: "isTerminalOf",
            args: [projectId, address],
          })
          .catch(() => false)
      : Promise.resolve(false);

  if (await isTerminal(registry)) {
    const terminal = await client
      .readContract({
        address: registry!,
        abi: jbRouterTerminalRegistryAbi,
        functionName: "terminalOf",
        args: [projectId],
      })
      .catch(() => null);
    return terminal && terminal !== zeroAddress ? terminal : null;
  }
  if (await isTerminal(direct)) return direct!;
  return null;
}

async function readChainState(row: ChainProjectRow): Promise<BuybackChainState> {
  const client = publicClientFor(row.chainId);
  const buybackRegistry = v6ContractAddress(
    JBBuybackHookContracts.JBBuybackHookRegistry,
    row.chainId,
  );
  const routerRegistry = v6ContractAddress(
    JBRouterTerminalContracts.JBRouterTerminalRegistry,
    row.chainId,
  );

  const [hook, terminal, defaultHook, defaultTerminal] = await Promise.all([
    resolveBuybackHook(row).catch(() => null),
    resolveRouterTerminal(row).catch(() => null),
    buybackRegistry
      ? client
          .readContract({
            address: buybackRegistry,
            abi: jbBuybackHookRegistryAbi,
            functionName: "defaultHook",
          })
          .catch(() => null)
      : Promise.resolve(null),
    routerRegistry
      ? client
          .readContract({
            address: routerRegistry,
            abi: jbRouterTerminalRegistryAbi,
            functionName: "defaultTerminal",
          })
          .catch(() => null)
      : Promise.resolve(null),
  ]);

  // Chains without a full Uniswap v4 AMM have a registry with no default hook
  // or allowlisted terminal — setHookFor/initializePoolFor would revert there.
  const buybackAvailable = !!buybackRegistry && !!defaultHook && defaultHook !== zeroAddress;
  const routerAvailable = !!routerRegistry && !!defaultTerminal && defaultTerminal !== zeroAddress;

  let poolSummary = hook ? "Not initialized" : "Set the hook first";
  if (hook) {
    const projectId = BigInt(row.projectId);
    const probes: { label: string; token: Address }[] = [{ label: "Native", token: zeroAddress }];
    const usdc = USDC_ADDRESSES[row.chainId];
    if (usdc) probes.push({ label: "USDC", token: usdc });
    const windows = await Promise.all(
      probes.map(async (probe) => ({
        ...probe,
        twap: Number(
          await client
            .readContract({
              address: hook,
              abi: jbBuybackHookAbi,
              functionName: "twapWindowOf",
              args: [projectId, probe.token],
            })
            .catch(() => 0n),
        ),
      })),
    );
    const initialized = windows.filter((w) => w.twap > 0);
    if (initialized.length) {
      poolSummary = initialized.map((w) => `${w.label} pool · TWAP ${w.twap}s`).join(", ");
    }
  }

  return {
    ...row,
    buybackRegistry,
    routerRegistry,
    buybackAvailable,
    routerAvailable,
    hook,
    terminal,
    poolSummary,
  };
}

type ActionKind = "hook" | "terminal" | "pool";

const ACTIONS: Record<
  ActionKind,
  { title: string; description: string; danger: string; fieldLabel: string }
> = {
  hook: {
    title: "Set buyback hook",
    description:
      "Points the project at the hook that chooses, on every payment, whether to issue tokens or buy them on the AMM. Requires SET_BUYBACK_HOOK.",
    danger: "The buyback hook intercepts every payment. A wrong hook can misroute or strand funds.",
    fieldLabel: "Buyback hook",
  },
  terminal: {
    title: "Set router terminal",
    description:
      "Sets the terminal the swap router forwards into after swapping USDC or another payment token. Requires SET_ROUTER_TERMINAL.",
    danger:
      "This changes where router-swapped funds are deposited. A wrong terminal can misdirect or strand funds.",
    fieldLabel: "Router terminal",
  },
  pool: {
    title: "Initialize buyback pool",
    description:
      "Creates and price-initializes the Uniswap v4 pool for a pair token through the project's configured hook (set the hook first). Requires SET_BUYBACK_POOL.",
    danger:
      "A wrong initial price lets arbitrageurs extract value. Verify the price, fee, tick spacing, pair token, and every selected chain.",
    fieldLabel: "Pair (terminal) token",
  },
};

/**
 * website/-parity renderBuybackRouterCard: cross-chain reads of the project's
 * actual buyback hook + router terminal (resolved through the ruleset data
 * hook, never the defaulting registry getters) and the three operator writes
 * against the registries, run per selected chain as sequential simulate-first
 * transactions.
 */
export function BuybackRouterCard({ rows }: { rows: ChainProjectRow[] }) {
  const stateQuery = useQuery({
    queryKey: [
      "v6-buyback-router-state",
      rows.map((row) => `${row.chainId}:${row.projectId}`).join(","),
    ],
    enabled: rows.length > 0,
    staleTime: 30_000,
    retry: 1,
    queryFn: () => Promise.all(rows.map((row) => readChainState(row))),
  });
  const states = stateQuery.data ?? [];

  return (
    <div>
      <h3 className="mb-2 text-base font-semibold text-zinc-700">Buyback &amp; swap router</h3>
      <div className="max-w-screen-sm">
        <p className="text-sm text-zinc-500">
          Wire up the project&apos;s buyback hook and swap router, then initialize its Uniswap pool.
          Each action runs on the chains you select as sequential transactions from the
          operator&apos;s wallet.
        </p>
        {stateQuery.isLoading ? (
          <SkeletonLines lines={4} className="mt-3" />
        ) : stateQuery.isError ? (
          <p className="text-sm text-red-600 mt-3">Could not read the buyback registries.</p>
        ) : (
          <div className="mt-3 divide-y divide-melon-200 bg-melon-50 px-4">
            <ActionRow kind="hook" states={states} onDone={() => stateQuery.refetch()} />
            <ActionRow kind="terminal" states={states} onDone={() => stateQuery.refetch()} />
            <ActionRow kind="pool" states={states} onDone={() => stateQuery.refetch()} />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionRow({
  kind,
  states,
  onDone,
}: {
  kind: ActionKind;
  states: BuybackChainState[];
  onDone: () => void;
}) {
  const action = ACTIONS[kind];
  const [open, setOpen] = useState(false);
  const available = states.filter((state) =>
    kind === "terminal" ? state.routerAvailable : state.buybackAvailable,
  );

  return (
    <div className="py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{action.title}</p>
        <p className="text-xs text-zinc-500 mt-1">{action.description}</p>
      </div>

      {(() => {
        const cell = (state: BuybackChainState) => {
          const isAvailable = kind === "terminal" ? state.routerAvailable : state.buybackAvailable;
          const value = kind === "hook" ? state.hook : kind === "terminal" ? state.terminal : null;
          return { isAvailable, value };
        };
        // When every chain reads the same, one value + a note beats four cards.
        const cells = states.map(cell);
        const summaries = states.map((state, i) =>
          !cells[i].isAvailable
            ? "unavailable"
            : kind === "pool"
              ? state.poolSummary
              : (cells[i].value ?? "unset").toLowerCase(),
        );
        const allSame = states.length > 1 && summaries.every((s) => s === summaries[0]);

        if (allSame) {
          const first = states[0];
          const { isAvailable, value } = cells[0];
          return (
            <div className="mt-2 flex items-start gap-2 bg-melon-100 px-2.5 py-1.5">
              <div className="min-w-0">
                {!isAvailable ? (
                  <p className="text-xs text-zinc-400">No Uniswap v4 registry on any chain</p>
                ) : kind === "pool" ? (
                  <p className="text-xs text-zinc-600">{first.poolSummary}</p>
                ) : value ? (
                  <EthereumAddress
                    address={value}
                    short
                    chain={JB_CHAINS[first.chainId]?.chain}
                    className="text-xs font-mono"
                  />
                ) : (
                  <p className="text-xs text-zinc-400">Not set</p>
                )}
                <p className="text-xs text-zinc-400 mt-0.5">Same on all chains</p>
              </div>
            </div>
          );
        }

        return (
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {states.map((state) => {
              const { isAvailable, value } = cell(state);
              return (
                <div
                  key={state.chainId}
                  className="flex items-start gap-2 bg-melon-100 px-2.5 py-1.5"
                >
                  <ChainLogo chainId={state.chainId} width={14} height={14} className="mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-700">{chainName(state.chainId)}</p>
                    {!isAvailable ? (
                      <p className="text-xs text-zinc-400">No Uniswap v4 registry here</p>
                    ) : kind === "pool" ? (
                      <p className="text-xs text-zinc-600">{state.poolSummary}</p>
                    ) : value ? (
                      <EthereumAddress
                        address={value}
                        short
                        chain={JB_CHAINS[state.chainId]?.chain}
                        className="text-xs font-mono"
                      />
                    ) : (
                      <p className="text-xs text-zinc-400">Not set</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      <Button
        variant="default"
        size="sm"
        className="mt-3"
        disabled={!available.length}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : action.title}
      </Button>

      {open ? (
        <BuybackActionForm
          kind={kind}
          available={available}
          onDone={() => {
            setOpen(false);
            onDone();
          }}
        />
      ) : null}
    </div>
  );
}

const DIGITS = /^\d+$/;

function BuybackActionForm({
  kind,
  available,
  onDone,
}: {
  kind: ActionKind;
  available: BuybackChainState[];
  onDone: () => void;
}) {
  const action = ACTIONS[kind];
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(available.map((state) => state.chainId)),
  );
  const [addresses, setAddresses] = useState<Record<number, string>>(() =>
    Object.fromEntries(
      available.map((state) => [
        state.chainId,
        kind === "hook"
          ? (state.hook ?? "")
          : kind === "terminal"
            ? (state.terminal ?? "")
            : NATIVE_TOKEN,
      ]),
    ),
  );
  const [fee, setFee] = useState("3000");
  const [tickSpacing, setTickSpacing] = useState("60");
  const [twapWindow, setTwapWindow] = useState("1800");
  const [sqrtPriceX96, setSqrtPriceX96] = useState("");
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chosen = useMemo(
    () => available.filter((state) => selected.has(state.chainId)),
    [available, selected],
  );

  const submit = async () => {
    if (busy || !address || !ack) return;
    setError(null);
    try {
      if (!chosen.length) throw new Error("Choose at least one available chain.");
      let poolValues: {
        fee: number;
        tickSpacing: number;
        twapWindow: bigint;
        sqrtPriceX96: bigint;
      } | null = null;
      if (kind === "pool") {
        if (![fee, tickSpacing, twapWindow, sqrtPriceX96].every((v) => DIGITS.test(v))) {
          throw new Error("Fee, tick spacing, TWAP window, and price must be whole numbers.");
        }
        poolValues = {
          fee: Number(fee),
          tickSpacing: Number(tickSpacing),
          twapWindow: BigInt(twapWindow),
          sqrtPriceX96: BigInt(sqrtPriceX96),
        };
        if (poolValues.fee < 0 || poolValues.fee > 0xffffff) {
          throw new Error("Fee must fit uint24.");
        }
        if (poolValues.tickSpacing < 1 || poolValues.tickSpacing > 0x7fffff) {
          throw new Error("Tick spacing must be a positive int24 value.");
        }
        if (poolValues.twapWindow < 1n || poolValues.twapWindow > 0xffffffffn) {
          throw new Error("TWAP window must be between 1 and 4,294,967,295 seconds.");
        }
        if (poolValues.sqrtPriceX96 <= 0n || poolValues.sqrtPriceX96 >= 2n ** 160n) {
          throw new Error("Initial price must be a positive uint160 value.");
        }
      }

      const writes: ChainWrite[] = chosen.map((state) => {
        const input = (addresses[state.chainId] ?? "").trim();
        if (!isAddress(input)) {
          throw new Error(
            `${chainName(state.chainId)}: enter a valid ${action.fieldLabel.toLowerCase()} address.`,
          );
        }
        const target = input as Address;
        const projectId = BigInt(state.projectId);
        if (kind === "hook") {
          if (!state.buybackRegistry)
            throw new Error(`${chainName(state.chainId)}: no buyback registry.`);
          return {
            chainId: state.chainId,
            address: state.buybackRegistry,
            abi: jbBuybackHookRegistryAbi,
            functionName: "setHookFor",
            args: [projectId, target],
          };
        }
        if (kind === "terminal") {
          if (!state.routerRegistry)
            throw new Error(`${chainName(state.chainId)}: no router registry.`);
          return {
            chainId: state.chainId,
            address: state.routerRegistry,
            abi: jbRouterTerminalRegistryAbi,
            functionName: "setTerminalFor",
            args: [projectId, target],
          };
        }
        if (!state.buybackRegistry || !poolValues)
          throw new Error(`${chainName(state.chainId)}: no buyback registry.`);
        return {
          chainId: state.chainId,
          address: state.buybackRegistry,
          abi: jbBuybackHookRegistryAbi,
          functionName: "initializePoolFor",
          args: [
            projectId,
            poolValues.fee,
            poolValues.tickSpacing,
            poolValues.twapWindow,
            target,
            poolValues.sqrtPriceX96,
          ],
        };
      });

      setBusy(true);
      const done = await runSequentialWrites({
        writes,
        account: address,
        writeContractAsync,
        onProgress: setStatus,
      });
      setStatus(`${action.title} completed on ${done} chain${done === 1 ? "" : "s"}.`);
      toast({ title: action.title, description: "Transaction(s) confirmed." });
      onDone();
    } catch (e) {
      const message = formatWalletError(e) || "Could not complete this action.";
      setError(message);
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 bg-melon-100 p-3">
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Run on</label>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {available.map((state) => (
            <label key={state.chainId} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.has(state.chainId)}
                disabled={busy}
                onChange={(e) =>
                  setSelected((current) => {
                    const next = new Set(current);
                    if (e.target.checked) next.add(state.chainId);
                    else next.delete(state.chainId);
                    return next;
                  })
                }
              />
              <ChainLogo chainId={state.chainId} width={14} height={14} />
              {chainName(state.chainId)}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium mb-1">{action.fieldLabel} per chain</label>
        <div className="space-y-2">
          {chosen.map((state) => (
            <div key={state.chainId} className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs w-36 shrink-0">
                <ChainLogo chainId={state.chainId} width={14} height={14} />
                {chainName(state.chainId)}
              </span>
              <Input
                value={addresses[state.chainId] ?? ""}
                onChange={(e) =>
                  setAddresses((current) => ({
                    ...current,
                    [state.chainId]: e.target.value,
                  }))
                }
                disabled={busy}
                placeholder={`0x… ${action.fieldLabel.toLowerCase()}`}
                className="h-8 text-xs font-mono"
                spellCheck={false}
              />
            </div>
          ))}
        </div>
        {kind === "pool" ? (
          <p className="text-xs text-zinc-500 mt-1">
            Use the native-token sentinel ({NATIVE_TOKEN}) for native ETH pools; the hook stores
            that pool key under address(0). USDC and other pair-token addresses can differ by chain.
          </p>
        ) : null}
      </div>

      {kind === "pool" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <NumberField
            label="Fee (hundredths of a bip)"
            value={fee}
            onChange={setFee}
            disabled={busy}
            placeholder="3000 = 0.3%"
          />
          <NumberField
            label="Tick spacing"
            value={tickSpacing}
            onChange={setTickSpacing}
            disabled={busy}
            placeholder="60 for a 0.3% pool"
          />
          <NumberField
            label="TWAP window (seconds)"
            value={twapWindow}
            onChange={setTwapWindow}
            disabled={busy}
            placeholder="1800"
          />
          <NumberField
            label="Initial price (sqrtPriceX96)"
            value={sqrtPriceX96}
            onChange={setSqrtPriceX96}
            disabled={busy}
            placeholder="positive uint160"
          />
        </div>
      ) : null}

      <label className="mt-3 flex items-start gap-2 border border-red-300 bg-red-50 rounded p-3">
        <input
          type="checkbox"
          checked={ack}
          disabled={busy}
          onChange={(e) => setAck(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-xs text-red-700">
          I verified every selected chain and value. {action.danger}
        </span>
      </label>

      <ButtonWithWallet
        targetChainId={chosen[0]?.chainId}
        connectWalletText="Connect wallet to continue"
        size="sm"
        className="mt-3"
        loading={busy}
        disabled={busy || !ack || !chosen.length}
        onClick={submit}
      >
        {action.title}
      </ButtonWithWallet>
      {status ? <p className="text-xs text-zinc-500 mt-2">{status}</p> : null}
      {error ? <p className="text-xs text-red-600 mt-2">{error}</p> : null}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <Input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        disabled={disabled}
        placeholder={placeholder}
        className="h-8 text-xs tabular-nums"
      />
    </label>
  );
}
