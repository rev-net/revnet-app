"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import React from "react";
import { AppLoadingSkeleton } from "@/components/loading/LoadingSkeletons";

function DynamicProviderFallback() {
  const pathname = usePathname();
  return <AppLoadingSkeleton pathname={pathname} />;
}

const DynamicAppSpecificProviders = dynamic(
  () => import("./AppSpecificProviders").then((mod) => mod.AppSpecificProviders),
  {
    ssr: false,
    loading: () => <DynamicProviderFallback />,
  },
);

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't load providers for splash
  const isSplashPage = pathname === "/";
  if (isSplashPage) {
    return <>{children}</>;
  }

  // For all other pages, render the dynamically imported AppSpecificProviders
  return <DynamicAppSpecificProviders>{children}</DynamicAppSpecificProviders>;
}
