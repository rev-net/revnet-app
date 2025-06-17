import { useAccount, usePublicClient } from "wagmi";
import { Address, formatEther } from "viem";
import { Token } from "@uniswap/sdk-core";
import { POSITION_MANAGER_ADDRESSES } from "@/constants";
import { useEffect, useState } from "react";

// Uniswap V3 Nonfungible Position Manager ABI
const NONFUNGIBLE_POSITION_MANAGER_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'positions',
    outputs: [
      { name: 'nonce', type: 'uint96' },
      { name: 'operator', type: 'address' },
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'feeGrowthInside0LastX128', type: 'uint256' },
      { name: 'feeGrowthInside1LastX128', type: 'uint256' },
      { name: 'tokensOwed0', type: 'uint128' },
      { name: 'tokensOwed1', type: 'uint128' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' }
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

interface Position {
  tokenId: bigint;
  token0: Address;
  token1: Address;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
}

interface PositionsListProps {
  projectToken: Token;
  nativeToken: Token;
}

export function PositionsList({ projectToken, nativeToken }: PositionsListProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPositions = async () => {
      if (!address || !publicClient) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const positionManagerAddress = POSITION_MANAGER_ADDRESSES[projectToken.chainId];
        if (!positionManagerAddress) {
          throw new Error(`Position Manager not found for chain ID ${projectToken.chainId}`);
        }

        console.log('Chain ID:', projectToken.chainId);
        console.log('Using Position Manager:', positionManagerAddress);

        // Verify the contract exists and has the balanceOf function
        try {
          const code = await publicClient.getBytecode({ address: positionManagerAddress });
          if (!code || code === '0x') {
            throw new Error(`No contract found at address ${positionManagerAddress}`);
          }
        } catch (error) {
          console.error('Error verifying contract:', error);
          throw new Error(`Invalid contract at address ${positionManagerAddress}`);
        }

        // Get total number of positions
        const balance = await publicClient.readContract({
          address: positionManagerAddress,
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          functionName: 'balanceOf',
          args: [address]
        });

        console.log('Found positions:', Number(balance));

        // Fetch each position
        const positionsPromises = Array.from({ length: Number(balance) }, async (_, index) => {
          const tokenId = await publicClient.readContract({
            address: positionManagerAddress,
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [address, BigInt(index)]
          });

          const position = await publicClient.readContract({
            address: positionManagerAddress,
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: 'positions',
            args: [tokenId]
          });

          return {
            tokenId,
            token0: position[2],
            token1: position[3],
            fee: Number(position[4]),
            tickLower: Number(position[5]),
            tickUpper: Number(position[6]),
            liquidity: position[7],
            tokensOwed0: position[10],
            tokensOwed1: position[11]
          };
        });

        const allPositions = await Promise.all(positionsPromises);
        
        // Filter positions for this pool
        const poolPositions = allPositions.filter(pos => 
          (pos.token0.toLowerCase() === projectToken.address.toLowerCase() && 
           pos.token1.toLowerCase() === nativeToken.address.toLowerCase()) ||
          (pos.token0.toLowerCase() === nativeToken.address.toLowerCase() && 
           pos.token1.toLowerCase() === projectToken.address.toLowerCase())
        );

        console.log('Filtered pool positions:', poolPositions);
        setPositions(poolPositions);
      } catch (error) {
        console.error('Error fetching positions:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch positions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();
  }, [address, publicClient, projectToken, nativeToken]);

  if (isLoading) {
    return <div className="p-4">Loading positions...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (positions.length === 0) {
    return <div className="p-4 text-gray-500">No positions found in this pool.</div>;
  }

  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-lg font-medium">Your Positions</h3>
      <div className="space-y-2">
        {positions.map((position) => (
          <div key={position.tokenId.toString()} className="p-4 border rounded-lg bg-zinc-50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Position #{position.tokenId.toString()}</p>
                <p className="text-sm">
                  Liquidity: {formatEther(position.liquidity)}
                </p>
                <p className="text-sm">
                  Range: {position.tickLower} to {position.tickUpper}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  {projectToken.symbol}: {formatEther(position.tokensOwed0)}
                </p>
                <p className="text-sm">
                  {nativeToken.symbol}: {formatEther(position.tokensOwed1)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 