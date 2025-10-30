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
    forceChildren: boolean;
  } & ButtonProps
>(({ children, connectWalletText, targetChainId, forceChildren, ...props }, ref) => {
  const jbChainId = useJBChainId();
  const userChainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChainAsync, isPending } = useSwitchChain();

  const _targetChainId = targetChainId || jbChainId;

  if (typeof _targetChainId !== "undefined" && userChainId !== _targetChainId) {
    return (
      <Button
        {...props}
        onClick={async (e) => {
          e.preventDefault();
          await switchChainAsync({ chainId: _targetChainId });
          props.onClick?.(e);
        }}
        loading={isPending}
      >
        {forceChildren ? children : `Switch to ${JB_CHAINS[_targetChainId].name}`}
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
