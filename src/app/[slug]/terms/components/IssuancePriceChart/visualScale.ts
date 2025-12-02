import { Stage } from "./prepareChartData";

const MIN_STAGE_WIDTH_PERCENT = 0.12;

export type StageMapping = {
  start: number;
  end: number;
  visualStart: number;
  visualEnd: number;
};

export type VisualScale = {
  mappings: StageMapping[];
  toVisual: (timestamp: number) => number;
  toReal: (visualX: number) => number;
};

/**
 * Creates a visual scale that ensures each stage takes at least MIN_STAGE_WIDTH_PERCENT
 * of the chart width, preventing tiny stages from being invisible.
 */
export function createVisualScale(stages: Stage[], endTimestamp: number): VisualScale {
  if (stages.length === 0) {
    return { mappings: [], toVisual: (ts) => ts, toReal: (v) => v };
  }

  const totalDuration = endTimestamp - stages[0].start;
  const stageDurations = stages.map((stage, i) => {
    const nextStart = stages[i + 1]?.start ?? endTimestamp;
    return {
      stage,
      start: stage.start,
      end: nextStart,
      duration: nextStart - stage.start,
      naturalWidth: (nextStart - stage.start) / totalDuration,
    };
  });

  const underMinStages = stageDurations.filter((s) => s.naturalWidth < MIN_STAGE_WIDTH_PERCENT);
  const overMinStages = stageDurations.filter((s) => s.naturalWidth >= MIN_STAGE_WIDTH_PERCENT);

  // If no stages need adjustment, use identity mapping
  if (underMinStages.length === 0) {
    const mappings = stageDurations.map((s) => ({
      start: s.start,
      end: s.end,
      visualStart: s.start,
      visualEnd: s.end,
    }));
    return { mappings, toVisual: (ts) => ts, toReal: (v) => v };
  }

  // Calculate how much width needs to be redistributed
  const widthNeeded = underMinStages.reduce(
    (sum, s) => sum + (MIN_STAGE_WIDTH_PERCENT - s.naturalWidth),
    0,
  );
  const widthAvailable = overMinStages.reduce((sum, s) => sum + s.naturalWidth, 0);
  const scaleFactor = (widthAvailable - widthNeeded) / widthAvailable;

  const adjustedWidths = stageDurations.map((s) => ({
    ...s,
    adjustedWidth:
      s.naturalWidth < MIN_STAGE_WIDTH_PERCENT
        ? MIN_STAGE_WIDTH_PERCENT
        : s.naturalWidth * scaleFactor,
  }));

  const visualRange = 1000;
  let visualCursor = 0;
  const mappings: StageMapping[] = adjustedWidths.map((s) => {
    const visualWidth = s.adjustedWidth * visualRange;
    const mapping = {
      start: s.start,
      end: s.end,
      visualStart: visualCursor,
      visualEnd: visualCursor + visualWidth,
    };
    visualCursor += visualWidth;
    return mapping;
  });

  const toVisual = (ts: number): number => {
    const mapping =
      mappings.find((m) => ts >= m.start && ts < m.end) ?? mappings[mappings.length - 1];
    if (!mapping) return ts;
    const progress = (ts - mapping.start) / (mapping.end - mapping.start);
    return mapping.visualStart + progress * (mapping.visualEnd - mapping.visualStart);
  };

  const toReal = (v: number): number => {
    const mapping =
      mappings.find((m) => v >= m.visualStart && v < m.visualEnd) ?? mappings[mappings.length - 1];
    if (!mapping) return v;
    const progress = (v - mapping.visualStart) / (mapping.visualEnd - mapping.visualStart);
    return mapping.start + progress * (mapping.end - mapping.start);
  };

  return { mappings, toVisual, toReal };
}
