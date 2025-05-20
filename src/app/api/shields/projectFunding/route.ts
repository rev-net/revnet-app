import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_BENDYSTRAW_URL?.replace(/\/$/, "") + "/graphql";

  console.log("✅ HIT: /api/shields/projectFunding", url);

  if (!url) {
    return NextResponse.json({ error: "Missing BendyStraw URL" }, { status: 500 });
  }

  const query = `
    query MyQuery {
      project(chainId: 8453, projectId: 53) {
        id
        balance
        chainId
        participants {
          totalCount
        }
      }
    }
  `;

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
      badgeUrl: "https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Ff1ae7ffc33f8.ngrok.app%2Fapi%2Fshields%2FprojectFunding&query=%24.message&label=Our%20Revnet"
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error", details: err.message }, { status: 500 });
  }
}