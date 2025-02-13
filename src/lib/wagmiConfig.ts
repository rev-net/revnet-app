import { getDefaultConfig } from "connectkit";
import {
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
  sepolia,
} from "viem/chains";
import { createConfig, http, fallback } from "wagmi";

const defaultConfig = getDefaultConfig({
  chains: [sepolia, optimismSepolia, baseSepolia, arbitrumSepolia],
  appName: "REVNET",
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  transports: {
    [sepolia.id]: fallback([
      http("https://eth-sepolia.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
      http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
    ]),
    [optimismSepolia.id]: fallback([
      http("https://opt-sepolia.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
      http(`https://optimism-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
    ]),
    [baseSepolia.id]: fallback([
      http(`https://api.developer.coinbase.com/rpc/v1/base-sepolia/${process.env.NEXT_PUBLIC_BASE_ID}`),
      http("https://base-sepolia.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
    ]),
    [arbitrumSepolia.id]: fallback([
      http("https://arb-sepolia.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
      http(`https://arbitrum-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
    ]),
  },
});

export const wagmiConfig = createConfig(defaultConfig);
