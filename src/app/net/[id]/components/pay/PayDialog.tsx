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
import { useJbMultiTerminalPay } from "@/lib/juicebox/hooks/contract";
import { PropsWithChildren } from "react";
import { Address } from "viem";
import { NATIVE_TOKEN } from "../../contexts/datatypes";
import { useAccount } from "wagmi";
import { useJBContractContext } from "../../contexts/JBContractContext/JBContractContext";

export function PayDialog({
  payAmountWei,
  projectId,
  primaryTerminalEth,
  disabled,
  children,
}: PropsWithChildren<{
  payAmountWei: bigint;
  projectId: bigint;
  primaryTerminalEth: Address;
  disabled?: boolean;
}>) {
  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { address } = useAccount();
  const value = payAmountWei;
  const { write } = useJbMultiTerminalPay({
    // address: primaryNativeTerminal.data,
    args: address
      ? [
          projectId,
          NATIVE_TOKEN,
          value,
          address,
          0n,
          `Joined REVNET ${projectId}`,
          "0x0",
        ]
      : undefined,
    value,
  });

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
