import { TopSuckerGroupsDocument, TopSuckerGroupsQuery } from "@/generated/graphql";
import { getBendystrawClient } from "@/graphql/bendystrawClient";
import { fetchEthPrice } from "@/lib/ethPrice";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { unstable_cache } from "next/cache";
import { formatUnits } from "viem";
import { mainnet } from "viem/chains";

export async function getTopProjects() {
  const [top, ethPrice] = await Promise.all([fetchTopProjects(), fetchEthPrice()]);

  return top.suckerGroups.items
    .map((group) => {
      const project = group.projects?.items[0];
      if (!project || !project.isRevnet) return null;

      const symbol = project.tokenSymbol?.toUpperCase();
      if (symbol !== "ETH" && symbol !== "USDC") return null;

      const balance = Number(formatUnits(BigInt(group.balance), project.decimals ?? 18));
      const balanceUsd = symbol === "ETH" ? balance * ethPrice : balance;

      return { project, balanceUsd };
    })
    .filter((item) => item !== null)
    .sort((a, b) => b.balanceUsd - a.balanceUsd)
    .slice(0, 10)
    .map((item, index) => {
      const { project, balanceUsd } = item;
      const chainId = project.chainId as JBChainId;

      return {
        rank: index + 1,
        projectId: project.projectId,
        chainId: chainId,
        chainSlug: JB_CHAINS[chainId]?.slug ?? "eth",
        name: project.name ?? `Project #${project.projectId}`,
        tagline: project.projectTagline,
        logoUrl: project.logoUri ? ipfsUriToGatewayUrl(project.logoUri) : null,
        balanceUsd,
      };
    });
}

const fetchTopProjects = unstable_cache(
  async () => {
    const client = getBendystrawClient(mainnet.id);
    return client.request<TopSuckerGroupsQuery>(TopSuckerGroupsDocument);
  },
  ["top-projects-v2"],
  { revalidate: 600 }, // 10 minutes
);
