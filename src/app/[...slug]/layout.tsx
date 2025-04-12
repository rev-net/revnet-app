import { headers } from "next/headers";
import type { Metadata } from "next";

export const revalidate = 300;

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

  let imgUrl = `${origin}/assets/img/discover_revenue_tokens.png`;

  const frame = {
    version: "next",
    imageUrl: imgUrl,
    button: {
      title: `Support project ${fullPath}`, // TODO: pass in project name after testing
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