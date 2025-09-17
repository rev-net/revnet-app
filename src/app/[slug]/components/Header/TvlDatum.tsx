import { USDC_ADDRESSES } from "@/app/constants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { useSuckersTokenSurplus } from "@/hooks/useSuckersTokenSurplus";
import { formatUnits, JB_CHAINS, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { JBChainId, useEtherPrice, useJBChainId, useJBContractContext } from "juice-sdk-react";
import { Loader2 } from "lucide-react";

export function TvlDatum() {
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();

  // Get the suckerGroupId from the current project
  const { data: projectData, isLoading: projectLoading } = useBendystrawQuery(
    ProjectDocument,
    {
      chainId: Number(chainId),
      projectId: Number(projectId),
      version,
    },
    {
      enabled: !!chainId && !!projectId,
      pollInterval: 10000, // Poll every 10 seconds
    },
  );
  const suckerGroupId = projectData?.project?.suckerGroupId;

  // Get all projects in the sucker group with their token data
  const { data: suckerGroupData, isLoading: suckerGroupLoading } = useBendystrawQuery(
    SuckerGroupDocument,
    {
      id: suckerGroupId ?? "",
    },
    {
      enabled: !!suckerGroupId,
      pollInterval: 10000, // Poll every 10 seconds
    },
  );

  // Transform into the format expected by useSuckersTokenSurplus
  const tokenMap = suckerGroupData?.suckerGroup?.projects?.items?.reduce(
    (acc, project) => {
      if (project.token) {
        acc[Number(project.chainId) as JBChainId] = {
          token: project.token as `0x${string}`,
          currency: Number(project.currency),
          decimals: project.decimals || NATIVE_TOKEN_DECIMALS,
        };
      }
      return acc;
    },
    {} as Record<JBChainId, { token: `0x${string}`; currency: number; decimals: number }>,
  );

  // Only call useSuckersTokenSurplus when we have the tokenMap and it's not empty
  const surplusQuery = useSuckersTokenSurplus(
    tokenMap ||
      ({} as Record<JBChainId, { token: `0x${string}`; currency: number; decimals: number }>),
  );

  const { data: ethPrice } = useEtherPrice();

  // Show loading if any of the queries are loading
  const loading = projectLoading || suckerGroupLoading || surplusQuery.isLoading;

  const surpluses = surplusQuery?.data as
    | {
        surplus: bigint;
        chainId: JBChainId;
      }[]
    | undefined;

  // Check if all chains use the same token type
  const allTokens = surpluses
    ?.map((surplus) => {
      const tokenConfig = tokenMap?.[surplus.chainId];
      return tokenConfig?.token;
    })
    .filter(Boolean);

  // Check if all tokens are USDC addresses (case-insensitive)
  const isAllUsdc =
    allTokens &&
    allTokens.length > 0 &&
    allTokens.every((token) => {
      const tokenLower = token?.toLowerCase() as `0x${string}`;
      const usdcAddressesLower = Object.values(USDC_ADDRESSES).map((addr) => addr.toLowerCase());
      return usdcAddressesLower.includes(tokenLower);
    });

  // Alternative check: if all tokens are USDC addresses, treat as USD
  const allTokensAreUsdc =
    allTokens &&
    allTokens.length > 0 &&
    allTokens.every((token) => {
      const tokenLower = token?.toLowerCase() as `0x${string}`;
      const usdcAddressesLower = Object.values(USDC_ADDRESSES).map((addr) => addr.toLowerCase());
      return usdcAddressesLower.includes(tokenLower);
    });

  const isAllEth = surpluses?.every((surplus) => {
    const tokenConfig = tokenMap?.[surplus.chainId];
    return tokenConfig?.currency === 1 || tokenConfig?.currency === 61166; // ETH currency ID (handle both old and new)
  });

  // Determine target currency and decimals
  const targetDecimals = isAllUsdc || allTokensAreUsdc ? 6 : NATIVE_TOKEN_DECIMALS; // USDC or ETH decimals
  const targetCurrency = isAllUsdc || allTokensAreUsdc ? "USD" : isAllEth ? "ETH" : "TOKEN";

  const convertedSurpluses = surpluses?.map((surplus) => {
    const tokenConfig = tokenMap?.[surplus.chainId];
    if (!tokenConfig || !surplus.surplus) return { ...surplus, convertedSurplus: 0n };

    // If all chains use the same token type, we can aggregate directly
    if (isAllUsdc || isAllEth) {
      return { ...surplus, convertedSurplus: surplus.surplus };
    } else {
      // For mixed tokens, we'd need price conversion
      // TODO: Add proper currency conversion using price oracles
      return { ...surplus, convertedSurplus: surplus.surplus };
    }
  });

  const totalAmount =
    convertedSurpluses?.reduce((acc, curr) => {
      return acc + BigInt(curr.convertedSurplus || 0);
    }, 0n) ?? 0n;

  // Convert to USD: USDC is already USD, ETH needs price conversion
  const usdValue = isAllUsdc
    ? totalAmount
      ? Number(formatUnits(totalAmount, targetDecimals))
      : 0
    : totalAmount && ethPrice
      ? Number(formatUnits(totalAmount, targetDecimals)) * ethPrice
      : 0;

  const usd = usdValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (loading) return <Loader2 className="animate-spin" size={16} />;

  // Show error state
  if (surplusQuery.isError) {
    return <span className="text-red-500">Error Loading Surplus</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        {typeof usd !== "undefined" ? (
          <span className="sm:text-xl text-lg">
            <span className="font-medium text-black-500">${usd}</span>{" "}
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
          const isUsdc =
            token &&
            Object.values(USDC_ADDRESSES)
              .map((addr) => addr.toLowerCase())
              .includes(token.toLowerCase() as `0x${string}`);

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
            {totalAmount
              ? (() => {
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
                })()
              : "0"}{" "}
            {targetCurrency}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
