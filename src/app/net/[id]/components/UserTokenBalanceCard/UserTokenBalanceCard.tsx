import { Button } from "@/components/ui/button";
import { useTokenA } from "@/hooks/useTokenA";
import { useNativeTokenSurplus } from "@/hooks/useTokenASurplus";
import { FixedInt } from "fpnum";
import { JBProjectToken, getTokenRedemptionQuoteEth } from "juice-sdk-core";
import {
  useJBContractContext,
  useJBRulesetContext,
  useJBTokenContext,
  useJbControllerPendingReservedTokenBalanceOf,
  useJbTokensTotalBalanceOf,
  useJbTokensTotalSupplyOf,
} from "juice-sdk-react";
import { useAccount } from "wagmi";
import { RedeemDialog } from "./RedeemDialog";

export function UserTokenBalanceCard() {
  const {
    projectId,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { rulesetMetadata } = useJBRulesetContext();
  const { address: userAddress } = useAccount();
  const tokenA = useTokenA();
  const { token } = useJBTokenContext();

  const { data: creditBalance } = useJbTokensTotalBalanceOf({
    args: userAddress ? [userAddress, projectId] : undefined,
    select(data) {
      return new JBProjectToken(data);
    },
  });
  const { data: tokensReserved } = useJbControllerPendingReservedTokenBalanceOf(
    {
      args: [projectId],
    }
  );
  const { data: nativeTokenSurplus } = useNativeTokenSurplus();

  const { data: totalTokenSupply } = useJbTokensTotalSupplyOf({
    args: [projectId],
  });

  const creditBalanceRedemptionQuote =
    nativeTokenSurplus &&
    totalTokenSupply &&
    tokensReserved &&
    rulesetMetadata?.data
      ? new FixedInt(
          getTokenRedemptionQuoteEth(creditBalance?.value ?? 0n, {
            overflowWei: nativeTokenSurplus,
            totalSupply: totalTokenSupply,
            redemptionRate: rulesetMetadata.data.redemptionRate.value,
            tokensReserved,
          }),
          tokenA.decimals
        )
      : null;

  return (
    <div className="mb-16 bg-zinc-50 border border-zinc-200 w-full shadow-lg rounded-xl p-4 flex justify-between gap-2 flex-wrap items-center">
      <div>
        <div className="mb-1">Your tokens</div>
        <div className="text-lg overflow-auto mb-1">
          {creditBalance?.format(6) ?? 0} {token?.data?.symbol}
        </div>
        {creditBalance && creditBalanceRedemptionQuote ? (
          <div className="text-xs text-zinc-500">
            ≈ {creditBalanceRedemptionQuote.format(8)} {tokenA.symbol}
          </div>
        ) : null}
      </div>
      {token?.data && creditBalance && primaryNativeTerminal.data ? (
        <RedeemDialog
          projectId={projectId}
          creditBalance={creditBalance}
          tokenSymbol={token.data.symbol}
          primaryTerminalEth={primaryNativeTerminal.data}
        >
          <Button variant="outline" disabled={creditBalance.value === 0n}>
            Redeem
          </Button>
        </RedeemDialog>
      ) : null}
    </div>
  );
}
