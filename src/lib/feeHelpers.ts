import { calcPrepaidFee } from "revnet-sdk";

export function generateFeeData({
  grossBorrowedEth,
  prepaidPercent,
  fixedLoanFee = 0.035,
}: {
  grossBorrowedEth: number;
  prepaidPercent: string;
  fixedLoanFee?: number;
}) {
  const MAX_YEARS = 10;
  const monthsToPrepay = (parseFloat(prepaidPercent) / 50) * 120;
  const prepaidDuration = monthsToPrepay / 12;
  
  // Use the actual SDK calculation that matches the contract
  // Round monthsToPrepay to nearest integer since calcPrepaidFee expects an integer
  const feeBpsBigInt = calcPrepaidFee(Math.round(monthsToPrepay)); // SDK returns bps as bigint
  const feeBps = Number(feeBpsBigInt);
  const prepaidFee = (grossBorrowedEth * feeBps) / 10000; 
  
  const borrowedAmount = grossBorrowedEth;
  const fixedFee = borrowedAmount * fixedLoanFee;
  const decayingPortion = borrowedAmount - prepaidFee;
  const data = [];

  // Generate data points every 0.25 years, but ensure we reach exactly 10 years
  for (let year = 0; year < MAX_YEARS; year += 0.25) {
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
    const totalFees = fixedFee + clampedVariableFee;
    
    // Total cost to unlock = borrowed amount + fees
    const totalCostToUnlock = borrowedAmount + totalFees;

    data.push({ year, totalCost: totalCostToUnlock });
  }

  // Add the final point at exactly 10 years with maximum value
  const maxFees = fixedFee + decayingPortion;
  const maxCostToUnlock = borrowedAmount + maxFees;
  data.push({ year: MAX_YEARS, totalCost: maxCostToUnlock });

  return data;
}