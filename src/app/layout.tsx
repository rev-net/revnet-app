import { DM_Sans, Playfair_Display } from "next/font/google";
import { twMerge } from "tailwind-merge";
import "./globals.css";
import { Providers } from "./providers";
import { ConnectKitButton } from "connectkit";
import { Nav } from "@/components/layout/Nav";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
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
        className={twMerge(
          playfair.variable,
          dmSans.className,
          "bg-zinc-25 text-zinc-950"
        )}
      >
        <Providers>
          <Nav />
          <main>{children}</main>
        </Providers>
        <footer></footer>
      </body>
    </html>
  );
}
