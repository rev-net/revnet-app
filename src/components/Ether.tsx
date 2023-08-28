import { formatEther } from "@/lib/juicebox/utils";

export function Ether({
  wei,
  decimals = 4,
}: {
  wei: bigint;
  decimals?: number;
}) {
  return <>{formatEther(wei, { decimals })} ETH</>;
}
