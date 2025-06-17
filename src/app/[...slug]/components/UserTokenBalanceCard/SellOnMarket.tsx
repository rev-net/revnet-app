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
} from "juice-sdk-react";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Token } from "@uniswap/sdk-core";
import { Pool, FeeAmount } from "@uniswap/v3-sdk";
import { UNISWAP_V3_FACTORY_ADDRESSES, WETH_ADDRESSES } from "@/constants";
import { CHAIN_IDS } from "@/constants";
import { parseEther } from "viem";
import { FixedInt } from "fpnum";
import { AddLiquidity } from "./AddLiquidity";

// Define minimal ABIs for the functions we need
const FACTORY_ABI = [
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'fee', type: 'uint24' }
    ],
    name: 'getPool',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'fee', type: 'uint24' }
    ],
    name: 'createPool',
    outputs: [{ name: 'pool', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

const POOL_ABI = [
  {
    inputs: [],
    name: 'slot0',
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'observationIndex', type: 'uint16' },
      { name: 'observationCardinality', type: 'uint16' },
      { name: 'observationCardinalityNext', type: 'uint16' },
      { name: 'feeProtocol', type: 'uint8' },
      { name: 'unlocked', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'liquidity',
    outputs: [{ name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'sqrtPriceX96', type: 'uint160' }
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
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
  primaryTerminalEth,
  disabled,
  children,
}: PropsWithChildren<{
  tokenSymbol: string;
  primaryTerminalEth: Address;
  disabled?: boolean;
}>) {
  const { address } = useAccount();
  const { data: balances } = useSuckersUserTokenBalance();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
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
    if (!sellChainId) return null;

    // Use WETH address for Base Sepolia
    const nativeTokenAddress = Number(sellChainId) === CHAIN_IDS.BASE_SEPOLIA 
      ? WETH_ADDRESSES[CHAIN_IDS.BASE_SEPOLIA]
      : NATIVE_TOKEN as `0x${string}`;

    return {
      projectToken: new Token(
        Number(sellChainId),
        primaryTerminalEth as `0x${string}`,
        18,
        tokenSymbol,
        tokenSymbol
      ),
      nativeToken: new Token(
        Number(sellChainId),
        nativeTokenAddress,
        18,
        "ETH",
        "Ethereum"
      )
    };
  }, [sellChainId, primaryTerminalEth, tokenSymbol]);

  // Calculate initial price when ruleset data is available
  useEffect(() => {
    if (!ruleset?.data || !rulesetMetadata?.data || !tokens) return;

    try {
      // Calculate initial price using Juicebox SDK
      const oneEth = new FixedInt(parseEther("1"), tokens.nativeToken.decimals);
      const amountAQuote = getTokenBtoAQuote(
        oneEth,
        tokens.projectToken.decimals,
        {
          weight: ruleset.data.weight,
          reservedPercent: rulesetMetadata.data.reservedPercent,
        }
      );

      // Convert the quote to a price ratio (tokens per ETH)
      const tokensPerEth = Number(amountAQuote.format());
      console.log('Tokens per ETH from Juicebox TODO FIX:', tokensPerEth);

      // Calculate price in ETH per token (inverse of tokens per ETH)
      const price = 1 / tokensPerEth;
      console.log('Initial price (ETH per token):', price);
      setInitialPrice(price);
    } catch (error) {
      console.error('Error calculating initial price:', error);
      setInitialPrice(null);
    }
  }, [ruleset?.data, rulesetMetadata?.data, tokens]);

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
        if (!code || code === '0x') {
          console.error('No contract code found at factory address:', factoryAddress);
          setPoolState({
            exists: false,
            hasInitialPrice: false,
            hasLiquidity: false,
            address: null,
          });
          return;
        }

        console.log('Contract exists at:', factoryAddress);
        console.log('Checking pool with params:', {
          factoryAddress,
          tokenA: tokens.projectToken.address,
          tokenB: tokens.nativeToken.address,
          fee: FeeAmount.MEDIUM
        });
        console.log('Project Token:', {
          address: tokens.projectToken.address,
          symbol: tokens.projectToken.symbol,
          chainId: tokens.projectToken.chainId
        });
        console.log('Native Token:', {
          address: tokens.nativeToken.address,
          symbol: tokens.nativeToken.symbol,
          chainId: tokens.nativeToken.chainId
        });

        // First check if the pool exists using the factory
        const poolAddress = await publicClient.readContract({
          address: factoryAddress,
          abi: FACTORY_ABI,
          functionName: 'getPool',
          args: [
            tokens.projectToken.address as `0x${string}`,
            tokens.nativeToken.address as `0x${string}`,
            FeeAmount.MEDIUM
          ],
        }) as `0x${string}`;

        console.log('Pool address returned:', poolAddress);

        if (poolAddress === '0x0000000000000000000000000000000000000000') {
          console.log('No pool exists for this token pair');
          setPoolState({
            exists: false,
            hasInitialPrice: false,
            hasLiquidity: false,
            address: null,
          });
          return;
        }

        console.log('Pool exists at:', poolAddress);

        // If pool exists, check its state
        const [slot0, liquidity] = await Promise.all([
          publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: 'slot0',
          }),
          publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: 'liquidity',
          }),
        ]);

        // slot0 returns [sqrtPriceX96, tick, observationIndex, observationCardinality, observationCardinalityNext, feeProtocol, unlocked]
        const sqrtPriceX96 = (slot0 as readonly [bigint, number, number, number, number, number, boolean])[0];
        const hasInitialPrice = sqrtPriceX96 > 0n;
        const hasLiquidity = liquidity > 0n;

        setPoolState({
          exists: true,
          hasInitialPrice,
          hasLiquidity,
          address: poolAddress,
        });
      } catch (error) {
        console.error('Error checking pool:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error details:', {
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
        functionName: 'createPool',
        args: [
          tokens.projectToken.address as `0x${string}`,
          tokens.nativeToken.address as `0x${string}`,
          FeeAmount.MEDIUM
        ],
        account: address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Pool created:', receipt);

      // Get the new pool address using SDK
      const newPoolAddress = Pool.getAddress(
        tokens.projectToken,
        tokens.nativeToken,
        FeeAmount.MEDIUM
      );

      setPoolState({
        exists: true,
        hasInitialPrice: false,
        hasLiquidity: false,
        address: newPoolAddress as Address,
      });
      console.log('New pool created at:', newPoolAddress);
    } catch (error) {
      console.error('Error creating pool:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializePool = async () => {
    if (!address || !walletClient || !publicClient || !sellChainId || !tokens || !poolState.address || !initialPrice) return;

    try {
      setIsLoading(true);
      
      // Calculate sqrtPriceX96 for Uniswap V3
      const priceX96 = BigInt(Math.floor(initialPrice * 1e6)) * BigInt(2 ** 96);
      const sqrtPriceX96 = BigInt(Math.floor(Math.sqrt(Number(priceX96))));

      const hash = await walletClient.writeContract({
        address: poolState.address,
        abi: POOL_ABI,
        functionName: 'initialize',
        args: [sqrtPriceX96],
        account: address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Pool initialized:', receipt);

      // Update pool state
      setPoolState(prev => ({
        ...prev,
        hasInitialPrice: true
      }));
    } catch (error) {
      console.error('Error initializing pool:', error);
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
                      <div>
                        <p className="font-medium text-green-600">
                          Pool exists on {JB_CHAINS[Number(sellChainId) as JBChainId].name}
                        </p>
                        <p className="text-zinc-600 mt-1 break-all">
                          {poolState.address}
                        </p>
                      </div>

                      {!poolState.hasInitialPrice && (
                        <div className="mt-2">
                          <p className="text-amber-600">Pool needs initial price</p>
                          {initialPrice && (
                            <p className="text-zinc-600 mt-1">
                              Initial price will be {initialPrice} ETH per token
                            </p>
                          )}
                          <ButtonWithWallet
                            targetChainId={Number(sellChainId) as JBChainId}
                            onClick={initializePool}
                            disabled={isLoading || !initialPrice}
                            className="mt-2"
                          >
                            {isLoading ? 'Initializing...' : 'Initialize Pool Price'}
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
                    </div>
                  ) : (
                    <div className="text-sm">
                      <p className="text-amber-600">No pool exists for this token pair</p>
                      <ButtonWithWallet
                        targetChainId={Number(sellChainId) as JBChainId}
                        onClick={createPool}
                        disabled={isLoading}
                        className="mt-2"
                      >
                        {isLoading ? 'Creating...' : 'Create Pool'}
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