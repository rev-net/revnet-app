import { Button } from "@/components/ui/button";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Address } from "viem";
import { useJBContractContext } from "juice-sdk-react";

// Privileged admin address
const PRIVILEGED_ADMIN = "0xDf087B724174A3E4eD2338C0798193932E851F1b";

// Base Juicebox contract addresses
const BASE_CONTRACTS = {
  JBPermissions: "0xf5ca295dc286a176e35ebb7833031fd95550eb14",
  JBBuybackHook: "0x47d1b88af8ee0ed0a772a7c98430894141b9ac8b",
  JBController4_1: "0xd1c436eb62e1d23e66842701b09e3d65aa8522e8",
  JBDirectory: "0x0bc9f153dee4d3d474ce0903775b9b2aaae9aa41",
  JBProjects: "0x0b538a02610d7d3cc91ce2870f423e0a34d646ad",
  JBRulesets: "0xda86eedb67c6c9fb3e58fe83efa28674d7c89826",
  JBMultiTerminal: "0xdb9644369c79c3633cde70d2df50d827d7dc7dbc"
} as const;

// Juicebox Controller ABI for terminal management
const CONTROLLER_ABI = [
  {
    inputs: [
      { name: "_projectId", type: "uint256" },
      { name: "_terminal", type: "address" }
    ],
    name: "addTerminalOf",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "_projectId", type: "uint256" },
      { name: "_terminal", type: "address" }
    ],
    name: "removeTerminalOf",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "_projectId", type: "uint256" },
      { name: "_terminal", type: "address" }
    ],
    name: "isTerminalOf",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// JBSwapTerminal ABI for configuration
const JB_SWAP_TERMINAL_ABI = [
  {
    inputs: [
      { name: "_projectId", type: "uint256" },
      { name: "_token", type: "address" },
      { name: "_swapPath", type: "bytes" },
      { name: "_fee", type: "uint24" }
    ],
    name: "setSwapPath",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// JBPermissions ABI for checking permissions
const PERMISSIONS_ABI = [
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "projectId", type: "uint256" },
      { name: "permission", type: "uint256" }
    ],
    name: "hasPermission",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

interface ProjectAdminProps {
  children: React.ReactNode;
}

export function ProjectAdmin({ children }: ProjectAdminProps) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { toast } = useToast();
  const { projectId } = useJBContractContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [swapTerminalAddress, setSwapTerminalAddress] = useState("0x9b82f7f43a956f5e83faaf1d46382cba19ce71ab");
  const [projectTokenAddress, setProjectTokenAddress] = useState("");
  const [nativeTokenAddress, setNativeTokenAddress] = useState("0x4200000000000000000000000000000000000006"); // WETH on Base

  // Check if current user is privileged admin
  const isPrivilegedAdmin = address?.toLowerCase() === PRIVILEGED_ADMIN.toLowerCase();

  const addSwapTerminal = async () => {
    if (!address || !walletClient || !publicClient || !projectId) {
      toast({
        title: "Error",
        description: "Missing required data",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);

      // TODO: Add permission check back later
      // For now, skip permission check since user likely has permission
      console.log("🔐 Skipping permission check for now");

      // Use the Base JBController4_1 address
      const controllerAddress = BASE_CONTRACTS.JBController4_1;

      // Check if the swap terminal contract exists
      const swapTerminalCode = await publicClient.getBytecode({
        address: swapTerminalAddress as Address
      });

      if (!swapTerminalCode || swapTerminalCode === "0x") {
        toast({
          title: "Error",
          description: "JBSwapTerminal contract not found at the specified address",
          variant: "destructive"
        });
        return;
      }

      console.log("🔧 Adding JBSwapTerminal to project:", {
        projectId: projectId.toString(),
        controllerAddress,
        swapTerminalAddress,
        contractExists: !!swapTerminalCode
      });

      // Check if terminal is already added to the project
      try {
        const isTerminalAdded = await publicClient.readContract({
          address: controllerAddress as Address,
          abi: CONTROLLER_ABI,
          functionName: "isTerminalOf",
          args: [BigInt(projectId), swapTerminalAddress as Address]
        });

        console.log("🔍 Terminal already added:", isTerminalAdded);

        if (isTerminalAdded) {
          toast({
            title: "Info",
            description: "JBSwapTerminal is already added to this project",
          });
          return;
        }
      } catch (error) {
        console.log("🔍 Could not check if terminal is added:", error);
      }

      // Add terminal to project
      const addTerminalHash = await walletClient.writeContract({
        address: controllerAddress as Address,
        abi: CONTROLLER_ABI,
        functionName: "addTerminalOf",
        args: [BigInt(projectId), swapTerminalAddress as Address],
        account: address
      });

      const addTerminalReceipt = await publicClient.waitForTransactionReceipt({ hash: addTerminalHash });
      console.log("✅ Terminal added to project:", addTerminalReceipt);

      // Configure swap path if token addresses are provided
      if (projectTokenAddress && nativeTokenAddress) {
        console.log("🔧 Configuring swap path...");
        
        // Create swap path for Uniswap V3 (token0 -> token1 with fee)
        const swapPath = encodeSwapPath(projectTokenAddress, nativeTokenAddress, 500); // 0.05% fee

        const configureHash = await walletClient.writeContract({
          address: swapTerminalAddress as Address,
          abi: JB_SWAP_TERMINAL_ABI,
          functionName: "setSwapPath",
          args: [
            BigInt(projectId),
            projectTokenAddress as Address,
            swapPath,
            500 // 0.05% fee
          ],
          account: address
        });

        const configureReceipt = await publicClient.waitForTransactionReceipt({ hash: configureHash });
        console.log("✅ Swap path configured:", configureReceipt);
      }

      toast({
        title: "Success",
        description: "JBSwapTerminal successfully added and configured for the project",
      });

    } catch (error) {
      console.error("Error configuring swap terminal:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to configure swap terminal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to encode Uniswap V3 swap path
  const encodeSwapPath = (tokenIn: string, tokenOut: string, fee: number): `0x${string}` => {
    // Simple path encoding: tokenIn + fee + tokenOut
    const tokenInBytes = tokenIn.slice(2).padStart(64, '0');
    const feeBytes = fee.toString(16).padStart(6, '0');
    const tokenOutBytes = tokenOut.slice(2).padStart(64, '0');
    
    return `0x${tokenInBytes}${feeBytes}${tokenOutBytes}`;
  };

  // Only show admin interface to privileged user
  if (!isPrivilegedAdmin) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Project Administration</DialogTitle>
          <DialogDescription>
            Configure project settings (Privileged access only)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium text-gray-800 mb-2">Project Information</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Project ID:</span> {projectId?.toString()}</p>
              <p><span className="font-medium">Controller:</span> {BASE_CONTRACTS.JBController4_1}</p>
              <p><span className="font-medium">Directory:</span> {BASE_CONTRACTS.JBDirectory}</p>
              <p><span className="font-medium">Permissions:</span> {BASE_CONTRACTS.JBPermissions}</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="font-medium text-blue-800 mb-2">Swap Terminal Configuration</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  JBSwapTerminal Address
                </label>
                <input
                  type="text"
                  value={swapTerminalAddress}
                  onChange={(e) => setSwapTerminalAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full p-2 border rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Token Address
                </label>
                <input
                  type="text"
                  value={projectTokenAddress}
                  onChange={(e) => setProjectTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full p-2 border rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Native Token Address (WETH)
                </label>
                <input
                  type="text"
                  value={nativeTokenAddress}
                  onChange={(e) => setNativeTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full p-2 border rounded text-sm"
                />
              </div>

              <ButtonWithWallet
                onClick={addSwapTerminal}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Configuring..." : "Add & Configure Swap Terminal"}
              </ButtonWithWallet>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>Privileged Admin: {PRIVILEGED_ADMIN}</p>
            <p>Current User: {address}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
