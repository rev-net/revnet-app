import { useMutation } from "@tanstack/react-query";
import { erc2771ForwarderAddress, JBChainId } from "juice-sdk-react";
import { API } from "../constants";
import { RelayrPostBundleResponse } from "../types";

export function useRequestRelayrQuote() {
  return useMutation({
    mutationFn: async (
      args: {
        data: `0x${string}`;
        chain: JBChainId;
      }[]
    ) => {
      const transactions = args.map((ct) => {
        return {
          chain: ct.chain,
          data: ct.data,
          target: erc2771ForwarderAddress[ct.chain],
          value: "0",
        };
      });

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

      return (await response.json()) as RelayrPostBundleResponse;
    },
  });
}
