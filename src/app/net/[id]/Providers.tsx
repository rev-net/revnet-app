"use client";
import {
  JBFundingCycleProvider,
  JBProjectProvider,
} from "juice-hooks/lib/react";

export function Providers({
  children,
  projectId,
}: {
  projectId: bigint;
  children: React.ReactNode;
}) {
  return (
    <JBProjectProvider projectId={projectId}>
      <JBFundingCycleProvider projectId={projectId}>
        {children}
      </JBFundingCycleProvider>
    </JBProjectProvider>
  );
}
