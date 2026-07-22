import Image from "next/image";
import Link from "next/link";
import { getTopProjects } from "./getTopProjects";

export async function TopProjectsTable() {
  const projects = await getTopProjects();

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 min-w-0">
      <table className="w-full max-w-xl table-fixed text-left">
        <colgroup>
          <col className="w-10 sm:w-16" />
          <col />
          <col className="w-20 sm:w-32" />
        </colgroup>
        <thead>
          <tr className="h-12 border-b border-zinc-100 text-sm text-zinc-500">
            <th className="py-0 pl-4 pr-2 align-middle font-normal sm:pl-8 sm:pr-4" />
            <th className="px-2 align-middle font-normal sm:px-4">Project</th>
            <th className="py-0 pl-2 pr-4 text-right align-middle font-normal sm:pl-4 sm:pr-8">
              Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={`${project.chainId}-${project.projectId}`}
              className="border-b border-zinc-100 last:border-b-0"
            >
              <td className="py-3 pl-4 pr-2 text-zinc-400 tabular-nums sm:pl-8 sm:pr-4">
                {project.rank}
              </td>
              <td className="min-w-0 px-2 py-3 sm:px-4">
                <Link
                  href={`/v${project.version}:${project.chainSlug}:${project.projectId}`}
                  className="group flex min-h-11 min-w-0 items-center gap-2 sm:gap-3"
                >
                  {project.logoUrl ? (
                    <Image
                      src={project.logoUrl}
                      alt={project.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover shrink-0 group-hover:opacity-70 transition-opacity"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-zinc-100 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="max-sm:text-sm font-medium truncate group-hover:text-teal-600 transition-colors">
                      {project.name}
                    </div>
                    {project.tagline && (
                      <div className="text-xs md:text-sm text-zinc-500 line-clamp-1">
                        {project.tagline}
                      </div>
                    )}
                  </div>
                </Link>
              </td>
              <td className="whitespace-nowrap py-3 pl-2 pr-4 text-right text-sm tabular-nums sm:pl-4 sm:pr-8 md:text-base">
                {project.balanceUsd.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
