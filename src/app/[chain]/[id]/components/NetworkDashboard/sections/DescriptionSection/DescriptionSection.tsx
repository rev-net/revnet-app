import {
  useJBProjectMetadataContext,
} from "juice-sdk-react";
import { useState } from "react";
import { SectionTooltip } from "../SectionTooltip";

export function DescriptionSection() {
  const { metadata } = useJBProjectMetadataContext();
  const [isOpen, setIsOpen] = useState(false);
  
  const { description } = metadata?.data ?? {};

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Dropdown Header */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-left text-black-600"
      >
        <span
          className={`transform transition-transform font-sm ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        >
          ▶
        </span>
      <div className="flex flex-row space-x-2">
        <h2 className="text-2xl font-semibold">About</h2>
      </div>
      </button>
      {/* Dropdown Content */}
      {isOpen && 
        <div className="mt-2 text-gray-600 text-sm">
          <div className="mb-2">
            {description
              ? description.split("\n").map((d, idx) => (
            <p className="mb-3" key={idx}>
              {d}
            </p>
          ))
              : null}
          </div>
        </div>
      }
    </>
  );
}
