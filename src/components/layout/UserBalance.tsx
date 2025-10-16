"use client";

import { formatTokenSymbol } from "@/lib/utils";
import { JBProjectToken } from "juice-sdk-core";
import { useJBTokenContext, useSuckersUserTokenBalance } from "juice-sdk-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function UserBalance() {
  const { data: balances, isLoading } = useSuckersUserTokenBalance();
  const { token } = useJBTokenContext();
  const { slug } = useParams<{ slug: string }>();

  const totalBalance = new JBProjectToken(
    balances?.reduce((acc, curr) => acc + curr.balance.value, 0n) ?? 0n,
  );

  if (isLoading || token.isLoading) return <div className="animate-pulse w-24 grow bg-zinc-100" />;

  return (
    <Link
      className="text-black border border-zinc-200 px-2 py-1 flex items-center hover:bg-zinc-100 duration-75"
      href={`/${decodeURIComponent(slug)}/you`}
    >
      {totalBalance.format(2)}{" "}
      <span className="text-teal-500 ml-1.5 font-medium">{formatTokenSymbol(token)}</span>
    </Link>
  );
}
