"use client";

import { formatSeconds } from "@/lib/utils";
import { useEffect, useState } from "react";

interface NewProjectNoticeProps {
  startDate: number;
}

export function NewProjectNotice({ startDate }: NewProjectNoticeProps) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const timeUntilStart = startDate - now;
  const hasStarted = timeUntilStart <= 0;

  useEffect(() => {
    if (hasStarted) return;

    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted]);

  if (hasStarted) return null;

  return (
    <div className="bg-orange-100 px-4 py-2.5 text-orange-950 text-sm">
      Starts in {formatSeconds(timeUntilStart)}
    </div>
  );
}
