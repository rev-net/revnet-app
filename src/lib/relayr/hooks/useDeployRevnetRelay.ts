import { useToast } from "@/components/ui/use-toast";
import { useCallback, useState } from "react";
import { RelayrAPIResponse } from "../types";
import { API } from "../constants";

// relayr is a thing 0xBASED built
// APP: https://relayr-dashboard-staging.up.railway.app
// DOCS: https://relayr-docs-staging.up.railway.app

type DeployRevnetRelayArgs = {
  data: `0x${string}`;
  chainDeployer: {
    chain: number;
    deployer: string;
  }[];
}

export function useDeployRevnetRelay() {
  const { toast } = useToast();
  const [relayrResponse, setRelayrResponse] = useState<RelayrAPIResponse>();
  const deployRevnet = useCallback(async (args: DeployRevnetRelayArgs) => {
    const t = toast({
      title: "Deploying through relayer...",
      duration: 35_000
    });
    const transactions = args.chainDeployer.map((ct) => {
      return {
        chain: ct.chain,
        data: args.data,
        target: ct.deployer,
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
