"use client";

import { formatTokenSymbol } from "@/lib/utils";
import clsx from "clsx";
import { useJBTokenContext } from "juice-sdk-react";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";
import { PropsWithChildren } from "react";

export function ProjectMenu() {
  const { token } = useJBTokenContext();

  return (
    <ul className="flex gap-4 sm:gap-6">
      <MenuOption href="">Activity</MenuOption>
      <MenuOption href="terms">Terms</MenuOption>
      <MenuOption href="owners">Owners</MenuOption>
      <MenuOption href="about">About</MenuOption>
      <MenuOption href="you">{formatTokenSymbol(token)}</MenuOption>
    </ul>
  );
}

function MenuOption({
  href,
  children,
  badge,
}: PropsWithChildren<{ href: string; badge?: string }>) {
  const params = useParams<{ slug: string }>();
  const segment = useSelectedLayoutSegment();
  const isSelected = (segment || "") === href;

  return (
    <li className="flex items-start gap-2">
      <Link
        href={`/${decodeURIComponent(params.slug)}/${href}`}
        className={clsx("flex items-start text-xl sm:text-2xl font-medium transition-all", {
          "text-black underline decoration-teal-500 underline-offset-8 decoration-2": isSelected,
          "text-zinc-500 hover:text-zinc-800": !isSelected,
        })}
      >
        {children}
      </Link>
      {badge && (
        <span className="rounded-xl border border-teal-400 text-teal-500 font-medium text-[13px] px-2 py-1">
          {badge}
        </span>
      )}
    </li>
  );
}
