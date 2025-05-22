import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function RepayDialog({
  projectId,
  tokenSymbol,
  address,
  open,
  onOpenChange,
  loan,
  ...props
}: {
  projectId: bigint;
  tokenSymbol: string;
  address: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: any;
}) {
  const [internalSelectedLoan, setInternalSelectedLoan] = useState<any | null>(null);
  const [repayAmount, setRepayAmount] = useState("");
  const [collateralToReturn, setCollateralToReturn] = useState("");
  const [repayStatus, setRepayStatus] = useState("idle");
  const [repayTxHash, setRepayTxHash] = useState<string | null>(null);
  const [isRepaying, setIsRepaying] = useState(false);

  useEffect(() => {
    if (open && loan) {
      setInternalSelectedLoan(loan);
      setRepayAmount((Number(loan.borrowAmount) / 1e18).toString());
      setCollateralToReturn((Number(loan.collateral) / 1e18).toString());
    }
    if (!open) {
      setInternalSelectedLoan(null);
      setRepayAmount("");
      setCollateralToReturn("");
      setRepayStatus("idle");
      setRepayTxHash(null);
      setIsRepaying(false);
    }
  }, [open, loan]);

  if (!internalSelectedLoan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Repay loan</DialogTitle>
          <DialogDescription asChild>
            <section className="my-4">
              {/* Dialog description content here */}
            </section>
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-zinc-700 space-y-4">
          <div className="grid grid-cols-7 gap-2">
            <div className="col-span-4">
              <Label htmlFor="collateral-to-return" className="block text-gray-700 text-sm font-bold mb-1">
                How much {tokenSymbol} collateral do you want back?
              </Label>
              <Input
                id="collateral-to-return"
                type="number"
                step="1"
                value={collateralToReturn}
                onChange={(e) => setCollateralToReturn(e.target.value)}
                placeholder="Enter collateral amount to return"
              />
              <div className="flex gap-1 mt-2">
                {[10, 25, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={async () => {
                      const collateralInTokens = Number(internalSelectedLoan.collateral) / 1e18;
                      const portion = collateralInTokens * (pct / 100);
                      setCollateralToReturn(portion.toString());
                      // Simulate repay amount update here if needed
                    }}
                    className="h-10 px-3 text-sm text-zinc-700 border border-zinc-300 rounded-md bg-white hover:bg-zinc-100"
                  >
                    {pct}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const maxCollateral = Number(internalSelectedLoan.collateral) / 1e18;
                    setCollateralToReturn(maxCollateral.toString());
                    const repay = Number(internalSelectedLoan.borrowAmount) / 1e18;
                    setRepayAmount(repay.toFixed(6));
                  }}
                  className="h-10 px-3 text-sm text-zinc-700 border border-zinc-300 rounded-md bg-white hover:bg-zinc-100"
                >
                  Max
                </button>
              </div>
            </div>
          </div>
              <Label className="block text-gray-700 text-sm font-bold mb-1 mt-4">
                Cost to repay: {repayAmount || "0.00"} ETH
              </Label>
          <div className="flex flex-col items-end pt-2">
            <ButtonWithWallet
              targetChainId={internalSelectedLoan.chainId}
              loading={isRepaying || repayStatus === "waiting-signature" || repayStatus === "pending"}
              onClick={async () => {
                // Repay logic here
              }}
            >
              Repay loan
            </ButtonWithWallet>
            {repayStatus !== "idle" && (
              <p className="text-sm text-zinc-600 mt-2">
                {repayStatus === "waiting-signature" && "Waiting for wallet confirmation..."}
                {repayStatus === "pending" && "Repayment pending..."}
                {repayStatus === "success" && "Repayment successful!"}
                {repayStatus === "error" && "Something went wrong during repayment."}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 