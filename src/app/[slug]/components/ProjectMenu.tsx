"use client";

import clsx from "clsx";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";
import { PropsWithChildren } from "react";

export function ProjectMenu() {
  return (
    <ul className="flex gap-4 sm:gap-6">
      <MenuOption href="">Activity</MenuOption>
      <MenuOption href="terms">Terms</MenuOption>
      <MenuOption href="owners">Owners</MenuOption>
      <MenuOption href="about">About</MenuOption>
    </ul>
  );
}

function MenuOption({ href, children }: PropsWithChildren<{ href: string }>) {
  const params = useParams<{ slug: string }>();
  const segment = useSelectedLayoutSegment();
  const isSelected = (segment || "") === href;

  return (
    <li>
      <Link
        href={`/${decodeURIComponent(params.slug)}/${href}`}
        className={clsx("text-xl sm:text-2xl font-medium transition-all", {
          "text-black underline decoration-teal-500 underline-offset-8 decoration-2":
            isSelected,
          "text-zinc-500 hover:text-zinc-800": !isSelected,
        })}
      >
        {children}
      </Link>
    </li>
  );
}
