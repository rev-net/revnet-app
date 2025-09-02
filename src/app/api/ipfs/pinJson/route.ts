import { NextRequest } from "next/server";

export type InfuraPinResponse = {
  Hash: string;
};

const INFURA_IPFS_API_BASE_URL = "https://ipfs.infura.io:5001";
const INFURA_IPFS_PROJECT_ID = process.env.INFURA_IPFS_PROJECT_ID;
const INFURA_IPFS_API_SECRET = process.env.INFURA_IPFS_API_SECRET;

const AUTH_HEADER = `Basic ${Buffer.from(
  `${INFURA_IPFS_PROJECT_ID}:${INFURA_IPFS_API_SECRET}`,
).toString("base64")}`;

const DEV_ORIGIN = "http://localhost:3000";
const MAINNET_ORIGIN = "https://juicebox.money";

const origin = process.env.NODE_ENV === "development" ? DEV_ORIGIN : MAINNET_ORIGIN;

/**
 * https://docs.infura.io/infura/networks/ipfs/http-api-methods/pin
 */
async function pinFile(file: string | Blob): Promise<InfuraPinResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${INFURA_IPFS_API_BASE_URL}/api/v0/add`, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      origin,
    },
    body: formData,
  }).then((res) => res.json());

  return res;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    console.log("pinning::", data);

    const pinJson = await pinFile(JSON.stringify(data));

    return Response.json(pinJson);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "failed to pin data" }), {
      status: 500,
    });
  }
}
