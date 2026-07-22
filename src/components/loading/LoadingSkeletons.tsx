import { Skeleton, SkeletonLines, SkeletonTable } from "@/components/ui/skeleton";

function ActivityRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-start gap-3">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-2.5 w-1/3" />
            <Skeleton className={index % 2 === 0 ? "h-3 w-4/5" : "h-3 w-2/3"} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityFeedSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading activity" className="py-2">
      <span className="sr-only">Loading activity</span>
      <ActivityRows rows={rows} />
    </div>
  );
}

export function ChartSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading chart"
      className={`relative overflow-hidden border-b border-l border-melon-100 ${className}`}
    >
      <span className="sr-only">Loading chart</span>
      <div className="absolute inset-0 flex flex-col justify-evenly px-4" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="border-t border-melon-100" />
        ))}
      </div>
      <div className="absolute inset-x-4 bottom-3 top-4 text-melon-100" aria-hidden="true">
        <svg className="h-full w-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
          <path
            d="M 20 268 H 100 V 248 H 185 V 225 H 270 V 196 H 360 V 166 H 450 V 130 H 545 V 98 H 635 V 72 H 725 V 54 H 815 V 39 H 900 V 25 H 980"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="square"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 20 278 H 980"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="square"
            vectorEffect="non-scaling-stroke"
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
}

export function CardSkeleton({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-label="Loading content" className={`border border-melon-100 bg-melon-50 p-4 ${className}`}>
      <span className="sr-only">Loading content</span>
      <Skeleton className="mb-4 h-4 w-28" />
      <SkeletonLines lines={rows} />
    </div>
  );
}

export function TableSkeleton({ rows = 4, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div role="status" aria-label="Loading table" className="bg-melon-50 p-4">
      <span className="sr-only">Loading table</span>
      <SkeletonTable rows={rows} columns={columns} />
    </div>
  );
}

export function TopProjectsTableSkeleton() {
  return (
    <div className="mt-12 w-full max-w-xl" role="status" aria-label="Loading top projects">
      <span className="sr-only">Loading top projects</span>
      <div className="grid h-12 grid-cols-[3rem_1fr_8rem] items-center border-b border-zinc-100 px-4 sm:px-8">
        <span />
        <span className="text-sm text-zinc-500">Project</span>
        <span className="text-right text-sm text-zinc-500">Balance</span>
      </div>
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="grid min-h-[64px] grid-cols-[3rem_1fr_8rem] items-center border-b border-zinc-100 px-4 last:border-b-0 sm:px-8"
        >
          <Skeleton className="h-3 w-3" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className={index % 2 === 0 ? "h-3 w-36" : "h-3 w-28"} />
              <Skeleton className="h-2.5 w-44 max-w-[70%]" />
            </div>
          </div>
          <Skeleton className="ml-auto h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function DiscoverGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3" role="status" aria-label="Loading projects">
      <span className="sr-only">Loading projects</span>
      {Array.from({ length: cards }, (_, index) => (
        <div key={index} className="min-h-[180px] border border-zinc-200 bg-melon-50 p-4">
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <SkeletonLines lines={3} />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NavigationSkeleton() {
  return (
    <div className="border-b border-zinc-100">
      <div className="flex items-center justify-between px-4 py-3 sm:container">
        <Skeleton className="size-[60px]" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}

export function DiscoverPageSkeleton() {
  return (
    <div
      className="container mt-40 px-6 sm:px-8"
      role="status"
      aria-label="Loading discover page"
    >
      <span className="sr-only">Loading discover page</span>
      <Skeleton className="aspect-[7/2] w-[840px] max-w-full" />
      <Skeleton className="mt-8 h-7 w-[34rem] max-w-[90%]" />
      <Skeleton className="mt-8 h-16 w-24 md:h-12" />
      <div className="mt-10 border-t border-zinc-100 pt-6">
        <Skeleton className="mb-4 h-7 w-72 max-w-[80%]" />
        <DiscoverGridSkeleton />
      </div>
    </div>
  );
}

export function CreatePageSkeleton() {
  return (
    <div className="min-h-screen" role="status" aria-label="Loading creation form">
      <span className="sr-only">Loading creation form</span>
      <NavigationSkeleton />
      <div className="mx-auto my-20 grid max-w-6xl gap-6 px-4 sm:px-8 md:grid-cols-3 xl:px-0">
        {Array.from({ length: 3 }, (_, column) => (
          <div key={column} className="space-y-5 border border-zinc-100 bg-melon-50 p-5">
            <Skeleton className="h-7 w-40 max-w-[80%]" />
            <SkeletonLines lines={4} />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-24 w-full" />
            <SkeletonLines lines={3} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppLoadingSkeleton({ pathname }: { pathname: string }) {
  if (pathname === "/discover") return <DiscoverPageSkeleton />;
  if (pathname === "/create") return <CreatePageSkeleton />;
  return <ProjectPageSkeleton />;
}

export function ProjectPageSkeleton() {
  return (
    <div className="min-h-screen" role="status" aria-label="Loading project">
      <span className="sr-only">Loading project</span>
      <NavigationSkeleton />

      <div className="w-full px-4 pt-6 sm:container">
        <div className="mb-4 flex flex-col items-start gap-4 sm:mb-6 sm:flex-row sm:items-center">
          <Skeleton className="h-[120px] w-[120px] shrink-0 sm:size-36" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-8 w-72 max-w-[75%]" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-4 w-96 max-w-[85%]" />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6 px-4 pb-5 md:flex-row md:gap-10 sm:container">
        <aside className="w-full shrink-0 md:w-[300px]">
          <Skeleton className="mb-6 h-64 w-full" />
          <Skeleton className="mb-5 h-5 w-24" />
          <ActivityRows rows={5} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-10">
            <div className="flex gap-6 overflow-hidden border-b border-zinc-200 pb-2">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-5 w-20 shrink-0" />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </div>
            <ChartSkeleton className="aspect-[4/3] w-full sm:aspect-[2/1] lg:aspect-[5/2]" />
            <CardSkeleton rows={4} />
          </div>
        </div>
      </div>
    </div>
  );
}
