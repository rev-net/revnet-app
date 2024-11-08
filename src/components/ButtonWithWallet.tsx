import { ConnectKitButton } from "connectkit";
import React from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { Button, ButtonProps } from "./ui/button";
import { useJBChainId } from "juice-sdk-react";
import { chainNames } from "@/app/constants";

const ButtonWithWallet = React.forwardRef<
  HTMLInputElement,
  { connectWalletText: string; children: React.ReactNode } & ButtonProps
>(({ children, connectWalletText, ...props }, ref) => {
  const jbChainId = useJBChainId();
  const userChainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  console.log(jbChainId, userChainId);

  if (typeof jbChainId !== "undefined" && jbChainId !== userChainId) {
    return (
      <Button
        {...props}
        onClick={() => switchChain({ chainId: jbChainId })}
        loading={isPending}
      >
        {`Switch to ${chainNames[jbChainId]}`}
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <ConnectKitButton.Custom>
        {({ isConnecting, show }) => {
          return (
            <Button {...props} onClick={show} loading={isConnecting}>
              {connectWalletText ?? "Connect Wallet"}
            </Button>
          );
        }}
      </ConnectKitButton.Custom>
    );
  }

  return <Button {...props}>{children}</Button>;
});

ButtonWithWallet.displayName = "ButtonWithWallet";

export { ButtonWithWallet };
