import { ConnectKitButton } from "connectkit";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { useJBChainId } from "juice-sdk-react";
import React from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { Button, ButtonProps } from "./ui/button";

const ButtonWithWallet = React.forwardRef<
  HTMLInputElement,
  {
    connectWalletText?: string;
    targetChainId?: JBChainId;
    children: React.ReactNode;
  } & ButtonProps
>(({ children, connectWalletText, targetChainId, ...props }, ref) => {
  const jbChainId = useJBChainId();
  const userChainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  const _targetChainId = targetChainId || jbChainId;

  if (typeof _targetChainId !== "undefined" && userChainId !== _targetChainId) {
    return (
      <Button
        {...props}
        onClick={() => switchChain({ chainId: _targetChainId })}
        loading={isPending}
      >
        {`Switch to ${JB_CHAINS[_targetChainId].name}`}
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
