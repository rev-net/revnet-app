import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import dotenv from "dotenv";
import { optimismSepolia, sepolia } from "wagmi/chains";
import addresses from "./addresses.json";

dotenv.config();

const juiceboxContracts = Object.keys(addresses).map((name) => {
  return {
    name,
    address: {
      [sepolia.id]: (addresses as any)[name].sepolia as `0x${string}`,
      [optimismSepolia.id]: (addresses as any)[name]
        .optimismSepolia as `0x${string}`,
    },
  };
});

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
              [sepolia.id]: "0xAE21bf6aD00B9E33218f0D21c89ce463449c2e4d",
              [optimismSepolia.id]:
                "0x9D4baed80284a032F6B553E6b514Dd9f32273a48",
            },
          },
        ],
      }),
      react(),
    ],
  },
  {
    out: "src/lib/juicebox/hooks/contract.ts",
    plugins: [
      etherscan({
        apiKey: process.env.ETHERSCAN_API_KEY!,
        chainId: sepolia.id,
        contracts: [...juiceboxContracts],
      }),
      react(),
    ],
  },
]);
