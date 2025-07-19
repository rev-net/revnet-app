import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { ChainLogo } from "@/components/ChainLogo";
import { TokenAmount } from "@/components/TokenAmount";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stat } from "@/components/ui/stat";
import { useToast } from "@/components/ui/use-toast";
import {
  JB_CHAINS,
  JBChainId,
  NATIVE_TOKEN,
  TokenAmountType,
} from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useSuckers,
  useWriteJbMultiTerminalPay,
} from "juice-sdk-react";
import { USDC_ADDRESSES } from "@/app/constants";
import { useEffect, useState } from "react";
import { Address, erc20Abi } from "viem";
import {
  useAccount,
  useWaitForTransactionReceipt,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { useSelectedSucker } from "./SelectedSuckerContext";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";

export function PayDialog({
  amountA,
  amountB,
  memo,
  paymentToken,
  disabled,
}: {
  amountA: TokenAmountType;
  amountB: TokenAmountType;
  memo: string | undefined;
  paymentToken: `0x${string}`;
  disabled?: boolean;
}) {
  const { projectId } = useJBContractContext();
  const primaryNativeTerminal = { data: "0xdb9644369c79c3633cde70d2df50d827d7dc7dbc" };
  const { address } = useAccount();
  const value = amountA.amount.value;
  const { isError, error, writeContract, isPending: isWriteLoading, data } = useWriteJbMultiTerminalPay();
  const chainId = useJBChainId();
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();
  const txHash = data;
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const { toast } = useToast();
  const suckersQuery = useSuckers();
  const suckers = suckersQuery.data;
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isApproving, setIsApproving] = useState(false);

  // Get the suckerGroupId from the current project
  const { data: projectData } = useBendystrawQuery(ProjectDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
  }, {
    enabled: !!chainId && !!projectId,
  });
  const suckerGroupId = projectData?.project?.suckerGroupId;

  // Get all projects in the sucker group with their token data
  const { data: suckerGroupData } = useBendystrawQuery(SuckerGroupDocument, {
    id: suckerGroupId ?? "",
  }, {
    enabled: !!suckerGroupId,
  });

  // Get the correct token address for the selected chain
  const getTokenForChain = (targetChainId: number) => {
    if (!suckerGroupData?.suckerGroup?.projects?.items) {
      return paymentToken; // fallback to original paymentToken
    }
    
    const projectForChain = suckerGroupData.suckerGroup.projects.items.find(
      project => project.chainId === targetChainId
    );
    
    if (projectForChain?.token) {
      return projectForChain.token as `0x${string}`;
    }
    
    return paymentToken; // fallback to original paymentToken
  };

  useEffect(() => {
    if (isError && error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while processing your contribution",
      });
    }
  }, [isError, error, toast]);

  useEffect(() => {
    if (chainId && suckers && !suckers.find((s) => s.peerChainId === chainId)) {
      suckers.push({ peerChainId: chainId, projectId });
    }
    if (suckers && !selectedSucker) {
      const i = suckers.findIndex((s) => s.peerChainId === chainId);
      setSelectedSucker(suckers[i]);
    }
  }, [suckers, chainId, projectId, selectedSucker, setSelectedSucker]);

  const loading = isWriteLoading || isTxLoading || isApproving;

  const handlePay = async () => {
    if (!primaryNativeTerminal?.data || !address || !selectedSucker || !walletClient || !publicClient) return;

    // Get the correct token for the selected chain
    const chainToken = getTokenForChain(selectedSucker.peerChainId);
    const isNative = chainToken === "0x000000000000000000000000000000000000eeee";

    try {
      if (!isNative) {
        const allowance = await publicClient.readContract({
          address: chainToken,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, primaryNativeTerminal.data as `0x${string}`],
        });

        if (BigInt(allowance) < BigInt(value)) {
          setIsApproving(true);
          const hash = await walletClient.writeContract({
            address: chainToken,
            abi: erc20Abi,
            functionName: "approve",
            args: [primaryNativeTerminal.data as `0x${string}`, value],
          });
          await publicClient.waitForTransactionReceipt({ hash });
          setIsApproving(false);
        }
      }

      writeContract?.({
        chainId: selectedSucker.peerChainId,
        address: primaryNativeTerminal.data as `0x${string}`,
        args: [
          selectedSucker.projectId,
          chainToken,
          value,
          address,
          0n,
          memo || "",
          "0x0",
        ],
        value: isNative ? value : 0n,
      });
    } catch (err) {
      setIsApproving(false);
      const errMsg = err instanceof Error ? err.message : "Unknown error during payment";
      console.error("Payment failed:", err);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: errMsg,
      });
    }
  };

  return (
    <Dialog open={disabled === true ? false : undefined}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="w-full bg-teal-500 hover:bg-teal-600">
          Pay
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogDescription>
            <div>
              {isSuccess ? (
                <div>Success! You can close this window.</div>
              ) : (
                <>
                  <div className="flex flex-col gap-6">
                    <Stat label="Pay">
                      <TokenAmount amount={amountA} />
                    </Stat>
                    <Stat label="Get">
                      <TokenAmount amount={amountB} />
                    </Stat>
                    {memo && <Stat label="Memo">{memo}</Stat>}
                  </div>
                  {isTxLoading ? <div>Transaction submitted, awaiting confirmation...</div> : null}
                </>
              )}
            </div>
          </DialogDescription>
          {!isSuccess ? (
            <div className="flex flex-row justify-between items-end">
              {suckers && suckers.length > 1 ? (
                <div className="flex flex-col mt-4">
                  <div className="text-sm text-zinc-500">{amountB.symbol} is available on:</div>
                  <Select
                    onValueChange={(v) => setSelectedSucker(suckers[parseInt(v)])}
                    value={selectedSucker ? String(suckers.indexOf(selectedSucker)) : undefined}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select chain" />
                    </SelectTrigger>
                    <SelectContent>
                      {suckers.map((s, index) => (
                        <SelectItem key={s.peerChainId} value={String(index)} className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <ChainLogo chainId={s.peerChainId as JBChainId} />
                            <span>{JB_CHAINS[s.peerChainId as JBChainId].name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                selectedSucker && (
                  <div className="flex flex-col mt-4">
                    <div className="text-xs text-slate-500">{amountB.symbol} is only on:</div>
                    <div className="flex flex-row items-center gap-2 pl-3 min-w-fit pr-5 py-2 border ring-offset-white">
                      <ChainLogo chainId={selectedSucker.peerChainId as JBChainId} />
                      {JB_CHAINS[selectedSucker.peerChainId as JBChainId].name}
                    </div>
                  </div>
                )
              )}
              <ButtonWithWallet
                targetChainId={selectedSucker?.peerChainId as JBChainId | undefined}
                loading={loading}
                onClick={handlePay}
                className="bg-teal-500 hover:bg-teal-600"
              >
                Pay
              </ButtonWithWallet>
            </div>
          ) : null}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
