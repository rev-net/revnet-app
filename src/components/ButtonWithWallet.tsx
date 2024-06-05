import { useAccount } from "wagmi";
import { Button, ButtonProps } from "./ui/button";
import { ConnectKitButton } from "connectkit";

export function ButtonWithWallet({
  children,
  connectWalletText,
  ...props
}: {
  connectWalletText?: string;
  children: React.ReactNode;
} & ButtonProps) {
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
}
