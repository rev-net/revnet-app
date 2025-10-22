import {
  getJBContractAddress,
  JBChainId,
  JBCoreContracts,
  jbDirectoryAbi,
  jbMultiTerminalAbi,
  jbSwapTerminalAbi,
  JBSwapTerminalContracts,
  JBVersion,
} from "juice-sdk-core";
import { getContract, PublicClient, zeroAddress } from "viem";
import { Token } from "./token";

export async function getPaymentTerminal(args: {
  client: PublicClient;
  version: JBVersion;
  chainId: JBChainId;
  projectId: bigint;
  token: Token;
}) {
  const { client, version, chainId, projectId, token } = args;

  const directory = getContract({
    address: getJBContractAddress(JBCoreContracts.JBDirectory, version, chainId),
    abi: jbDirectoryAbi,
    client,
  });

  const terminal = await directory.read.primaryTerminalOf([projectId, token.address]);

  if (!terminal) {
    throw new Error(`No primary terminal found for ${token.symbol}`);
  }

  const swapTerminal = getJBContractAddress(
    token.isNative
      ? JBSwapTerminalContracts.JBSwapTerminalRegistry
      : JBSwapTerminalContracts.JBSwapTerminalUSDCRegistry,
    version,
    chainId,
  );

  if (terminal === zeroAddress) {
    return { address: swapTerminal, abi: jbSwapTerminalAbi, type: "swap" };
  }

  const isSwapTerminal = terminal.toLowerCase() === swapTerminal.toLowerCase();

  return {
    address: terminal,
    abi: isSwapTerminal ? jbSwapTerminalAbi : jbMultiTerminalAbi,
    type: isSwapTerminal ? "swap" : "multi",
  };
}
