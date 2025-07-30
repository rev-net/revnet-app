import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatUnits, JB_CHAINS, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { JBChainId } from "juice-sdk-react";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { useAvailableCurrencies } from "@/hooks/useAvailableCurrencies";
import { useAggregatedBalance } from "@/hooks/useAggregatedBalance";
import { Loader2 } from 'lucide-react';
import { USDC_ADDRESSES } from "@/app/constants";

export function TvlDatum() {
  // Get current project and sucker group ID
  const { suckerGroupId, isLoading: projectLoading } = useCurrentProject();

  // Get all available currencies and their balances
  const {
    tokenMap,
    surpluses,
    isLoading: currenciesLoading,
    isAllUsdc,
    isAllEth,
    targetCurrency,
    targetDecimals,
  } = useAvailableCurrencies(suckerGroupId);

  // Calculate aggregated balance
  const { formattedUsd, convertedSurpluses } = useAggregatedBalance(
    tokenMap,
    surpluses,
    isAllUsdc,
    isAllEth,
    targetDecimals
  );

  const loading = projectLoading || currenciesLoading;

  if (loading) return <Loader2 className="animate-spin" size={16} />;

  // Show error state
  if (projectLoading || currenciesLoading) {
    return <span className="text-red-500">Error Loading Surplus</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        {typeof formattedUsd !== "undefined" ? (
          <span className="sm:text-xl text-lg">
            <span className="font-medium text-black-500">${formattedUsd}</span>{" "}
            <span className="text-zinc-500">balance</span>
          </span>
        ) : null}
      </TooltipTrigger>
      <TooltipContent className="w-64">
        {convertedSurpluses?.map((surplus, index) => {
          const tokenConfig = tokenMap?.[surplus.chainId];
          const decimals = tokenConfig?.decimals || NATIVE_TOKEN_DECIMALS;
          const token = tokenConfig?.token;
          const currency = tokenConfig?.currency;
          
          // Detect USDC by token address using the constants
          const isUsdc = token && Object.values(USDC_ADDRESSES).map(addr => addr.toLowerCase()).includes(token.toLowerCase() as `0x${string}`);
          
          // Get token name based on currency ID
          const getTokenName = (currencyId: number) => {
            if (isUsdc) return "USD"; // Use USD for consistency with targetCurrency
            if (currencyId === 1 || currencyId === 61166) return "ETH"; // ETH currency ID (handle both old and new)
            return "USD"; // For encoded currency IDs, assume USD if not ETH
          };
          
          // Format the amount with better precision control
          const formatAmount = (amount: bigint, decimals: number) => {
            const formatted = formatUnits(amount, decimals);
            const num = Number(formatted);
            
            // For USDC, show 2 decimal places
            if (isUsdc) {
              return num.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
            }
            
            // For ETH, show up to 4 decimal places but trim trailing zeros
            if (currency === 1 || currency === 61166) {
              return num.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4,
              });
            }
            
            // For other tokens, show up to 2 decimal places
            return num.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            });
          };
          
          return (
            <div key={index} className="flex justify-between gap-2">
              {JB_CHAINS[surplus.chainId].name}
              <span className="font-medium">
                {surplus.surplus ? formatAmount(surplus.surplus, decimals) : "0"}{" "}
                {getTokenName(currency || 0)}
              </span>
            </div>
          );
        })}
        <hr className="py-1" />
        <div className="flex justify-between gap-2">
          <span>[All chains]</span>
          <span className="font-medium">
            {convertedSurpluses?.reduce((acc, curr) => acc + BigInt(curr.convertedSurplus || 0), 0n) ? (() => {
              const totalAmount = convertedSurpluses?.reduce((acc, curr) => acc + BigInt(curr.convertedSurplus || 0), 0n) ?? 0n;
              const formatted = formatUnits(totalAmount, targetDecimals);
              const num = Number(formatted);
              
              if (isAllUsdc) {
                return num.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
              }
              
              if (isAllEth) {
                return num.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 4,
                });
              }
              
              return num.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              });
            })() : "0"}{" "}
            {targetCurrency}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
