import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { formatEther } from "juice-sdk-core";

export function Ether({
  wei,
  decimals = 4,
}: {
  wei: bigint;
  decimals?: number;
}) {
  const symbol = useNativeTokenSymbol();

  return (
    <>
      {formatEther(wei, { fractionDigits: decimals })} {symbol}
    </>
  );
}
