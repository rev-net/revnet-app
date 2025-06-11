import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FixedInt } from "fpnum";
import {
  DEFAULT_METADATA,
  JB_CHAINS,
  JBProjectToken,
  NATIVE_TOKEN,
  NATIVE_TOKEN_DECIMALS,
} from "juice-sdk-core";
import {
  JBChainId,
  NativeTokenValue,
  useJBContractContext,
  useSuckersUserTokenBalance,
  useTokenCashOutQuoteEth,
  useWriteJbMultiTerminalCashOutTokensOf,
} from "juice-sdk-react";
import { PropsWithChildren, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Address, parseUnits } from "viem";
import { useAccount, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { useUniswapV3Pool } from "@/hooks/useUniswapV3Pool";
import { useJBTokenContext } from "juice-sdk-react";
import { Button } from "@/components/ui/button";
import { mainnet, optimism, base, arbitrum, sepolia, optimismSepolia, baseSepolia, arbitrumSepolia } from "viem/chains";

// Explorer URLs for each chain
const EXPLORER_URLS: Record<number, string> = {
  [mainnet.id]: "https://etherscan.io",
  [optimism.id]: "https://optimistic.etherscan.io",
  [base.id]: "https://basescan.org",
  [baseSepolia.id]: "https://sepolia.basescan.org",
  [arbitrum.id]: "https://arbiscan.io",
  [sepolia.id]: "https://sepolia.etherscan.io",
  [optimismSepolia.id]: "https://sepolia-optimism.etherscan.io",
  [arbitrumSepolia.id]: "https://sepolia.arbiscan.io",
};

export function SellOnMarketDialog({
  projectId,
  creditBalance,
  tokenSymbol,
  primaryTerminalEth,
  disabled,
  children,
}: PropsWithChildren<{
  creditBalance: FixedInt<number>;
  tokenSymbol: string;
  projectId: bigint;
  primaryTerminalEth: Address;
  disabled?: boolean;
}>) {
  const [sellAmount, setSellAmount] = useState<string>("");
  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: balances } = useSuckersUserTokenBalance();
  const [sellChainId, setSellChainId] = useState<string>("");
  const { token } = useJBTokenContext();
  const [hasUniswapPool, setHasUniswapPool] = useState<boolean | null>(null);
  const [isCheckingPool, setIsCheckingPool] = useState(false);
  const lastCheckedRef = useRef<{ chainId: string; tokenAddress: string } | null>(null);
  const [initialPrice, setInitialPrice] = useState<string>("");

  // Check if user is on the correct network
  const isOnCorrectNetwork = useMemo(() => {
    return chainId === Number(sellChainId);
  }, [chainId, sellChainId]);

  // Sync dropdown with connected network
  useEffect(() => {
    // Only update if we have a valid chainId and it's one of the available balances
    if (chainId && balances?.some(b => b.chainId === chainId)) {
      console.log("Syncing dropdown with connected network:", chainId);
      setSellChainId(chainId.toString());
    }
  }, [chainId, balances]);

  const sellAmountBN = useMemo(() => {
    if (!sellAmount || isNaN(Number(sellAmount)) || Number(sellAmount) <= 0) {
      return 0n;
    }
    try {
      return JBProjectToken.parse(sellAmount, 18).value;
    } catch (error) {
      console.error("Error parsing sell amount:", error);
      return 0n;
    }
  }, [sellAmount]);

  const { checkPool, initializePool, isInitializing, isPoolExists, poolAddress, isInitialized } = useUniswapV3Pool(
    token?.data?.address as Address,
    sellChainId ? Number(sellChainId) : undefined
  );

  const checkPoolExistence = useCallback(async () => {
    if (!sellChainId || !token?.data?.address || token.data.address === "0x0000000000000000000000000000000000000000") {
      setHasUniswapPool(null);
      return;
    }

    // Check if we've already checked this combination
    const currentCheck = { chainId: sellChainId, tokenAddress: token.data.address };
    if (
      lastCheckedRef.current?.chainId === currentCheck.chainId &&
      lastCheckedRef.current?.tokenAddress === currentCheck.tokenAddress
    ) {
      return;
    }

    try {
      setIsCheckingPool(true);
      const exists = await checkPool();
      console.log("Pool check result:", { exists, isPoolExists, poolAddress });
      setHasUniswapPool(exists);
      lastCheckedRef.current = currentCheck;
    } catch (error) {
      console.error("Error checking pool:", error);
      setHasUniswapPool(null);
    } finally {
      setIsCheckingPool(false);
    }
  }, [sellChainId, token?.data?.address, checkPool, isPoolExists, poolAddress]);

  // Update hasUniswapPool when isPoolExists changes
  useEffect(() => {
    if (isPoolExists !== undefined) {
      console.log("isPoolExists changed:", isPoolExists);
      setHasUniswapPool(isPoolExists);
    }
  }, [isPoolExists]);

  const handleChainChange = useCallback((chainId: string) => {
    setSellChainId(chainId);
    setHasUniswapPool(null);
    lastCheckedRef.current = null;
    checkPoolExistence();
  }, [checkPoolExistence]);

  const handleAmountChange = useCallback((amount: string) => {
    if (amount === "" || /^\d*\.?\d*$/.test(amount)) {
      setSellAmount(amount);
    }
  }, []);

  // Check pool when chain or token changes
  useEffect(() => {
    if (sellChainId && token?.data?.address) {
      checkPoolExistence();
    }
  }, [sellChainId, token?.data?.address, checkPoolExistence]);

  const {
    writeContract,
    isPending: isWriteLoading,
    data,
  } = useWriteJbMultiTerminalCashOutTokensOf();

  const txHash = data;
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const { data: sellQuote } = useTokenCashOutQuoteEth(sellAmountBN, {
    chainId: Number(sellChainId) as JBChainId,
  });
  const loading = isWriteLoading || isTxLoading;
  const selectedBalance = balances?.find(
    (b) => b.chainId === Number(sellChainId)
  );
  const valid =
    sellAmountBN > 0n &&
    (selectedBalance?.balance.value ?? 0n) >= sellAmountBN;

  const handleInitializePool = useCallback(async () => {
    try {
      await initializePool(initialPrice);
      const exists = await checkPool();
      setHasUniswapPool(exists);
    } catch (error) {
      console.error("Error initializing pool:", error);
    }
  }, [initializePool, checkPool, isPoolExists, poolAddress, initialPrice]);

  // Get explorer URL for current chain
  const explorerUrl = useMemo(() => {
    if (!sellChainId) return null;
    return EXPLORER_URLS[Number(sellChainId)];
  }, [sellChainId]);

  // Get cashout value for 1 token
  const { data: cashoutQuote } = useTokenCashOutQuoteEth(
    JBProjectToken.parse("1", 18).value,
    { chainId: Number(sellChainId) as JBChainId }
  );

  // Set as default if not already set
  useEffect(() => {
    if (cashoutQuote && (!initialPrice || initialPrice === "0.01")) {
      setInitialPrice((Number(cashoutQuote) / 1e18).toString());
    }
  }, [cashoutQuote, initialPrice]);

  return (
    <Dialog open={disabled === true ? false : undefined}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-arrow-down-right"
          >
            <path d="m7 7 10 10" />
            <path d="M17 7v10H7" />
          </svg>
          Sell on market
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sell {tokenSymbol} on market</DialogTitle>
          <div className="text-sm text-muted-foreground">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  {isOnCorrectNetwork && (
                    <>
                      <div className="text-sm font-medium">Uniswap V3 Pool Status</div>
                      {!sellChainId ? (
                        <div className="text-sm text-zinc-600">Select a chain to check pool status</div>
                      ) : isCheckingPool ? (
                        <div className="text-sm text-zinc-600">Checking pool status...</div>
                      ) : hasUniswapPool ? (
                        <div className="space-y-1">
                          <div className="text-sm text-green-600 flex items-center gap-2">
                            <span>✓ Pool exists (0.3% fee tier)</span>
                          </div>
                          {poolAddress && explorerUrl && (
                            <div className="text-sm text-zinc-600 pl-6 space-y-1">
                              <div>
                                <a 
                                  href={`${explorerUrl}/address/${poolAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  View on Explorer
                                </a>
                              </div>
                              <div>
                                <a 
                                  href={`https://app.uniswap.org/pools/${poolAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  View on Uniswap
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-sm text-amber-600 flex items-center gap-2">
                            <span>⚠️ No Uniswap V3 Pool found</span>
                          </div>
                          <div className="text-sm text-zinc-600 pl-6 space-y-2">
                            <div>You can:</div>
                            <div className="space-y-1">
                              <div>1. Create a new Uniswap pool to enable trading</div>
                              <div>2. Cash out your tokens or take a loan</div>
                            </div>
                          </div>
                          {isOnCorrectNetwork && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-6"
                              onClick={handleInitializePool}
                              disabled={isInitializing}
                            >
                              {isInitializing ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                  Creating Pool...
                                </div>
                              ) : (
                                "Create Uniswap Pool"
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          <div className="my-4">
            {isSuccess ? (
              <div>Success! You can close this window.</div>
            ) : (
              <>
                {/* Price Initialization Status */}
                {isOnCorrectNetwork && hasUniswapPool && poolAddress && !isCheckingPool && !isInitialized && (
                  <div className="mb-4 p-3 border border-amber-200 bg-amber-50 rounded-md">
                    <div className="text-sm text-amber-800 font-medium mb-2">
                      ⚠️ Pool needs price initialization
                    </div>
                    <div className="text-sm text-amber-700 mb-3">
                      The pool exists but needs to be initialized with a price before trading can begin.
                    </div>
                    <div className="mb-3">
                      <label htmlFor="initialPrice" className="block text-sm font-medium text-amber-900 mb-1">
                        Initial Price (ETH per {tokenSymbol})
                      </label>
                      <input
                        id="initialPrice"
                        type="number"
                        min="0"
                        step="any"
                        value={initialPrice}
                        onChange={e => setInitialPrice(e.target.value)}
                        className="w-full rounded border border-amber-300 px-2 py-1 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="e.g. 0.01"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleInitializePool}
                      disabled={isInitializing || !initialPrice || Number(initialPrice) <= 0}
                      className="w-full"
                    >
                      {isInitializing ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-800"></div>
                          Initializing Price...
                        </div>
                      ) : (
                        "Initialize Pool Price"
                      )}
                    </Button>
                  </div>
                )}

                <div className="mb-5 w-[65%]">
                  <span className="text-sm text-black font-medium">
                    {" "}
                    Your {tokenSymbol}
                  </span>
                  <div className="mt-1 border border-zinc-200 p-3 bg-zinc-50">
                    {balances?.map((balance, index) => (
                      <div key={index} className="flex justify-between gap-2">
                        {JB_CHAINS[balance.chainId as JBChainId].name}
                        <span className="font-medium">
                          {balance.balance?.format()} {tokenSymbol}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid w-full gap-1.5">
                  {/* Hide only the amount input if there is no Uniswap pool and not checking */}
                  {!(isOnCorrectNetwork && !isCheckingPool && hasUniswapPool === false) && (
                    <Label htmlFor="amount" className="text-zinc-900">
                      Amount to sell
                    </Label>
                  )}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Hide only the input, not the chain selector */}
                    <div className="col-span-4">
                      {!(isOnCorrectNetwork && !isCheckingPool && hasUniswapPool === false) && (
                        <div className="relative">
                          <Input
                            id="amount"
                            name="amount"
                            value={sellAmount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                          />
                          <div
                            className={
                              "pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 z-10"
                            }
                          >
                            <span className="text-zinc-500 sm:text-md">
                              {tokenSymbol}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-span-3">
                      <Select 
                        onValueChange={handleChainChange}
                        value={sellChainId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select chain" />
                        </SelectTrigger>
                        <SelectContent>
                          {balances
                            ?.filter((b) => b.balance.value > 0n)
                            .map((balance) => {
                              return (
                                <SelectItem
                                  value={balance.chainId.toString()}
                                  key={balance.chainId}
                                >
                                  <div className="flex items-center gap-2">
                                    <ChainLogo
                                      chainId={balance.chainId as JBChainId}
                                    />
                                    {
                                      JB_CHAINS[balance.chainId as JBChainId]
                                        .name
                                    }
                                  </div>
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {sellAmount && sellChainId && !valid ? (
                  <div className="text-red-500 mt-4">
                    Insuffient {tokenSymbol} on{" "}
                    {JB_CHAINS[Number(sellChainId) as JBChainId].name}
                  </div>
                ) : null}

                {sellAmount && sellAmountBN > 0n && valid ? (
                  <div className="text-base mt-4">
                    Estimated value:{" "}
                    {sellQuote ? (
                      <span className="font-medium">
                        <NativeTokenValue wei={((sellQuote * 975n) / 1000n)} decimals={8} />
                      </span>
                    ) : (
                      <>...</>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          {!isSuccess ? (
            <ButtonWithWallet
              targetChainId={Number(sellChainId) as JBChainId}
              loading={loading}
              onClick={() => {
                if (!primaryNativeTerminal?.data) {
                  console.error("no terminal");
                  return;
                }

                if (!(address && sellAmountBN)) {
                  console.error("incomplete args");
                  return;
                }

                const args = [
                  address, // holder
                  projectId, // project id
                  sellAmount
                    ? parseUnits(sellAmount, NATIVE_TOKEN_DECIMALS)
                    : 0n, // sell count
                  NATIVE_TOKEN, // token to reclaim
                  0n, // min tokens reclaimed
                  address, // beneficiary
                  DEFAULT_METADATA, // metadata
                ] as const;

                console.log("⏩ sell args", args);

                writeContract?.({
                  chainId: Number(sellChainId) as JBChainId,
                  address: primaryNativeTerminal?.data,
                  args,
                });
              }}
            >
              Sell on market
            </ButtonWithWallet>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 