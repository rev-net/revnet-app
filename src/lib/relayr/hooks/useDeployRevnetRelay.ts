import { useToast } from "@/components/ui/use-toast";
import { useCallback, useState } from "react";

// relayr is a thing 0xBASED built
// APP: https://relayr-dashboard-staging.up.railway.app
// DOCS: https://relayr-docs-staging.up.railway.app

type DeployRevnetRelayArgs = {
  data: `0x${string}`;
  chainTerminals: {
    chain: number;
    terminal: string;
  }[];
}

export type ChainPayment = {
  chain: number;
  token: `0x${string}`;
  amount: `0x${string}`;
  target: `0x${string}`;
  calldata: `0x${string}`;
  payment_deadline: string;
}

type TransactionRequest = {
  chain: number;
  target: `0x${string}`;
  data: `0x${string}`;
  value: `0x${string}`;
  gas_limit: `0x${string}`;
  virtual_nonce: null | number;
}

type TransactionStatus = {
  state: "Pending" | "Completed" | "Failed";
}

type Transaction = {
  tx_uuid: string;
  request: TransactionRequest;
  status: TransactionStatus;
}

export type RelayrAPIResponse = {
  bundle_uuid: string;
  payment_info: ChainPayment[];
  payment_received: boolean;
  transactions: Transaction[];
  created_at: string;
  expires_at: string;
}

const API = "https://relayr-api-staging.up.railway.app";

export function useDeployRevnetRelay() {
  const { toast } = useToast();
  const [relayrResponse, setRelayrResponse] = useState<RelayrAPIResponse>();
  const deployRevnet = useCallback(async (args: DeployRevnetRelayArgs) => {
    const t = toast({
      title: "Deploying through relayer...",
    });
    const transactions = args.chainTerminals.map((ct) => {
      return {
        chain: ct.chain,
        data: args.data,
        target: ct.terminal,
        value: "0"
      }
    });
    try {
      const response = await fetch(`${API}/v1/bundle/prepaid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions,
          virtual_nonce_mode: "Disabled"
        })
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const data: RelayrAPIResponse = await response.json();
      console.log("Relayr:: ", data)
      setRelayrResponse(data);
      t.dismiss();
    } catch(e: any) {
      toast({
        title: "Failed to deploy revnet",
        description: e?.message,
        variant: "destructive"
      });
      console.log("Relayr ERROR:: ", e)
    }
  }, [toast]);
  return { write: deployRevnet, response: relayrResponse };
}
