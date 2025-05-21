"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, type Theme as ConnectKitTheme } from "connectkit"; // Import ConnectKit's Theme type
import * as React from "react";
import { WagmiProvider } from "wagmi";
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'; // Import and alias

// This helper component will consume the theme from NextThemesProvider
// and correctly pass it to ConnectKitProvider.
// It also handles the mounting logic to ensure `resolvedTheme` is available.
function ThemedProviders({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme(); // from next-themes
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

  return (
    <ConnectKitProvider
      theme="auto"
      // Dynamically set ConnectKit's mode based on the resolved theme from next-themes
      mode={resolvedTheme as ConnectKitTheme || 'auto'} // Cast and provide a fallback
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

  // It's good practice to create the queryClient instance once.
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