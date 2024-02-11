import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import dotenv from "dotenv";
import { optimismSepolia, sepolia } from "wagmi/chains";

dotenv.config();

export default defineConfig([
  {
    out: "src/lib/revnet/hooks/contract.ts",
    plugins: [
      etherscan({
        apiKey: process.env.ETHERSCAN_API_KEY!,
        chainId: sepolia.id,
        contracts: [
          {
            name: "REVBasicDeployer",
            address: {
              [sepolia.id]: "0xb046ad707C2c311FbcC5B865611AEF24ddc57975",
              [optimismSepolia.id]:
                "0x4B8d42107487c86CA64845d3f650e4da9583A983",
            },
          },
        ],
      }),
      react(),
    ],
  },
]);
