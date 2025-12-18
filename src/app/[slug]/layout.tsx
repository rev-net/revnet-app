import { Nav } from "@/components/layout/Nav";
import { parseSlug } from "@/lib/slug";
import { NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PropsWithChildren, Suspense } from "react";
import { ActivityFeed } from "./components/ActivityFeed/ActivityFeed";
import { Header } from "./components/Header/Header";
import { NewProjectNotice } from "./components/NewProjectNotice";
import { PayCard } from "./components/PayCard/PayCard";
import { ProjectMenu } from "./components/ProjectMenu";
import { TokenPriceChart } from "./components/TokenPrice/TokenPriceChart";
import { getProject } from "./getProject";
import { getProjectOperator } from "./getProjectOperator";
import { getSuckerGroup } from "./getSuckerGroup";
import { ProjectProviders } from "./ProjectProviders";
import { getRulesets } from "./terms/getRulesets";

export const revalidate = 300;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;
  const slug = decodeURIComponent(params?.slug ?? "");

  const url = new URL(`/${slug}`, origin);

  if (!slug.includes(":")) {
    const title = "Revnet";
    const description = "Explore onchain revenue networks";
    const imageUrl = `${origin}/assets/img/rev-og-191-1.png`;
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
    return buildMetadata({
      title,
      description,
      imageUrl,
      url: url.href,
      frame,
    });
  }

  const { projectId, chainId, version } = parseSlug(slug);
  const project = projectId ? await getProject(projectId, chainId, version) : null;
  const imageUrl = project?.logoUri || `${origin}/assets/img/rev-og-191-1.png`;

  const frame = {
    version: "next",
    imageUrl,
    button: {
      title: truncate(`Support ${project?.handle || "project"}`),
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
    title: project?.name ? `${project.name} | REVNET` : "Revnet",
    description: "Explore onchain revenue networks",
    imageUrl,
    url: url.href,
    frame,
  });
}

export default async function SlugLayout({ children, params }: PropsWithChildren<Props>) {
  const { chainId, projectId, version } = parseSlug(params.slug);

  const project = await getProject(projectId, chainId, version);
  if (!project || !project.token) notFound();

  const suckerGroup = await getSuckerGroup(project.suckerGroupId, chainId);
  if (!suckerGroup) notFound();

  const projects = suckerGroup.projects?.items ?? [];

  const operatorPromise = getProjectOperator(Number(projectId), chainId, version);

  const rulesets = await getRulesets(projectId.toString(), chainId, version);
  const startDate = rulesets[0]?.start;
  const hasStarted = !startDate || startDate <= Math.floor(Date.now() / 1000);

  return (
    <ProjectProviders chainId={chainId} projectId={projectId} version={version}>
      <Nav />

      <div className="w-full px-4 sm:container pt-6">
        <Header operatorPromise={operatorPromise} projects={projects} />
      </div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 w-full px-4 sm:container pb-5 mb-10">
        <aside className="w-full md:w-[300px] shrink-0">
          {startDate && <NewProjectNotice startDate={startDate} />}
          <div className="mt-1 mb-4">
            <PayCard />
          </div>
          <ActivityFeed suckerGroupId={suckerGroup.id} projects={projects} />
        </aside>
        <div className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto pb-10 gap-6 flex flex-col">
            {hasStarted && (
              <Suspense>
                <TokenPriceChart
                  projectId={projectId.toString()}
                  chainId={chainId}
                  version={version}
                  suckerGroupId={suckerGroup.id}
                  token={project.token}
                  tokenSymbol={project.tokenSymbol ?? "ETH"}
                  tokenDecimals={project.decimals ?? NATIVE_TOKEN_DECIMALS}
                />
              </Suspense>
            )}

            <ProjectMenu />

            {children}
          </div>
        </div>
      </div>
    </ProjectProviders>
  );
}

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
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 800,
          alt: `${title} preview image`,
        },
      ],
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
