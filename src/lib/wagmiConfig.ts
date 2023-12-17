import { getDefaultConfig } from "connectkit";
import { sepolia } from "viem/chains";
import { createConfig } from "wagmi";

export const wagmiConfig = createConfig(
  getDefaultConfig({
    autoConnect: true,
    appName: "Revnet",
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    infuraId: process.env.NEXT_PUBLIC_INFURA_ID!,
    chains: [sepolia],
  })
);
