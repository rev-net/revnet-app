"use client";

import React, { useEffect, useState } from "react";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { formatEther, parseEther, UserRejectedRequestError } from "viem";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  fetchMarkeeLeaderboard,
  MarkeeAbi,
  MarkeeNetwork,
  REVNETS_STRATEGY,
  type MarkeeEntry,
} from "@/lib/markee";

const DEFAULT_MAX_MESSAGE = 223;
const DEFAULT_MAX_NAME = 22;

const trimTrailingZeros = (value: string) =>
  value.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  currentTopDawg: bigint;
  currentMessage: string;
  minimumPrice: bigint;
  takeTopSpot: bigint;
};

export function MarkeeModal({
  onClose,
  onSuccess,
  currentMessage,
  minimumPrice,
  takeTopSpot,
}: Props) {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState(false);
  const [ethError, setEthError] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<MarkeeEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { address } = useAccount();
  const connectedChainId = useChainId();
  const { connectors, connect } = useConnect();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { toast } = useToast();

  const isOnBase = connectedChainId === MarkeeNetwork.id;
  const isConnected = !!address;

  const { data: baseBalanceData } = useBalance({
    address,
    chainId: MarkeeNetwork.id,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });
  const baseBalance = baseBalanceData?.value ?? null;

  const { writeContractAsync, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: MarkeeNetwork.id,
  });

  useEffect(() => {
    if (isSuccess) onSuccess();
  }, [isSuccess, onSuccess]);

  useEffect(() => {
    if (!leaderboardOpen || leaderboard.length > 0) return;
    setLeaderboardLoading(true);
    setLeaderboardError(null);
    fetchMarkeeLeaderboard(REVNETS_STRATEGY)
      .then(setLeaderboard)
      .catch(() => setLeaderboardError("Unable to load leaderboard."))
      .finally(() => setLeaderboardLoading(false));
  }, [leaderboardOpen, leaderboard.length]);

  const takeTopSpotInput = formatEther(takeTopSpot);
  const minToJoinInput = formatEther(minimumPrice);
  const takeTopSpotEth = trimTrailingZeros(parseFloat(takeTopSpotInput).toFixed(3));
  const minToJoinEth = trimTrailingZeros(parseFloat(minToJoinInput).toFixed(6));

  const totalRaised = leaderboard.reduce(
    (sum, e) => sum + BigInt(e.totalFundsAdded),
    BigInt(0),
  );

  const validate = () => {
    let valid = true;
    if (!message.trim()) {
      setMessageError(true);
      valid = false;
    } else {
      setMessageError(false);
    }
    if (!ethAmount || isNaN(parseFloat(ethAmount)) || parseFloat(ethAmount) <= 0) {
      setEthError(true);
      setInputError("Enter a valid ETH amount.");
      valid = false;
    } else {
      let parsedAmount: bigint;
      try {
        parsedAmount = parseEther(ethAmount);
      } catch {
        setEthError(true);
        setInputError("Invalid ETH amount.");
        return false;
      }
      if (parsedAmount < minimumPrice) {
        setEthError(true);
        setInputError(`Minimum is ${minToJoinEth} ETH to join the leaderboard.`);
        valid = false;
      } else if (baseBalance != null && parsedAmount > baseBalance) {
        setEthError(true);
        setInputError("Insufficient ETH balance.");
        valid = false;
      } else {
        setEthError(false);
        if (valid) setInputError(null);
      }
    }
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!address) {
      setInputError("Connect your wallet before submitting.");
      return;
    }
    if (!isOnBase) {
      try {
        await switchChainAsync({ chainId: MarkeeNetwork.id });
        setInputError("Switched to Base. Please submit again.");
      } catch {
        setInputError("Please switch your wallet to Base mainnet first.");
      }
      return;
    }
    try {
      const value = parseEther(ethAmount);
      const hash = await writeContractAsync({
        address: REVNETS_STRATEGY,
        abi: MarkeeAbi,
        functionName: "createMarkee",
        args: [message.trim(), name.trim()],
        value,
        chainId: MarkeeNetwork.id,
      });
      setTxHash(hash);
    } catch (err: unknown) {
      if (
        err instanceof UserRejectedRequestError ||
        (err as { cause?: unknown })?.cause instanceof UserRejectedRequestError
      ) {
        return;
      }
      const message =
        err instanceof Error ? err.message : "Transaction failed. Please try again.";
      setInputError(message);
      toast({ variant: "destructive", title: "Transaction failed", description: message });
    }
  };

  const isLoading = isPending || isConfirming || isSwitching;

  let parsedAmount: bigint | null = null;
  if (ethAmount && !isNaN(parseFloat(ethAmount)) && parseFloat(ethAmount) > 0) {
    try {
      parsedAmount = parseEther(ethAmount);
    } catch {
      parsedAmount = null;
    }
  }

  const hasInsufficientBalance =
    isOnBase && baseBalance != null && parsedAmount != null && parsedAmount > baseBalance;

  const buyDisabled = isLoading || (isConnected && !isOnBase) || hasInsufficientBalance;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-0 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-zinc-200">
          <DialogTitle className="text-lg font-semibold">
            Change the Markee Message
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 mt-0.5">
            62% to Revnet Treasury · 38% to{" "}
            <a
              href="https://markee.xyz"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-zinc-700 transition-colors"
            >
              Markee Cooperative
            </a>
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-5">
          {/* Current message + leaderboard */}
          <div className="mb-5 rounded border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-xs text-zinc-400 mb-1">Current message</p>
            <p className="font-mono text-sm text-zinc-700 break-words">{currentMessage}</p>

            <button
              onClick={() => setLeaderboardOpen((o) => !o)}
              className="mt-3 flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <ChevronDownIcon
                className={`h-3.5 w-3.5 transition-transform duration-200 ${leaderboardOpen ? "rotate-180" : ""}`}
              />
              {leaderboardOpen ? "Hide leaderboard" : "Show leaderboard"}
            </button>

            {leaderboardOpen && (
              <div className="mt-3 border-t border-zinc-200 pt-3 space-y-2">
                {leaderboardLoading ? (
                  <p className="text-xs text-zinc-400 font-mono">loading...</p>
                ) : leaderboardError ? (
                  <p className="text-xs text-red-500">{leaderboardError}</p>
                ) : leaderboard.length === 0 ? (
                  <p className="text-xs text-zinc-400">No entries yet.</p>
                ) : (
                  <>
                    {leaderboard.map((entry) => (
                      <div
                        key={`${entry.totalFundsAdded}-${entry.name}-${entry.message}`}
                        className="flex items-start justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-zinc-700 break-words">
                            {entry.message}
                          </p>
                          {entry.name && (
                            <p className="text-xs text-zinc-400 mt-0.5">{entry.name}</p>
                          )}
                        </div>
                        <span className="text-xs font-mono text-zinc-400 flex-shrink-0 mt-0.5">
                          {parseFloat(formatEther(BigInt(entry.totalFundsAdded))).toFixed(3)} ETH
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-zinc-200">
                      <span className="text-xs text-zinc-400 font-medium">Total raised</span>
                      <span className="text-xs font-mono font-semibold text-zinc-600">
                        {parseFloat(formatEther(totalRaised)).toFixed(3)} ETH
                      </span>
                    </div>
                  </>
                )}
                <p className="pt-2 text-xs text-zinc-400 border-t border-zinc-200">
                  Add funds and edit your existing messages at{" "}
                  <a
                    href="https://www.markee.xyz/ecosystem/revnets"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:text-zinc-600 transition-colors"
                  >
                    markee.xyz/ecosystem/revnets
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Your Message */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Your Message{" "}
              <span className="text-xs text-zinc-400 font-normal">
                ({message.length}/{DEFAULT_MAX_MESSAGE})
              </span>
            </label>
            <textarea
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm font-mono placeholder:text-zinc-400 resize-y min-h-[88px] max-h-56 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-colors ${
                messageError ? "border-red-500" : "border-zinc-300"
              }`}
              placeholder="this is a sign."
              value={message}
              maxLength={DEFAULT_MAX_MESSAGE}
              rows={3}
              onChange={(e) => {
                setMessage(e.target.value);
                setMessageError(false);
                setInputError(null);
              }}
            />
            {messageError && (
              <p className="mt-1 text-xs text-red-500">Message is required.</p>
            )}
          </div>

          {/* Your Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Your Name{" "}
              <span className="text-xs text-zinc-400 font-normal">
                (optional · {name.length}/{DEFAULT_MAX_NAME})
              </span>
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
              placeholder="vitalik"
              value={name}
              maxLength={DEFAULT_MAX_NAME}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* ETH Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              ETH Amount
              {isOnBase && baseBalance != null && (
                <span className="text-xs text-zinc-400 font-normal ml-2">
                  (balance: {parseFloat(formatEther(baseBalance)).toFixed(3)} ETH)
                </span>
              )}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Take top spot */}
              <button
                type="button"
                title={`Set to ${takeTopSpotInput} ETH`}
                onClick={() => {
                  setEthAmount(takeTopSpotInput);
                  setEthError(false);
                  setInputError(null);
                }}
                className={`flex flex-col items-center justify-center rounded px-2 py-2.5 text-center cursor-pointer transition-colors ${
                  ethAmount === takeTopSpotInput
                    ? "border-2 border-yellow-400 bg-yellow-50"
                    : "border-2 border-yellow-400/50 hover:border-yellow-400 bg-zinc-50 hover:bg-yellow-50"
                }`}
              >
                <span className="text-xs font-mono font-semibold text-zinc-700">
                  {takeTopSpotEth} ETH
                </span>
                <span className="text-xs text-zinc-400 mt-0.5 leading-tight">Take top spot</span>
              </button>

              {/* Minimum */}
              <button
                type="button"
                title={`Set to ${minToJoinInput} ETH`}
                onClick={() => {
                  setEthAmount(minToJoinInput);
                  setEthError(false);
                  setInputError(null);
                }}
                className={`flex flex-col items-center justify-center rounded border px-2 py-2.5 text-center cursor-pointer transition-colors bg-zinc-50 hover:bg-zinc-100 ${
                  ethAmount === minToJoinInput && ethAmount !== takeTopSpotInput
                    ? "border-zinc-500"
                    : "border-zinc-300 hover:border-zinc-400"
                }`}
              >
                <span className="text-xs font-mono font-semibold text-zinc-700">
                  {minToJoinEth} ETH
                </span>
                <span className="text-xs text-zinc-400 mt-0.5 leading-tight">Minimum to buy</span>
              </button>

              {/* Custom */}
              <input
                type="number"
                className={`rounded-md border bg-white px-2 py-2.5 text-xs font-mono text-center placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-colors ${
                  ethError || hasInsufficientBalance ? "border-red-500" : "border-zinc-300"
                }`}
                placeholder={takeTopSpotEth}
                value={ethAmount}
                min="0"
                step="any"
                onChange={(e) => {
                  setEthAmount(e.target.value);
                  setEthError(false);
                  setInputError(null);
                }}
              />
            </div>
            {(ethError || hasInsufficientBalance) && (
              <p className="mt-2 rounded border border-red-200 bg-red-50 px-2 pt-2 pb-1.5 text-xs text-red-600">
                {hasInsufficientBalance ? "Insufficient ETH balance." : inputError}
              </p>
            )}
          </div>

          {/* Wrong network banner */}
          {isConnected && !isOnBase && (
            <div className="mb-4 rounded border border-yellow-300 bg-yellow-50 px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-yellow-700">Switch to Base to pay for the sign.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => switchChainAsync({ chainId: MarkeeNetwork.id })}
                disabled={isSwitching}
                className="ml-3 border-yellow-500 text-yellow-700 hover:bg-yellow-100"
              >
                {isSwitching ? "Switching..." : "Switch to Base"}
              </Button>
            </div>
          )}

          {/* General error */}
          {inputError && !messageError && !ethError && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {inputError}
            </div>
          )}

          {/* Action */}
          <div className="flex justify-center mt-5">
            {!isConnected ? (
              <Button
                onClick={() => {
                  const connector = connectors[0];
                  if (connector) connect({ connector });
                }}
                className="px-8"
              >
                Connect Wallet
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={buyDisabled}
                className={`px-8 ${
                  buyDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-500 text-white"
                }`}
                title={hasInsufficientBalance ? "Insufficient balance" : ""}
              >
                {isPending
                  ? "Confirm in wallet..."
                  : isConfirming
                    ? "Confirming..."
                    : "Buy Message"}
              </Button>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-zinc-400">
            You&apos;ll receive MARKEE tokens and become a Markee Network owner
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
