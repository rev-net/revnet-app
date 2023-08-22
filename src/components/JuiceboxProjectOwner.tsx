"use client";

import { useJbProjectsOwnerOf } from "juice-hooks";

export function JuiceboxProjectOwner() {
  const { data: address } = useJbProjectsOwnerOf({
    args: [1n],
  });

  return (
    <div>
      JuiceboxDAO project owner:
      {address && <div>{address}</div>}
    </div>
  );
}
