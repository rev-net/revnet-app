"use client";

import { JBProjectProvider } from "./contexts/JBProjectProvider/JBProjectProvider";

export function Providers({
  children,
  projectId,
}: {
  projectId: bigint;
  children: React.ReactNode;
}) {
  return (
    <JBProjectProvider projectId={projectId}>{children}</JBProjectProvider>
  );
}
