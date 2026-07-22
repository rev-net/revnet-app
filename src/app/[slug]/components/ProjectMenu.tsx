"use client";

import { useJBContractContext } from "@bananapus/nana-sdk-react";
import clsx from "clsx";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";
import { PropsWithChildren } from "react";

export function ProjectMenu({
  mobileActivityActive = false,
  onMobileActivityChange,
}: {
  mobileActivityActive?: boolean;
  onMobileActivityChange?: (active: boolean) => void;
}) {
  const { version } = useJBContractContext();

  // v6 projects get the full website/-parity tab set; earlier versions keep the
  // original tabs untouched.
  if (version === 6) {
    return (
      <div className="overflow-x-auto">
        <ul className="flex w-max min-w-full gap-4 border-b border-zinc-200 sm:gap-6">
          <MobileActivityOption
            active={mobileActivityActive}
            onSelect={() => onMobileActivityChange?.(true)}
          />
          <MenuOption
            href=""
            forceInactive={mobileActivityActive}
            onSelect={() => onMobileActivityChange?.(false)}
          >
            Overview
          </MenuOption>
          <MenuOption
            href="terms"
            forceInactive={mobileActivityActive}
            onSelect={() => onMobileActivityChange?.(false)}
          >
            Terms
          </MenuOption>
          <MenuOption
            href="owners"
            forceInactive={mobileActivityActive}
            onSelect={() => onMobileActivityChange?.(false)}
          >
            Owners
          </MenuOption>
          <MenuOption
            href="shop"
            forceInactive={mobileActivityActive}
            onSelect={() => onMobileActivityChange?.(false)}
          >
            Shop
          </MenuOption>
          <MenuOption
            href="extras"
            forceInactive={mobileActivityActive}
            onSelect={() => onMobileActivityChange?.(false)}
          >
            Extras
          </MenuOption>
          <MenuOption
            href="operator"
            forceInactive={mobileActivityActive}
            onSelect={() => onMobileActivityChange?.(false)}
          >
            Operator
          </MenuOption>
        </ul>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <ul className="flex w-max min-w-full gap-4 border-b border-zinc-200 sm:gap-6">
        <MobileActivityOption
          active={mobileActivityActive}
          onSelect={() => onMobileActivityChange?.(true)}
        />
        <MenuOption
          href=""
          forceInactive={mobileActivityActive}
          onSelect={() => onMobileActivityChange?.(false)}
        >
          About
        </MenuOption>
        <MenuOption
          href="terms"
          forceInactive={mobileActivityActive}
          onSelect={() => onMobileActivityChange?.(false)}
        >
          Terms
        </MenuOption>
        <MenuOption
          href="owners"
          forceInactive={mobileActivityActive}
          onSelect={() => onMobileActivityChange?.(false)}
        >
          Owners
        </MenuOption>
        <MenuOption
          href="ops"
          forceInactive={mobileActivityActive}
          onSelect={() => onMobileActivityChange?.(false)}
        >
          Ops
        </MenuOption>
      </ul>
    </div>
  );
}

function MobileActivityOption({ active, onSelect }: { active: boolean; onSelect: () => void }) {
  return (
    <li className="flex items-start min-[601px]:hidden">
      <button
        type="button"
        onClick={onSelect}
        className={clsx(
          "-mb-px flex min-h-11 items-center whitespace-nowrap border-b-2 pb-2 text-base font-medium uppercase transition-all",
          active
            ? "border-teal-500 text-black"
            : "border-transparent text-zinc-500 hover:text-zinc-800",
        )}
      >
        Activity
      </button>
    </li>
  );
}

function MenuOption({
  href,
  children,
  badge,
  forceInactive = false,
  onSelect,
}: PropsWithChildren<{
  href: string;
  badge?: string;
  forceInactive?: boolean;
  onSelect?: () => void;
}>) {
  const params = useParams<{ slug: string }>();
  const segment = useSelectedLayoutSegment();
  const isSelected = !forceInactive && (segment || "") === href;

  return (
    <li className="flex items-start gap-2">
      <Link
        href={`/${decodeURIComponent(params.slug)}/${href}`}
        onClick={onSelect}
        className={clsx(
          // -mb-px drops the active border onto the row's persistent baseline.
          "-mb-px flex min-h-11 items-center whitespace-nowrap border-b-2 pb-2 text-base font-medium uppercase transition-all sm:text-lg",
          {
            "text-black border-teal-500": isSelected,
            "text-zinc-500 hover:text-zinc-800 border-transparent": !isSelected,
          },
        )}
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
