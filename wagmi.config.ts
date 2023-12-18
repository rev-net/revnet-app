import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { goerli, sepolia } from "wagmi/chains";
import dotenv from "dotenv";
dotenv.config();
import addresses from "./addresses.json";
import { sep } from "path";

const juiceboxContracts = Object.keys(addresses).map((name) => {
  return {
    name,
    address: {
      [sepolia.id]: (addresses as any)[name].sepolia as `0x${string}`,
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
              [sepolia.id]: "0x5f1fFe756b4F8206e8e29c3f3a481Eea087CFE47",
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
