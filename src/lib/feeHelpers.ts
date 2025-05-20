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
  const monthsToPrepay = (parseFloat(prepaidPercent) / 50) * 120;
  const feeBps = monthsToPrepay * 10;
  const prepaidFee = (grossBorrowedEth * feeBps) / 1000;
  const prepaidDuration = monthsToPrepay / 12;

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