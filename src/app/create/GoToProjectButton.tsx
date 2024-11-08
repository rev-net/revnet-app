import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTransactionReceipt } from "wagmi";
import { JBChainId } from "juice-sdk-react";
import { FastForwardIcon, CheckCircle } from "lucide-react";
import { chainIdMap } from "../constants";

export function GoToProjectButton({
  txHash,
  chainId,
}: {
  txHash?: string,
  chainId?: JBChainId,
}) {
  const { data, isLoading } = useTransactionReceipt({
    chainId,
    hash: txHash as `0x${string}`,
  });

  const projectId = data?.logs[0]?.topics[1] ? Number(data.logs[0].topics[1]) : undefined;
  const chain = chainId ? chainIdMap[chainId] : "sepolia";
  const projectUrl = `/${chain}/${projectId}`;
  return (
    <div className="max-w-fit">
      <Link
        href={projectUrl}
        className={!projectId ? 'pointer-events-none' : ''}
      >
        <Button
          type="submit"
          size="lg"
          disabled={!projectId}
          className="transition-all duration-200 mt-2"
        >
          Go to your revnet
          <FastForwardIcon
            className={"h-4 w-4 fill-white ml-2 animate-pulse"}
          />
        </Button>
      </Link>
    </div>
  );
}
