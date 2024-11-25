import { toBytes, toHex } from "viem";

export function createSalt() {
  const base: string = "0x" + Math.random().toString(16).slice(2); // idk lol
  const salt = toHex(toBytes(base, { size: 32 }));

  return salt;
}

export function commaNumber(value: string | number): string {
  const numStr = value.toString();
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}
