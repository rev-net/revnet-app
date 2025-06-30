export function generateFeeData({
  grossBorrowedEth,
  ethToWallet,
  prepaidPercent,
  fixedLoanFee = 0.035,
  feeConstants,
  actualPrepaidFeeAmount,
}: {
  grossBorrowedEth: number;
  ethToWallet: number;
  prepaidPercent: string;
  fixedLoanFee?: number;
  feeConstants?: {
    totalProtocolFeePercent?: number;
    minPrepaidFeePercent?: number;
    revPrepaidFeePercent?: number;
  };
  actualPrepaidFeeAmount?: number;
}) {
  const MAX_YEARS = 10;
  
  // Use actual contract fee constants if available, otherwise fall back to hardcoded value
  const actualProtocolFee = feeConstants?.totalProtocolFeePercent ?? fixedLoanFee;
  
  // Calculate prepaid duration in years
  const monthsToPrepay = Math.round((parseFloat(prepaidPercent) / 50) * 120);
  const prepaidDuration = monthsToPrepay / 12;
  
  // Use actual prepaid fee amount if provided, otherwise calculate based on percentage
  const prepaidFeeAmount = actualPrepaidFeeAmount ?? (grossBorrowedEth * (parseFloat(prepaidPercent) / 100));
  
  // The amount to wallet is already calculated as grossBorrowedEth - prepaidFeeAmount
  // So we don't need to recalculate it here
  const amountToWallet = ethToWallet;
  
  // The decaying portion is the amount that will be subject to time-based fees
  const decayingPortion = grossBorrowedEth - prepaidFeeAmount;
  
  // Use actual protocol fee instead of hardcoded fixed fee
  const fixedFee = grossBorrowedEth * actualProtocolFee;
  
  const data = [];

  // Generate data points from 0 to MAX_YEARS with 0.1 step increments
  // Use Math.ceil to ensure we get exactly to MAX_YEARS
  const steps = Math.ceil(MAX_YEARS / 0.1);
  
  for (let i = 0; i <= steps; i++) {
    const year = Math.min(i * 0.1, MAX_YEARS);
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