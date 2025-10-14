import { JBProjectMetadata } from "juice-sdk-core";

export async function pinProjectMetadata(metadata: JBProjectMetadata) {
  const { Hash } = await fetch("/api/ipfs/pinJson", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  }).then((res) => res.json());

  return Hash;
}
