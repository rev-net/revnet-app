import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePayEthPaymentTerminal } from "@/hooks/juicebox/usePayEthPaymentTerminal";
import { ETHER_ADDRESS } from "@/lib/juicebox/constants";
import { PropsWithChildren } from "react";
import { Hash } from "viem";

export function PayDialog({
  payAmountWei,
  projectId,
  primaryTerminalEth,
  disabled,
  children,
}: PropsWithChildren<{
  payAmountWei: bigint;
  projectId: bigint;
  primaryTerminalEth: Hash;
  disabled?: boolean;
}>) {
  const { write, isLoading, isSuccess, isError } = usePayEthPaymentTerminal(
    {
      projectId,
      terminalAddress: primaryTerminalEth,
      amountWei: payAmountWei,
      token: ETHER_ADDRESS,
      minReturnedTokens: 0n,
      preferClaimedTokens: true,
      memo: `Joined REVNET ${projectId}`,
    },
    {
      onSuccess() {
        alert("Mint complete");
      },
    }
  );

  return (
    <Dialog open={disabled === true ? false : undefined}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Join network</DialogTitle>
          <DialogDescription>Send it.</DialogDescription>
          <DialogFooter>
            <Button
              onClick={() => {
                write?.();
              }}
            >
              Buy and Join
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
