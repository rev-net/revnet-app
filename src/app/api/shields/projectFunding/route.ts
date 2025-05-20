import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BENDYSTRAW_URL?.replace(/\/$/, "") + "/graphql";
  const { searchParams } = new URL(req.url);
  const chainId = parseInt(searchParams.get("chainId") ?? "");
  const projectId = parseInt(searchParams.get("projectId") ?? "");
  const publicBase = req.headers.get("host")?.startsWith("f1ae7ffc33f8.ngrok.app")
    ? "https://f1ae7ffc33f8.ngrok.app"
    : "https://revnet.eth.sucks";
  const publicUrl = `${publicBase}/api/shields/projectFunding?chainId=${chainId}&projectId=${projectId}`;

  if (isNaN(chainId) || isNaN(projectId)) {
    return NextResponse.json({ error: "Missing or invalid chainId/projectId" }, { status: 400 });
  }

  const url = baseUrl;

  console.log("✅ HIT: /api/shields/projectFunding", url);

  if (!url) {
    return NextResponse.json({ error: "Missing BendyStraw URL" }, { status: 500 });
  }

  const query = `
    query MyQuery {
      project(chainId: ${chainId}, projectId: ${projectId}) {
        id
        balance
        chainId
        participants {
          totalCount
        }
      }
    }
  `;

  console.log("🔍 GraphQL Query:", query);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "GraphQL error", details: text }, { status: res.status });
    }

    const data = await res.json();
    const balance = parseFloat(data.data.project.balance) / 1e18;
    const supporters = data.data.project.participants.totalCount;
    const logoSvg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='%23000'/><text x='12' y='16' font-size='10' text-anchor='middle' fill='%23fff'>R</text></svg>";

    return NextResponse.json({
      label: "Funding",
      message: `${balance.toFixed(2)} ETH • ${supporters} supporters`,
      color: balance > 1 ? "green" : balance > 0.1 ? "yellow" : "red",
      logoSvg,
      badgeUrl: `https://img.shields.io/badge/dynamic/json?url=${encodeURIComponent(publicUrl)}&query=%24.message&label=Our%20Revnet`
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error", details: err.message }, { status: 500 });
  }
}