import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
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
import {
  JB_CHAINS,
  NATIVE_TOKEN,
  getTokenBtoAQuote,
  JBProjectToken,
} from "juice-sdk-core";
import {
  JBChainId,
  useSuckersUserTokenBalance,
  useJBRulesetContext,
  useSuckers,
  useJBTokenContext,
  useJBContractContext,
  useJBChainId,
} from "juice-sdk-react";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Token } from "@uniswap/sdk-core";
import { Pool, FeeAmount } from "@uniswap/v3-sdk";
import { UNISWAP_V3_FACTORY_ADDRESSES, WETH_ADDRESSES } from "@/constants";
import { parseEther } from "viem";
import { FixedInt } from "fpnum";
import { AddLiquidity } from "./AddLiquidity";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { toast } from "@/components/ui/use-toast";


// Define minimal ABIs for the functions we need
const FACTORY_ABI = [
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee", type: "uint24" }
    ],
    name: "getPool",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee", type: "uint24" }
    ],
    name: "createPool",
    outputs: [{ name: "pool", type: "address" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

const POOL_ABI = [
  {
    inputs: [],
    name: "slot0",
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint8" },
      { name: "unlocked", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "liquidity",
    outputs: [{ name: "", type: "uint128" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "sqrtPriceX96", type: "uint160" }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

interface PoolState {
  exists: boolean;
  hasInitialPrice: boolean;
  hasLiquidity: boolean;
  address: Address | null;
}



export function SellOnMarket({
  tokenSymbol,
  disabled,
  children,
}: PropsWithChildren<{
  tokenSymbol: string;
  disabled?: boolean;
}>) {
  const { address } = useAccount();
  const { data: balances } = useSuckersUserTokenBalance();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const { token } = useJBTokenContext();
  const { projectId } = useJBContractContext(); // Add this
  const chainId = useJBChainId(); // Add this
  const [sellChainId, setSellChainId] = useState<string>();
  const [poolState, setPoolState] = useState<PoolState>({
    exists: false,
    hasInitialPrice: false,
    hasLiquidity: false,
    address: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [initialPrice, setInitialPrice] = useState<number | null>(null);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const suckersQuery = useSuckers();
  const suckers = suckersQuery.data;



  // Get the correct factory address for the selected chain
  const factoryAddress = useMemo(() => {
    if (!sellChainId) return null;
    const address = UNISWAP_V3_FACTORY_ADDRESSES[Number(sellChainId)];
    return address ? (address as `0x${string}`) : null;
  }, [sellChainId]);

  // Create token instances once when chain is selected
  const tokens = useMemo(() => {
    if (!sellChainId || !token?.data) return null;

    const chainId = Number(sellChainId);

    // Check if the native token from JB is ETH
    const isEthChain = NATIVE_TOKEN === "0x000000000000000000000000000000000000EEEe";

    if (isEthChain) {
      // For ETH chains, use WETH for Uniswap V3 pools
      const wethAddress = WETH_ADDRESSES[chainId];
      if (!wethAddress || wethAddress === "0x0000000000000000000000000000000000000000") {
        console.warn(`WETH address not available for chain ${sellChainId}`);
        return null;
      }

      return {
        projectToken: new Token(
          chainId,
          token.data.address as `0x${string}`,
          token.data.decimals,
          tokenSymbol,
          tokenSymbol
        ),
        nativeToken: new Token(
          chainId,
          wethAddress,
          18,
          "WETH",
          "Wrapped Ether"
        )
      };
    } else {
      // For non-ETH chains, use the native token directly
      return {
        projectToken: new Token(
          chainId,
          token.data.address as `0x${string}`,
          token.data.decimals,
          tokenSymbol,
          tokenSymbol
        ),
        nativeToken: new Token(
          chainId,
          NATIVE_TOKEN as `0x${string}`,
          18,
          "NATIVE",
          "Native Token"
        )
      };
    }
  }, [sellChainId, token?.data, tokenSymbol]);

  // Calculate initial price when ruleset data is available
  useEffect(() => {
    if (!ruleset?.data || !rulesetMetadata?.data || !tokens) return;

    try {
      // Calculate initial price using Juicebox SDK
      const oneNativeToken = new FixedInt(parseEther("1"), tokens.nativeToken.decimals);
      const amountAQuote = getTokenBtoAQuote(
        oneNativeToken,
        tokens.projectToken.decimals,
        {
          weight: ruleset.data.weight,
          reservedPercent: rulesetMetadata.data.reservedPercent,
        }
      );

      // The quote gives us tokens per native token (how many project tokens for 1 native token)
      const tokensPerNative = Number(amountAQuote.format()); // e.g., 10000 tokens per native
      const nativePerToken = 1 / tokensPerNative; // e.g., 0.0001 native per token

      console.log("Price from Juicebox:", {
        nativePerToken,   // How much native token you need for 1 project token
        tokensPerNative,  // How many project tokens you get for 1 native token
        note: `1 ${tokens.nativeToken.symbol} = ${tokensPerNative} ${tokenSymbol}, or 1 ${tokenSymbol} = ${nativePerToken} ${tokens.nativeToken.symbol}`
      });

      // Set initial price to 200% of JB price (in tokens per native) - make it more expensive
      const initialTokensPerNative = tokensPerNative * 2; // e.g., 170000 tokens per native (200% of issuance)
      const initialNativePerToken = 1 / initialTokensPerNative; // e.g., 0.000005882353 native per token

      console.log("Initial pool price:", {
        initialNativePerToken,    // How much native token you need for 1 project token
        initialTokensPerNative,   // How many project tokens you get for 1 native token
        note: `Initial price = ${initialNativePerToken} ${tokens.nativeToken.symbol} per ${tokenSymbol} (or ${initialTokensPerNative} ${tokenSymbol} per ${tokens.nativeToken.symbol})`
      });
      setInitialPrice(initialTokensPerNative); // Set to tokens per native for contract

      // Calculate sqrtPriceX96 for Uniswap V3 (consistent with initializePool)
      const sqrt = Math.sqrt(initialTokensPerNative);
      const sqrtPriceX96 = BigInt(Math.floor(sqrt * 2 ** 96));

      console.log("Pool Initialization:", {
        initialNativePerToken,    // native token per project token
        initialTokensPerNative,   // project tokens per native token
        sqrt,
        sqrtPriceX96: sqrtPriceX96.toString(),
        note: `sqrtPriceX96 is calculated from ${tokenSymbol} per ${tokens.nativeToken.symbol} (consistent with initializePool)`
      });
    } catch (error) {
      console.error("Error calculating initial price:", error);
      setInitialPrice(null);
    }
  }, [ruleset?.data, rulesetMetadata?.data, tokens, tokenSymbol]);

  // Check for existing pool when chain is selected
  useEffect(() => {
    const checkPool = async () => {
      if (!sellChainId || !publicClient || !tokens || !factoryAddress) {
        setPoolState({
          exists: false,
          hasInitialPrice: false,
          hasLiquidity: false,
          address: null,
        });
        return;
      }

      try {
        // First verify the contract exists and has the getPool function
        const code = await publicClient.getBytecode({ address: factoryAddress });
        if (!code || code === "0x") {
          console.error("No contract code found at factory address:", factoryAddress);
          setPoolState({
            exists: false,
            hasInitialPrice: false,
            hasLiquidity: false,
            address: null,
          });
          return;
        }

        console.log("Contract exists at:", factoryAddress);
        console.log("Checking pool with params:", {
          factoryAddress,
          tokenA: tokens.projectToken.address,
          tokenB: tokens.nativeToken.address,
          fee: FeeAmount.LOW
        });
        console.log("Project Token:", {
          address: tokens.projectToken.address,
          symbol: tokens.projectToken.symbol,
          chainId: tokens.projectToken.chainId
        });
        console.log("Native Token:", {
          address: tokens.nativeToken.address,
          symbol: tokens.nativeToken.symbol,
          chainId: tokens.nativeToken.chainId
        });

        // First check if the pool exists using the factory
        const poolAddress = await publicClient.readContract({
          address: factoryAddress,
          abi: FACTORY_ABI,
          functionName: "getPool",
          args: [
            tokens.projectToken.address as `0x${string}`,
            tokens.nativeToken.address as `0x${string}`,
            FeeAmount.LOW
          ],
        }) as `0x${string}`;

        console.log("Pool address returned:", poolAddress);

        if (poolAddress === "0x0000000000000000000000000000000000000000") {
          console.log("No pool exists for this token pair");
          setPoolState({
            exists: false,
            hasInitialPrice: false,
            hasLiquidity: false,
            address: null,
          });
          return;
        }

        console.log("Pool exists at:", poolAddress);

        // If pool exists, check its state
        const [slot0, liquidity] = await Promise.all([
          publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: "slot0",
          }),
          publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: "liquidity",
          }),
        ]);

        // slot0 returns [sqrtPriceX96, tick, observationIndex, observationCardinality, observationCardinalityNext, feeProtocol, unlocked]
        const sqrtPriceX96 = (slot0 as readonly [bigint, number, number, number, number, number, boolean])[0];
        const hasInitialPrice = sqrtPriceX96 > 0n;
        const hasLiquidity = liquidity > 0n;

        console.log("Pool state check:", {
          poolAddress,
          sqrtPriceX96: sqrtPriceX96.toString(),
          hasInitialPrice,
          liquidity: liquidity.toString(),
          hasLiquidity
        });

        setPoolState({
          exists: true,
          hasInitialPrice,
          hasLiquidity,
          address: poolAddress,
        });
      } catch (error) {
        console.error("Error checking pool:", error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
        }
        setPoolState({
          exists: false,
          hasInitialPrice: false,
          hasLiquidity: false,
          address: null,
        });
      }
    };

    checkPool();
  }, [sellChainId, publicClient, tokens, factoryAddress]);

  const createPool = async () => {
    if (!address || !walletClient || !publicClient || !sellChainId || !tokens || !factoryAddress) return;

    try {
      setIsLoading(true);
      const hash = await walletClient.writeContract({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: "createPool",
        args: [
          tokens.projectToken.address as `0x${string}`,
          tokens.nativeToken.address as `0x${string}`,
          FeeAmount.LOW
        ],
        account: address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Pool created:", receipt);

      // Get the new pool address from the factory
      const newPoolAddress = await publicClient.readContract({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: "getPool",
        args: [
          tokens.projectToken.address as `0x${string}`,
          tokens.nativeToken.address as `0x${string}`,
          FeeAmount.LOW
        ],
      }) as `0x${string}`;

      setPoolState({
        exists: true,
        hasInitialPrice: false,
        hasLiquidity: false,
        address: newPoolAddress,
      });
      console.log("New pool created at:", newPoolAddress);
    } catch (error) {
      console.error("Error creating pool:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializePool = async () => {
    if (!address || !walletClient || !publicClient || !sellChainId || !tokens || !poolState.address || !initialPrice) return;

    try {
      setIsLoading(true);

      // Calculate sqrtPriceX96 for Uniswap V3
      const tokensPerNative = 1 / initialPrice;
      const sqrt = Math.sqrt(tokensPerNative);
      const sqrtPriceX96 = BigInt(Math.floor(sqrt * 2 ** 96));

      console.log("Pool Initialization:", {
        initialPrice,                    // native token per project token
        tokensPerNative,                 // project tokens per native token
        sqrt,
        sqrtPriceX96: sqrtPriceX96.toString(),
        note: `sqrtPriceX96 = sqrt(${tokenSymbol} per ${tokens.nativeToken.symbol}) * 2^96`
      });

      const hash = await walletClient.writeContract({
        address: poolState.address,
        abi: POOL_ABI,
        functionName: "initialize",
        args: [sqrtPriceX96],
        account: address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Pool initialized:", receipt);

      // Update pool state
      setPoolState(prev => ({
        ...prev,
        hasInitialPrice: true
      }));
    } catch (error) {
      console.error("Error initializing pool:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to check who owns the buyback hook
  const checkBuybackHookOwner = async () => {
    if (!publicClient) return;

    try {
      const buybackHookAddress = "0x47d1b88af8ee0ed0a772a7c98430894141b9ac8b" as Address;

      // Try to read the owner
      const owner = await publicClient.readContract({
        address: buybackHookAddress,
        abi: [
          {
            inputs: [],
            name: "owner",
            outputs: [{ name: "", type: "address" }],
            stateMutability: "view",
            type: "function"
          }
        ],
        functionName: "owner",
      });

      console.log("Buyback hook owner:", owner);
      return owner;
    } catch (error) {
      console.log("Could not read owner, trying different approach:", error);

      // Try to check if the current user is the owner by attempting the call
      // This will fail with a permission error if they're not the owner
      return null;
    }
  };

  // Update the reset function to fix the type error
  const resetBuybackHookToMediumFee = async () => {
    if (!address || !walletClient || !publicClient || !sellChainId || !tokens) {
      console.error("Missing required data");
      return;
    }

    try {
      setIsLoading(true);

      // Use the hardcoded buyback hook address
      const buybackHookAddress = "0x47d1b88af8ee0ed0a772a7c98430894141b9ac8b" as Address;

      console.log("Resetting buyback hook to MEDIUM fee...");

      // Buyback hook ABI for updating pool configuration
      const BUYBACK_HOOK_ABI = [
        {
          inputs: [
            {
              components: [
                { name: "token", type: "address" },
                { name: "fee", type: "uint24" },
                { name: "twapWindow", type: "uint32" },
                { name: "twapSlippageTolerance", type: "uint16" }
              ],
              name: "poolConfigurations",
              type: "tuple[]"
            }
          ],
          name: "setPoolConfigurations",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        }
      ] as const;

      // Update to MEDIUM fee (3000 = 0.3%)
      const newPoolConfigurations = [
        {
          token: tokens.nativeToken.address as `0x${string}`, // Fix the type
          fee: 3000, // FeeAmount.MEDIUM (0.3%)
          twapWindow: 2 * 60 * 60 * 24, // 2 days
          twapSlippageTolerance: 9000, // 90%
        }
      ];

      console.log("New pool configurations:", newPoolConfigurations);

      const hash = await walletClient.writeContract({
        address: buybackHookAddress,
        abi: BUYBACK_HOOK_ABI,
        functionName: "setPoolConfigurations",
        args: [newPoolConfigurations],
        account: address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Buyback hook updated:", receipt);

      toast({
        title: "Success",
        description: "Buyback hook updated to MEDIUM fee tier",
      });

    } catch (error) {
      console.error("Error updating buyback hook:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update buyback hook - you may not have permission",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sell {tokenSymbol} on Market</DialogTitle>
          <DialogDescription>
            Create and manage a Uniswap V3 pool for {tokenSymbol}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Chain
            </label>
            <Select
              value={sellChainId}
              onValueChange={setSellChainId}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a chain" />
              </SelectTrigger>
              <SelectContent>
                {suckers?.map((sucker) => (
                  <SelectItem key={sucker.peerChainId} value={sucker.peerChainId}>
                    <div className="flex items-center space-x-2">
                      <ChainLogo chainId={sucker.peerChainId as JBChainId} />
                      <span>{JB_CHAINS[sucker.peerChainId as JBChainId].name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sellChainId && (
            <div className="mt-4 p-4 border rounded-lg bg-zinc-50">
              {!factoryAddress ? (
                <div className="text-sm">
                  <p className="font-medium text-red-600">
                    Uniswap V3 is not supported on {JB_CHAINS[Number(sellChainId) as JBChainId].name}
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-sm mb-4">
                    <p className="font-medium">Your {tokenSymbol} balance:</p>
                      {balances?.map((balance, index) => (
                      <div key={index} className="flex justify-between gap-2 mt-1">
                        <span>{JB_CHAINS[balance.chainId as JBChainId].name}</span>
                          <span className="font-medium">
                          {balance.balance?.format(6)} {tokenSymbol}
                          </span>
                        </div>
                      ))}
                    <hr className="my-2" />
                    <div className="flex justify-between gap-2">
                      <span>[All chains]</span>
                      <span className="font-medium">
                        {new JBProjectToken(
                          balances?.reduce((acc, curr) => acc + curr.balance.value, 0n) ?? 0n
                        ).format(6)} {tokenSymbol}
                      </span>
                    </div>
                  </div>

                  {poolState.exists ? (
                    <div className="text-sm space-y-4">
                      {!poolState.hasInitialPrice && (
                        <div className="mt-2">
                          <p className="text-gray-600">Pool needs initial price</p>
                          {initialPrice && (
                            <p className="text-gray-600 mt-1">
                              Initial price will be {(1 / initialPrice).toFixed(6)} {tokenSymbol} per {tokens?.nativeToken.symbol}
                            </p>
                          )}
                          <ButtonWithWallet
                            targetChainId={Number(sellChainId) as JBChainId}
                            onClick={initializePool}
                            disabled={isLoading || !initialPrice}
                            className="mt-2"
                          >
                            {isLoading ? "Initializing..." : "Initialize Pool Price"}
                          </ButtonWithWallet>
                        </div>
                      )}

                      {poolState.hasInitialPrice && !poolState.hasLiquidity && (
                        <AddLiquidity
                          poolAddress={poolState.address!}
                          projectToken={tokens!.projectToken}
                          nativeToken={tokens!.nativeToken}
                          disabled={isLoading}
                        />
                      )}

                      {poolState.hasInitialPrice && poolState.hasLiquidity && (
                        <div className="mt-3">
                          <AddLiquidity
                            poolAddress={poolState.address!}
                            projectToken={tokens!.projectToken}
                            nativeToken={tokens!.nativeToken}
                            disabled={isLoading}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm">
                      <p className="text-gray-600">No pool exists for this token pair</p>
                      <ButtonWithWallet
                        targetChainId={Number(sellChainId) as JBChainId}
                        onClick={createPool}
                        disabled={isLoading}
                        className="mt-2"
                      >
                        {isLoading ? "Creating..." : "Create Pool"}
                      </ButtonWithWallet>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>




      </DialogContent>
    </Dialog>
  );
}