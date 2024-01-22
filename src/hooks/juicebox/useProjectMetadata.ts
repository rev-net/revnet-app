import { OPEN_IPFS_GATEWAY_HOSTNAME } from "@/lib/ipfs";
import { getProjectMetadata } from "juice-sdk-core";
import { useQuery } from "react-query";
import { Address } from "viem";
import { useChainId, usePublicClient } from "wagmi";

export function useProjectMetadata({
  projectId,
  jbControllerAddress,
}: {
  projectId: bigint | undefined;
  jbControllerAddress: Address | undefined;
}) {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  return useQuery([projectId?.toString(), jbControllerAddress], async () => {
    if (!projectId || !jbControllerAddress) return null;

    const response = await getProjectMetadata(
      publicClient,
      {
        projectId,
        jbControllerAddress,
      },
      {
        ipfsGatewayHostname: OPEN_IPFS_GATEWAY_HOSTNAME,
      }
    );

    return response;
  });
}
