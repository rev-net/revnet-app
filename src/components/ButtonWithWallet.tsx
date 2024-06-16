import { ConnectKitButton } from "connectkit";
import React from "react";
import { useAccount } from "wagmi";
import { Button } from "./ui/button";

const ButtonWithWallet = React.forwardRef<
  HTMLInputElement,
  { connectWalletText: "string"; children: React.ReactNode }
>(({ children, connectWalletText, ...props }, ref) => {
  const { isConnected } = useAccount();
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
