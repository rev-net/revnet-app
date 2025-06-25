import { Token } from "@uniswap/sdk-core";
import { formatTokenAmount, getNativeTokenDisplaySymbol } from "@/lib/tokenDisplay";
import { Input } from "@/components/ui/input";

interface TokenInputProps {
  token: Token;
  value: string;
  onValueChange: (value: string) => void;
  balance: bigint | null;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  chainId?: number;
}

export const TokenInput = ({
  token,
  value,
  onValueChange,
  balance,
  label,
  placeholder = "0.0",
  disabled = false,
  className = "",
  chainId,
}: TokenInputProps) => {
  const displaySymbol = chainId 
    ? getNativeTokenDisplaySymbol(token, chainId)
    : (token.symbol || "Unknown");

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-12"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
          {displaySymbol}
        </div>
      </div>
      {balance !== null && (
        <div className="text-xs text-gray-500">
          Balance: {formatTokenAmount(balance, token.decimals, displaySymbol)}
        </div>
      )}
    </div>
  );
}; 