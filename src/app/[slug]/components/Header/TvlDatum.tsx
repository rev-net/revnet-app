"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Project } from "@/generated/graphql";
import { isUsd } from "@/lib/currency";
import { formatTokenAmount, getTokenFractionDigits, isNativeToken } from "@/lib/token";
import { DEFAULT_NATIVE_TOKEN_SYMBOL, JB_CHAINS, JBChainId } from "juice-sdk-core";
import { useEtherPrice } from "juice-sdk-react";
import { useMemo } from "react";
import { formatUnits } from "viem";

interface Props {
  projects: Array<
    Pick<Project, "chainId" | "projectId" | "token" | "decimals" | "balance" | "tokenSymbol">
  >;
}

export function TvlDatum(props: Props) {
  const { projects } = props;

  const { data: ethPrice } = useEtherPrice();

  const token = useMemo(() => {
    return {
      address: projects[0].token as `0x${string}`,
      symbol: projects[0].tokenSymbol || DEFAULT_NATIVE_TOKEN_SYMBOL,
      decimals: projects[0].decimals || 18,
      isNative: isNativeToken(projects[0].token),
    };
  }, [projects]);

  const total = useMemo(() => {
    const value = projects.reduce((acc, project) => acc + BigInt(project.balance), 0n);
    if (token.symbol === "ETH" && ethPrice) {
      const usdValue = Number(formatUnits(value, token.decimals)) * ethPrice;
      return `$${usdValue.toLocaleString("en-US", getTokenFractionDigits("USD"))}`;
    }
    if (isUsd(token.symbol)) {
      return `$${formatTokenAmount(value, token)}`;
    }
    return `${formatTokenAmount(value, token)} ${token.symbol}`;
  }, [projects, ethPrice, token]);

  return (
    <Tooltip>
      <TooltipTrigger>
        <span className="sm:text-xl text-lg">
          <span className="font-medium text-black">{total}</span>{" "}
          <span className="text-zinc-500">balance</span>
        </span>
      </TooltipTrigger>
      <TooltipContent className="w-64">
        {projects.map((project) => {
          const symbol = project.tokenSymbol || DEFAULT_NATIVE_TOKEN_SYMBOL;
          return (
            <div key={project.chainId} className="flex justify-between gap-2">
              {JB_CHAINS[project.chainId as JBChainId].name}
              <span className="font-medium">
                {formatTokenAmount(project.balance, { symbol, decimals: project.decimals || 18 })}{" "}
                {symbol}
              </span>
            </div>
          );
        })}
        <hr className="py-1" />
        <div className="flex justify-between gap-2">
          <span>[All chains]</span>
          <span className="font-medium">{total}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
