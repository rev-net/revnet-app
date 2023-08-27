import { Playfair_Display } from "next/font/google";
import { twMerge } from "tailwind-merge";
import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
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
      <body className={twMerge(playfair.variable, "bg-zinc-25 text-zinc-950")}>
        <Providers>
          <Nav />
          <main>{children}</main>
        </Providers>

        <Footer />
      </body>
    </html>
  );
}
