import "server-only";

import { getEmptyProfile } from "@/lib/emptyProfile";
import { fetchProfile, type Profile as IProfile } from "@/lib/profile";
import { Suspense } from "react";

interface Props {
  address: string;
  children: (profile: IProfile) => React.ReactNode;
}

export async function Profile(props: Props) {
  const { children, address } = props;
  const emptyProfile = getEmptyProfile(address);
  const profile = fetchProfile(address);

  return (
    <Suspense fallback={children(emptyProfile)}>
      {children((await profile) || emptyProfile)}
    </Suspense>
  );
}
