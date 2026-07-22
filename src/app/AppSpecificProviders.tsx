"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLoadingSkeleton } from "@/components/loading/LoadingSkeletons";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import * as React from "react";
import { usePathname } from "next/navigation";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppSpecificProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <AppLoadingSkeleton pathname={pathname} />;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="soft"
          mode="light"
          customTheme={{
            "--ck-font-family": "var(--font-simplon-mono)",
            "--ck-connectbutton-border-radius": "0",
            "--ck-accent-color": "#68CA8F",
            "--ck-accent-text-color": "#15281D",
            "--ck-connectbutton-color": "#15281D",
            "--ck-connectbutton-background": "#E1F7EA",
            "--ck-connectbutton-box-shadow": "inset 0 0 0 1px #C6EDD5",
            "--ck-connectbutton-hover-color": "#15281D",
            "--ck-connectbutton-hover-background": "#C6EDD5",
            "--ck-connectbutton-active-color": "#15281D",
            "--ck-connectbutton-active-background": "#A5E0BD",
            "--ck-connectbutton-balance-color": "#15281D",
            "--ck-connectbutton-balance-background": "#F6FEF9",
            "--ck-connectbutton-balance-hover-background": "#E1F7EA",
            "--ck-primary-button-color": "#15281D",
            "--ck-primary-button-background": "#E1F7EA",
            "--ck-primary-button-hover-color": "#15281D",
            "--ck-primary-button-hover-background": "#C6EDD5",
            "--ck-secondary-button-color": "#15281D",
            "--ck-secondary-button-background": "#E1F7EA",
            "--ck-secondary-button-hover-background": "#C6EDD5",
            "--ck-tertiary-button-background": "#F6FEF9",
            "--ck-body-color": "#15281D",
            "--ck-body-color-muted": "#3D7955",
            "--ck-body-color-muted-hover": "#1F3D2B",
            "--ck-body-background": "#F6FEF9",
            "--ck-body-background-transparent": "rgba(246, 254, 249, 0)",
            "--ck-body-background-secondary": "#E1F7EA",
            "--ck-body-background-secondary-hover-background": "#C6EDD5",
            "--ck-body-background-secondary-hover-outline": "#68CA8F",
            "--ck-body-background-tertiary": "#EBFAF1",
            "--ck-body-action-color": "#3D7955",
            "--ck-body-divider": "#C6EDD5",
            "--ck-body-divider-secondary": "rgba(61, 121, 85, 0.18)",
            "--ck-overlay-background": "rgba(21, 40, 29, 0.24)",
            "--ck-modal-box-shadow": "0 3px 16px rgba(21, 40, 29, 0.12)",
            "--ck-focus-color": "#68CA8F",
            "--ck-spinner-color": "#4FA270",
            "--ck-copytoclipboard-stroke": "#4FA270",
            "--ck-tooltip-background": "#15281D",
            "--ck-tooltip-background-secondary": "#1F3D2B",
            "--ck-tooltip-color": "#F6FEF9",
            "--ck-dropdown-button-color": "#3D7955",
            "--ck-dropdown-button-background": "#F6FEF9",
            "--ck-dropdown-button-hover-color": "#15281D",
            "--ck-dropdown-button-hover-background": "#E1F7EA",
            "--ck-dropdown-box-shadow": "0 2px 15px rgba(21, 40, 29, 0.15)",
            "--ck-qr-dot-color": "#15281D",
            "--ck-qr-border-color": "#C6EDD5",
          }}
        >
          <TooltipProvider delayDuration={200} skipDelayDuration={100}>
            {children}
          </TooltipProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
