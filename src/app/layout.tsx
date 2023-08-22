import "./globals.css";
import { Providers } from "./providers";

import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { twMerge } from "tailwind-merge";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata = {
  title: "Next.js + Juicebox",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={twMerge(playfair.variable, "bg-neutral-25 text-stone-950")}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
