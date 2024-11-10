import { Button } from "@/components/ui/button";
import { useTokenA } from "@/hooks/useTokenA";
import { useNativeTokenSurplus } from "@/hooks/useTokenASurplus";
import { formatTokenSymbol } from "@/lib/utils";
import { FixedInt } from "fpnum";
import { JBProjectToken, getTokenRedemptionQuoteEth } from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useJBRulesetContext,
  useJBTokenContext,
  useReadJbControllerPendingReservedTokenBalanceOf,
  useReadJbTokensTotalSupplyOf
} from "juice-sdk-react";
import { useAccount } from "wagmi";
import { RedeemDialog } from "./RedeemDialog";
import { UserTokenBalanceDatum } from "./UserTokenBalanceDatum";
import { useSuckersUserTokenBalance } from "./useSuckersUserTokenBalance";

export function UserTokenBalanceCard() {
  const {
    projectId,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { rulesetMetadata } = useJBRulesetContext();
  const { address: userAddress } = useAccount();
  const tokenA = useTokenA();
  const { token } = useJBTokenContext();
  const tokenSymbol = formatTokenSymbol(token);
  const chainId = useJBChainId();
  const { data: balances } = useSuckersUserTokenBalance();
  const creditBalance = new JBProjectToken(
    balances?.reduce((acc, balance) => acc + balance.balance.value, 0n) ?? 0n
  );

  const { data: tokensReserved } =
    useReadJbControllerPendingReservedTokenBalanceOf({
      chainId,
      args: [projectId],
    });
  const { data: nativeTokenSurplus } = useNativeTokenSurplus();

  const { data: totalTokenSupply } = useReadJbTokensTotalSupplyOf({
    chainId,
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
            redemptionRate: Number(rulesetMetadata.data.redemptionRate.value),
            tokensReserved,
          }),
          tokenA.decimals
        )
      : null;

  return (
    <div className="flex flex-col mb-16 bg-zinc-50 border border-zinc-200 w-full shadow-lg rounded-xl p-4 justify-between gap-2 flex-wrap">
      <div>
        <div>
          <div className="text-lg overflow-auto mb-1 flex gap-1 items-center">
            <span>You own</span> <UserTokenBalanceDatum />
          </div>
        </div>
        {creditBalance && creditBalanceRedemptionQuote ? (
          <div className="text-xs text-zinc-500">
            ≈ {creditBalanceRedemptionQuote.format(8)} {tokenA.symbol}
          </div>
        ) : null}
      </div>
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
