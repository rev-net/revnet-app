import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.NEXT_PUBLIC_KV_REST_API_URL,
  token: process.env.NEXT_PUBLIC_KV_REST_API_TOKEN,
});

function getUserNotificationDetailsKey(fid: number): string {
  return `revnet:user:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<FrameNotificationDetails | null> {
  const res = await redis.get<FrameNotificationDetails>(
    getUserNotificationDetailsKey(fid)
  );
  console.log(res);
  return res;
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: FrameNotificationDetails
): Promise<void> {
  console.log(notificationDetails,fid);
  await redis.set(getUserNotificationDetailsKey(fid), notificationDetails);
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  await redis.del(getUserNotificationDetailsKey(fid));
}

export async function getTeamPreferences(fid: string): Promise<string[] | null> {
  try {
    const key = `revnet:preference:${fid}`;
    const res = await redis.get<string[]>(key);
    return res || null;
  } catch (error) {
    console.error("Failed to get team preferences:", error);
    return null;
  }
}