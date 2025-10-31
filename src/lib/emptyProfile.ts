import { Profile } from "./profile";
import { formatEthAddress } from "./utils";

export function getEmptyProfile(address: string): Profile {
  return {
    identity: formatEthAddress(address),
    displayName: formatEthAddress(address),
    address,
  };
}
