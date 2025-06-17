import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Token } from "@uniswap/sdk-core";
import { Address, parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { POSITION_MANAGER_ADDRESSES } from "@/constants";
import { PositionsList } from "./PositionsList";

// Minimal ABI for Uniswap V3 Position Manager
const POSITION_MANAGER_ABI = [
  {
    inputs: [
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'amount0Desired', type: 'uint256' },
      { name: 'amount1Desired', type: 'uint256' },
      { name: 'amount0Min', type: 'uint256' },
      { name: 'amount1Min', type: 'uint256' },
      { name: 'recipient', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    name: 'mint',
    outputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

interface AddLiquidityProps {
  poolAddress: Address;
  projectToken: Token;
  nativeToken: Token;
  disabled?: boolean;
}

export function AddLiquidity({
  poolAddress,
  projectToken,
  nativeToken,
  disabled,
}: AddLiquidityProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [nativeAmount, setNativeAmount] = useState<string>("");
  const [projectAmount, setProjectAmount] = useState<string>("");
  const [isSingleSided, setIsSingleSided] = useState(true);
  const { toast } = useToast();

  const addLiquidity = async () => {
    if (!address || !walletClient || !publicClient) return;
    if (isSingleSided && !projectAmount) return;
    if (!isSingleSided && (!nativeAmount || !projectAmount)) return;

    try {
      setIsLoading(true);

      // Convert amounts to wei
      const projectAmountWei = parseEther(projectAmount);

      // Get position manager address for the current chain
      const positionManagerAddress = POSITION_MANAGER_ADDRESSES[projectToken.chainId];
      if (!positionManagerAddress) {
        throw new Error("Uniswap V3 Position Manager not found for this chain");
      }

      // For single-sided liquidity, we'll use a very narrow range around the current price
      const tickLower = -100; // ~0.99x current price
      const tickUpper = 100;  // ~1.01x current price

      // Add liquidity through the position manager
      const mintHash = await walletClient.writeContract({
        address: positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: 'mint',
        args: [
          projectToken.address as Address,
          nativeToken.address as Address,
          3000, // 0.3% fee tier
          tickLower,
          tickUpper,
          projectAmountWei,
          0n,
          0n,
          0n,
          address,
          BigInt(Math.floor(Date.now() / 1000) + 60 * 20) // 20 minutes
        ],
        account: address
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: mintHash });
      console.log('Liquidity added:', receipt);

      toast({
        title: "Success",
        description: "Liquidity has been added to the pool."
      });

      // Reset form
      setProjectAmount("");
      setNativeAmount("");
    } catch (error) {
      console.error('Error adding liquidity:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add liquidity"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-zinc-50">
      <h3 className="text-lg font-medium mb-4">Add Liquidity</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="singleSided"
            checked={isSingleSided}
            onChange={(e) => setIsSingleSided(e.target.checked)}
            className="rounded border-zinc-300"
          />
          <label htmlFor="singleSided" className="text-sm">
            Single-sided liquidity
          </label>
        </div>

        {!isSingleSided && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Amount ({nativeToken.symbol})
            </label>
            <input
              type="number"
              value={nativeAmount}
              onChange={(e) => setNativeAmount(e.target.value)}
              placeholder={`Enter ${nativeToken.symbol} amount`}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Amount ({projectToken.symbol})
          </label>
          <input
            type="number"
            value={projectAmount}
            onChange={(e) => setProjectAmount(e.target.value)}
            placeholder={`Enter ${projectToken.symbol} amount`}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
        </div>

        <ButtonWithWallet
          onClick={addLiquidity}
          disabled={isLoading || (isSingleSided ? !projectAmount : (!nativeAmount || !projectAmount)) || disabled}
          className="w-full"
        >
          {isLoading ? 'Adding Liquidity...' : 'Add Liquidity'}
        </ButtonWithWallet>

        <PositionsList projectToken={projectToken} nativeToken={nativeToken} />
      </div>
    </div>
  );
} 