type Props = {
  totalBorrowed?: bigint;
  totalCollateral?: bigint;
  loanCount?: bigint;
  borrowableAmount?: bigint;
};

export default function LoanStatsDisplay({
  totalBorrowed,
  totalCollateral,
  loanCount,
  borrowableAmount,
}: Props) {
  return (
    <div className="text-sm text-gray-800 mt-4 space-y-1">
      <div>💸 Borrowed: {totalBorrowed?.toString() ?? "Loading..."}</div>
      <div>
        🔒 Collateral burned:{" "}
        {totalCollateral !== undefined
          ? `${(Number(totalCollateral) / 1e18).toFixed(4)}`
          : "Loading..."}
      </div>
      <div>📄 Number of Loans: {loanCount?.toString() ?? "Loading..."}</div>
      <div>
        🏦 Borrowable Amount:{" "}
        {borrowableAmount !== undefined
          ? `${(Number(borrowableAmount) / 1e18).toFixed(4)}`
          : "Loading..."}
      </div>
    </div>
  );
}
