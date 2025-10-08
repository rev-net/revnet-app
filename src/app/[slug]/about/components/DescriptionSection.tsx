"use client";

import { useUserPermissions } from "@/hooks/useUserPermissions";
import DOMPurify from "dompurify";
import { useJBProjectMetadataContext } from "juice-sdk-react";
import { useEffect } from "react";
import { EditMetadataDialog } from "./EditMetadataDialog";

const RichPreview = ({ source }: { source: string }) => {
  useEffect(() => {
    DOMPurify.addHook("afterSanitizeAttributes", function (node) {
      if (node.tagName === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
  }, []);

  if (!source?.trim()) {
    return null;
  }

  try {
    const purified = DOMPurify.sanitize(source);
    return (
      <div
        className="break-words [&_a]:underline [&_a]:text-gray-600 [&_a:hover]:text-gray-800"
        dangerouslySetInnerHTML={{
          __html: purified,
        }}
      />
    );
  } catch (error) {
    console.error("HTML sanitization failed:", error);
    return <div className="break-words">{source}</div>;
  }
};

export function DescriptionSection() {
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
          <EditMetadataDialog />
        </div>
      )}
    </div>
  );
}
