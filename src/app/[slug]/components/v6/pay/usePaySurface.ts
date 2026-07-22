"use client";

import {
  payTokenCurrencyId,
  routerPayRouteWorks,
  V6PayTokenOption,
} from "@/lib/v6/pay";
import {
  JB_CHAINS,
  JBChainId,
  jbContractAddress,
  JBCoreContracts,
  jbDirectoryAbi,
  JBRouterTerminalContracts,
  NATIVE_TOKEN,
  USDC_ADDRESSES,
} from "@bananapus/nana-sdk-core";
import { getAccountingContexts, getCurrentRuleset } from "@bananapus/nana-sdk-core/v6";
import { useQuery } from "@tanstack/react-query";
import { Address, erc20Abi, PublicClient } from "viem";
import { usePublicClient } from "wagmi";

export interface V6PaySurface {
  /** Directly accepted tokens first, then live-probed via-router options. */
  tokens: V6PayTokenOption[];
  /** Current ruleset start timestamp (seconds), 0 when unknown. */
  rulesetStart: number;
  pausePay: boolean;
  /** The project's listed payment terminals (JBDirectory.terminalsOf). */
  terminals: Address[];
}

/**
 * The project's payment surface on the selected chain: accepted tokens + live
 * ruleset gates (website/ readProjectPaymentSurface parity).
 *
 * Direct tokens = the multi terminal's accounting contexts. When the project
 * also lists the router terminal registry, native ETH and/or USDC that it does
 * NOT accept directly are offered as swap-via-router options — but ONLY when a
 * live `previewPayFor` probe through the registry succeeds (a listed router
 * with no route reverts at pay time). Built atomically so the token list is
 * never a partial snapshot.
 */
export function usePaySurface(chainId: JBChainId, projectId: bigint) {
  const publicClient = usePublicClient({ chainId });

  return useQuery({
    queryKey: ["v6PaySurface", chainId, projectId.toString()],
    enabled: !!publicClient,
    staleTime: 60_000,
    retry: 1,
    queryFn: async (): Promise<V6PaySurface> => {
      const client = publicClient as PublicClient;
      const nativeSymbol = JB_CHAINS[chainId]?.nativeTokenSymbol ?? "ETH";
      const directory = jbContractAddress[6][JBCoreContracts.JBDirectory][chainId];
      const routerRegistry = jbContractAddress[6][
        JBRouterTerminalContracts.JBRouterTerminalRegistry
      ]?.[chainId] as Address | undefined;

      const [contexts, ruleset, terminalsRaw] = await Promise.all([
        getAccountingContexts(client, { chainId, projectId }),
        getCurrentRuleset(client, { chainId, projectId }).catch(() => null),
        client
          .readContract({
            address: directory,
            abi: jbDirectoryAbi,
            functionName: "terminalsOf",
            args: [projectId],
          })
          .catch(() => [] as readonly Address[]),
      ]);

      const direct: V6PayTokenOption[] = await Promise.all(
        contexts.map(async (ctx) => ({
          token: ctx.token,
          decimals: ctx.decimals,
          currency: ctx.currency,
          viaRouter: false,
          symbol: await resolveSymbol(client, ctx.token, nativeSymbol),
        })),
      );

      const terminals = (terminalsRaw ?? []).filter(Boolean) as Address[];
      const hasRouter =
        !!routerRegistry &&
        terminals.some((t) => t.toLowerCase() === routerRegistry.toLowerCase());

      // Router candidates: ETH/USDC that aren't already accepted directly,
      // each gated by an actual previewPayFor route probe (cached).
      const has = (a: string) => direct.some((t) => t.token.toLowerCase() === a.toLowerCase());
      let routable: V6PayTokenOption[] = [];
      if (hasRouter && routerRegistry) {
        const candidates: V6PayTokenOption[] = [];
        if (!has(NATIVE_TOKEN)) {
          candidates.push({
            token: NATIVE_TOKEN as Address,
            decimals: 18,
            currency: payTokenCurrencyId(NATIVE_TOKEN as Address),
            symbol: nativeSymbol,
            viaRouter: true,
          });
        }
        const usdc = USDC_ADDRESSES[chainId];
        if (usdc && !has(usdc)) {
          candidates.push({
            token: usdc,
            decimals: 6,
            currency: payTokenCurrencyId(usdc),
            symbol: "USDC",
            viaRouter: true,
          });
        }
        const gated = await Promise.all(
          candidates.map(async (c) =>
            (await routerPayRouteWorks(client, chainId, projectId, routerRegistry, c.token, c.decimals))
              ? c
              : null,
          ),
        );
        routable = gated.filter((c): c is V6PayTokenOption => c !== null);
      }

      return {
        tokens: [...direct, ...routable],
        rulesetStart: ruleset ? Number(ruleset.ruleset.start) : 0,
        pausePay: ruleset ? ruleset.metadata.pausePay : false,
        terminals,
      };
    },
  });
}

async function resolveSymbol(
  client: PublicClient,
  token: Address,
  nativeSymbol: string,
): Promise<string> {
  if (token.toLowerCase() === NATIVE_TOKEN.toLowerCase()) return nativeSymbol;
  try {
    return await client.readContract({ address: token, abi: erc20Abi, functionName: "symbol" });
  } catch {
    return `${token.slice(0, 6)}…${token.slice(-4)}`;
  }
}
