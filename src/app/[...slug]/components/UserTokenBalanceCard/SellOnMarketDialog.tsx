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
import { Address } from "viem";
import { useAccount, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { useUniswapV3Pool } from "@/hooks/useUniswapV3Pool";
import { useJBTokenContext } from "juice-sdk-react";
import { Button } from "@/components/ui/button";
import { mainnet, optimism, base, arbitrum, sepolia, optimismSepolia, baseSepolia, arbitrumSepolia } from "viem/chains";
import { toast } from "@/components/ui/use-toast";
import { usePublicClient, useWalletClient } from "wagmi";
import { useUniswapV3AddLimitOrder } from '@/hooks/useUniswapV3CreateAndSeedPool';

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
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
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
    token?.data?.address as Address || "0x0000000000000000000000000000000000000000",
    sellChainId ? Number(sellChainId) : 1
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
      setHasUniswapPool(null); // Reset pool state while checking
      const exists = await checkPool();
      console.log("Pool check result:", { exists, isPoolExists, poolAddress, isInitialized });
      
      // Update UI state based on pool existence and initialization
      if (exists) {
        if (isInitialized) {
          setHasUniswapPool(true); // Pool exists and is initialized - show sell UI
        } else {
          setHasUniswapPool(false); // Pool exists but not initialized - show create pool UI
        }
      } else {
        setHasUniswapPool(null); // No pool exists - show create pool UI
      }
      
      lastCheckedRef.current = currentCheck;
    } catch (error) {
      console.error("Error checking pool:", error);
      setHasUniswapPool(null);
    } finally {
      setIsCheckingPool(false);
    }
  }, [sellChainId, token?.data?.address, checkPool, isPoolExists, poolAddress, isInitialized]);

  // Update hasUniswapPool when isPoolExists or isInitialized changes
  useEffect(() => {
    if (isPoolExists !== undefined) {
      console.log("isPoolExists changed:", isPoolExists);
      if (isPoolExists) {
        if (isInitialized) {
          setHasUniswapPool(true); // Pool exists and is initialized - show sell UI
        } else {
          setHasUniswapPool(false); // Pool exists but not initialized - show create pool UI
        }
      } else {
        setHasUniswapPool(null); // No pool exists - show create pool UI
      }
    }
  }, [isPoolExists, isInitialized]);

  const handleChainChange = useCallback((chainId: string) => {
    setSellChainId(chainId);
    setHasUniswapPool(null); // Reset pool state
    lastCheckedRef.current = null; // Reset last checked reference
    setIsCheckingPool(true); // Set checking state before starting the check
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

  const handleSwitchNetwork = useCallback(async (targetChainId: number) => {
    if (!walletClient) return;
    try {
      await walletClient.switchChain({ id: targetChainId });
      // Wait for the network switch to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Verify we're on the correct network
      if (!publicClient) throw new Error("Public client not available");
      const currentChainId = await publicClient.getChainId();
      if (currentChainId !== targetChainId) {
        throw new Error("Failed to switch network");
      }
    } catch (error) {
      console.error("Error switching network:", error);
      toast({
        title: "Error switching network",
        description: "Please try switching networks manually in your wallet",
        variant: "destructive",
      });
    }
  }, [walletClient, publicClient]);

  const handleInitializePool = useCallback(async () => {
    try {
      // Ensure we're on the correct network first
      if (!isOnCorrectNetwork && sellChainId) {
        await handleSwitchNetwork(Number(sellChainId));
      }
      await initializePool(initialPrice);
      const exists = await checkPool();
      setHasUniswapPool(exists);
    } catch (error) {
      console.error("Error initializing pool:", error);
      toast({
        title: "Error creating pool",
        description: error instanceof Error ? error.message : "Failed to create pool",
        variant: "destructive",
      });
    }
  }, [initializePool, checkPool, isPoolExists, poolAddress, initialPrice, isOnCorrectNetwork, sellChainId, handleSwitchNetwork]);

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

  const {
    isLoading: isCreatingPool,
    error: poolError,
    addLimitOrder,
  } = useUniswapV3AddLimitOrder();

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
          <DialogDescription>
            Create a liquidity pool or sell your tokens on an existing pool.
          </DialogDescription>
          <div className="text-sm text-muted-foreground">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ChainLogo chainId={Number(sellChainId) as 1 | 10 | 8453 | 84532 | 42161 | 11155111 | 11155420 | 421614} />
                <Select
                  value={sellChainId}
                  onValueChange={handleChainChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {balances?.map((balance) => (
                      <SelectItem
                        key={balance.chainId}
                        value={balance.chainId.toString()}
                      >
                        {JB_CHAINS[balance.chainId as JBChainId]?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isOnCorrectNetwork && (
                  <ButtonWithWallet
                    onClick={() => {
                      if (!sellChainId) return;
                      handleSwitchNetwork(Number(sellChainId));
                    }}
                  >
                    Switch Network
                  </ButtonWithWallet>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {isCheckingPool && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <div className="mt-2 text-sm text-muted-foreground">
              Checking pool status...
            </div>
          </div>
        )}

        {!isCheckingPool && !hasUniswapPool && (
          <div className="space-y-4">
            <div className="text-sm">
              {isPoolExists ? (
                <>
                  <p className="mb-2">Add liquidity to the existing pool. Your tokens will be available for sale at the price you specify.</p>
                  <p className="text-muted-foreground">Current pool price: {(Number(cashoutQuote) / 1e18).toFixed(6)} ETH per token</p>
                </>
              ) : (
                <p>Create a liquidity pool with your tokens. The pool will be initialized with your tokens only, allowing others to add ETH later.</p>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="initialPrice">
                  {isPoolExists ? "Sell Price (ETH per token)" : "Initial Price (ETH per token)"}
                </Label>
                <Input
                  id="initialPrice"
                  type="number"
                  step="any"
                  min="0"
                  value={initialPrice}
                  onChange={(e) => setInitialPrice(e.target.value)}
                  placeholder="e.g. 0.01"
                  required
                />
                {isPoolExists && (
                  <>
                    <div className="text-sm text-muted-foreground mt-1">
                      Price must be above current pool price: {(Number(cashoutQuote) / 1e18).toFixed(6)} ETH
                    </div>
                    {cashoutQuote && initialPrice && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {(() => {
                          const currentPrice = Number(cashoutQuote) / 1e18;
                          const userPrice = Number(initialPrice);
                          const priceDiff = Math.abs(userPrice - currentPrice) / currentPrice;
                          if (priceDiff < 0.01) { // Less than 1% difference
                            return (
                              <div className="text-yellow-500">
                                Warning: Your price is very close to the current price. Consider setting a higher price to ensure your order is filled.
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </>
                )}
                {!isPoolExists && cashoutQuote && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Minimum price must be above cashout value: {(Number(cashoutQuote) / 1e18).toFixed(6)} ETH
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="amountToken">
                  {isPoolExists ? "Amount of Tokens to Add" : "Amount of Tokens in Limit Order"}
                </Label>
                <Input
                  id="amountToken"
                  type="number"
                  step="any"
                  min="0"
                  value={sellAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="e.g. 1000"
                  required
                />
              </div>

              <Button
                onClick={async () => {
                  try {
                    if (!cashoutQuote) {
                      throw new Error("Unable to get cashout value");
                    }
                    const minPriceEth = Number(initialPrice);
                    const cashoutValueEth = Number(cashoutQuote) / 1e18;
                    
                    if (minPriceEth <= cashoutValueEth) {
                      throw new Error(`Price must be above ${isPoolExists ? 'current pool price' : 'cashout value'} (${cashoutValueEth.toFixed(6)} ETH)`);
                    }

                    // If pool doesn't exist, create and initialize it first
                    if (!isPoolExists) {
                      console.log("Pool doesn't exist, creating and initializing...");
                      await initializePool(initialPrice);
                      // Wait a moment for the pool to be fully initialized
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      // Check pool status again
                      const exists = await checkPool();
                      if (!exists) {
                        throw new Error("Failed to create pool");
                      }
                    }

                    // Now add the limit order
                    await addLimitOrder({
                      tokenAddress: token?.data?.address as Address,
                      chainId: Number(sellChainId),
                      limitPrice: minPriceEth,
                      amountToken: sellAmountBN,
                      amountETH: 0n, // No ETH deposit initially
                      liquidityType: 'limit', // Specify this is a limit order
                      cashoutQuote // Add the cashout quote
                    });
                    // Refresh pool status after creation
                    checkPoolExistence();
                  } catch (error) {
                    console.error("Error creating pool:", error);
                    toast({
                      title: "Error creating pool",
                      description: error instanceof Error ? error.message : "Failed to create pool",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={isCreatingPool || !initialPrice || !sellAmount}
              >
                {isCreatingPool 
                  ? "Processing..." 
                  : isPoolExists 
                    ? "Add Liquidity Above Current Price" 
                    : "Create Pool with Tokens"}
              </Button>

              {poolError && (
                <div className="text-red-500 mt-2">
                  Error: {poolError}
                </div>
              )}
            </div>
          </div>
        )}

        {!isCheckingPool && hasUniswapPool && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount to sell</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                min="0"
                value={sellAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.0"
              />
            </div>
            {sellQuote && (
              <div className="text-sm text-muted-foreground">
                You will receive {NativeTokenValue({ wei: sellQuote, decimals: NATIVE_TOKEN_DECIMALS })} {NATIVE_TOKEN}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!isCheckingPool && hasUniswapPool && (
            <ButtonWithWallet
              onClick={() => {
                if (!primaryNativeTerminal?.data || !sellChainId) return;
                writeContract({
                  address: primaryNativeTerminal.data,
                  args: [
                    primaryNativeTerminal.data,
                    projectId,
                    sellAmountBN,
                    NATIVE_TOKEN,
                    0n,
                    DEFAULT_METADATA,
                    address as `0x${string}`,
                  ],
                  chainId: Number(sellChainId) as JBChainId,
                });
              }}
              disabled={!valid || loading || !isOnCorrectNetwork}
            >
              {loading
                ? "Processing..."
                : !isOnCorrectNetwork
                ? "Switch Network"
                : "Sell"}
            </ButtonWithWallet>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 