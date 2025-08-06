import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { REV_LOANS_ADDRESSES } from "@/app/constants";
import { revLoansAbi } from "revnet-sdk";

export function useWriteRevLoansBorrowFrom() {
  const { writeContract, data, isPending, error } = useWriteContract();

  const writeRevLoansBorrowFrom = async ({
    chainId,
    args,
  }: {
    chainId: number;
    args: readonly [
      bigint, // projectId
      { token: `0x${string}`; terminal: `0x${string}` }, // borrowToken
      bigint, // minBorrowAmount
      bigint, // collateral
      `0x${string}`, // borrower
      bigint, // feeTenths
    ];
  }) => {
    const address = REV_LOANS_ADDRESSES[chainId];
    if (!address) {
      throw new Error(`RevLoans address not found for chain ${chainId}`);
    }
    console.log("writeRevLoansBorrowFrom", REV_LOANS_ADDRESSES, address, chainId, args);

    return writeContract({
      address,
      abi: revLoansAbi,
      functionName: "borrowFrom",
      args,
      chainId,
    });
  };

  return {
    writeContract: writeRevLoansBorrowFrom,
    data,
    isPending,
    error,
  };
} 