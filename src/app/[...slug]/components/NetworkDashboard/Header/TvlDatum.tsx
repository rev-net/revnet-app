import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useJBChainId, useEtherPrice } from "juice-sdk-react";
import { formatUnits, JB_CHAINS, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { JBChainId } from "juice-sdk-react";
import { useSuckersTokenSurplus } from "@/hooks/useSuckersTokenSurplus";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";
import { useJBContractContext } from "juice-sdk-react";
import { Loader2 } from 'lucide-react';
import { USDC_ADDRESSES } from "@/app/constants";

export function TvlDatum() {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();

  // Get the suckerGroupId from the current project
  const { data: projectData } = useBendystrawQuery(ProjectDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
  });
  const suckerGroupId = projectData?.project?.suckerGroupId;

  // Get all projects in the sucker group with their token data
  const { data: suckerGroupData } = useBendystrawQuery(SuckerGroupDocument, {
    id: suckerGroupId ?? "",
  }, {
    enabled: !!suckerGroupId
  });
  // Transform into the format expected by useSuckersTokenSurplus
  const tokenMap = suckerGroupData?.suckerGroup?.projects?.items?.reduce((acc, project) => {
    if (project.token) {
      acc[Number(project.chainId) as JBChainId] = {
        token: project.token as `0x${string}`,
        currency: Number(project.currency),
        decimals: project.decimals || NATIVE_TOKEN_DECIMALS
      };
    }
    return acc;
  }, {} as Record<JBChainId, { token: `0x${string}`; currency: number; decimals: number }>);
  // call bendy straw for accounting context and feed that into the useSuckerTokenSurplus(_)
  const surplusQuery = useSuckersTokenSurplus(
    tokenMap || {} as Record<JBChainId, { token: `0x${string}`; currency: number; decimals: number }>
  );
  if (surplusQuery.isError) {
    console.error("surplusQuery failed - check network/contract access");
  }
  const { data: ethPrice } = useEtherPrice();
  const loading = surplusQuery.isLoading;
  const surpluses = surplusQuery?.data as
    | {
        surplus: bigint;
        chainId: JBChainId;
      }[]
    | undefined;
  // Check if all chains use the same token type
  const allTokens = surpluses?.map(surplus => {
    const tokenConfig = tokenMap?.[surplus.chainId];
    return tokenConfig?.token;
  }).filter(Boolean);
  
  const isAllUsdc = allTokens && allTokens.length > 0 && 
    allTokens.every(token => token && Object.values(USDC_ADDRESSES).includes(token));
  
  const isAllEth = surpluses?.every(surplus => {
    const tokenConfig = tokenMap?.[surplus.chainId];
    return tokenConfig?.currency === 61166; // ETH currency ID
  });
  
  // Determine target currency and decimals
  const targetDecimals = isAllUsdc ? 6 : NATIVE_TOKEN_DECIMALS; // USDC or ETH decimals
  const targetCurrency = isAllUsdc ? "USDC" : isAllEth ? "ETH" : "TOKEN";
  
  const convertedSurpluses = surpluses?.map(surplus => {
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

  const totalAmount = convertedSurpluses?.reduce((acc, curr) => {
    return acc + BigInt(curr.convertedSurplus || 0);
  }, 0n) ?? 0n;

  // Convert to USD: USDC is already USD, ETH needs price conversion
  const usdValue = isAllUsdc 
    ? (totalAmount ? Number(formatUnits(totalAmount, targetDecimals)) : 0)
    : (totalAmount && ethPrice ? Number(formatUnits(totalAmount, targetDecimals)) * ethPrice : 0);
    
  const usd = usdValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (loading) return <Loader2 className="animate-spin" size={16} />;

  if (surplusQuery.isError) return <span>Error Loading Surplus</span>

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
          const isUsdc = token && Object.values(USDC_ADDRESSES).includes(token);
          
          // Get token name based on currency ID
          const getTokenName = (currencyId: number) => {
            if (isUsdc) return "USDC";
            if (currencyId === 61166) return "ETH"; // ETH currency ID
            return "OTHER TOKEN"; // fallback
          };
          
          return (
            <div key={index} className="flex justify-between gap-2">
              {JB_CHAINS[surplus.chainId].name}
              <span className="font-medium">
                {surplus.surplus ? formatUnits(surplus.surplus, decimals, {
                  fractionDigits: 4,
                }) : "0"}{" "}
                {getTokenName(currency || 0)}
              </span>
            </div>
          );
        })}
        <hr className="py-1" />
        <div className="flex justify-between gap-2">
          <span>[All chains]</span>
          <span className="font-medium">
            {formatUnits(totalAmount, targetDecimals, {
              fractionDigits: 4,
            })}{" "}
            {targetCurrency}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
