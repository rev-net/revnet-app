"use client";
import { JBProjectProvider } from "./contexts/JBProjectContext/JBProjectContext";

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
