import EtherscanLink from "@/components/EtherscanLink";
import { RelayrPaymentSelect } from "@/components/RelayrPaymentSelect";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTokenA } from "@/hooks/useTokenA";
import { formatWalletError } from "@/lib/utils";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import {
  ChainPayment,
  RelayrPostBundleResponse,
  useGetRelayrTxBundle,
  useSendRelayrTx,
} from "juice-sdk-react";
import {
  CheckCircle,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleXIcon,
  FastForwardIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Hash } from "viem";
import { GoToProjectButton } from "./GoToProjectButton";

interface PaymentAndDeploySectionProps {
  relayrResponse: RelayrPostBundleResponse;
  revnetTokenSymbol: string;
}

const statusToIcon = (status: string) => {
  if (status === "Pending")
    return <CircleDashedIcon className="w-5 h-5 text-amber-400 animate-spin" />;
  if (status === "Mempool")
    return <CircleDotDashedIcon className="w-5 h-5 text-blue-400 animate-spin" />;
  if (status === "Included")
    return <CircleDotIcon className="w-5 h-5 text-cyan-400 animate-spin" />;
  if (status === "Success") return <CheckCircle className="w-5 h-5 text-emerald-500 fade-in-50" />;
  return <CircleXIcon className="w-5 h-5 text-red-500 fade-in-50" />;
};

export function PayAndDeploy({ relayrResponse, revnetTokenSymbol }: PaymentAndDeploySectionProps) {
  const [selectedPayment, selectPayment] = useState<ChainPayment | null>(null);
  const [payIsProcessing, setPayIsProcessing] = useState(false);
  const { sendRelayrTx } = useSendRelayrTx();
  const { startPolling, response: bundleResponse } = useGetRelayrTxBundle();
  const { toast } = useToast();
  const { symbol } = useTokenA();

  return (
    <div>
      <RelayrPaymentSelect
        payments={relayrResponse.payment_info}
        tokenSymbol={symbol ?? ""}
        selectedPayment={selectedPayment}
        onSelectPayment={selectPayment}
        disabled={payIsProcessing}
      />
      <div className="flex md:col-span-3 mt-4">
        <Button
          type="submit"
          size="lg"
          disabled={payIsProcessing}
          className="disabled:text-black disabled:bg-transparent disabled:border disabled:border-black disabled:bg-gray-100 bg-teal-500 hover:bg-teal-600"
          onClick={async () => {
            setPayIsProcessing(true);
            try {
              if (!selectedPayment || !sendRelayrTx) throw new Error("No payment selected");
              await sendRelayrTx(selectedPayment);
              startPolling(relayrResponse.bundle_uuid);
            } catch (e: any) {
              setPayIsProcessing(false);
              toast({
                title: "Error",
                description: formatWalletError(e),
                variant: "destructive",
              });
            }
          }}
        >
          Pay and ship
          {!!bundleResponse ? (
            <CheckCircle className={"h-4 w-4 ml-2 fill-none text-emerald-500"} />
          ) : (
            <FastForwardIcon
              className={twMerge(
                "h-4 w-4 fill-white ml-2",
                payIsProcessing ? "animate-spin" : "animate-pulse",
              )}
            />
          )}
        </Button>
      </div>
      {!!bundleResponse && (
        <div className="mt-10 flex flex-col space-y-2">
          <div className="text-left text-zinc-500 mb-2">
            Your revnet is made up of components deployed on each blockchain where it'll accept
            funds and issue {revnetTokenSymbol} from. These transactions take 1-2 minutes to settle.
          </div>
          <div className="grid grid-cols-3 gap-4 font-semibold border-b mb-2">
            <div>Network</div>
            <div>Status</div>
            <div>Transaction</div>
          </div>
          {bundleResponse.transactions.map(
            (txn) =>
              txn?.status && (
                <div key={txn?.tx_uuid} className="grid grid-cols-3 gap-4">
                  <div>{JB_CHAINS[txn.request.chain as JBChainId].name}</div>
                  <div className="flex flex-row space-x-2 items-center justify-start">
                    <div>{statusToIcon(txn.status.state)}</div>
                    <div>{txn.status.state}</div>
                  </div>
                  {"hash" in (txn?.status?.data ?? {}) ? (
                    <div className="flex flex-row space-x-1 items-center">
                      <EtherscanLink
                        value={(txn?.status?.data as { hash: Hash })?.hash}
                        type="tx"
                        chain={JB_CHAINS[txn.request.chain as JBChainId].chain}
                        truncateTo={6}
                      />
                      <SquareArrowOutUpRightIcon className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="animate-pulse italic">generating...</div>
                  )}
                </div>
              ),
          )}
          <GoToProjectButton
            txHash={(bundleResponse.transactions[0].status?.data as { hash: Hash })?.hash}
            chainId={bundleResponse.transactions[0].request.chain}
          />
        </div>
      )}
    </div>
  );
}
