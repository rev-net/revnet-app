import { useEnsName } from "@/hooks/ens/useEnsName";
import { formatEthAddress } from "@/lib/juicebox/utils";

export function EthereumAddress({
  address,
  short,
  withEns,
}: {
  address: string;
  short?: boolean;
  withEns?: boolean;
}) {
  const { data: ensName } = useEnsName(address, { enabled: withEns });
  const formattedAddress = short ? formatEthAddress(address) : address;

  const renderValue = ensName ?? formattedAddress;

  return <span>{renderValue}</span>;
}
