"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import * as React from "react";
import { WagmiProvider } from "wagmi";
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

function ThemedProviders({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <TooltipProvider delayDuration={200} skipDelayDuration={100}>
        {children} {/* Or null if children should also wait */}
      </TooltipProvider>
    );
  }

  const connectKitMode = (resolvedTheme === 'light' || resolvedTheme === 'dark')
    ? resolvedTheme
    : 'auto';

  return (
    <ConnectKitProvider
      theme="auto"
      mode={connectKitMode}
    >
      <TooltipProvider delayDuration={200} skipDelayDuration={100}>
        {children}
      </TooltipProvider>
    </ConnectKitProvider>
  );
}


export function Providers({ children }: { children: React.ReactNode }) {
  const [appMounted, setAppMounted] = React.useState(false);
  React.useEffect(() => setAppMounted(true), []);

  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ThemedProviders>
            {appMounted ? children : null /* Or a loading spinner for the whole app */}
          </ThemedProviders>
        </QueryClientProvider>
      </WagmiProvider>
    </NextThemesProvider>
  );
}