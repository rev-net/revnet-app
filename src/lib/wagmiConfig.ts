import { getDefaultConfig } from "connectkit";
import {
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
  sepolia,
} from "viem/chains";
import { createConfig, http } from "wagmi";

const defaultConfig = getDefaultConfig({
  chains: [sepolia, optimismSepolia, baseSepolia, arbitrumSepolia],
  appName: "REVNET",
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  transports: {
    [sepolia.id]: http(
      `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
    ),
    [optimismSepolia.id]: http(
      `https://optimism-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
    ),
    [baseSepolia.id]: http(
      `https://api.developer.coinbase.com/rpc/v1/base-sepolia/${process.env.NEXT_PUBLIC_BASE_ID}`
    ),
    [arbitrumSepolia.id]: http(
      `https://arbitrum-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
    ),
  },
});

export const wagmiConfig = createConfig(defaultConfig);
