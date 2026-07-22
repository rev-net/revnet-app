"use client";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
import EtherscanLink from "@/components/EtherscanLink";
import { TokenAmount } from "@/components/TokenAmount";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stat } from "@/components/ui/stat";
import { useToast } from "@/components/ui/use-toast";
import { useAllowance } from "@/hooks/useAllowance";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { getPaymentTerminal, resolveBestV6PayRoute } from "@/lib/paymentTerminal";
import { minReturnedTokens, Pool } from "@/lib/quote";
import { Token } from "@/lib/token";
import { UNISWAP_V3_SWAP_ROUTER_ABI } from "@/lib/uniswap/abis";
import { UNISWAP_V3_SWAP_ROUTER_ADDRESSES } from "@/lib/uniswap/constants";
import { formatWalletError } from "@/lib/utils";
import { JB_CHAINS, JBChainId, JBVersion, TokenAmountType } from "@bananapus/nana-sdk-core";
import { buildPayTx } from "@bananapus/nana-sdk-core/v6";
import { useJBContractContext, useSuckers } from "@bananapus/nana-sdk-react";
import { useEffect } from "react";
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useSelectedSucker } from "./SelectedSuckerContext";

interface Props {
  amountA: TokenAmountType;
  amountB: TokenAmountType;
  memo: string | undefined;
  tokenIn: Token;
  tokenOut: Pick<Token, "address" | "decimals">;
  disabled?: boolean;
  onSuccess?: () => void;
  pool?: Pool;
}

export function PayDialog(props: Props) {
  const { amountA, amountB, memo, tokenIn, tokenOut, disabled, onSuccess, pool } = props;
  const { version } = useJBContractContext();
  const { address } = useAccount();
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { selectedSucker } = useSelectedSucker();
  const { peerChainId: chainId, projectId } = selectedSucker;
  const { isLoading: isTxLoading, isSuccess, error } = useWaitForTransactionReceipt({ hash });
  const { toast } = useToast();
  const baseToken = useProjectBaseToken();

  const publicClient = usePublicClient({ chainId });
  const { ensureAllowance, isApproving } = useAllowance(chainId);

  const value = amountA.amount.value;

  const { balances } = useTokenBalances([tokenIn], chainId);
  const userBalance = balances.get(tokenIn.address) ?? 0n;

  // Auto-reset after successful payment
  useEffect(() => {
    if (isSuccess && onSuccess) {
      const timer = setTimeout(onSuccess, 3000); // Show success message for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess]);

  useEffect(() => {
    if (!error) return;
    toast({ variant: "destructive", title: "Error", description: formatWalletError(error) });
  }, [error, toast]);

  const loading = isPending || isTxLoading || isApproving;

  const handlePay = async () => {
    try {
      if (!address || !selectedSucker || !publicClient || !writeContractAsync || !baseToken) {
        throw new Error("Please try again");
      }

      if (value > userBalance) {
        throw new Error(`You don't have enough ${tokenIn.symbol} balance in your wallet`);
      }

      if (pool) {
        // AMM flow
        const swapRouterAddress = UNISWAP_V3_SWAP_ROUTER_ADDRESSES[chainId];
        if (!swapRouterAddress) {
          throw new Error(`No Uniswap SwapRouter for chain ${chainId}`);
        }

        if (!tokenIn.isNative) {
          await ensureAllowance(tokenIn.address, swapRouterAddress, value);
        }

        const minTokens = minReturnedTokens(amountB.amount.value, 500n);

        const swapParams = {
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          fee: pool.fee,
          recipient: address,
          amountIn: value,
          amountOutMinimum: minTokens,
          sqrtPriceLimitX96: 0n,
        };

        await publicClient.simulateContract({
          abi: UNISWAP_V3_SWAP_ROUTER_ABI,
          functionName: "exactInputSingle",
          address: swapRouterAddress,
          args: [swapParams],
          value: tokenIn.isNative ? value : 0n,
          account: address,
        });

        await writeContractAsync({
          abi: UNISWAP_V3_SWAP_ROUTER_ABI,
          functionName: "exactInputSingle",
          chainId,
          address: swapRouterAddress,
          args: [swapParams],
          value: tokenIn.isNative ? value : 0n,
        });
      } else if (version === 6) {
        await handleV6Pay({
          publicClient,
          chainId,
          projectId,
          tokenIn,
          amount: value,
          beneficiary: address,
          memo: memo || "",
          writeContractAsync,
          ensureAllowance,
        });
      } else {
        await handleLegacyPay({
          publicClient,
          version,
          chainId,
          projectId,
          tokenIn,
          baseToken,
          amount: value,
          beneficiary: address,
          memo: memo || "",
          quotedPayerTokens: amountB.amount.value,
          writeContractAsync,
          ensureAllowance,
        });
      }
    } catch (err) {
      console.error("Payment failed:", err);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: formatWalletError(err),
      });
    }
  };

  return (
    <Dialog open={disabled === true ? false : undefined}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="h-14 w-full bg-teal-500 text-melon-950 hover:bg-teal-600"
        >
          Pay
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogTitle className="hidden">Pay</DialogTitle>
        <DialogHeader>
          <DialogDescription>
            <div>
              {isSuccess ? (
                <div>Success! You can close this window.</div>
              ) : (
                <>
                  <div className="flex flex-col gap-6">
                    <Stat label="Pay">
                      <TokenAmount amount={amountA} />
                    </Stat>
                    <Stat label="Get">
                      <TokenAmount amount={amountB} />
                    </Stat>
                    {memo && <Stat label="Memo">{memo}</Stat>}
                  </div>
                  {isTxLoading ? <div>Transaction submitted, awaiting confirmation...</div> : null}
                </>
              )}
            </div>
          </DialogDescription>
          {!isSuccess ? (
            <div className="flex flex-row justify-between items-end">
              {pool ? (
                <AmmSwapInfo poolAddress={pool.address as string} chainId={chainId} />
              ) : (
                <ChainSelector tokenSymbol={amountB.symbol || ""} chainId={chainId} />
              )}
              <ButtonWithWallet
                targetChainId={chainId}
                loading={loading}
                onClick={handlePay}
                className="bg-teal-500 text-melon-950 hover:bg-teal-600"
              >
                Pay
              </ButtonWithWallet>
            </div>
          ) : null}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

type WriteContractAsync = ReturnType<typeof useWriteContract>["writeContractAsync"];
type EnsureAllowance = (
  tokenAddress: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
) => Promise<unknown>;

/**
 * v6 pays re-resolve the best route (multi terminal vs router registry) with a fresh
 * on-chain preview at pay time, so `minReturnedTokens` is never encoded from a stale or
 * missing quote.
 */
async function handleV6Pay(args: {
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>;
  chainId: JBChainId;
  projectId: bigint;
  tokenIn: Token;
  amount: bigint;
  beneficiary: `0x${string}`;
  memo: string;
  writeContractAsync: WriteContractAsync;
  ensureAllowance: EnsureAllowance;
}) {
  const {
    publicClient,
    chainId,
    projectId,
    tokenIn,
    amount,
    beneficiary,
    memo,
    writeContractAsync,
    ensureAllowance,
  } = args;

  const route = await resolveBestV6PayRoute({
    client: publicClient,
    chainId,
    projectId,
    token: tokenIn.address,
    amount,
    beneficiary,
  });

  if (!route) {
    throw new Error("Could not resolve a payment route with a live quote. Please try again.");
  }

  if (!tokenIn.isNative) {
    await ensureAllowance(tokenIn.address, route.address, amount);
  }

  const request = buildPayTx({
    chainId,
    terminal: route.address,
    projectId,
    token: tokenIn.address,
    amount,
    beneficiary,
    minReturnedTokens: minReturnedTokens(route.preview.beneficiaryTokenCount, 100n),
    memo,
    metadata: "0x",
  });

  await writeContractAsync({
    abi: route.abi,
    functionName: request.functionName,
    chainId,
    address: request.address,
    args: request.args,
    value: request.value,
  });
}

async function handleLegacyPay(args: {
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>;
  version: Exclude<JBVersion, 6>;
  chainId: JBChainId;
  projectId: bigint;
  tokenIn: Token;
  baseToken: NonNullable<ReturnType<typeof useProjectBaseToken>>;
  amount: bigint;
  beneficiary: `0x${string}`;
  memo: string;
  quotedPayerTokens: bigint;
  writeContractAsync: WriteContractAsync;
  ensureAllowance: EnsureAllowance;
}) {
  const {
    publicClient,
    version,
    chainId,
    projectId,
    tokenIn,
    baseToken,
    amount,
    beneficiary,
    memo,
    quotedPayerTokens,
    writeContractAsync,
    ensureAllowance,
  } = args;

  const terminal = await getPaymentTerminal({
    client: publicClient,
    version,
    chainId,
    projectId,
    tokenIn,
    baseToken,
  });

  if (!tokenIn.isNative) {
    await ensureAllowance(tokenIn.address, terminal.address, amount);
  }

  // Slippage floor for direct multi-terminal non-native pays (e.g. USDC-base revnets).
  // Swap terminals price at market rates — leave minReturnedTokens at 0.
  const minTokens =
    terminal.type === "multi" && !tokenIn.isNative
      ? minReturnedTokens(quotedPayerTokens, 500n)
      : 0n;

  await writeContractAsync({
    abi: terminal.abi,
    functionName: "pay",
    chainId,
    address: terminal.address,
    args: [projectId, tokenIn.address, amount, beneficiary, minTokens, memo, "0x"],
    value: tokenIn.isNative ? amount : 0n,
  });
}

interface ChainSelectorProps {
  tokenSymbol: string;
  chainId: JBChainId;
}

function ChainSelector({ tokenSymbol, chainId }: ChainSelectorProps) {
  const { data: suckers } = useSuckers();
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();

  if (!suckers) return null;

  if (suckers.length > 1) {
    return (
      <div className="flex flex-col mt-4">
        <div className="text-sm text-zinc-500">{tokenSymbol} is available on:</div>
        <Select
          onValueChange={(v) =>
            setSelectedSucker(suckers.find((s) => s.peerChainId === Number(v))!)
          }
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

interface AmmSwapInfoProps {
  poolAddress: string;
  chainId: JBChainId;
}

function AmmSwapInfo({ poolAddress, chainId }: AmmSwapInfoProps) {
  return (
    <div className="flex flex-col mt-4">
      <div className="text-xs text-slate-500">Swapping via AMM pool:</div>
      <EtherscanLink
        value={poolAddress}
        type="address"
        truncateTo={6}
        chain={JB_CHAINS[chainId].chain}
        className="text-sm"
      />
    </div>
  );
}
