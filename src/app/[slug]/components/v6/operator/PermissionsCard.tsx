"use client";

import { ChainLogo } from "@/components/ChainLogo";
import { EthereumAddress } from "@/components/EthereumAddress";
import { SkeletonLines } from "@/components/ui/skeleton";
import { JB_CHAINS, JBChainId } from "@bananapus/nana-sdk-core";
import { useBendystrawQuery, useJBContractContext } from "@bananapus/nana-sdk-react";
import { useMemo } from "react";
import { Address, isAddress } from "viem";
import {
  ChainProjectRow,
  PermissionHolderRow,
  PermissionHoldersDocument,
  permissionHoldersWhere,
} from "./operatorLib";
import { permissionInfo } from "./permissionMeta";

type Grant = {
  operator: Address;
  isRevnetOperator: boolean;
  rows: PermissionHolderRow[];
  /** Union of granted permission ids across chains, ascending. */
  union: number[];
  /** True when a chain is missing the grant or the sets differ by chain. */
  differs: boolean;
};

function samePermissionSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const aa = [...a].sort((x, y) => x - y);
  const bb = [...b].sort((x, y) => x - y);
  return aa.every((value, index) => value === bb[index]);
}

function aggregateGrants(items: PermissionHolderRow[], rows: ChainProjectRow[]): Grant[] {
  const groups = new Map<string, Grant>();
  for (const item of items) {
    const permissions = (item.permissions ?? []).map(Number).filter((id) => id > 0);
    if (!permissions.length) continue; // stale/cleared grant — holds nothing
    if (!isAddress(item.operator)) continue;
    const key = item.operator.toLowerCase();
    const grant = groups.get(key) ?? {
      operator: item.operator as Address,
      isRevnetOperator: false,
      rows: [],
      union: [],
      differs: false,
    };
    grant.rows.push(item);
    grant.isRevnetOperator ||= Boolean(item.isRevnetOperator);
    grant.union = [...new Set([...grant.union, ...permissions])].sort((a, b) => a - b);
    groups.set(key, grant);
  }
  for (const grant of groups.values()) {
    const first = (grant.rows[0]?.permissions ?? []).map(Number).filter((id) => id > 0);
    const coveredChains = new Set(grant.rows.map((row) => row.chainId));
    grant.differs =
      rows.some((row) => !coveredChains.has(row.chainId)) ||
      grant.rows.some(
        (row) =>
          !samePermissionSet(
            first,
            (row.permissions ?? []).map(Number).filter((id) => id > 0),
          ),
      );
  }
  return [...groups.values()];
}

/**
 * website/-parity renderPermissionsCard, revnet branch: a READ-ONLY list of
 * every permission holder across the sucker group's chains and the human
 * meaning of each granted v6 permission id. The operator role is set on the
 * revnet itself (REVOwner), not via setPermissionsFor here.
 */
export function PermissionsCard({ rows }: { rows: ChainProjectRow[] }) {
  const { version } = useJBContractContext();
  const query = useBendystrawQuery(
    PermissionHoldersDocument,
    { where: permissionHoldersWhere(rows, version) },
    { enabled: rows.length > 0 },
  );
  const grants = useMemo(
    () => aggregateGrants(query.data?.permissionHolders?.items ?? [], rows),
    [query.data, rows],
  );

  return (
    <div>
      <h3 className="mb-2 text-base font-semibold text-zinc-700">Permissions</h3>
      <div className="max-w-screen-sm">
        <p className="text-sm text-zinc-500">
          What this revnet&apos;s operator is allowed to do. These powers come with the operator
          role — the default revnet powers plus any NFT powers granted when the revnet was deployed.
        </p>
        {query.isLoading ? (
          <SkeletonLines lines={4} className="mt-3" />
        ) : query.isError ? (
          <p className="text-sm text-zinc-500 mt-3">Could not read permissions.</p>
        ) : grants.length === 0 ? (
          <p className="text-sm text-zinc-500 mt-3">No operator permissions found.</p>
        ) : (
          <div className="mt-3 divide-y divide-melon-200 bg-melon-50 px-4">
            {grants.map((grant) => (
              <div key={grant.operator} className="py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <EthereumAddress
                    address={grant.operator}
                    short
                    withEnsName
                    chain={JB_CHAINS[grant.rows[0]?.chainId as JBChainId]?.chain}
                  />
                  {grant.isRevnetOperator ? (
                    <span className="rounded-full bg-teal-50 text-teal-700 px-2 py-0.5 text-[11px] font-medium">
                      Operator
                    </span>
                  ) : null}
                  {grant.differs ? (
                    <span className="rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[11px] font-medium">
                      Differs by chain
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 space-y-2">
                  {grant.union.map((id) => {
                    const info = permissionInfo(id);
                    const onChains = grant.rows
                      .filter((row) => (row.permissions ?? []).map(Number).includes(id))
                      .map((row) => row.chainId);
                    return (
                      <div
                        key={id}
                        className="grid gap-x-3 gap-y-0.5 sm:grid-cols-[12rem_1fr_auto]"
                      >
                        <span className="text-sm font-medium">
                          {info.label}
                          <span className="ml-1 font-mono text-[10px] text-zinc-400">#{id}</span>
                        </span>
                        <span className="text-xs text-zinc-500">{info.description}</span>
                        <span className="flex items-center gap-1" title="Granted on">
                          {onChains.map((chainId) => (
                            <ChainLogo
                              key={chainId}
                              chainId={chainId as JBChainId}
                              width={14}
                              height={14}
                            />
                          ))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
