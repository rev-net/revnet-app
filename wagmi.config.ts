import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { goerli } from "wagmi/chains";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  out: "src/lib/revnet/hooks/contract.ts",
  plugins: [
    etherscan({
      apiKey: process.env.ETHERSCAN_API_KEY!,
      chainId: goerli.id,
      contracts: [
        {
          name: "BasicRevnetDeployer",
          address: {
            [goerli.id]: "0x42369a6E077d5E3E6A8268FEb05A046369833c77",
          },
        },
      ],
    }),
    react(),
  ],
});
