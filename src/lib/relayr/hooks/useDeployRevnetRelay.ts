import { useCallback, useState } from "react";
import { RelayrPostBundleResponse } from "../types";
import { API, DASHBOARD } from "../constants";
import { erc2771ForwarderAddress, JBChainId } from "juice-sdk-react";

type DeployRevnetRelayArgs = {
  data: `0x${string}`;
  chain: JBChainId;
};

export function useDeployRevnetRelay() {
  const [isLoading, setIsLoading] = useState(false);
  const [relayrResponse, setRelayrResponse] =
    useState<RelayrPostBundleResponse>();
  const [error, setError] = useState<Error>();

  const reset = useCallback(() => {
    setIsLoading(false);
    setRelayrResponse(undefined);
    setError(undefined);
  }, []);

  const deployRevnet = useCallback(async (args: DeployRevnetRelayArgs[]) => {
    setIsLoading(true);
    setError(undefined);

    const transactions = args.map((ct) => {
      return {
        chain: ct.chain,
        data: ct.data,
        target: erc2771ForwarderAddress[ct.chain],
        value: "0",
      };
    });

    try {
      const response = await fetch(`${API}/v1/bundle/prepaid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions,
          virtual_nonce_mode: "Disabled",
        }),
      });

      if (!response.ok) {
        console.error("Relayr ERROR:: ", response);
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const data: RelayrPostBundleResponse = await response.json();
      console.log("Relayr:: ", data);
      console.log(`${DASHBOARD}/bundle/${data.bundle_uuid}`);
      setRelayrResponse(data);
    } catch (e: any) {
      console.log("Relayr ERROR:: ", e);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    write: deployRevnet,
    response: relayrResponse,
    error,
    isLoading,
    reset,
  };
}
