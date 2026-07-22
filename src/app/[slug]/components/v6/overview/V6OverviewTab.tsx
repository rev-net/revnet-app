"use client";

import { DescriptionSection } from "../../../about/components/DescriptionSection";
import { ProjectItem } from "../shared";
import { OtherInfoPanel } from "./OtherInfoPanel";

/**
 * website/-parity Overview tab for V6 projects (renderAboutSection): the
 * about card (rich description, social links, Edit CTA for SET_PROJECT_URI
 * holders — all wired by DescriptionSection) and the "Other info" panel
 * (per-chain project IDs + operator).
 */
export function V6OverviewTab({ projects }: { projects: ProjectItem[] }) {
  return (
    <div className="flex flex-col min-w-0 gap-8">
      <div>
        <h3 className="mb-2 text-base font-semibold text-zinc-700">About</h3>
        <DescriptionSection projects={projects} />
        <div className="max-w-screen-sm">
        </div>
      </div>

      <OtherInfoPanel projects={projects} />
    </div>
  );
}
