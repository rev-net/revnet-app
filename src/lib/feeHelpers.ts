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
  
  // Calculate prepaid duration in years
  const monthsToPrepay = (parseFloat(prepaidPercent) / 50) * 120;
  const prepaidDuration = monthsToPrepay / 12;
  
  // Calculate the prepaid fee amount (this goes to the protocol)
  const prepaidFeeAmount = grossBorrowedEth * (parseFloat(prepaidPercent) / 100);
  
  // Calculate the amount that goes to user's wallet
  const amountToWallet = ethToWallet * (1 - parseFloat(prepaidPercent) / 100);
  
  // The decaying portion is the amount that will be subject to time-based fees
  const decayingPortion = grossBorrowedEth - prepaidFeeAmount;
  
  // Fixed fee is always applied
  const fixedFee = grossBorrowedEth * fixedLoanFee;
  
  const data = [];

  for (let year = 0; year <= MAX_YEARS; year += 0.1) {
    let variableFee = 0;

    // Variable fees only start after the prepaid period
    if (year > prepaidDuration && year <= MAX_YEARS) {
      const elapsedAfterPrepaid = year - prepaidDuration;
      const remainingTime = MAX_YEARS - prepaidDuration;
      const percentElapsed = Math.min(elapsedAfterPrepaid / remainingTime, 1);
      variableFee = decayingPortion * percentElapsed;
    } else if (year > MAX_YEARS) {
      variableFee = decayingPortion;
    }

    const totalCost = fixedFee + variableFee;
    data.push({ year, totalCost });
  }

  return data;
}