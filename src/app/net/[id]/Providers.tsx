"use client";
import { JBProjectProvider } from "juice-hooks";

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
