import { toBytes, toHex } from "viem";

export function createSalt() {
  const base: string = "0x" + Math.random().toString(16).slice(2); // idk lol
  const salt = toHex(toBytes(base, { size: 32 }));

  return salt;
}
