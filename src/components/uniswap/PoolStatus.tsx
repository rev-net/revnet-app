import { Button } from "@/components/ui/button";
import { PoolState } from "@/lib/uniswap";
import { getUniswapPoolUrl } from "@/lib/uniswap";
import { ExternalLink } from "@/components/ExternalLink";

interface PoolStatusProps {
  poolState: PoolState;
  chainId: number;
  onCreatePool: () => void;
  onInitializePool: () => void;
  isLoading?: boolean;
  className?: string;
}

export function PoolStatus({
  poolState,
  chainId,
  onCreatePool,
  onInitializePool,
  isLoading = false,
  className = ""
}: PoolStatusProps) {
  const uniswapUrl = poolState.address ? getUniswapPoolUrl(chainId, poolState.address) : null;

  if (!poolState.exists) {
    return (
      <div className={`p-4 border rounded-lg bg-amber-50 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-amber-800">Pool Not Created</h3>
            <p className="text-sm text-amber-600 mt-1">
              Create a Uniswap V3 pool to enable trading
            </p>
          </div>
          <Button
            onClick={onCreatePool}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? "Creating..." : "Create Pool"}
          </Button>
        </div>
      </div>
    );
  }

  if (!poolState.hasInitialPrice) {
    return (
      <div className={`p-4 border rounded-lg bg-blue-50 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-800">Pool Created</h3>
            <p className="text-sm text-blue-600 mt-1">
              Pool exists but needs initial price set
            </p>
          </div>
          <Button
            onClick={onInitializePool}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? "Initializing..." : "Initialize Pool Price"}
          </Button>
        </div>
      </div>
    );
  }

  // Pool is fully ready
  return null;
}
