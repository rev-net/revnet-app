import { useCallback, useState } from "react";
import { RelayrPostBundleResponse } from "../types";
import { API } from "../constants";

type DeployRevnetRelayArgs = {
  data: `0x${string}`;
  chainDeployer: {
    chain: number;
    deployer: string;
  }[];
}

export function useDeployRevnetRelay() {
  const [isLoading, setIsLoading] = useState(false);
  const [relayrResponse, setRelayrResponse] = useState<RelayrPostBundleResponse>();
  const [error, setError] = useState<Error>();

  const deployRevnet = useCallback(async (args: DeployRevnetRelayArgs) => {
    setIsLoading(true);
    setError(undefined);

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

      const data: RelayrPostBundleResponse = await response.json();
      console.log("Relayr:: ", data);
      console.log(`https://relayr-dashboard-staging.up.railway.app/bundle/${data.bundle_uuid}`);
      setRelayrResponse(data);
    } catch(e: any) {
      console.log("Relayr ERROR:: ", e)
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    write: deployRevnet,
    response: relayrResponse,
    error,
    isLoading
  };
}
