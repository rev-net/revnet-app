"use client";

import { ChainLogo } from "@/components/ChainLogo";
import EtherscanLink from "@/components/EtherscanLink";
import { RelayrPaymentSelect } from "@/components/RelayrPaymentSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { formatEthAddress, formatWalletError } from "@/lib/utils";
import { getPublicClient } from "@wagmi/core";
import {
  JB_CHAINS,
  JBChainId,
  jbControllerAbi,
  jbDirectoryAbi,
  jbProjectsAbi,
  JBCoreContracts,
} from "@bananapus/nana-sdk-core";
import { getTokenAddress, hasPermissions, JBPermissionIdsV6 } from "@bananapus/nana-sdk-core/v6";
import {
  ChainPayment,
  RelayrPostBundleResponse,
  useGetRelayrTxQuote,
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
  useSendRelayrTx,
} from "@bananapus/nana-sdk-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Address,
  encodeAbiParameters,
  encodeFunctionData,
  erc20Abi,
  keccak256,
  PublicClient,
  zeroAddress,
} from "viem";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { ProjectItem } from "../shared";

type TokenChainState = {
  chainId: JBChainId;
  projectId: bigint;
  controller: Address;
  owner: Address;
  token: Address | null;
  name: string | null;
  symbol: string | null;
};

const stateKey = (projects: ProjectItem[]) =>
  projects
    .map((project) => `${project.chainId}:${project.projectId}`)
    .sort()
    .join("|");

function clientFor(chainId: JBChainId) {
  const client = getPublicClient(wagmiConfig, { chainId }) as PublicClient | undefined;
  if (!client) throw new Error(`No public client is configured for chain ${chainId}.`);
  return client;
}

function Pipe() {
  return <span aria-hidden="true" className="text-melon-200">|</span>;
}

function TokenField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="text-melon-600">{label}:</span>
      <span className="text-black">{children}</span>
    </span>
  );
}

/** Token identity and omnichain edit/deploy controls, ahead of the Owners subtabs. */
export function V6TokenPanel({ projects }: { projects: ProjectItem[] }) {
  const { contractAddress } = useJBContractContext();
  const { metadata } = useJBProjectMetadataContext();
  const { token: contextToken } = useJBTokenContext();
  const { address } = useAccount();
  const key = useMemo(() => stateKey(projects), [projects]);

  const tokenState = useQuery({
    queryKey: ["v6-token-panel", key],
    enabled: projects.length > 0,
    staleTime: 30_000,
    queryFn: async (): Promise<TokenChainState[]> =>
      Promise.all(
        projects.map(async (project) => {
          const chainId = project.chainId as JBChainId;
          const projectId = BigInt(project.projectId);
          const client = clientFor(chainId);
          const [controller, owner, token] = await Promise.all([
            client.readContract({
              address: contractAddress(JBCoreContracts.JBDirectory, chainId),
              abi: jbDirectoryAbi,
              functionName: "controllerOf",
              args: [projectId],
            }),
            client.readContract({
              address: contractAddress(JBCoreContracts.JBProjects, chainId),
              abi: jbProjectsAbi,
              functionName: "ownerOf",
              args: [projectId],
            }),
            getTokenAddress(client, { chainId, projectId }),
          ]);

          if (!controller || controller === zeroAddress) {
            throw new Error(`No controller is configured on ${JB_CHAINS[chainId].name}.`);
          }

          let name: string | null = null;
          let symbol: string | null = null;
          if (token) {
            [name, symbol] = await Promise.all([
              client.readContract({ address: token, abi: erc20Abi, functionName: "name" }),
              client.readContract({ address: token, abi: erc20Abi, functionName: "symbol" }),
            ]);
          }

          return { chainId, projectId, controller, owner, token, name, symbol };
        }),
      ),
  });

  const states = tokenState.data ?? [];
  const primary = states.find((state) => state.token) ?? states[0];
  const isDeployed = states.some((state) => !!state.token);

  const permission = useQuery({
    queryKey: ["v6-token-panel-permission", key, address, isDeployed],
    enabled: !!address && states.length === projects.length && states.length > 0,
    staleTime: 15_000,
    queryFn: async () => {
      if (!address) return false;
      const allowed = await Promise.all(
        states.map(async (state) => {
          if (state.owner.toLowerCase() === address.toLowerCase()) return true;
          return hasPermissions(clientFor(state.chainId), {
            chainId: state.chainId,
            operator: address,
            account: state.owner,
            projectId: state.projectId,
            permissionIds: [
              state.token ? JBPermissionIdsV6.SET_TOKEN_METADATA : JBPermissionIdsV6.DEPLOY_ERC20,
            ],
          }).catch(() => false);
        }),
      );
      return allowed.every(Boolean);
    },
  });

  const fallbackName = contextToken.data?.name ?? metadata?.data?.name ?? "";
  const fallbackSymbol = contextToken.data?.symbol ?? "";

  return (
    <section className="mb-8 bg-melon-50 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-melon-700">Token</h2>

      {tokenState.isLoading ? (
        <SkeletonLines lines={2} />
      ) : tokenState.isError ? (
        <p className="text-sm text-red-600">Couldn&apos;t read this project&apos;s token.</p>
      ) : isDeployed && primary?.token ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <TokenField label="Name">{primary.name ?? primary.symbol ?? "Token"}</TokenField>
          <Pipe />
          <TokenField label="Symbol">{primary.symbol ?? "—"}</TokenField>
          <Pipe />
          <TokenField label="Type">ERC-20</TokenField>
          <Pipe />
          <TokenField label="Address">
            <EtherscanLink
              value={primary.token}
              chain={JB_CHAINS[primary.chainId].chain}
              className="font-medium"
            >
              {formatEthAddress(primary.token)}
            </EtherscanLink>
          </TokenField>
          <Pipe />
          <TokenField label="On">
            <span className="inline-flex items-center -space-x-0.5">
              {states
                .filter((state) => state.token)
                .map((state) => (
                  <EtherscanLink
                    key={state.chainId}
                    value={state.token!}
                    chain={JB_CHAINS[state.chainId].chain}
                    className="inline-flex rounded-full"
                  >
                    <ChainLogo chainId={state.chainId} width={18} height={18} />
                  </EtherscanLink>
                ))}
            </span>
          </TokenField>
        </div>
      ) : (
        <div className="max-w-3xl">
          <p className="font-medium text-black">No ERC-20 yet</p>
          <p className="mt-1 text-sm text-melon-700">
            Balances remain internal Juicebox credits and can still be cashed out. Deploying an
            ERC-20 makes them claimable as a transferable token and enables market liquidity.
          </p>
        </div>
      )}

      {!tokenState.isLoading && !tokenState.isError && states.length > 0 ? (
        <div className="mt-4">
          <TokenEditDialog
            states={states}
            deployed={isDeployed}
            initialName={primary?.name ?? fallbackName}
            initialSymbol={primary?.symbol ?? fallbackSymbol}
            canManage={permission.data === true}
            permissionLoading={permission.isLoading}
            onSuccess={() => tokenState.refetch()}
          />
        </div>
      ) : null}
    </section>
  );
}

function TokenEditDialog({
  states,
  deployed,
  initialName,
  initialSymbol,
  canManage,
  permissionLoading,
  onSuccess,
}: {
  states: TokenChainState[];
  deployed: boolean;
  initialName: string;
  initialSymbol: string;
  canManage: boolean;
  permissionLoading: boolean;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState<RelayrPostBundleResponse | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<ChainPayment | null>(null);
  const { address, chainId: connectedChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { getRelayrTxQuote, reset: resetRelayr } = useGetRelayrTxQuote();
  const { sendRelayrTx } = useSendRelayrTx();
  const { toast } = useToast();
  const { projectId: homeProjectId } = useJBContractContext();

  const resetQuote = () => {
    setQuote(null);
    setSelectedPayment(null);
    resetRelayr();
  };

  const finish = (description: string) => {
    toast({ title: deployed ? "Token updated" : "Token deployment submitted", description });
    setOpen(false);
    resetQuote();
    setTimeout(onSuccess, deployed ? 2_000 : 10_000);
  };

  const callFor = (state: TokenChainState, nextName: string, nextSymbol: string) => {
    if (state.token) {
      const args = [state.projectId, nextName, nextSymbol] as const;
      return {
        functionName: "setTokenMetadataOf" as const,
        args,
        data: encodeFunctionData({
          abi: jbControllerAbi,
          functionName: "setTokenMetadataOf",
          args,
        }),
      };
    }
    const salt = keccak256(
      encodeAbiParameters(
        [{ type: "uint256" }, { type: "string" }],
        [BigInt(homeProjectId), nextSymbol],
      ),
    );
    const args = [state.projectId, nextName, nextSymbol, salt] as const;
    return {
      functionName: "deployERC20For" as const,
      args,
      data: encodeFunctionData({ abi: jbControllerAbi, functionName: "deployERC20For", args }),
    };
  };

  const submit = async () => {
    const nextName = name.trim();
    const nextSymbol = symbol.trim();
    if (!nextName || !nextSymbol) {
      toast({ variant: "destructive", title: "Enter a token name and symbol" });
      return;
    }
    if (nextSymbol.length > 11) {
      toast({ variant: "destructive", title: "The symbol can be at most 11 characters" });
      return;
    }
    if (!address || !canManage) return;

    setBusy(true);
    try {
      if (states.length === 1) {
        const state = states[0];
        if (connectedChainId !== state.chainId) await switchChainAsync({ chainId: state.chainId });
        const call = callFor(state, nextName, nextSymbol);
        const hash = state.token
          ? await writeContractAsync({
              address: state.controller,
              chainId: state.chainId,
              abi: jbControllerAbi,
              functionName: "setTokenMetadataOf",
              args: call.args as readonly [bigint, string, string],
            })
          : await writeContractAsync({
              address: state.controller,
              chainId: state.chainId,
              abi: jbControllerAbi,
              functionName: "deployERC20For",
              args: call.args as readonly [bigint, string, string, `0x${string}`],
            });
        await clientFor(state.chainId).waitForTransactionReceipt({ hash });
        finish(deployed ? "The name and symbol are now updated." : "The ERC-20 is now deployed.");
        return;
      }

      const transactions = await Promise.all(
        states.map(async (state) => {
          const call = callFor(state, nextName, nextSymbol);
          const client = clientFor(state.chainId);
          const gas = state.token
            ? await client.estimateContractGas({
                account: address,
                address: state.controller,
                abi: jbControllerAbi,
                functionName: "setTokenMetadataOf",
                args: call.args as readonly [bigint, string, string],
              })
            : await client.estimateContractGas({
                account: address,
                address: state.controller,
                abi: jbControllerAbi,
                functionName: "deployERC20For",
                args: call.args as readonly [bigint, string, string, `0x${string}`],
              });
          return {
            chainId: state.chainId,
            data: {
              from: address,
              to: state.controller,
              value: 0n,
              gas: gas + (state.token ? 50_000n : 150_000n),
              data: call.data,
            },
          };
        }),
      );
      const relayrQuote = await getRelayrTxQuote(transactions);
      if (!relayrQuote) throw new Error("Relayr did not return a quote.");
      setQuote(relayrQuote);
      setSelectedPayment(relayrQuote.payment_info[0] ?? null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: deployed ? "Could not update the token" : "Could not deploy the token",
        description: formatWalletError(error),
      });
    } finally {
      setBusy(false);
    }
  };

  const payAndSubmit = async () => {
    if (!quote || !selectedPayment || !sendRelayrTx) return;
    setBusy(true);
    try {
      await sendRelayrTx(selectedPayment);
      finish(
        `Relayr is executing the ${deployed ? "update" : "deployment"} on ${states.length} chains.`,
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not submit the Relayr payment",
        description: formatWalletError(error),
      });
    } finally {
      setBusy(false);
    }
  };

  const permissionName = deployed ? "SET_TOKEN_METADATA" : "DEPLOY_ERC20";
  const chainNames = states.map((state) => JB_CHAINS[state.chainId].name).join(", ");

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setName(initialName);
          setSymbol(initialSymbol);
        }
        resetQuote();
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-xs text-melon-600 underline decoration-melon-300 underline-offset-4 transition-colors hover:text-black"
        >
          {deployed ? "Edit" : "Deploy ERC-20"}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{deployed ? "Edit token name & symbol" : "Set token name & symbol"}</DialogTitle>
          <DialogDescription>
            {deployed
              ? `Renames the ERC-20 on ${states.length} chain${states.length === 1 ? "" : "s"}: ${chainNames}. The contract address stays the same.`
              : `Deploys one ERC-20 at the same deterministic address on ${states.length} chain${states.length === 1 ? "" : "s"}: ${chainNames}.`}
          </DialogDescription>
        </DialogHeader>

        <div
          className={`border px-3 py-2 text-sm ${
            canManage
              ? "border-melon-200 bg-melon-50 text-melon-700"
              : "border-zinc-200 bg-zinc-50 text-zinc-600"
          }`}
        >
          {!address
            ? `Connect the project authority or an operator with ${permissionName} permission.`
            : permissionLoading
              ? "Checking authority across every project chain…"
              : canManage
                ? `Connected wallet is authorized to ${deployed ? "edit this token" : "deploy this ERC-20"}.`
                : `This wallet needs ${permissionName} permission on every project chain.`}
        </div>

        <div className="space-y-4 py-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-black">Token name</span>
            <Input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                resetQuote();
              }}
              placeholder="e.g. My Project Token"
              disabled={busy}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-black">Symbol</span>
            <Input
              value={symbol}
              maxLength={11}
              onChange={(event) => {
                setSymbol(event.target.value);
                resetQuote();
              }}
              placeholder="e.g. TOKEN"
              disabled={busy}
            />
          </label>
        </div>

        {quote ? (
          <RelayrPaymentSelect
            payments={quote.payment_info}
            tokenSymbol={symbol || "token"}
            selectedPayment={selectedPayment}
            onSelectPayment={setSelectedPayment}
            disabled={busy}
          />
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          {quote ? (
            <Button type="button" onClick={payAndSubmit} loading={busy} disabled={!selectedPayment || busy}>
              Pay and submit
            </Button>
          ) : (
            <Button type="button" onClick={submit} loading={busy} disabled={!address || !canManage || busy}>
              {states.length > 1 ? "Get quote" : deployed ? "Save token" : "Deploy token"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
