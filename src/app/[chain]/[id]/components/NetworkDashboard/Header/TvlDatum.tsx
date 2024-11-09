import { chainNames } from "@/app/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEtherPrice } from "@/hooks/useEtherPrice";
import { formatUnits, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { JBChainId, useSuckersNativeTokenSurplus } from "juice-sdk-react";

export function TvlDatum() {
  const surplusQuery = useSuckersNativeTokenSurplus();
  const { data: ethPrice } = useEtherPrice();
  const surpluses = surplusQuery?.data as {
    surplus: bigint;
    chainId: JBChainId;
  }[];
  const totalEth = surpluses?.reduce((acc, curr) => {
    return acc + curr.surplus;
  }, 0n);

  const usd = (
    (ethPrice ?? 0) * (totalEth ? Number(formatUnits(totalEth, 18)) : 0)
  ).toFixed(2);

  return (
    <Tooltip>
      <TooltipTrigger>
        {typeof usd !== "undefined" ? (
          <span className="text-sm">
            <span className="font-medium text-zinc-500">${usd}</span>{" "}
            <span className="text-zinc-500">TVL</span>
          </span>
        ) : null}
      </TooltipTrigger>
      <TooltipContent className="w-64">
        {surpluses?.map((surplus, index) => (
          <div key={index} className="flex justify-between gap-2">
            {chainNames[surplus.chainId]}
            {/* TODO maybe show USD-converted value here instead? */}
            <span className="font-medium">
              {formatUnits(surplus.surplus, NATIVE_TOKEN_DECIMALS, {
                fractionDigits: 4,
              })}{" "}
              ETH
            </span>
          </div>
        ))}
        <hr className="py-1" />
        <div className="flex justify-between gap-2">
          <span>[All chains]</span>
          <span className="font-medium">
            {formatUnits(totalEth, NATIVE_TOKEN_DECIMALS, {
              fractionDigits: 4,
            })}{" "}
            ETH
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
