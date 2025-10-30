"use client";

import { useRulesets } from "@/hooks/useRulesets";
import { formatSeconds } from "@/lib/utils";
import { useEffect, useState } from "react";

export function NewProjectNotice() {
  const { rulesets } = useRulesets();
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const startDate = rulesets?.[0]?.start;
  const timeUntilStart = startDate ? startDate - now : 0;
  const hasStarted = timeUntilStart <= 0;

  useEffect(() => {
    if (!startDate || hasStarted) return;

    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate, hasStarted]);

  if (!startDate || hasStarted) return null;

  return (
    <div className="bg-orange-100 px-4 py-2.5 text-orange-950 text-sm">
      Starts in {formatSeconds(timeUntilStart)}
    </div>
  );
}
