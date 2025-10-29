"use server";

import { revalidateTag } from "next/cache";

export async function revalidateCacheTag(tag: string, delay = 1000) {
  await new Promise((resolve) => setTimeout(resolve, delay));
  revalidateTag(tag);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return true;
}
