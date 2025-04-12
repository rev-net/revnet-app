import { headers } from "next/headers";
import type { Metadata } from "next";
import { request } from "graphql-request";
import { SUBGRAPH_URLS } from "../../graphql/constants";
import { JB_CHAINS, jbUrn } from "juice-sdk-core";

interface ProjectsQueryResult {
  projects: {
    projectId: string;
    metadataUri: string;
    handle: string;
    contributorsCount: number;
    createdAt: string;
  }[];
}

export const revalidate = 300;

function truncate(str: string, max = 32): string {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

async function getProjectMetadata(slug: string): Promise<{ handle: string; logoUri?: string } | null> {
  const urn = jbUrn(slug);
  if (!urn?.projectId || !urn?.chainId || !JB_CHAINS[urn.chainId]) {
    throw new Error("Invalid URN");
  }
  if (!(urn.chainId in SUBGRAPH_URLS)) {
    console.error("No valid subgraph URL for chain: " + urn.chainId);
    return null;
  }

  const chainId = Number(urn.chainId) as keyof typeof SUBGRAPH_URLS;

  const subgraphUrl = SUBGRAPH_URLS[chainId];
  if (!subgraphUrl) {
    console.error("Subgraph URL is undefined for chain: " + urn.chainId);
    return null;
  }

  const query = `
    query Projects($projectId: Int!) {
      projects(where: { projectId: $projectId }, first: 1, skip: 0) {
        projectId
        metadataUri
        handle
        contributorsCount
        createdAt
      }
    }
  `;

  const variables = { projectId: Number(urn.projectId) };

  try {
    const data = await request<ProjectsQueryResult>(subgraphUrl, query, variables);
    const project = data.projects[0];
    if (!project.handle && project.metadataUri?.startsWith("ipfs://")) {
      const ipfsHash = project.metadataUri.replace("ipfs://", "");
      try {
        const metadataRes = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
        const metadata = await metadataRes.json();
        return {
          handle: metadata.name ?? "project",
          logoUri: metadata.logoUri?.startsWith("ipfs://")
            ? `https://${process.env.NEXT_PUBLIC_INFURA_IPFS_HOSTNAME}/ipfs/${metadata.logoUri.replace("ipfs://", "")}`
            : metadata.logoUri,
        };
      } catch (err) {
        console.error("Failed to fetch metadata from IPFS:", err);
        return { handle: "project" };
      }
    }
    return { handle: project.handle ?? "project" };
  } catch (err) {
    console.error("Failed to fetch project metadata:", err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;
  const slugPath = decodeURIComponent(params?.slug?.join("/") ?? "");
  const fullPath = `/${slugPath}`;
  const url = new URL(fullPath, origin);

  // Fetch project metadata using the slugPath as the handle
  const project = slugPath ? await getProjectMetadata(slugPath) : null;
  const projectName = project ? project.handle : "project";

  let imgUrl = project?.logoUri || `${origin}/assets/img/discover_revenue_tokens.png`;

  const frame = {
    version: "next",
    imageUrl: imgUrl,
    button: {
      title: truncate(`Support ${projectName}`),
      action: {
        type: "launch_frame",
        name: "Revnet",
        url: url.href,
        splashImageUrl: `${origin}/assets/img/small-bw-200x200.png`,
        splashBackgroundColor: "#ffffff",
      },
    },
  };

  return {
    title: "Revnet",
    openGraph: {
      title: "Revnet",
      description: "Explore onchain revenue networks",
      url: url.href,
      images: [
        {
          url: imgUrl,
          width: 1200,
          height: 630,
          alt: "Revnet preview image",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Revnet",
      description: "Explore onchain revenue networks",
      images: [imgUrl],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}