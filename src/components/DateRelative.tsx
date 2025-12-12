"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

interface Props {
  timestamp: number;
  className?: string;
}

export function DateRelative({ timestamp, className }: Props) {
  const date = new Date(timestamp * 1000);
  const relative = formatTimeAgo(date);
  const full = format(date, "MMM d, yyyy 'at' h:mm a");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time dateTime={date.toISOString()} className={className}>
          {relative}
        </time>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {full}
      </TooltipContent>
    </Tooltip>
  );
}
