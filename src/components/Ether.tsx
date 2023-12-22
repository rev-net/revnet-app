import { formatEther } from "juice-sdk-core";

export function Ether({
  wei,
  decimals = 4,
}: {
  wei: bigint;
  decimals?: number;
}) {
  return <>{formatEther(wei, { fractionDigits: decimals })} ETH</>;
}
