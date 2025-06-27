"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import * as React from "react";
import { WagmiProvider } from "wagmi";
import { AppDataProvider } from "@/contexts/AppDataContext";

const queryClient = new QueryClient();

export function AppSpecificProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Skeleton later
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="soft"
          mode="light"
          customTheme={{
            "--ck-font-family": "var(--font-simplon-norm)",
            "--ck-connectbutton-border-radius": "0",
            "--ck-accent-color": "#14B8A6",
            "--ck-accent-text-color": "#ffffff",
          }}
        >
          <AppDataProvider>
            <TooltipProvider delayDuration={200} skipDelayDuration={100}>
              {children}
            </TooltipProvider>
          </AppDataProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}