import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { RelayrGetBundleResponse } from "../types";
import { API } from "../constants";

export function useGetRelayrBundle() {
  const { toast } = useToast();
  const [relayrResponse, setRelayrResponse] = useState<RelayrGetBundleResponse>();
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [uuid, setUuid] = useState<string>();

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let t: any;
    const pollBundle = async () => {
      try {
        console.log("fetching bundle_uuid:: ", uuid);
        const response = await fetch(`${API}/v1/bundle/${uuid}`);
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage);
        }
        const data: RelayrGetBundleResponse = await response.json();
        console.log("Relayr:: ", data);
        setRelayrResponse(data);
        setError(null);

        const allTxHaveHash = data.transactions?.every(tx => tx?.status.data?.hash);
        if (allTxHaveHash) {
          setIsPolling(false);
          toast({
            title: "Deployment complete",
          });
        }
      } catch (e: any) {
        setError(e);
        setIsPolling(false);
        toast({
          title: "Failed to deploy revnet",
          description: e?.message,
          variant: "destructive"
        });
        console.log("Relayr ERROR:: ", e);
      }
    };

    if (isPolling && uuid) {
      pollBundle();
      pollInterval = setInterval(pollBundle, 2000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isPolling, uuid, toast]);

  const startPolling = useCallback((bundleUuid: string) => {
    setError(null);
    setUuid(bundleUuid);
    setIsPolling(true);
  }, []);

  const isComplete = relayrResponse?.transactions?.every(tx => tx?.status.data?.hash) ?? false;
  const firstProjectIdReady = relayrResponse?.transactions.find((txn) => {
    return txn?.status?.data?.hash !== undefined
  });

  return {
    startPolling,
    response: relayrResponse,
    isPolling,
    isComplete,
    firstProjectIdReady,
    error,
    uuid
  };
}
