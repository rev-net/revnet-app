import { useMemo } from "react";
import { Token } from "@uniswap/sdk-core";
import { FixedInt } from "fpnum";
import { 
  hasSufficientBalance as hasSufficientBalanceUtil,
  getBalanceErrorMessage as getBalanceErrorMessageUtil
} from "@/lib/tokenDisplay";

interface UseBalanceValidationProps {
  projectAmount: string;
  nativeAmount: string;
  projectToken: Token;
  projectTokenBalance: bigint | undefined;
  nativeTokenBalance: bigint | undefined;
  ethBalance: bigint | undefined;
  isSingleSided: boolean;
  activeView: string;
  projectTokenAmount: { amount: FixedInt<number>; symbol: string | undefined } | null;
  ethTokenAmount: { amount: FixedInt<number>; symbol: string | undefined } | null;
  nativeTokenAmount: { amount: FixedInt<number>; symbol: string | undefined } | null;
}

export const useBalanceValidation = ({
  projectAmount,
  nativeAmount,
  projectToken,
  projectTokenBalance,
  nativeTokenBalance,
  ethBalance,
  isSingleSided,
  activeView,
  projectTokenAmount,
  ethTokenAmount,
  nativeTokenAmount,
}: UseBalanceValidationProps) => {
  const hasSufficientBalance = useMemo(() => {
    return hasSufficientBalanceUtil(
      projectAmount,
      nativeAmount,
      projectTokenBalance,
      nativeTokenBalance,
      ethBalance,
      isSingleSided,
      activeView
    );
  }, [projectAmount, nativeAmount, projectTokenBalance, nativeTokenBalance, ethBalance, isSingleSided, activeView]);

  const getBalanceErrorMessage = () => {
    return getBalanceErrorMessageUtil(
      projectAmount,
      nativeAmount,
      projectToken,
      projectTokenBalance,
      nativeTokenBalance,
      ethBalance,
      isSingleSided,
      activeView,
      projectTokenAmount,
      ethTokenAmount,
      nativeTokenAmount
    );
  };

  return {
    hasSufficientBalance,
    getBalanceErrorMessage,
  };
}; 