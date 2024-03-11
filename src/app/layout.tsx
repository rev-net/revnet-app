import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { twMerge } from "tailwind-merge";
import "./globals.css";
import { Providers } from "./providers";

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
      <body
        className={twMerge(
          simplonNorm.variable,
          simplonMono.variable,
          "bg-zinc-25 text-zinc-950 font-sans min-h-screen"
        )}
      >
        <Providers>
          <main>{children}</main>

          <Footer />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
