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
            [goerli.id]: "0x04b70D5B629464C555fca5aAC0dA70302d351D62",
          },
        },
      ],
    }),
    react(),
  ],
});
