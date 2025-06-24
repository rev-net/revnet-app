import { Button } from "@/components/ui/button";

interface ViewTabsProps {
  activeView: string;
  onViewChange: (view: string) => void;
  views: Array<{
    id: string;
    label: string;
    disabled?: boolean;
  }>;
  className?: string;
}

export const ViewTabs = ({
  activeView,
  onViewChange,
  views,
  className = "",
}: ViewTabsProps) => {
  return (
    <div className={`flex space-x-1 p-1 bg-gray-100 rounded-lg ${className}`}>
      {views.map((view) => (
        <Button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          disabled={view.disabled}
          variant={activeView === view.id ? "tab-selected" : "bottomline"}
          size="sm"
          className="flex-1"
        >
          {view.label}
        </Button>
      ))}
    </div>
  );
}; 