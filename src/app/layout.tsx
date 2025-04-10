import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { twMerge } from "tailwind-merge";
import "./globals.css";
import { Providers } from "./providers";
import { externalBaseUrl } from "@/app/constants";

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

export const metadata = {
  title: "REVNET",
};

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
        <meta
          name="fc:frame"
          content={`{"version":"next","imageUrl":"${externalBaseUrl}/assets/img/discover_revenue_tokens.png","button":{"title":"Discover Revenue Tokens","action":{"type":"launch_frame","name":"Revnet","url":"${externalBaseUrl}","splashImageUrl":"${externalBaseUrl}/assets/img/small-bw.svg","splashBackgroundColor":"#ffffff"}}}`}
        />
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
