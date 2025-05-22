"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const DynamicAppSpecificProviders = dynamic(
  () => import('./AppSpecificProviders').then(mod => mod.AppSpecificProviders),
  {
    ssr: false,
    loading: () => null,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't load providers for splash
  const isSplashPage = pathname === '/';
  if (isSplashPage) {
    return <>{children}</>;
  }

  // For all other pages, render the dynamically imported AppSpecificProviders
  return <DynamicAppSpecificProviders>{children}</DynamicAppSpecificProviders>;
}