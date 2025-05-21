import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { LoansDetailsByAccountDocument } from "@/generated/graphql";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { formatSeconds } from "@/lib/utils";

export function LoanDetailsTable({
  revnetId,
  address,
  onSelectLoan,
  chainId,
  title,
  selectedLoanId,
}: {
  revnetId: bigint;
  address: string;
  onSelectLoan?: (loanId: string, loanData: any) => void;
  chainId?: number;
  title?: string;
  selectedLoanId?: string;
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
    return null;

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
            <th className="px-2 py-1 w-4" />
            <th className="px-2 py-1 text-left">Chain</th>
            <th className="px-2 py-1 text-right">Borrowed ETH</th>
            <th className="px-2 py-1 text-right">Collateral</th>
            <th className="px-2 py-1 text-right">Fees Increase In</th>
          </tr>
        </thead>
        <tbody>
          {sortedLoans.map((loan) => {
            return (
              <tr key={`${loan.id}-${loan.createdAt}`}
                className={`border-b border-zinc-100 h-auto hover:bg-zinc-100 ${
                  selectedLoanId === loan.id ? "bg-zinc-100" : ""
                }`}
              >
                <td className="px-2 py-1 text-left">
                  <input
                    type="radio"
                    name="selectedLoan"
                    checked={selectedLoanId === loan.id}
                    onChange={() => onSelectLoan?.(loan.id, loan)}
                  />
                </td>
                <td className="px-2 py-1 text-left">{JB_CHAINS[loan.chainId as JBChainId]?.name || loan.chainId}</td>
                <td className="px-2 py-1 text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{(Number(loan.borrowAmount) / 1e18).toFixed(4)}</span>
                    </TooltipTrigger>
                    <TooltipContent>Loan ID: {loan.id?.toString() ?? "Unavailable"}</TooltipContent>
                  </Tooltip>
                </td>
                <td className="px-2 py-1 text-right">{(Number(loan.collateral) / 1e18).toFixed(4)}</td>
                <td className="px-2 py-1 text-right">
                  {formatSeconds(Math.max(0, loan.prepaidDuration - (now - Number(loan.createdAt))))}
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