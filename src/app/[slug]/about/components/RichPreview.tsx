"use client";

import DOMPurify from "dompurify";
import { useEffect } from "react";

export const RichPreview = ({ source }: { source: string }) => {
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
    const purified = DOMPurify.sanitize(source.trim());
    return (
      <div
        className="break-words [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:decoration-teal-500"
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
