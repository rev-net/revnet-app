import { Nav } from "@/components/layout/Nav";
import { parseSlug } from "@/lib/slug";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { PropsWithChildren } from "react";
import { Header } from "./components/Header/Header";
import { PayCard } from "./components/PayCard/PayCard";
import { ProjectMenu } from "./components/ProjectMenu";
import { getProject } from "./getProject";
import { ProjectProviders } from "./ProjectProviders";

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

export default function SlugLayout({ children, params }: PropsWithChildren<Props>) {
  const { chainId, projectId, version } = parseSlug(params.slug);

  return (
    <ProjectProviders chainId={chainId} projectId={projectId} version={version}>
      <Nav />
      <div className="w-full px-4 sm:container pt-6">
        <Header />
      </div>
      <div className="flex gap-10 w-full px-4 sm:container pb-5 md:flex-nowrap flex-wrap mb-10">
        {/* Column 2, hide on mobile */}
        <aside className="hidden md:w-[300px] md:block shrink-0">
          <div className="mt-1 mb-4">
            <PayCard />
          </div>
        </aside>
        {/* Column 1 */}
        <div className="flex-1">
          {/* Render Pay and activity after header on mobile */}
          <div className="sm:hidden">
            <div className="mt-1 mb-4">
              <PayCard />
            </div>
          </div>

          <div className="max-w-4xl mx-auto pb-10 gap-6 flex flex-col">
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
