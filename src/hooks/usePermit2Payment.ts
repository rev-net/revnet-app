import { useState } from "react";
import { useSignTypedData } from "wagmi";
import { USDC_ADDRESSES } from "@/app/constants";
import {
  AllowanceTransfer,
  MaxAllowanceTransferAmount,
  PERMIT2_ADDRESS
} from "@uniswap/permit2-sdk";
import { useToast } from "@/components/ui/use-toast";

interface UsePermit2PaymentReturn {
  executePermit2Payment: (params: {
    chainId: number;
    terminalAddress: `0x${string}`;
    projectId: bigint;
    amount: bigint;
    beneficiary: `0x${string}`;
    memo?: string;
  }) => Promise<{
    signature: string;
    permitData: any;
  }>;
  isPermit2Loading: boolean;
  error: string | null;
}

export function usePermit2Payment(): UsePermit2PaymentReturn {
  const { signTypedDataAsync } = useSignTypedData();
  const [isPermit2Loading, setIsPermit2Loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const executePermit2Payment = async ({
    chainId,
    terminalAddress,
    projectId,
    amount,
    beneficiary,
    memo = "",
  }: {
    chainId: number;
    terminalAddress: `0x${string}`;
    projectId: bigint;
    amount: bigint;
    beneficiary: `0x${string}`;
    memo?: string;
  }) => {
    setIsPermit2Loading(true);
    setError(null);

    try {
      const usdcAddress = USDC_ADDRESSES[chainId];
      if (!usdcAddress) {
        throw new Error("USDC not supported on this chain");
      }

      // Create permit data
      const permit = {
        details: {
          token: usdcAddress,
          amount: amount, // Use exact amount for conservative approach
          expiration: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
          nonce: 0 // TODO: Fetch this from Permit2 contract
        },
        spender: terminalAddress,
        sigDeadline: Math.floor(Date.now() / 1000) + 60 * 10 // 10 minutes
      };

      const { domain, types, values } = AllowanceTransfer.getPermitData(
        permit,
        PERMIT2_ADDRESS,
        chainId
      );

      // Get user signature
      const signature = await signTypedDataAsync({
        domain: {
          name: 'Permit2',
          version: '1',
          chainId: BigInt(chainId),
          verifyingContract: PERMIT2_ADDRESS
        },
        types: {
          PermitSingle: [
            { name: 'details', type: 'PermitDetails' },
            { name: 'spender', type: 'address' },
            { name: 'sigDeadline', type: 'uint256' }
          ],
          PermitDetails: [
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint160' },
            { name: 'expiration', type: 'uint48' },
            { name: 'nonce', type: 'uint48' }
          ],
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
          ]
        },
        primaryType: 'PermitSingle',
        message: {
          details: {
            token: usdcAddress,
            amount: amount,
            expiration: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
            nonce: 0
          },
          spender: terminalAddress,
          sigDeadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 10)
        },
      });

      return {
        signature,
        permitData: {
          projectId,
          token: usdcAddress,
          amount,
          beneficiary,
          memo,
          signature,
        }
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process PERMIT2 payment";
      setError(errorMessage);
      console.error("Permit2 payment failed:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsPermit2Loading(false);
    }
  };

  return {
    executePermit2Payment,
    isPermit2Loading,
    error,
  };
} 