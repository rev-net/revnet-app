"use client";

import { Button } from "@/components/ui/button";
import { twJoin } from "tailwind-merge";

export function LoanTabsHeader({
  selectedTab,
  setSelectedTab,
}: {
  selectedTab: "borrow" | "repay";
  setSelectedTab: (tab: "borrow" | "repay") => void;
}) {
  return (
    <div className="flex gap-4 mb-4">
      {["borrow", "repay"].map((tab) => (
        <Button
          key={tab}
          variant={selectedTab === tab ? "tab-selected" : "bottomline"}
          className={twJoin("text-md text-zinc-400", selectedTab === tab && "text-inherit")}
          onClick={() => setSelectedTab(tab as "borrow" | "repay")}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </Button>
      ))}
    </div>
  );
}
