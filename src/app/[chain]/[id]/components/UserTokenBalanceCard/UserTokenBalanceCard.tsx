import { Button } from "@/components/ui/button";
import { useTokenA } from "@/hooks/useTokenA";
import { formatTokenSymbol } from "@/lib/utils";
import { JBProjectToken } from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { RedeemDialog } from "./RedeemDialog";
import { useSuckersUserTokenBalance } from "./useSuckersUserTokenBalance";

export function UserTokenBalanceCard() {
  const {
    projectId,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const tokenA = useTokenA();
  const { token } = useJBTokenContext();
  const tokenSymbol = formatTokenSymbol(token);
  const chainId = useJBChainId();

  const { data: balances } = useSuckersUserTokenBalance();
  const creditBalance = new JBProjectToken(
    balances?.reduce((acc, balance) => acc + balance.balance.value, 0n) ?? 0n
  );

  return (
    <div className="flex flex-row gap-2 mt-2">
      {/* <div>
        <div>
          <div className="text-lg overflow-auto mb-1 flex gap-1 items-center">
            <span>You own</span> <UserTokenBalanceDatum />
          </div>
        </div>
        {creditBalance && creditBalanceRedemptionQuote ? (
          <div className="text-xs text-zinc-500">
            ≈{" "}
            {formatUnits(creditBalanceRedemptionQuote, tokenA.decimals, {
              fractionDigits: 8,
            })}{" "}
            {tokenA.symbol}
          </div>
        ) : null}
      </div> */}
      {token?.data?.symbol && creditBalance && primaryNativeTerminal.data ? (
        <RedeemDialog
          projectId={projectId}
          creditBalance={creditBalance}
          tokenSymbol={tokenSymbol}
          primaryTerminalEth={primaryNativeTerminal.data}
        >
          <Button variant="outline" disabled={creditBalance.value === 0n}>
            Cash out
          </Button>
        </RedeemDialog>
      ) : null}
      <Button variant="outline" disabled={true}>
        Get a loan (soon)
      </Button>
    </div>
  );
}
