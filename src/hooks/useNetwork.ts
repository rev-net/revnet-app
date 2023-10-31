import { Chain, useConfig, useNetwork as useNetworkWagmi } from "wagmi";

/**
 * Return the chain that the user is currently connected to.
 * If user is not connected, return the public chain. (configured in wagmiConfig)
 * @returns {Chain}
 */
export function useChain(): Chain {
  const { chain } = useNetworkWagmi();
  const { publicClient } = useConfig();
  return chain ?? publicClient.chain;
}
