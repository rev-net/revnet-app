import { Address, isAddress, PublicClient } from "viem";
import { sepolia, mainnet } from "viem/chains";
import { useChainId, usePublicClient } from "wagmi";
import { useQuery } from "wagmi/query";

const ENS_IDEAS_BASE_URL = "https://api.ensideas.com";

/**
 * Try to resolve an Eth address to an ENS name using ENS Ideas API.
 *
 * NOTE: only works on mainnet.
 */
async function resolveAddressEnsIdeas(addressOrEnsName: string) {
  const response: { name: string | null; address: string } = await fetch(
    `${ENS_IDEAS_BASE_URL}/ens/resolve/${addressOrEnsName}`
  ).then((res) => res.json());

  return response;
}

/**
 * Try to resolve an ENS name or address.
 *
 * If mainnet, first tries ENSIdeas API. Then, falls back to our API.
 * @param address
 * @returns
 */
async function resolveAddress(
  address: Address,
  { chainId, publicClient }: { chainId: number; publicClient: PublicClient }
) {
  if (chainId === sepolia.id) {
    const data = await publicClient.getEnsName({ address });
    return {
      name: data,
      address,
    };
  }

  return resolveAddressEnsIdeas(address);
}

/**
 * Try to resolve an address to an ENS name.
 */
export function useEnsName(
  address: string | undefined,
  { enabled }: { enabled?: boolean } = {}
) {
  const chainId = mainnet.id;
  const publicClient = usePublicClient({ chainId });

  return useQuery({
    queryKey: ["ensName", address, chainId],
    queryFn: async () => {
      if (!address || !isAddress(address)) return null;
      if (!publicClient) {
        throw new Error("Public client not available");
      }

      const data = await resolveAddress(address, { chainId, publicClient });
      return data.name;
    },
    enabled,
  });
}
