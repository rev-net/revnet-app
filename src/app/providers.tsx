"use client";

import { wagmiConfig } from "@/lib/wagmiConfig";
import { ConnectKitProvider } from "connectkit";
import * as React from "react";
import { WagmiConfig } from "wagmi";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider>{mounted && children}</ConnectKitProvider>
    </WagmiConfig>
  );
}
