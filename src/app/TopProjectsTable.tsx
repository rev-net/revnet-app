import Image from "next/image";
import Link from "next/link";
import { getTopProjects } from "./getTopProjects";

export async function TopProjectsTable() {
  const projects = await getTopProjects();

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-lg font-medium mb-2.5 text-center">Top revnets by balance</h2>
      <table className="w-full max-w-xl text-left">
        <thead>
          <tr className="text-zinc-500 text-sm border-b border-zinc-100">
            <th className="pb-2 pr-2 font-normal w-8">#</th>
            <th className="pb-2 pr-4 font-normal">Project</th>
            <th className="pb-2 font-normal text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={`${project.chainId}-${project.projectId}`}
              className="border-b border-zinc-100 last:border-b-0"
            >
              <td className="py-3 pr-2 text-zinc-400 tabular-nums">{project.rank}</td>
              <td className="py-3 pr-4">
                <Link
                  href={`/v5:${project.chainSlug}:${project.projectId}`}
                  className="flex items-center gap-3 hover:opacity-70 transition-opacity"
                >
                  {project.logoUrl ? (
                    <Image
                      src={project.logoUrl}
                      alt={project.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-zinc-100 shrink-0" />
                  )}
                  <div>
                    <div className="max-sm:text-sm font-medium truncate">{project.name}</div>
                    {project.tagline && (
                      <div className="text-xs md:text-sm text-zinc-500 line-clamp-1">
                        {project.tagline}
                      </div>
                    )}
                  </div>
                </Link>
              </td>
              <td className="py-3 text-sm md:text-base text-right tabular-nums whitespace-nowrap">
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
