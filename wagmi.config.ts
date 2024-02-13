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
              [sepolia.id]: "0x8096A07Da9f5EC18f3b82921a2Db8fCCb5D71847",
              [optimismSepolia.id]:
                "0xab0Cc21b3533C4F36A886493F0871Ce16Eb85c5a",
            },
          },
        ],
      }),
      react(),
    ],
  },
]);
