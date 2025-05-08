import { ChainLogo } from "@/components/ChainLogo";
import { JBChainId } from "juice-sdk-react";
import { LoanTableRow } from "../components/UserTokenBalanceCard/LoanTableRow";

export function TokenBalanceTable({
  balances,
  projectId,
  tokenSymbol,
  terminalAddress,
}: {
  balances: {
    chainId: number;
    balance: {
      value: bigint;
    };
  }[] | undefined;
  projectId: bigint;
  tokenSymbol: string;
  terminalAddress: `0x${string}`;
}) {
  if (!balances || balances.length === 0) return null;

  return (
    <div className="mb-5 w-full max-w-md">
      <span className="text-sm text-black font-medium">Your {tokenSymbol}</span>
      <div className="mt-1 border border-zinc-200 p-3 bg-zinc-50 rounded-md">
        <div className="grid grid-cols-3 gap-3 text-right text-sm font-bold text-zinc-600 mb-1">
          <div></div>
          <div>Holding ({tokenSymbol})</div>
          <div>Borrowable (ETH)</div>
        </div>
        <div className="flex flex-col gap-2 sm:gap-0">
          {balances.map((balance, index) => (
            <LoanTableRow
              key={index}
              index={index}
              revnetId={projectId}
              chainId={balance.chainId as JBChainId}
              terminalAddress={terminalAddress}
              tokenAddress={"0x000000000000000000000000000000000000EEEe"} // TODO: Replace with base token address
              decimals={18}
              currency={61166n}
              collateralCount={balance.balance.value}
              tokenSymbol={tokenSymbol}
            />
          ))}
        </div>
      </div>
    </div>
  );
}