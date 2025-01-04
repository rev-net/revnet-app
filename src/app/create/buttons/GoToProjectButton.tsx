import { Button } from "@/components/ui/button";
import { JB_CHAIN_SLUGS } from "juice-sdk-core";
import { JBChainId } from "juice-sdk-react";
import { FastForwardIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { sepolia } from "viem/chains";
import { useTransactionReceipt } from "wagmi";

export function GoToProjectButton({
  txHash,
  chainId,
}: {
  txHash?: string;
  chainId?: JBChainId;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const { data } = useTransactionReceipt({
    chainId,
    hash: txHash as `0x${string}`,
  });

  const projectId = data?.logs[0]?.topics[1]
    ? Number(data.logs[0].topics[1])
    : undefined;
  const chain = chainId
    ? JB_CHAIN_SLUGS[chainId].slug
    : JB_CHAIN_SLUGS[sepolia.id].slug;
  const projectUrl = `/${chain}/${projectId}`;
  return (
    <div className="max-w-fit">
      <Link
        href={projectUrl}
        className={!projectId ? "pointer-events-none" : ""}
      >
        <Button
          type="submit"
          size="lg"
          disabled={!projectId}
          loading={isLoading}
          className="transition-all duration-200 mt-2"
          onClick={() => setIsLoading(true)}
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
