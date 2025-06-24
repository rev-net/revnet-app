import { useState, useEffect } from "react";
import { Token } from "@uniswap/sdk-core";
import { parseEther } from "viem";
import { PublicClient } from "viem";
import { getSwapQuote } from "@/lib/uniswap/swap";
import { useToast } from "@/components/ui/use-toast";

interface UseSwapQuoteProps {
  projectAmount: string;
  projectToken: Token;
  nativeToken: Token;
  publicClient: PublicClient | null | undefined;
  activeView: string;
}

export const useSwapQuote = ({
  projectAmount,
  projectToken,
  nativeToken,
  publicClient,
  activeView,
}: UseSwapQuoteProps) => {
  const [swapQuote, setSwapQuote] = useState<{ amountOut: string; priceImpact: number } | null>(null);
  const [isSwapLoading, setIsSwapLoading] = useState(false);
  const { toast } = useToast();

  const handleSwapQuote = async () => {
    if (!projectAmount || !publicClient) return;

    try {
      const amountIn = parseEther(projectAmount);
      const quote = await getSwapQuote(projectToken, nativeToken, amountIn, publicClient);
      
      if (quote && !('type' in quote)) {
        // Success case - quote is a SwapQuote
        const amountOutEth = Number(quote.amountOut) / 1e18;
        
        setSwapQuote({
          amountOut: amountOutEth.toFixed(6),
          priceImpact: quote.priceImpact
        });
      } else if (quote && 'type' in quote) {
        // Error case - quote is a SwapQuoteError
        setSwapQuote(null);
        
        let errorMessage = quote.message;
        if (quote.type === 'insufficient_liquidity' && quote.details) {
          const tokenInFormatted = quote.details.tokenInBalance 
            ? (Number(quote.details.tokenInBalance) / Math.pow(10, projectToken.decimals)).toFixed(6)
            : '0';
          const tokenOutFormatted = quote.details.tokenOutBalance 
            ? (Number(quote.details.tokenOutBalance) / Math.pow(10, nativeToken.decimals)).toFixed(6)
            : '0';
          const requiredFormatted = (Number(amountIn) / Math.pow(10, projectToken.decimals)).toFixed(6);
          
          errorMessage = `Insufficient liquidity. Pool has ${tokenInFormatted} ${projectToken.symbol} and ${tokenOutFormatted} ${nativeToken.symbol}, but you're trying to swap ${requiredFormatted} ${projectToken.symbol}.`;
        }
        
        toast({
          variant: "destructive",
          title: "Quote Failed",
          description: errorMessage
        });
      } else {
        // Null case
        setSwapQuote(null);
        toast({
          variant: "destructive",
          title: "Quote Failed",
          description: "Unable to get swap quote. The pool may not have sufficient liquidity for this trade."
        });
      }
    } catch (error) {
      setSwapQuote(null);
      toast({
        variant: "destructive",
        title: "Quote Error",
        description: "Failed to get swap quote. Please try a smaller amount or check if the pool has liquidity."
      });
    }
  };

  // Auto-update quote when amount changes - only for sell view
  useEffect(() => {
    if (projectAmount && parseFloat(projectAmount) > 0 && activeView === 'sell') {
      const timeoutId = setTimeout(() => {
        handleSwapQuote();
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    } else {
      setSwapQuote(null);
    }
  }, [projectAmount, activeView, projectToken, nativeToken, publicClient]);

  return {
    swapQuote,
    isSwapLoading,
    setIsSwapLoading,
    handleSwapQuote,
  };
}; 