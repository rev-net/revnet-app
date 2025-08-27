import { Button } from "@/components/ui/button";

export type TradingTab = "market" | "limit" | "lp";

interface TradingTabsProps {
  activeTab: TradingTab;
  onTabChange: (tab: TradingTab) => void;
  disabled?: boolean;
  className?: string;
}

export function TradingTabs({
  activeTab,
  onTabChange,
  disabled = false,
  className = ""
}: TradingTabsProps) {
  return (
    <div className={`flex border-b mb-4 ${className}`}>
      <Button
        variant={activeTab === "market" ? "tab-selected" : "bottomline"}
        onClick={() => onTabChange("market")}
        disabled={disabled}
        className="flex-1"
      >
        Sell at Market
      </Button>
      <Button
        variant={activeTab === "limit" ? "tab-selected" : "bottomline"}
        onClick={() => onTabChange("limit")}
        disabled={disabled}
        className="flex-1"
      >
        Limit Order
      </Button>
      <Button
        variant={activeTab === "lp" ? "tab-selected" : "bottomline"}
        onClick={() => onTabChange("lp")}
        disabled={disabled}
        className="flex-1"
      >
        LP
      </Button>
    </div>
  );
}

interface TradingTabContentProps {
  activeTab: TradingTab;
  children: {
    market?: React.ReactNode;
    limit?: React.ReactNode;
    lp?: React.ReactNode;
  };
  className?: string;
}

export function TradingTabContent({
  activeTab,
  children,
  className = ""
}: TradingTabContentProps) {
  const getActiveContent = () => {
    switch (activeTab) {
      case "market":
        return children.market;
      case "limit":
        return children.limit;
      case "lp":
        return children.lp;
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {getActiveContent()}
    </div>
  );
}
