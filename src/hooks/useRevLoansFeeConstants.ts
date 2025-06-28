import { JBChainId } from "juice-sdk-core";
import { revLoansAddress } from "revnet-sdk";
import { useReadContract } from "wagmi";

// ABI for reading the fee constants from REVLoans contract
const revLoansConstantsAbi = [
  {
    inputs: [],
    name: "MAX_PREPAID_FEE_PERCENT",
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_PREPAID_FEE_PERCENT",
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "REV_PREPAID_FEE_PERCENT",
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useRevLoansFeeConstants(chainId?: JBChainId) {
  const revLoansContractAddress = chainId ? revLoansAddress[chainId] : undefined;

  const { data: maxPrepaidFeePercent } = useReadContract({
    address: revLoansContractAddress,
    abi: revLoansConstantsAbi,
    functionName: "MAX_PREPAID_FEE_PERCENT",
    chainId,
  });

  const { data: minPrepaidFeePercent } = useReadContract({
    address: revLoansContractAddress,
    abi: revLoansConstantsAbi,
    functionName: "MIN_PREPAID_FEE_PERCENT",
    chainId,
  });

  const { data: revPrepaidFeePercent } = useReadContract({
    address: revLoansContractAddress,
    abi: revLoansConstantsAbi,
    functionName: "REV_PREPAID_FEE_PERCENT",
    chainId,
  });

  return {
    // Basis points (raw contract values)
    maxPrepaidFeeBps: maxPrepaidFeePercent ? Number(maxPrepaidFeePercent) : undefined,
    minPrepaidFeeBps: minPrepaidFeePercent ? Number(minPrepaidFeePercent) : undefined,
    revPrepaidFeeBps: revPrepaidFeePercent ? Number(revPrepaidFeePercent) : undefined,
    totalProtocolFeeBps: minPrepaidFeePercent && revPrepaidFeePercent 
      ? Number(minPrepaidFeePercent) + Number(revPrepaidFeePercent)
      : undefined,
    
    // Percentages (converted from basis points)
    maxPrepaidFeePercent: maxPrepaidFeePercent ? Number(maxPrepaidFeePercent) / 10 : undefined,
    minPrepaidFeePercent: minPrepaidFeePercent ? Number(minPrepaidFeePercent) / 10 : undefined,
    revPrepaidFeePercent: revPrepaidFeePercent ? Number(revPrepaidFeePercent) / 10 : undefined,
    totalProtocolFeePercent: minPrepaidFeePercent && revPrepaidFeePercent 
      ? (Number(minPrepaidFeePercent) + Number(revPrepaidFeePercent)) / 10 
      : undefined,
  };
}

