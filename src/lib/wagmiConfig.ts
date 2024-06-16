import { getDefaultConfig } from "connectkit";
import { sepolia } from "viem/chains";
import { createConfig, http } from "wagmi";

export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [sepolia],
    appName: "Revnet",
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    transports: {
      [sepolia.id]: http(
        `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
      ),
    },
  })
);
