import { formatEther } from "juice-hooks";

export function Ether({
  wei,
  decimals = 4,
}: {
  wei: bigint;
  decimals?: number;
}) {
  return <>{formatEther(wei, { decimals })} ETH</>;
}
