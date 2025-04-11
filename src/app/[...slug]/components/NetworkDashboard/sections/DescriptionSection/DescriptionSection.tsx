"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify"
import { useJBProjectMetadataContext } from "juice-sdk-react";

const RichPreview = ({ source }: { source: string }) => {
  useEffect(() => {
    DOMPurify.addHook("afterSanitizeAttributes", function(node) {
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
    const purified = DOMPurify.sanitize(source)
    return (
      <div
        className="break-words [&_a]:underline [&_a]:text-gray-600 [&_a:hover]:text-gray-800"
        dangerouslySetInnerHTML={{
          __html: purified,
        }}
      />
    )
  } catch (error) {
    console.error("HTML sanitization failed:", error)
    return <div className="break-words">{source}</div>
  }
}

export function DescriptionSection() {
  const { metadata } = useJBProjectMetadataContext();
  const [isOpen, setIsOpen] = useState(false);

  const { description } = metadata?.data ?? {};

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-left text-black-600"
      >
        <div className="flex flex-row space-x-2">
          <h2 className="text-2xl font-semibold">About</h2>
        </div>
        <span
          className={`transform transition-transform font-sm ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        >
          ▶
        </span>
      </button>
      {isOpen && (
        <div className="mt-2 text-gray-600 text-sm">
          <RichPreview source={description || ""} />
        </div>
      )}
    </>
  );
}
