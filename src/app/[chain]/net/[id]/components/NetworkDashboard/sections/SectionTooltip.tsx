import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export function SectionTooltip({
  name,
  info
} : {
  name: string,
  info: string
}) {
  return (
    <Tooltip>
      <div className="flex flex-row space-x-2">
        <div className="text-2xl font-semibold">{name}</div>
        <TooltipTrigger>
          <QuestionMarkCircleIcon className="h-4 w-4 inline mb-1" />
        </TooltipTrigger>
        <TooltipContent side="right">
          {info}
        </TooltipContent>
      </div>
    </Tooltip>
  )
}
