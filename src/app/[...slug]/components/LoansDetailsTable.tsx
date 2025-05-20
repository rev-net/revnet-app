import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { LoansDetailsByAccountDocument } from "@/generated/graphql";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60) % 60;
  const hours = Math.floor(seconds / 3600) % 24;
  const days = Math.floor(seconds / (3600 * 24)) % 30;
  const months = Math.floor(seconds / (3600 * 24 * 30)) % 12;
  const years = Math.floor(seconds / (3600 * 24 * 30 * 12));

  const parts = [];
  if (years) parts.push(`${years}y`);
  if (months) parts.push(`${months}mo`);
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);

  return parts.length ? parts.join(" ") : "0m";
}

function formatTimeRemaining(createdAt: number, prepaidDuration: number): string {
  const endTimestamp = createdAt + prepaidDuration;
  const secondsRemaining = endTimestamp - Math.floor(Date.now() / 1000);
  const days = Math.floor(secondsRemaining / (60 * 60 * 24));
  const hours = Math.floor((secondsRemaining % (60 * 60 * 24)) / (60 * 60));
  if (secondsRemaining <= 0) return "Expired";
  return `${days}d ${hours}h left`;
}

export function LoanDetailsTable({
  revnetId,
  address,
  onSelectLoan,
  chainId,
  title,
}: {
  revnetId: bigint;
  address: string;
  onSelectLoan?: (loanId: string, loanData: any) => void;
  chainId?: number;
  title?: string;
}) {
  const { data } = useBendystrawQuery(LoansDetailsByAccountDocument, {
    owner: address,
    projectId: Number(revnetId),
  });
  if (!data?.loans?.items) return null;

  const now = Math.floor(Date.now() / 1000);
  const filteredLoans =
    chainId && chainId !== 0
      ? data.loans.items.filter((loan) => Number(loan.chainId) === chainId)
      : data.loans.items;
  if (!filteredLoans.length)
    return;

  const sortedLoans = [...filteredLoans].sort((a, b) => {
    const timeA = a.prepaidDuration - (now - Number(a.createdAt));
    const timeB = b.prepaidDuration - (now - Number(b.createdAt));
    return timeA - timeB;
  });
  return (
    <>
      {title && <p className="text-md font-semibold text-zinc-500 mt-4">{title}</p>}
      <div className="grid max-w-md gap-1.5 mt-4 max-h-96 overflow-auto bg-zinc-50 rounded-md border border-zinc-200">
      <table className="w-full text-xs">
        <thead className="sticky top-0 z-10 bg-zinc-50 text-left font-semibold text-zinc-600 border-b border-zinc-200">
          <tr>
            <th className="px-2 py-1 text-left">Chain</th>
            <th className="px-2 py-1 text-right">Borrowed ETH</th>
            <th className="px-2 py-1 text-right">Collateral</th>
            <th className="px-2 py-1 text-right">Fees Increase In</th>
          </tr>
        </thead>
        <tbody>
          {sortedLoans.map((loan, idx) => {
            return (
              <tr
                key={idx}
                onClick={() => onSelectLoan?.(loan.id, loan)}
                className="border-b border-zinc-100 h-auto cursor-pointer hover:bg-zinc-100"
              >
                <td className="px-2 py-1 text-left">{JB_CHAINS[loan.chainId as JBChainId]?.name || loan.chainId}</td>
                <td className="px-2 py-1 text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{(Number(loan.borrowAmount) / 1e18).toFixed(6)}</span>
                    </TooltipTrigger>
                    <TooltipContent>Loan ID: {loan.id?.toString() ?? "Unavailable"}</TooltipContent>
                  </Tooltip>
                </td>
                <td className="px-2 py-1 text-right">{(Number(loan.collateral) / 1e18).toFixed(6)}</td>
                <td className="px-2 py-1 text-right">
                  {formatDuration(loan.prepaidDuration - (Math.floor(Date.now() / 1000) - Number(loan.createdAt)))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </>
  );
}