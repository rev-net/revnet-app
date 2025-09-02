import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { LoansDetailsByAccountDocument } from "@/generated/graphql";

export function LoanSelectDropdown({
  revnetId,
  address,
  selectedLoanId,
  setSelectedLoanId,
  onLoanSelected,
}: {
  revnetId: bigint;
  address: string;
  selectedLoanId: string | null;
  setSelectedLoanId: (id: string) => void;
  onLoanSelected?: (loan: {
    id: string;
    borrowAmount: string;
    collateral: string;
    prepaidDuration: number;
    createdAt: number;
    projectId: number;
    terminal: string;
    token: string;
    chainId: number;
  }) => void;
}) {
  const { data } = useBendystrawQuery(LoansDetailsByAccountDocument, {
    owner: address,
    projectId: Number(revnetId),
  }, {
    pollInterval: 5000,
  });

  if (!data?.loans?.items?.length) return null;

  const now = Math.floor(Date.now() / 1000);

  const sortedLoans = [...data.loans.items].sort((a, b) => {
    const timeA = a.prepaidDuration - (now - Number(a.createdAt));
    const timeB = b.prepaidDuration - (now - Number(b.createdAt));
    return timeA - timeB;
  });

  return (
    <div className="grid grid-cols-7 gap-2 mt-4">
      <div className="col-span-4">
        <label className="block text-gray-700 text-sm font-bold mb-1">
          Select Loan
        </label>
        <select
          value={selectedLoanId ?? ""}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedLoanId(id);
            const loan = sortedLoans.find((l) => l.id === id);
            if (loan && onLoanSelected) {
              onLoanSelected(loan);
            }
          }}
          className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Choose a loan to repay
          </option>
          {Array.from(new Map(sortedLoans.map(loan => [loan.id, loan])).values()).map((loan) => {
            const borrowEth = (Number(loan.borrowAmount) / 1e18).toFixed(4);
            return (
              <option key={loan.id} value={loan.id}>
                {`Loan #${loan.id} – ${borrowEth} ETH`}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}