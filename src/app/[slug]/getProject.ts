import { ProjectDocument, ProjectQuery, ProjectQueryVariables } from "@/generated/graphql";
import { getBendystrawClient } from "@/graphql/bendystrawClient";
import { Version } from "@/lib/version";
import { cache } from "react";

export const getProject = cache(async (projectId: number | bigint, chainId: number) => {
  try {
    const client = getBendystrawClient(chainId);
    const result = await client.request<ProjectQuery, ProjectQueryVariables>(ProjectDocument, {
      projectId: Number(projectId),
      chainId,
      version: 4 // TODO dynamic version
    });
    return result.project;
  } catch (err) {
    console.error((err as any).message);
    return null;
  }
});
