import {
  getJBContractAddress,
  JBChainId,
  jbContractAddress,
  JBCoreContracts,
  jbDirectoryAbi,
  jbMultiTerminalAbi,
  jbRouterTerminalRegistryAbi,
  JBRouterTerminalContracts,
  jbSwapTerminalAbi,
  JBSwapTerminalContracts,
  JBVersion,
} from "@bananapus/nana-sdk-core";
import { PayPreview, previewPay, resolvePaymentTerminal } from "@bananapus/nana-sdk-core/v6";
import { Address, getContract, PublicClient, zeroAddress } from "viem";
import { Token } from "./token";

export type PaymentTerminalType = "multi" | "swap";

export type PaymentTerminal = {
  address: Address;
  abi: typeof jbMultiTerminalAbi | typeof jbRouterTerminalRegistryAbi | typeof jbSwapTerminalAbi;
  type: PaymentTerminalType;
};

export type V6PayRoute = PaymentTerminal & { preview: PayPreview };

export async function getPaymentTerminal(args: {
  client: PublicClient;
  version: JBVersion;
  chainId: JBChainId;
  projectId: bigint;
  tokenIn: Token;
  baseToken: Pick<Token, "isNative">;
}): Promise<PaymentTerminal> {
  const { client, version, chainId, projectId, tokenIn, baseToken } = args;

  // v6 replaced the swap terminal with the router terminal registry, which routes payments
  // in any token regardless of the project's accounting token. `resolvePaymentTerminal`
  // falls back to it when the project has no primary terminal for the token.
  if (version === 6) {
    const resolved = await resolvePaymentTerminal(client, {
      chainId,
      projectId,
      token: tokenIn.address,
    });
    const registry = getJBContractAddress(
      JBRouterTerminalContracts.JBRouterTerminalRegistry,
      version,
      chainId,
    );
    const isRouter =
      resolved.isRouter || resolved.address.toLowerCase() === registry.toLowerCase();

    return {
      address: resolved.address,
      abi: isRouter ? jbRouterTerminalRegistryAbi : jbMultiTerminalAbi,
      type: isRouter ? "swap" : "multi",
    };
  }

  const directory = getContract({
    address: getJBContractAddress(JBCoreContracts.JBDirectory, version, chainId),
    abi: jbDirectoryAbi,
    client,
  });

  const terminal = await directory.read.primaryTerminalOf([projectId, tokenIn.address]);

  if (!terminal) {
    throw new Error(`No primary terminal found for ${tokenIn.symbol}`);
  }

  const swapTerminal = getSwapTerminalAddress(version, chainId, baseToken.isNative);

  if (terminal === zeroAddress) {
    if (!swapTerminal) {
      throw new Error(`No swap terminal available for ${tokenIn.symbol} on this chain`);
    }
    return { address: swapTerminal, abi: jbSwapTerminalAbi, type: "swap" };
  }

  const isSwapTerminal = terminal.toLowerCase() === swapTerminal?.toLowerCase();

  return {
    address: terminal,
    abi: isSwapTerminal ? jbSwapTerminalAbi : jbMultiTerminalAbi,
    type: isSwapTerminal ? "swap" : "multi",
  };
}

/**
 * Resolve the best v6 pay route by previewing both the multi terminal and the router
 * terminal registry, keeping whichever mints the beneficiary the most project tokens.
 * Candidates whose preview reverts (e.g. no accounting context for the token) are
 * skipped, so a surviving route always carries a live quote.
 */
export async function resolveBestV6PayRoute(args: {
  client: PublicClient;
  chainId: JBChainId;
  projectId: bigint;
  token: Address;
  amount: bigint;
  beneficiary: Address;
}): Promise<V6PayRoute | null> {
  const { client, chainId, projectId, token, amount, beneficiary } = args;

  const previews = await Promise.all(
    v6PayRouteCandidates(chainId).map(async (route) => {
      try {
        const preview = await previewPay(client, {
          chainId,
          terminal: route.address,
          projectId,
          token,
          amount,
          beneficiary,
          metadata: "0x",
        });
        return { ...route, preview };
      } catch {
        return null;
      }
    }),
  );

  let best: V6PayRoute | null = null;
  for (const route of previews) {
    if (!route) continue;
    if (!best || v6PayRouteIsBetter(route, best)) best = route;
  }
  return best;
}

function v6PayRouteCandidates(chainId: JBChainId): PaymentTerminal[] {
  const routes: PaymentTerminal[] = [];

  try {
    routes.push({
      address: getJBContractAddress(JBRouterTerminalContracts.JBRouterTerminalRegistry, 6, chainId),
      abi: jbRouterTerminalRegistryAbi,
      type: "swap",
    });
  } catch {
    // Router registry not deployed on this chain.
  }

  const multi = jbContractAddress[6].JBMultiTerminal[chainId];
  if (multi && !routes.some((route) => route.address.toLowerCase() === multi.toLowerCase())) {
    routes.push({ address: multi, abi: jbMultiTerminalAbi, type: "multi" });
  }

  return routes;
}

function v6PayRouteIsBetter(candidate: V6PayRoute, current: V6PayRoute): boolean {
  if (candidate.preview.beneficiaryTokenCount !== current.preview.beneficiaryTokenCount) {
    return candidate.preview.beneficiaryTokenCount > current.preview.beneficiaryTokenCount;
  }
  const candidateTotal =
    candidate.preview.beneficiaryTokenCount + candidate.preview.reservedTokenCount;
  const currentTotal = current.preview.beneficiaryTokenCount + current.preview.reservedTokenCount;
  if (candidateTotal !== currentTotal) return candidateTotal > currentTotal;

  // Prefer the direct multi terminal over the router when quotes tie.
  return candidate.type === "multi" && current.type !== "multi";
}

function getSwapTerminalAddress(version: JBVersion, chainId: JBChainId, isNative: boolean) {
  if (version === 4) {
    return jbContractAddress[4].JBSwapTerminal1_1[chainId];
  }

  return getJBContractAddress(
    isNative
      ? JBSwapTerminalContracts.JBSwapTerminalRegistry
      : JBSwapTerminalContracts.JBSwapTerminalUSDCRegistry,
    version,
    chainId,
  );
}
