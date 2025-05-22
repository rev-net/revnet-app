import { headers } from "next/headers";
import type { Metadata } from "next";
import { request } from "graphql-request";
import { SUBGRAPH_URLS } from "../../graphql/constants";
import { JB_CHAINS, jbUrn } from "juice-sdk-core";
import { Providers } from "../providers";

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

function buildMetadata({
  title,
  description,
  imageUrl,
  url,
  frame,
}: {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  frame?: object;
}): Metadata {
  return {
    title,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: imageUrl, width: 1200, height: 800, alt: `${title} preview image` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    other: frame ? { "fc:frame": JSON.stringify(frame) } : {},
  };
}

async function getProjectMetadata(slug: string): Promise<{ handle: string; logoUri?: string } | null> {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("Fetching project metadata for slug:", slug);
    }
    const cleanSlug = slug.split("?")[0]?.trim();
    if (!cleanSlug || typeof cleanSlug !== "string" || !cleanSlug.includes(":")) {
      throw new Error("Missing or malformed slug");
    }

    const urn = jbUrn(decodeURIComponent(cleanSlug));
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

    const data = await request<ProjectsQueryResult>(subgraphUrl, query, variables);
    if (!data.projects.length) {
      console.warn("No project found for projectId", urn.projectId);
      return { handle: "project" };
    }
    const project = data.projects[0];
    if (!project.handle) {
      let ipfsHash = "";
      if (typeof project.metadataUri === "string") {
        if (project.metadataUri.startsWith("ipfs://")) {
          ipfsHash = project.metadataUri.replace("ipfs://", "");
        } else if (/^[A-Za-z0-9]{46,}$/.test(project.metadataUri)) {
          ipfsHash = project.metadataUri;
        }
      }
      if (!ipfsHash) {
        console.warn("Invalid metadata URI, skipping IPFS fetch");
        return { handle: "project" };
      }
      try {
        const metadataRes = await fetch(`https://${process.env.NEXT_PUBLIC_INFURA_IPFS_HOSTNAME}/ipfs/${ipfsHash}`);
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
    console.warn("getProjectMetadata error:", err);
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

  if (!slugPath.includes(":")) {
    const url = new URL(`/${slugPath}`, origin);
    const title = "Revnet";
    const description = "Explore onchain revenue networks";
    const imageUrl = `${origin}/assets/img/anachronistic1-1.png`;
    const frame = {
      version: "next",
      imageUrl,
      button: {
        title: "Support project",
        action: {
          type: "launch_frame",
          name: "Revnet",
          url: url.href,
          splashImageUrl: `${origin}/assets/img/small-bw-200x200.png`,
          splashBackgroundColor: "#ffffff",
        },
      },
    };
    return buildMetadata({ title, description, imageUrl, url: url.href, frame });
  }

  const fullPath = `/${slugPath}`;
  const url = new URL(fullPath, origin);

  // Fetch project metadata using the slugPath as the handle
  const project = slugPath ? await getProjectMetadata(slugPath) : null;
  const projectName = project ? project.handle : "project";

  let imgUrl = project?.logoUri || `${origin}/assets/img/anachronistic1-1.png`;

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

  return buildMetadata({
    title: "Revnet",
    description: "Explore onchain revenue networks",
    imageUrl: imgUrl,
    url: url.href,
    frame,
  });
}

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}