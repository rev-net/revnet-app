export function generateFeeData({
  grossBorrowedEth,
  ethToWallet,
  prepaidPercent,
  fixedLoanFee = 0.035,
  feeConstants,
  actualPrepaidFeeAmount,
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
  const monthsToPrepay = Math.round(Math.round((parseFloat(prepaidPercent) / 50) * 120));
  const prepaidDuration = monthsToPrepay / 12;
  
  // Use actual prepaid fee amount if provided, otherwise calculate based on percentage
  const prepaidFeeAmount = actualPrepaidFeeAmount ?? (grossBorrowedEth * (parseFloat(prepaidPercent) / 100));
  // Use actual prepaid fee amount if provided, otherwise calculate based on percentage
  const prepaidFeeAmount = actualPrepaidFeeAmount ?? (grossBorrowedEth * (parseFloat(prepaidPercent) / 100));
  
  // The amount to wallet is already calculated as grossBorrowedEth - prepaidFeeAmount
  // So we don't need to recalculate it here
  const amountToWallet = ethToWallet;
  
  // The amount that needs to be paid back (the borrowed amount)
  const amountToPayBack = grossBorrowedEth;
  
  const data = [];

  // Generate data points from 0 to MAX_YEARS with 0.1 step increments
  // Use Math.ceil to ensure we get exactly to MAX_YEARS
  const steps = Math.ceil(MAX_YEARS / 0.1);
  
  for (let i = 0; i <= steps; i++) {
    const year = Math.min(i * 0.1, MAX_YEARS);
    let additionalFees = 0;

    // Additional fees only start after the prepaid period
    if (year > prepaidDuration && year <= MAX_YEARS) {
      const elapsedAfterPrepaid = year - prepaidDuration;
      const remainingTime = MAX_YEARS - prepaidDuration;
      const percentElapsed = Math.min(elapsedAfterPrepaid / remainingTime, 1);
      // Additional fees are a percentage of the borrowed amount (max 50%)
      additionalFees = amountToPayBack * percentElapsed * 0.5;
    } else if (year > MAX_YEARS) {
      additionalFees = amountToPayBack * 0.5; // Max 50% additional fees
    }

    // The total cost is the amount borrowed plus any additional fees after prepaid period
    const totalCost = amountToPayBack + additionalFees;
    data.push({ year, totalCost });
  }

  return data;
}
