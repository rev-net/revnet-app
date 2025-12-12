export type TimeRange = "1d" | "7d" | "30d" | "3m" | "1y" | "all";

const SECONDS_PER_DAY = 86400;

const VALID_RANGES: TimeRange[] = ["1d", "7d", "30d", "3m", "1y", "all"];

export function parseTimeRange(range?: string | null): TimeRange {
  if (range && VALID_RANGES.includes(range as TimeRange)) {
    return range as TimeRange;
  }
  return "1y";
}

export function getTimeRangeConfig(range: TimeRange): { seconds: number | null; interval: number } {
  switch (range) {
    case "1d":
      return { seconds: SECONDS_PER_DAY, interval: 3600 };
    case "7d":
      return { seconds: 7 * SECONDS_PER_DAY, interval: 3600 };
    case "30d":
      return { seconds: 30 * SECONDS_PER_DAY, interval: SECONDS_PER_DAY };
    case "3m":
      return { seconds: 90 * SECONDS_PER_DAY, interval: SECONDS_PER_DAY };
    case "1y":
      return { seconds: 365 * SECONDS_PER_DAY, interval: SECONDS_PER_DAY };
    case "all":
      return { seconds: null, interval: SECONDS_PER_DAY * 5 };
  }
}

export function getStartTimeForRange(range: TimeRange): number {
  const now = Math.floor(Date.now() / 1000);
  switch (range) {
    case "1d":
      return now - SECONDS_PER_DAY;
    case "7d":
      return now - 7 * SECONDS_PER_DAY;
    case "30d":
      return now - 30 * SECONDS_PER_DAY;
    case "3m":
      return now - 90 * SECONDS_PER_DAY;
    case "1y":
      return now - 365 * SECONDS_PER_DAY;
    case "all":
      return 0;
  }
}
