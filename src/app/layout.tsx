import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { twMerge } from "tailwind-merge";
import "./globals.css";
import { Providers } from "./providers";
import { headers } from "next/headers";
import type { Metadata } from "next";


import localFont from "next/font/local";

const simplonNorm = localFont({
  src: [
    { path: "../../public/fonts/SimplonNorm-Light.otf", weight: "400" },
    { path: "../../public/fonts/SimplonNorm-Regular.otf", weight: "500" },
    { path: "../../public/fonts/SimplonNorm-Bold.otf", weight: "700" },
  ],
  variable: "--font-simplon-norm",
});
const simplonMono = localFont({
  src: [
    { path: "../../public/fonts/SimplonMono-Light.otf", weight: "400" },
    { path: "../../public/fonts/SimplonMono-Regular.otf", weight: "500" },
    { path: "../../public/fonts/SimplonMono-Bold.otf", weight: "700" },
  ],
  variable: "--font-simplon-mono",
});

export const revalidate = 300;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/img/small-bw.svg" />
        <link rel="apple-touch-icon" href="/assets/img/small-bw.svg" />
      </head>
      <body
        className={twMerge(
          simplonNorm.variable,
          simplonMono.variable,
          "bg-zinc-25 text-zinc-950 font-sans min-h-screen tracking-[0.015em]"
        )}
      >
        <Providers>
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>

        <Toaster />
      </body>
    </html>
  );
}


export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  // For the root layout, our fullPath is '/'
  const fullPath = "/";
  const url = new URL(fullPath, origin);

  const imgUrl = `${origin}/assets/img/anachronistic1-1.png`;

  const frame = {
    version: "next",
    imageUrl: imgUrl,
    button: {
      title: "Discover revenue tokens",
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