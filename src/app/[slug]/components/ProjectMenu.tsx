"use client";

import clsx from "clsx";
import { JBProjectToken } from "juice-sdk-core";
import { useSuckersUserTokenBalance } from "juice-sdk-react";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";
import { PropsWithChildren } from "react";

export function ProjectMenu() {
  const { data: balances } = useSuckersUserTokenBalance();

  const totalBalance = new JBProjectToken(
    balances?.reduce((acc, curr) => acc + curr.balance.value, 0n) ?? 0n,
  );

  return (
    <ul className="flex gap-4 sm:gap-6">
      <MenuOption href="">Activity</MenuOption>
      <MenuOption href="terms">Terms</MenuOption>
      <MenuOption href="owners">Owners</MenuOption>
      <MenuOption href="about">About</MenuOption>
      {totalBalance.value > 0n && (
        <MenuOption href="you" badge={totalBalance.format(2)}>
          You
        </MenuOption>
      )}
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
    <li className="flex items-start gap-1">
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
        <span className="rounded-xl bg-teal-400 text-white text-xs px-1.5 py-0.5">{badge}</span>
      )}
    </li>
  );
}
