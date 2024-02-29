import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Toaster } from "@/components/ui/toaster";
import { IBM_Plex_Sans } from "next/font/google";
import { twMerge } from "tailwind-merge";
import "./globals.css";
import { Providers } from "./providers";

const ibm = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm",
  weight: ["400", "500"],
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
          ibm.variable,
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
