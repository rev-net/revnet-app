"use client";

import { ChainLogo } from "@/components/ChainLogo";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Project } from "@/generated/graphql";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { isUsd } from "@/lib/currency";
import { prettyNumber } from "@/lib/number";
import { getUnitValue, Surplus } from "@/lib/reclaimableSurplus";
import { formatPortion, formatTokenSymbol } from "@/lib/utils";
import { formatUnits, JB_CHAINS, JBChainId } from "juice-sdk-core";
import { useEtherPrice, useJBTokenContext, useSuckersUserTokenBalance } from "juice-sdk-react";
import { use, useCallback } from "react";

interface Props {
  projects: Array<
    Pick<Project, "projectId" | "token" | "chainId" | "tokenSupply" | "decimals" | "balance">
  >;
  surplusesPromise: Promise<Surplus[]>;
  totalSupply: string;
}

export function BalanceTable(props: Props) {
  const { projects, surplusesPromise, totalSupply } = props;
  const surpluses = use(surplusesPromise);
  const baseToken = useProjectBaseToken();
  const { token } = useJBTokenContext();
  const { data: userBalances } = useSuckersUserTokenBalance();
  const { data: ethPrice } = useEtherPrice();

  const tokenSymbol = formatTokenSymbol(token.data?.symbol);
  const tokenDecimals = token.data?.decimals || 18;

  const getUsdValue = useCallback(
    (value: number) => {
      if (isUsd(baseToken.targetCurrency)) return value;
      if (!ethPrice) return 0;
      return value * ethPrice;
    },
    [ethPrice, baseToken],
  );

  const totalBalance = projects.reduce((acc, project) => acc + BigInt(project.balance || 0), 0n);
  const totalSurplus = surpluses.reduce((acc, surplus) => acc + BigInt(surplus.value), 0n);
  const avgUnitValue = getUnitValue(
    { value: totalSurplus.toString(), decimals: baseToken.decimals || 18 },
    { value: totalSupply, decimals: tokenDecimals },
  );

  const totalUserBalance =
    userBalances?.reduce((acc, balance) => acc + balance.balance.value, 0n) ?? 0n;

  let totalUserValue = 0;

  return (
    <div>
      <p className="text-pretty">
        {tokenSymbol} is issued across many blockchains. When {tokenSymbol} is moved between chains,
        a proportional amount of the revnet's funds moves too, which rebalances each token's cash
        out value.
      </p>
      <Table className="bg-zinc-50 border-zinc-200 border mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Chain</TableHead>
            <TableHead className="">Current supply</TableHead>
            <TableHead className="">Current balance</TableHead>
            <TableHead className="">Unit value</TableHead>
            <TableHead className="">Your supply</TableHead>
            <TableHead className="">Your current value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const { balance, tokenSupply, chainId } = project;

            const surplus = surpluses.find((s) => s.chainId === chainId) || null;

            const unitValue = getUnitValue(surplus, {
              value: tokenSupply,
              decimals: tokenDecimals,
            });
            const userBalance = userBalances?.find((b) => b.chainId === chainId)?.balance;
            const userValue = (userBalance?.toFloat() || 0) * unitValue;

            totalUserValue += userValue;

            return (
              <TableRow key={chainId}>
                <TableCell className="flex items-center gap-2">
                  <ChainLogo chainId={chainId as JBChainId} width={15} height={15} />
                  <span>{JB_CHAINS[chainId as JBChainId]?.name ?? chainId}</span>
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  <Tooltip>
                    <TooltipTrigger>
                      {formatPortion(BigInt(tokenSupply), BigInt(totalSupply))}%
                    </TooltipTrigger>
                    <TooltipContent>
                      {prettyNumber(formatUnits(tokenSupply, tokenDecimals, { fractionDigits: 4 }))}{" "}
                      {tokenSymbol}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  <Tooltip>
                    <TooltipTrigger>{formatPortion(BigInt(balance), totalBalance)}%</TooltipTrigger>
                    <TooltipContent>
                      {formatUnits(balance, project.decimals || 18, { fractionDigits: 4 })}{" "}
                      {baseToken.symbol}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                <TableCell className="whitespace-nowrap tabular-nums text-right">
                  <Tooltip>
                    <TooltipTrigger>
                      {unitValue.toFixed(6)} {baseToken.symbol} / {tokenSymbol}
                    </TooltipTrigger>
                    <TooltipContent>
                      {formatUsdValue(getUsdValue(unitValue))} / {tokenSymbol}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  {userBalance?.format(2) || 0} {tokenSymbol}
                </TableCell>

                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  <Tooltip>
                    <TooltipTrigger>
                      {userValue.toFixed(5)} {baseToken.symbol}
                    </TooltipTrigger>
                    <TooltipContent>{formatUsdValue(getUsdValue(userValue))}</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total revnet</TableCell>

            <TableCell className="whitespace-nowrap">
              {prettyNumber(formatUnits(BigInt(totalSupply), tokenDecimals, { fractionDigits: 4 }))}{" "}
              {tokenSymbol}
            </TableCell>

            <TableCell className="whitespace-nowrap">
              {formatUnits(totalBalance, baseToken.decimals || 18, { fractionDigits: 4 })}{" "}
              {baseToken.symbol}
            </TableCell>

            <TableCell className="whitespace-nowrap tabular-nums text-right">
              <Tooltip>
                <TooltipTrigger>
                  {avgUnitValue.toFixed(6)} {baseToken.symbol} / {tokenSymbol}
                </TooltipTrigger>
                <TooltipContent>
                  {formatUsdValue(getUsdValue(avgUnitValue))} / {tokenSymbol}
                </TooltipContent>
              </Tooltip>
            </TableCell>

            <TableCell className="whitespace-nowrap text-right tabular-nums">
              {formatUnits(totalUserBalance, tokenDecimals, { fractionDigits: 2 })} {tokenSymbol}
            </TableCell>

            <TableCell className="whitespace-nowrap text-right tabular-nums">
              <Tooltip>
                <TooltipTrigger>
                  {totalUserValue.toFixed(5)} {baseToken.symbol}
                </TooltipTrigger>
                <TooltipContent>{formatUsdValue(getUsdValue(totalUserValue))}</TooltipContent>
              </Tooltip>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

function formatUsdValue(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}
