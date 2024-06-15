"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import apolloClient from "@/lib/apolloClient";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { ApolloProvider } from "@apollo/client";
import { ConnectKitProvider } from "connectkit";
import * as React from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          customTheme={{
            "--ck-border-radius": "8px",
            "--ck-font-family": "var(--font-simplon-norm)",
          }}
        >
          <ApolloProvider client={apolloClient}>
            <TooltipProvider delayDuration={200} skipDelayDuration={100}>
              {mounted && children}
            </TooltipProvider>
          </ApolloProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
