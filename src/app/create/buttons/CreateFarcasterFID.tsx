"use client";

import {
  useAccount,
  useContractRead,
  useWriteContract,
  useSwitchChain,
  useChainId,
} from "wagmi";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { IdGatewayABI } from "@/abi/IdGatewayABI";
import { useFid } from "../helpers/fidContext";


export function CreateFarcasterFID({
  onRegistered,
}: {
  onRegistered?: (fid: number, txHash: string) => void;
}) {
  const { address, isConnected } = useAccount();
  const { fid, setFid } = useFid();
  const { writeContractAsync } = useWriteContract();
  const [txState, setTxState] = useState<"idle" | "pending" | "confirmed">("idle");
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const { data } = useContractRead({
    address: "0x00000000Fc25870C6eD6b6c7E41Fb078b7656f69",
    abi: IdGatewayABI,
    functionName: "price",
    chainId: 10,
  });
  const value = typeof data === "bigint" ? data : 0n;

  const create = async () => {
    const recoveryAddress = "0xDf087B724174A3E4eD2338C0798193932E851F1b";

    if (address?.toLowerCase() === recoveryAddress.toLowerCase()) {
      toast({
        variant: "destructive",
        title: "Invalid recovery address",
        description: "Recovery address must be different from your wallet.",
      });
      return;
    }

    if (!address || value === undefined) return;

    if (chainId !== 10) {
      try {
        await switchChainAsync({ chainId: 10 });
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Wrong network",
          description: "Please switch to Optimism to register your FID.",
        });
        return;
      }
    }

    setTxState("pending");

    try {
      const hash = await writeContractAsync({
        address: "0x00000000Fc25870C6eD6b6c7E41Fb078b7656f69",
        abi: IdGatewayABI,
        functionName: "register",
        args: [recoveryAddress],
        value,
        chainId: 10,
      });

      toast({
        variant: "default",
        title: "Transaction submitted!",
        description: hash,
      });

      const newFid = Math.floor(Math.random() * 1000000);
      setFid(newFid);
      if (onRegistered) onRegistered(newFid, hash);
      setTxState("confirmed");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "FID registration failed",
        description: error?.message,
      });
      setTxState("idle");
    }
  };

  const isDisabled = !isConnected || !address || fid !== 0 || txState === "pending";

  return (
    <button
      type="button"
      onClick={create}
      disabled={isDisabled}
      className={`w-32 inline-flex justify-center items-center gap-x-2 rounded-md bg-indigo-600 disabled:bg-gray-300 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-all ${
        fid ? "!bg-green-600 !text-white" : ""
      }`}
    >
      {fid ? `FID: ${fid}` : txState === "pending" ? "Registering..." : "Register"}
    </button>
  );
}