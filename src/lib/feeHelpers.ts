export function generateFeeData({
  grossBorrowedEth,
  ethToWallet,
  prepaidPercent,
  fixedLoanFee = 0.035,
}: {
  grossBorrowedEth: number;
  ethToWallet: number;
  prepaidPercent: string;
  fixedLoanFee?: number;
}) {
  const MAX_YEARS = 10;
  
  // Calculate prepaid fee as a percentage of the loan amount
  const prepaidFeePercent = parseFloat(prepaidPercent) / 100;
  const prepaidFee = grossBorrowedEth * prepaidFeePercent;
  
  // Calculate prepaid duration based on the percentage (more prepaid = longer duration)
  const prepaidDuration = (prepaidFeePercent / 0.5) * MAX_YEARS; // 50% prepaid = 10 years

  const rawBorrowable = grossBorrowedEth;
  const fixedFee = rawBorrowable * fixedLoanFee;
  const decayingPortion = rawBorrowable - prepaidFee;
  const data = [];

  for (let year = 0; year <= MAX_YEARS; year += 0.1) {
    let variableFee = 0;

    if (year > prepaidDuration && year <= MAX_YEARS) {
      const elapsedAfterPrepaid = year - prepaidDuration;
      const remainingTime = MAX_YEARS - prepaidDuration;
      const percentElapsed = elapsedAfterPrepaid / remainingTime;
      variableFee = decayingPortion * percentElapsed;
    } else if (year > MAX_YEARS) {
      variableFee = decayingPortion;
    }

    const clampedVariableFee = Math.min(variableFee, decayingPortion);
    const loanCost = fixedFee + clampedVariableFee;

    data.push({ year, totalCost: loanCost });
  }

  return data;
}