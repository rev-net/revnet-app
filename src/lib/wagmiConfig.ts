import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";
import { cache } from "react";
import { createPublicClient } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
} from "viem/chains";
import { createConfig, fallback, http } from "wagmi";
import { coinbaseWallet, safe, walletConnect } from "wagmi/connectors";

const safeConnector = safe({
  allowedDomains: [/^app\.safe\.global$/],
  debug: true,
  shimDisconnect: true,
});

const chains = [
  mainnet,
  optimism,
  arbitrum,
  base,
  sepolia,
  optimismSepolia,
  baseSepolia,
  arbitrumSepolia,
] as const;

const transports = {
  [sepolia.id]: fallback([
    http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
    http("https://eth-sepolia.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
  ]),
  [optimismSepolia.id]: fallback([
    http(`https://optimism-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
    http("https://opt-sepolia.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
  ]),
  [baseSepolia.id]: fallback([
    http("https://base-sepolia.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
    http(
      `https://api.developer.coinbase.com/rpc/v1/base-sepolia/${process.env.NEXT_PUBLIC_BASE_ID}`,
    ),
  ]),
  [arbitrumSepolia.id]: fallback([
    http(`https://arbitrum-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
    http("https://arb-sepolia.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
  ]),
  [mainnet.id]: fallback([
    http(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
    http("https://eth-mainnet.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
  ]),
  [optimism.id]: fallback([
    http(`https://optimism-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
    http("https://opt-mainnet.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
  ]),
  [base.id]: fallback([
    http(`https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
    http(`https://api.developer.coinbase.com/rpc/v1/base/${process.env.NEXT_PUBLIC_BASE_ID}`),
    http("https://base-mainnet.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
  ]),
  [arbitrum.id]: fallback([
    http(`https://arbitrum-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
    http("https://arb-mainnet.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
  ]),
};

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    miniAppConnector(),
    safeConnector,
    coinbaseWallet({
      appName: "REVNET",
      appLogoUrl: "https://app.revnet.eth.sucks/assets/img/small-bw.svg",
    }),
    // Only initialize WalletConnect in the browser
    ...(typeof window !== "undefined"
      ? [
          walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
            showQrModal: false,
            metadata: {
              name: "REVNET",
              description: "Tokenize revenues and fundraises. 100% autonomous.",
              url: "https://app.revnet.eth.sucks",
              icons: ["https://app.revnet.eth.sucks/assets/img/small-bw.svg"],
            },
          }),
        ]
      : []),
  ],
  transports,
});

export const getViemPublicClient = cache((chainId: keyof typeof transports) => {
  const transport = transports[chainId];
  if (!transport) throw new Error(`Transport not found for chainId: ${chainId}`);

  return createPublicClient({
    batch: { multicall: true },
    chain: chains.find((chain) => chain.id === chainId),
    transport,
  });
});
