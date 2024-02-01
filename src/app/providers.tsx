"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import apolloClient from "@/lib/apolloClient";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { ApolloProvider } from "@apollo/client";
import { ConnectKitProvider } from "connectkit";
import * as React from "react";
import { WagmiConfig } from "wagmi";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider>
        <ApolloProvider client={apolloClient}>
          <TooltipProvider delayDuration={200} skipDelayDuration={100}>
            {mounted && children}
          </TooltipProvider>
        </ApolloProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
