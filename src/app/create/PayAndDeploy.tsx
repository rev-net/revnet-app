import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useGetRelayrBundle } from "@/lib/relayr/hooks/useGetRelayrBundle";
import { usePayRelayr } from "@/lib/relayr/hooks/usePayRelayr";
import { RelayrPostBundleResponse } from "@/lib/relayr/types";
import { formatHexEther } from "@/lib/utils";
import { useTokenA } from "@/hooks/useTokenA";
import { chainNames } from "../constants";
import { CheckCircle, FastForwardIcon } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { GoToProjectButton } from "./GoToProjectButton";
import EtherscanLink from "@/components/EtherscanLink";
import { SquareArrowOutUpRightIcon, CircleDashedIcon, CircleDotDashedIcon, CircleDotIcon, CircleXIcon } from "lucide-react";
import { ChainIdToChain } from "../constants";
import { JBChainId } from "juice-sdk-react";

interface PaymentAndDeploySectionProps {
  relayrResponse: RelayrPostBundleResponse;
  revnetTokenSymbol: string;
}

const statusToIcon = (status: string) => {
  if (status === "Pending") return <CircleDashedIcon className="w-5 h-5 text-amber-400 animate-spin" />
  if (status === "Mempool") return <CircleDotDashedIcon className="w-5 h-5 text-blue-400 animate-spin" />
  if (status === "Included") return <CircleDotIcon className="w-5 h-5 text-cyan-400 animate-spin" />
  if (status === "Success") return <CheckCircle className="w-5 h-5 text-emerald-500 fade-in-50" />
  return <CircleXIcon className="w-5 h-5 text-red-500 fade-in-50" />
};

export function PayAndDeploy({
  relayrResponse,
  revnetTokenSymbol
}: PaymentAndDeploySectionProps) {
  const [paymentIndex, setPaymentIndex] = useState<number>(0);
  const [payIsProcessing, setPayIsProcessing] = useState(false);
  const { pay } = usePayRelayr();
  const { startPolling, response: bundleResponse } = useGetRelayrBundle();
  const { toast } = useToast();
  const { symbol } = useTokenA();

  return (
    <div>
      <div className="text-left text-black-500 font-semibold">
        How would you like to pay?
      </div>
      <div className="max-w-sm">
        <Select
          onValueChange={(v) => setPaymentIndex(Number(v))}
          defaultValue="0"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {relayrResponse.payment_info.map((payment, index) => {
              return (
                <SelectItem value={String(index)} key={payment.chain}>
                  {formatHexEther(payment?.amount)} {symbol} on {chainNames[payment.chain]}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex md:col-span-3 mt-4">
        <Button
          type="submit"
          size="lg"
          disabled={payIsProcessing}
          className="disabled:text-black disabled:bg-transparent disabled:border disabled:border-black disabled:bg-gray-100 bg-teal-500 hover:bg-teal-600"
          onClick={async () => {
            setPayIsProcessing(true);
            try {
              await pay?.(relayrResponse.payment_info[paymentIndex]);
              startPolling(relayrResponse.bundle_uuid);
            } catch (e: any) {
              setPayIsProcessing(false);
              toast({
                title: "Error",
                description: e.message,
                variant: "destructive",
              })
            }
          }}
        >
          Pay and ship
          {!!bundleResponse ? (
            <CheckCircle
              className={"h-4 w-4 ml-2 fill-none text-emerald-500"}
            />
          ) : (
            <FastForwardIcon
              className={
                twMerge("h-4 w-4 fill-white ml-2", payIsProcessing ? "animate-spin" : "animate-pulse")
              }
            />
          )}
        </Button>
      </div>
      {!!bundleResponse && (
        <div className="mt-10 flex flex-col space-y-2">
          <div className="text-left text-zinc-500 mb-2">Your revnet is made up of components deployed on each blockchain where it'll accept funds and issue {revnetTokenSymbol} from. These transactions take 1-2 minutes to settle.</div>
          <div className="grid grid-cols-3 gap-4 font-semibold border-b mb-2">
            <div>Network</div>
            <div>Status</div>
            <div>Transaction</div>
          </div>
          {bundleResponse.transactions.map((txn) => (
            txn?.status && (
              <div key={txn?.tx_uuid} className="grid grid-cols-3 gap-4">
                <div>{chainNames[txn.request.chain as JBChainId]}</div>
                <div className="flex flex-row space-x-2 items-center justify-start">
                  <div>{statusToIcon(txn.status.state)}</div>
                  <div>{txn.status.state}</div>
                </div>
                {txn?.status?.data?.hash ? (
                  <div className="flex flex-row space-x-1 items-center">
                    <EtherscanLink
                      value={txn?.status?.data?.hash}
                      type="tx"
                      chain={ChainIdToChain[txn.request.chain as JBChainId]}
                      truncateTo={6}
                    />
                    <SquareArrowOutUpRightIcon className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="animate-pulse italic">generating...</div>
                )}
              </div>
            )
          ))}
          <GoToProjectButton
            txHash={bundleResponse.transactions[0].status?.data?.hash}
            chainId={bundleResponse.transactions[0].request.chain as JBChainId}
          />
        </div>
      )}
    </div>
  );
}
