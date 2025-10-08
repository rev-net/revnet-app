"use client";

import { Project } from "@/generated/graphql";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useJBProjectMetadataContext } from "juice-sdk-react";
import { EditMetadataDialog } from "./EditMetadataDialog";
import { RichPreview } from "./RichPreview";

interface Props {
  projects: Array<Pick<Project, "projectId" | "token" | "chainId">>;
}

export function DescriptionSection({ projects }: Props) {
  const { metadata } = useJBProjectMetadataContext();
  const { hasPermission } = useUserPermissions();

  const { description } = metadata?.data ?? {};
  const canEditMetadata = hasPermission("SET_PROJECT_URI");

  return (
    <div className="max-w-screen-sm">
      <div className="text-gray-600 text-base">
        <RichPreview source={description || ""} />
      </div>
      {canEditMetadata && (
        <div className="mt-4">
          <EditMetadataDialog projects={projects} />
        </div>
      )}
    </div>
  );
}
